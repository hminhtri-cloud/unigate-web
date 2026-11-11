import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import app from '../api/index.js';
import { query,pool } from '../server/db.mjs';
import { questions,questionVersion } from '../data/questions.mjs';
import { majors,universities } from '../data/catalog.mjs';

test('MySQL integration: registration, authorization, scoring, persistence and session revocation',async t=>{
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const email=`integration-${randomUUID()}@unigate.test`,otherEmail=`integration-${randomUUID()}@unigate.test`;
  let cookie='',otherCookie='';
  async function request(path,method='GET',body,session=cookie,headers={}){
    const response=await fetch(`${base}/api${path}`,{method,headers:{...(session?{Cookie:session}:{}),...(method!=='GET'?{'Content-Type':'application/json'}:{}),...headers},...(method==='GET'?{}:{body:JSON.stringify(body??{})})});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
  }
  try{
    await t.test('public catalog; private endpoints reject anonymous',async()=>{
      assert.equal((await request('/health')).data.database,'MySQL');
      assert.equal((await request('/catalog')).data.majors.length,majors.length);
      assert.equal((await request('/catalog')).data.universities.length,universities.length);
      assert.equal((await request('/results')).status,401);
      assert.equal((await request('/auth/register','POST',{name:'A',email:'invalid',password:'short'})).status,400);
    });
    await t.test('registration validates and returns an HttpOnly session',async()=>{
      const a=await request('/auth/register','POST',{name:'Test Student',email,password:'unigate-test-123'});assert.equal(a.status,201);cookie=a.cookie;assert.ok(cookie.startsWith('unigate_session='));assert.equal(a.data.email,email);assert.equal(a.data.password_hash,undefined);
      const b=await request('/auth/register','POST',{name:'Other Student',email:otherEmail,password:'unigate-test-123'});assert.equal(b.status,201);otherCookie=b.cookie;
      assert.equal((await request('/auth/register','POST',{name:'Duplicate',email,password:'unigate-test-123'})).status,409);
      assert.equal((await request('/auth/login','POST',{email,password:'incorrect'})).status,401);
      const [row]=await query('SELECT password_hash FROM users WHERE email=?',[email]);assert.notEqual(row.password_hash,'unigate-test-123');
    });
    await t.test('drafts and results are private; score calculated server-side; submissions idempotent',async()=>{
      await request('/draft','PUT',{answers:{1:5},version:questionVersion});assert.deepEqual((await request('/draft')).data,{'1':5});assert.deepEqual((await request('/draft','GET',undefined,otherCookie)).data,{});
      assert.equal((await request('/results','POST',{answers:{1:5},version:questionVersion,requestId:randomUUID()})).status,400);
      const answers=Object.fromEntries(questions.map(q=>[q.id,q.group==='I'?5:q.group==='R'?4:q.group==='C'?3:1]));
      const body={answers,version:questionVersion,requestId:randomUUID()};const submitted=await request('/results','POST',body);assert.equal(submitted.status,201);assert.equal(submitted.data.code,'IRC');assert.equal(submitted.data.scores.I,50);
      const again=await request('/results','POST',body);assert.equal(again.data.id,submitted.data.id);assert.equal((await request('/results')).data.length,1);assert.equal((await request('/results','GET',undefined,otherCookie)).data.length,0);assert.deepEqual((await request('/draft')).data,{});
      const recommendations=(await request('/recommendations')).data;assert.equal(recommendations.length,majors.length);assert.ok(recommendations.every(x=>x.fit>=0&&x.fit<=100));
    });
    await t.test('scores reject invalid input and keep zero; wishlist order is transactionally validated',async()=>{
      assert.equal((await request('/scores','PUT',{subjects:{math:10.1},dgnl:null})).status,400);
      assert.equal((await request('/scores','PUT',{subjects:{math:'8'},dgnl:null})).status,400);
      assert.equal((await request('/scores','PUT',{subjects:{math:0,physics:9,chemistry:8},dgnl:1200})).status,200);
      assert.equal((await request('/scores')).data.combinations[0].total,17);assert.deepEqual((await request('/scores','GET',undefined,otherCookie)).data.subjects,{});
      for(const majorId of ['UIT-001','HCMUT-106'])assert.equal((await request('/wishes','POST',{majorId})).status,201);
      await request('/wishes','POST',{majorId:'UIT-001'});assert.equal((await request('/wishes')).data.length,2);
      assert.equal((await request('/wishes','POST',{majorId:'nonexistent'})).status,404);
      assert.equal((await request('/wishes/order','PUT',{ids:['UIT-001','UIT-001']})).status,400);
      assert.equal((await request('/wishes/order','PUT',{ids:['HCMUT-106','UIT-001']})).status,200);
      assert.equal((await request('/wishes')).data[0].majorId,'HCMUT-106');
      assert.equal((await request('/wishes/UIT-001','PUT',{note:'private note'})).status,200);
      assert.equal((await request('/wishes/UIT-001','PUT',{note:'tampered'},otherCookie)).status,404);
      await request('/wishes/UIT-001','DELETE',{},otherCookie);assert.equal((await request('/wishes')).data.length,2);
      assert.equal((await request('/wishes','GET',undefined,otherCookie)).data.length,0);
    });
    await t.test('admission profile validates four subjects, persists calculated combinations and stays private',async()=>{
      const profile={confirmed:true,examSubjects:['math','literature','physics','english'],otherScores:{hsa:100,sat:1400}};
      const body={subjects:{math:0,literature:7,physics:8,english:9},dgnl:900,admissionProfile:profile};
      assert.equal((await request('/scores','PUT',{...body,admissionProfile:{...profile,examSubjects:['math','physics','english']}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,subjects:{...body.subjects,chemistry:10}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,subjects:{math:0,literature:7,physics:8}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,admissionProfile:{...profile,examSubjects:['math','math','physics','english']}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,admissionProfile:{...profile,otherScores:{hsa:151}}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,subjects:{math:0,literature:7,english:8,french:9},admissionProfile:{...profile,examSubjects:['math','literature','english','french']}})).status,400);
      assert.equal((await request('/scores','PUT',{...body,combinations:[{code:'B00',total:30}]})).status,400);
      const saved=await request('/scores','PUT',body);assert.equal(saved.status,200);
      assert.deepEqual(saved.data.combinations.map(c=>c.code).sort(),['A01','C01','D01','D11']);
      const reloaded=(await request('/scores')).data;
      assert.deepEqual(reloaded.admissionProfile,profile);assert.equal(reloaded.dgnl,900);assert.equal(reloaded.subjects.math,0);
      assert.deepEqual(reloaded.combinations,saved.data.combinations);
      assert.equal((await request('/scores','GET',undefined,otherCookie)).data.admissionProfile,null);
      const [row]=await query('SELECT p.data FROM admission_profiles p JOIN users u ON u.id=p.user_id WHERE u.email=?',[email]);
      const stored=typeof row.data==='string'?JSON.parse(row.data):row.data;
      assert.deepEqual(stored.combinations,saved.data.combinations);
      assert.deepEqual(stored.availableMethods,['thpt','dgnl','dgnl-hn','sat']);
      const hsaOnly={subjects:{},dgnl:null,admissionProfile:{confirmed:true,examSubjects:[],otherScores:{hsa:95}}};
      assert.equal((await request('/scores','PUT',hsaOnly)).status,200);
      assert.deepEqual((await request('/scores')).data.combinations,[]);
      assert.equal((await request('/scores')).data.dgnl,null);
      await request('/scores','PUT',body);
    });
    await t.test('profile updates; cross-site writes blocked; logout and password rotation revoke old sessions',async()=>{
      assert.equal((await request('/me','PUT',{name:'Test Updated',school:'THPT Test',grade:'11'})).status,200);
      assert.equal((await request('/me')).data.grade,'11');
      assert.equal((await request('/scores','PUT',{subjects:{},dgnl:null},cookie,{Origin:'https://example.com'})).status,403);
      const oldCookie=cookie;
      const changed=await request('/me/password','PUT',{currentPassword:'unigate-test-123',newPassword:'new-password-123'});assert.equal(changed.status,200);cookie=changed.cookie;
      assert.equal((await request('/me','GET',undefined,oldCookie)).status,401);
      assert.equal((await request('/auth/logout','POST')).status,200);assert.equal((await request('/me')).status,401);
      const login=await request('/auth/login','POST',{email,password:'new-password-123'});assert.equal(login.status,200);cookie=login.cookie;
      assert.equal((await request('/results')).data.length,1);assert.equal((await request('/wishes')).data.length,2);assert.equal((await request('/scores')).data.subjects.math,0);
    });
  }finally{
    await query('DELETE FROM users WHERE email IN (?,?)',[email,otherEmail]);
    await new Promise(resolve=>server.close(resolve));await pool.end();
  }
});
