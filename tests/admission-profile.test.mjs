import {test} from 'node:test';
import assert from 'node:assert/strict';
import {admissionProfileReady,availableStudentMethods,matchAdmissionProfile,profileCombinations} from '../shared/admission-profile.mjs';
import {majors} from '../data/catalog.mjs';

const profile={subjects:{math:8.5,literature:7.5,physics:8,english:8},dgnl:900,admissionProfile:{confirmed:true,examSubjects:['math','literature','physics','english'],otherScores:{}}};
const route=(method,combinations=[],more={})=>({method,combinations,year:2026,source:'https://example.edu.vn/admissions',...more});

test('four exam subjects generate only their own combinations; unrelated stored marks cannot leak in',()=>{
  assert.deepEqual(profileCombinations({...profile,subjects:{...profile.subjects,chemistry:10}}).map(c=>c.code).sort(),['A01','C01','D01','D11']);
  assert.equal(profileCombinations(profile).find(c=>c.code==='A01').total,24.5);
  assert.deepEqual(availableStudentMethods(profile),['thpt','dgnl']);
  assert.equal(admissionProfileReady(profile),true);
  assert.equal(admissionProfileReady({...profile,admissionProfile:null}),false);
  assert.equal(admissionProfileReady({...profile,subjects:{},dgnl:null,admissionProfile:{confirmed:true,examSubjects:[],otherScores:{}}}),false);
  const chinese={...profile,subjects:{math:8,literature:7,history:6,chinese:9},admissionProfile:{...profile.admissionProfile,examSubjects:['math','literature','history','chinese']}};
  assert.ok(profileCombinations(chinese).some(c=>c.code==='D04'));
  assert.ok(!profileCombinations(chinese).some(c=>c.code==='D01'));
});

test('method and combination must match the same route, never a different method or another exam',()=>{
  const major={admissionScores:[route('thpt',['B00']),route('transcript',['A01'])]};
  assert.notEqual(matchAdmissionProfile(major,profile).status,'matched');
  const hsaOnly={subjects:{},dgnl:null,admissionProfile:{confirmed:true,examSubjects:[],otherScores:{hsa:100}}};
  assert.equal(matchAdmissionProfile({admissionScores:[route('dgnl')]},hsaOnly).status,'not-matched');
  assert.equal(matchAdmissionProfile({admissionScores:[route('dgnl-hn')]},hsaOnly).status,'matched');
  assert.equal(matchAdmissionProfile({admissionScores:[route('dgnl-hn')]},profile).status,'not-matched');
  const satOnly={...hsaOnly,admissionProfile:{...hsaOnly.admissionProfile,otherScores:{sat:1400}}};
  assert.equal(matchAdmissionProfile({admissionScores:[route('sat')]},satOnly).status,'matched');
  assert.equal(matchAdmissionProfile({admissionScores:[route('tsa')]},satOnly).status,'not-matched');
});

test('missing, converted, combined, stale and aptitude evidence cannot create false positive matches',()=>{
  for(const major of [
    {},{combinations:['A01']},
    {combinations:['A01'],admissionScores:[route('thpt')]},
    {admissionScores:[route('composite',['A01'])]},
    {admissionScores:[route('combined-vact',['A01'])]},
    {admissionScores:[route('thpt-equivalent',['A01'])]},
    {admissionScores:[route('aptitude-thpt',['A01'])]},
    {admissionScores:[route('thpt',['A01'],{year:2025})]},
    {admissionScores:[route('thpt',['A01'],{scoreType:'floor'})]},
    {admissionMethods:[{method:'thpt',combinations:['A01'],year:2026}]},
  ])assert.notEqual(matchAdmissionProfile(major,profile).status,'matched',JSON.stringify(major));
  assert.equal(matchAdmissionProfile({admissionScores:[route('thpt',['A00'])]},profile).status,'not-matched');
  assert.equal(matchAdmissionProfile({admissionScores:[route('thpt',['M01'])]},profile).status,'unknown');
});

test('real programme matches preserve method provenance and do not act as a cutoff threshold',()=>{
  const ctu=majors.find(m=>m.id==='CTU-7480201');
  const result=matchAdmissionProfile(ctu,profile);
  assert.equal(result.status,'matched');
  assert.ok(result.matches.some(m=>m.method==='thpt'&&m.combinations.some(c=>c.code==='A01')));
  assert.ok(result.matches.every(m=>m.source.startsWith('https://tuyensinh.ctu.edu.vn/')));
  const ump=majors.find(m=>m.id==='UMP-001');
  assert.equal(matchAdmissionProfile(ump,profile).status,'not-matched');
  const lowScore={subjects:{math:0,literature:1,chemistry:1,biology:1},dgnl:null,admissionProfile:{confirmed:true,examSubjects:['math','literature','chemistry','biology'],otherScores:{}}};
  assert.equal(matchAdmissionProfile(ump,lowScore).status,'matched');
  assert.equal(matchAdmissionProfile(majors.find(m=>m.id==='UIT-001'),profile).status,'unknown');
  const unres=majors.find(m=>m.id==='HCMUNRE-7480201');
  assert.ok(matchAdmissionProfile(unres,profile).matches.some(m=>m.method==='dgnl'));
});
