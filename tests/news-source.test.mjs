import test from 'node:test';
import assert from 'node:assert/strict';
import {createNewsSourceHandler,isMinistryUrl} from '../server/news-source.mjs';
const article='https://moet.gov.vn/tin-tuc/tin-tong-hop2/ban-hanh-quy-che-tuyen-sinh-dai-hoc-nam-2026.html';
async function invoke(handler,input=article,method='GET'){
  const headers={},res={setHeader:(key,value)=>{headers[key]=value;},end:text=>{res.body=JSON.parse(text);}};
  await handler({method,url:`/api/news-source?url=${encodeURIComponent(input)}`},res);
  return {...res,headers};
}
test('Ministry relay accepts only explicit public official HTML paths',()=>{
  assert.ok(isMinistryUrl(article));
  for(const url of ['https://evil.test/','https://moet.gov.vn.evil.test/a','http://moet.gov.vn/tin-tuc/tin-tong-hop2','https://moet.gov.vn/api/private','https://127.0.0.1/','https://moet.gov.vn:444/tin-tuc/tin-tong-hop2','https://moet.gov.vn/tin-tuc/tin-tong-hop2?url=http://127.0.0.1','https://evil.test@moet.gov.vn/tin-tuc/tin-tong-hop2'])assert.equal(isMinistryUrl(url),false);
});
test('relay preserves source URL and text; does not execute source HTML',async()=>{
  const html='<h1>Official notice</h1><script>throw new Error("never run")</script>';
  const handler=createNewsSourceHandler(async()=>new Response(html,{headers:{'content-type':'text/html'}}));
  const result=await invoke(handler);assert.equal(result.statusCode,200);assert.equal(result.body.sourceUrl,article);assert.equal(result.body.html,html);assert.ok(result.body.retrievedAt);assert.match(result.headers['Cache-Control'],/s-maxage=1800/);
});
test('relay rejects writes and untrusted redirects before requesting other hosts',async()=>{
  const calls=[],handler=createNewsSourceHandler(async url=>{calls.push(url);return new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});});
  assert.equal((await invoke(handler,article,'POST')).statusCode,405);assert.equal(calls.length,0);
  assert.equal((await invoke(handler,'https://evil.test/')).statusCode,400);assert.equal(calls.length,0);
  assert.equal((await invoke(handler)).statusCode,502);assert.deepEqual(calls,[article]);
});
test('relay reports failures without source cookies or internal errors',async()=>{
  const handler=createNewsSourceHandler(async()=>{throw new Error('sensitive internals');});
  const result=await invoke(handler);assert.equal(result.body.error,'official_source_unavailable');assert.equal(result.body.reason,'source_fetch_failed');assert.ok(!JSON.stringify(result.body).includes('sensitive internals'));
});
