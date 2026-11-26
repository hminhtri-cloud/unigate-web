import {readFile,writeFile,mkdir,rename,appendFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {setDefaultResultOrder} from 'node:dns';
import {newsSources} from '../data/news-sources.mjs';
import {allowedUrl,canonicalUrl,discoverLinks,extractArticle,mergeArticles,validateNews} from './news-core.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
// Hosted runners may resolve AAAA records without a working IPv6 egress route.
setDefaultResultOrder('ipv4first');
const {values}=parseArgs({options:{write:{type:'boolean',default:false},validate:{type:'boolean',default:false},sources:{type:'string'},'lookback-days':{type:'string',default:'60'},'max-per-source':{type:'string',default:'12'},'report-dir':{type:'string',default:'artifacts/news'}}});
const dataPath=resolve(root,'data/admission-news.json'),document=JSON.parse(await readFile(dataPath,'utf8'));
validateNews(document,newsSources);
if(values.validate){console.log(`Valid: ${document.articles.length} articles, ${newsSources.length} configured sources.`);process.exit(0);}
const positive=(value,max)=>{const n=Number(value);if(!Number.isInteger(n)||n<1||n>max)throw new Error(`Invalid limit: ${value}`);return n;};
const lookback=positive(values['lookback-days'],730),limit=positive(values['max-per-source'],40),now=new Date();
const notBefore=new Date(+now-lookback*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'});
const requested=values.sources?.trim()?values.sources.split(',').map(id=>id.trim()).filter(Boolean):null;
if(requested?.some(id=>!newsSources.some(s=>s.id===id)))throw new Error('Unknown source ID');
const sources=newsSources.filter(s=>!requested||requested.includes(s.id));
const report={startedAt:now.toISOString(),admissionYear:document.admissionYear,mode:values.write?'write':'dry-run',lookbackDays:lookback,limitPerSource:limit,sources:[],events:[]};
const errorText=error=>[error.message,error.cause?.code,error.cause?.message,error.cause?.address].filter(Boolean).join(' · ');
let browserPromise;
const maxBytes=3*1024*1024;
const relayEnabled=source=>source.id==='MOET'&&process.env.NEWS_MOET_RELAY==='true';
async function relayHtml(input,source){
  const endpoint=new URL('https://unigate-web.vercel.app/api/news-source');endpoint.searchParams.set('url',canonicalUrl(input));
  const response=await fetch(endpoint,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Project relay HTTP ${response.status}`);
  const text=await response.text();if(Buffer.byteLength(text)>maxBytes)throw new Error('Relay response too large');
  const data=JSON.parse(text);
  if(!allowedUrl(data.sourceUrl,source)||typeof data.html!=='string'||!data.retrievedAt||Number.isNaN(Date.parse(data.retrievedAt))||Date.now()-Date.parse(data.retrievedAt)>24*3600000)throw new Error('Unverified relay response');
  return {url:data.sourceUrl,html:data.html};
}
async function httpHtml(input,source){
  let url=canonicalUrl(input);
  for(let redirects=0;redirects<6;redirects++){
    if(!allowedUrl(url,source))throw new Error('Redirect outside official hosts');
    let response;
    for(let attempt=0;attempt<2;attempt++){
      response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'user-agent':'UniGate-News/1.0 (educational admissions link index)','accept':'text/html,application/xhtml+xml'}});
      if(![429,502,503,504].includes(response.status)||attempt)break;
      await response.body?.cancel();await new Promise(r=>setTimeout(r,1500));
    }
    if([301,302,303,307,308].includes(response.status)){
      const location=response.headers.get('location');await response.body?.cancel();
      if(!location)throw new Error('Redirect without location');url=canonicalUrl(location,url);continue;
    }
    if(!response.ok){await response.body?.cancel();throw new Error(`HTTP ${response.status}`);}
    if(!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw new Error('Not an HTML article');}
    let size=0;const parts=[];
    for await(const chunk of response.body){size+=chunk.length;if(size>maxBytes)throw new Error('HTML exceeds 3 MiB');parts.push(chunk);}
    const bytes=Buffer.concat(parts),type=response.headers.get('content-type')||'';
    const encoding=type.match(/charset=([\w-]+)/i)?.[1]||'utf-8';
    return {url,html:new TextDecoder(encoding).decode(bytes)};
  }
  throw new Error('Too many redirects');
}
async function renderedPages(url,source,paginate=false){
  browserPromise||=import('playwright').then(({chromium})=>chromium.launch());
  const page=await (await browserPromise).newPage();
  try{
    await page.route('**/*',route=>{
      const request=route.request();
      return !allowedUrl(request.url(),source)||['image','font','media'].includes(request.resourceType())?route.abort():route.continue();
    });
    const response=await page.goto(url,{waitUntil:'commit',timeout:25000});
    if(!response?.ok()||!allowedUrl(page.url(),source))throw new Error('Rendered page failed official URL/status check');
    // Slow assets must not discard an already successful article response.
    await page.waitForLoadState('domcontentloaded',{timeout:8000}).catch(()=>{});
    await page.locator('h1,article,.default-pagination').first().waitFor({state:'attached',timeout:6000}).catch(()=>{});
    await page.waitForTimeout(1200);
    const pages=[];
    for(let i=0;i<(paginate?6:1);i++){
      const html=await page.content();if(Buffer.byteLength(html)>maxBytes)throw new Error('Rendered HTML too large');
      pages.push({url:page.url(),html});
      const next=page.locator('.default-pagination a.next').first();
      if(!paginate||!await next.count())break;
      const before=(await page.locator('.default-pagination span.current').allTextContents()).join('|');
      try{
        await next.evaluate(el=>el.click());
        await page.waitForFunction(previous=>[...document.querySelectorAll('.default-pagination span.current')].map(el=>el.textContent).join('|')!==previous,before,{timeout:6000});
        await page.waitForTimeout(1200);
      }catch{break;}
    }
    return pages;
  }finally{await page.close();}
}
async function readPage(url,source){
  if(relayEnabled(source)){
    try{return await relayHtml(url,source);}catch(error){report.events.push({sourceId:source.id,url,reason:'project-relay-failed',error:errorText(error)});}
  }
  try{return await httpHtml(url,source);}catch(error){
    // Chromium uses its normal certificate checks; never disable TLS verification.
    if(!/fetch failed|Timeout|aborted/i.test(error.message))throw error;
    const [page]=await renderedPages(url,source);return page;
  }
}
async function collect(source){
  const result={id:source.id,name:source.name,transport:relayEnabled(source)?'project-relay-with-direct-fallback':'direct',status:'failed',pagesRead:0,candidates:0,verified:0,skipped:{},errors:[]},incoming=[],links=new Set(source.seeds||[]),started=Date.now();
  function event(url,reason){result.skipped[reason]=(result.skipped[reason]||0)+1;report.events.push({sourceId:source.id,url,reason});}
  for(const entry of source.entries){
    if(Date.now()-started>90000)break;
    try{
      let pages;
      if(source.render&&!relayEnabled(source)){
        try{pages=await renderedPages(entry,source,source.id==='MOET');}
        catch(error){result.errors.push({url:entry,error:errorText(error),fallback:'Retry as plain HTML'});pages=[await httpHtml(entry,source)];}
      }else pages=[await readPage(entry,source)];
      for(const page of pages){
        result.pagesRead++;
        // A configured entry can itself be an official announcement.
        const parsed=extractArticle(page.html,page.url,source,{year:document.admissionYear,now,notBefore});
        if(parsed.article)incoming.push(parsed.article);
        for(const url of discoverLinks(page.html,page.url,source))links.add(url);
      }
    }catch(error){result.errors.push({url:entry,error:errorText(error)});}
  }
  // New target-cycle headlines first, but do not infer publication dates from URLs.
  const candidates=[...links].sort((a,b)=>Number(b.includes(String(document.admissionYear)))-Number(a.includes(String(document.admissionYear)))).slice(0,limit);
  result.candidates=candidates.length;
  for(const url of candidates){
    if(Date.now()-started>90000){event(url,'source-time-budget');break;}
    if(incoming.some(a=>a.url===url))continue;
    try{
      const page=await readPage(url,source);
      let parsed=extractArticle(page.html,page.url,source,{year:document.admissionYear,now,notBefore});
      if(source.render&&!parsed.article&&['missing-article-body','unrelated-or-not-an-article','missing-or-invalid-published-date'].includes(parsed.reason)){
        const [rendered]=await renderedPages(url,source);parsed=extractArticle(rendered.html,rendered.url,source,{year:document.admissionYear,now,notBefore});
      }
      if(parsed.article)incoming.push(parsed.article);else event(url,parsed.reason);
    }catch(error){result.errors.push({url,error:errorText(error)});}
  }
  result.verified=incoming.length;
  result.status=result.pagesRead||result.verified?(result.errors.length?'partial':'checked'):'failed';
  result.durationMs=Date.now()-started;
  report.sources.push(result);
  console.log(`${source.id}: ${result.status}, ${result.verified} verified, ${result.candidates} candidates, ${result.errors.length} errors`);
  return incoming;
}
let cursor=0;
const incoming=[];
try{
  await Promise.all(Array.from({length:Math.min(3,sources.length)},async()=>{while(cursor<sources.length){const source=sources[cursor++];if(Date.now()-now.getTime()>25*60*1000){report.sources.push({id:source.id,name:source.name,status:'failed',pagesRead:0,candidates:0,verified:0,skipped:{},errors:[{error:'Global 25-minute collection budget reached'}]});continue;}incoming.push(...await collect(source));}}));
}finally{if(browserPromise){const active=await browserPromise.catch(()=>null);await active?.close();}}
// Stable source ordering makes duplicate selection independent of network timing.
incoming.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)||a.url.localeCompare(b.url));
const merged=mergeArticles(document.articles,incoming);
const next={...document,updatedAt:now.toISOString(),articles:merged.articles};
validateNews(next,newsSources);
const changed=merged.stats.added+merged.stats.updated+merged.stats.removed>0;
report.finishedAt=new Date().toISOString();report.stats={...merged.stats,total:merged.articles.length,sourcesAttempted:sources.length,sourcesRead:report.sources.filter(s=>s.status!=='failed').length,sourcesWithErrors:report.sources.filter(s=>s.errors.length).length};
report.changed=changed;report.written=false;
if(values.write&&changed&&report.stats.sourcesRead){
  await writeFile(`${dataPath}.tmp`,`${JSON.stringify(next,null,2)}\n`);await rename(`${dataPath}.tmp`,dataPath);report.written=true;
}
const dir=resolve(root,values['report-dir']);await mkdir(dir,{recursive:true});
await writeFile(resolve(dir,'report.json'),`${JSON.stringify(report,null,2)}\n`);
await writeFile(resolve(dir,'proposed-news.json'),`${JSON.stringify(next,null,2)}\n`);
const summary=[`## UniGate news — ${report.mode}`,``, `Year: ${document.admissionYear} · Window: ${lookback} days · Sources read: ${report.stats.sourcesRead}/${sources.length}`,``,`Added: ${merged.stats.added} · Updated: ${merged.stats.updated} · Duplicate: ${merged.stats.duplicate} · Out-of-scope removed: ${merged.stats.removed} · Total: ${merged.articles.length}`,``,`| Source | Status | Verified | Errors |`,`|---|---|---:|---:|`,...report.sources.sort((a,b)=>a.id.localeCompare(b.id)).map(s=>`| ${s.id} | ${s.status} | ${s.verified} | ${s.errors.length} |`)].join('\n');
await writeFile(resolve(dir,'summary.md'),`${summary}\n`);
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,`${summary}\n`);
console.log(JSON.stringify(report.stats));
if(!report.stats.sourcesRead)throw new Error('All sources failed; existing news preserved. See report.json.');
