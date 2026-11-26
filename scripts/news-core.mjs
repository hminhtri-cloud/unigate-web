import {createHash} from 'node:crypto';
import {load} from 'cheerio';

export const fold=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const clean=text=>String(text||'').replace(/\s+/g,' ').trim();
const hash=text=>createHash('sha256').update(text).digest('hex');
export function canonicalUrl(input,base){
  const url=new URL(input,base);
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Unsupported URL');
  url.hostname=url.hostname.toLowerCase();
  // Preserve hash-router article paths, discard plain section anchors.
  if(!url.hash.startsWith('#/'))url.hash='';
  for(const key of [...url.searchParams.keys()])if(/^(utm_|fbclid$|gclid$|categoryId$)/i.test(key))url.searchParams.delete(key);
  url.searchParams.sort();
  return url.href;
}
export function allowedUrl(input,source){
  try{const url=new URL(input);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password&&(!url.port||['80','443'].includes(url.port))&&source.hosts.includes(url.hostname.replace(/^www\./,'').toLowerCase());}catch{return false;}
}
export function parseDate(input,now=new Date()){
  const raw=clean(input);
  let match=raw.match(/\b(20\d{2})-(\d{2})-(\d{2})(?:T|\b)/),year,month,day;
  if(match)[,year,month,day]=match;
  else if((match=raw.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/)))[,day,month,year]=match;
  else if((match=raw.match(/\b(\d{1,2})\s+tháng\s+(\d{1,2}),?\s+(20\d{2})\b/i)))[,day,month,year]=match;
  else return null;
  const value=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const date=new Date(`${value}T00:00:00+07:00`);
  if(Number.isNaN(+date)||date.toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'})!==value||date>now)return null;
  return value;
}
export const relevantTitle=title=>/tuyen sinh|xet tuyen|nguyen vong|diem chuan|trung tuyen|nhap hoc|hoc bong|tot nghiep thpt|danh gia nang luc|danh gia tu duy/.test(fold(title))&&!/sau dai hoc|thac si|tien si|chuyen khoa cap|lien thong|van bang (thu )?(hai|2)|tuyen dung|dao tao tu xa|vua lam vua hoc|dai hoc thuong xuyen|bac trung cap|trinh do trung cap|chuyen tien hoc bong|khuyen khich hk|thu khoa/.test(fold(title));
const archivePage=(url,title,excerpt='')=>/cac-nam|qua-cac-nam/.test(new URL(url).pathname)||(!/\b20\d{2}\b/.test(title)&&/qua cac nam|cac nam tuyen sinh/.test(fold(excerpt)));
export function targetCycle(title,body,year){
  // A heading explicitly about another cycle wins over historical body mentions.
  const headingYears=[...title.matchAll(/\b20\d{2}\b/g)].map(m=>Number(m[0]));
  if(headingYears.length&&!headingYears.includes(year))return false;
  return headingYears.includes(year)||new RegExp(`\\b${year}\\b`).test(body.slice(0,5000));
}
function jsonArticles($){
  const result=[];
  function visit(value){if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(visit);return;}if([].concat(value['@type']||[]).some(t=>/^(NewsArticle|Article|BlogPosting)$/.test(t)))result.push(value);if(value['@graph'])visit(value['@graph']);}
  $('script[type="application/ld+json"]').each((_,el)=>{try{visit(JSON.parse($(el).text()));}catch{/* Other widgets may contain invalid JSON-LD. */}});
  return result;
}
export function extractArticle(html,url,source,{year=2026,now=new Date(),notBefore=null}={}){
  if(!allowedUrl(url,source))return {reason:'untrusted-url'};
  const location=new URL(url);
  if(location.pathname==='/'&&!location.search&&!location.hash.startsWith('#/'))return {reason:'homepage-not-article'};
  const $=load(html),structured=jsonArticles($)[0];
  const title=clean($('h1.article-title,h1.entry-title,h1[itemprop="headline"],article h1,main h1').first().text()||$('h1').first().text()||structured?.headline||$('meta[property="og:title"]').attr('content'));
  if(title.length<15||!relevantTitle(title))return {reason:'unrelated-or-not-an-article'};
  // Save explicit publication evidence before removing navigation/header chrome.
  const dateValues=[structured?.datePublished,$('meta[property="article:published_time"]').attr('content'),$('meta[name="pubdate"],meta[name="publishdate"],meta[name="date"]').first().attr('content')];
  const heading=$('h1').filter((_,el)=>clean($(el).text())===title).first(),dateRoot=heading.closest('article');
  dateRoot.find('time[datetime],[itemprop="datePublished"],[property~="dc:created"]').each((_,el)=>dateValues.push($(el).attr('datetime')||$(el).attr('content')||$(el).text()));
  for(const selector of source.dateSelectors||[])$(selector).each((_,el)=>dateValues.push($(el).attr('content')||$(el).text()));
  dateRoot.find('.post-date,.entry-date,.article-date,.publish-date,.date-published').each((_,el)=>dateValues.push($(el).text()));
  $('script,style,nav,header,footer,aside,.related-posts,.related-news,.comments,.entry-meta,.post-meta,.post-date,.submitted,.social-share,.social-media-sharing').remove();
  const selectors=[...(source.bodySelectors||[]),'.article-content','.entry-content','[itemprop="articleBody"]','.detail-content','.article-body','.news-content','.content-detail','article','main'];
  let content=selectors.map(selector=>$(selector).first()).find(el=>el.text().trim().length>80||(el.text().trim().length>20&&el.find('img').length));
  if(!content)return {reason:'missing-article-body'};
  const body=clean(content.text());
  if(!targetCycle(title,body,year))return {reason:'wrong-admission-year'};
  const metaExcerpt=clean($('meta[property="og:description"],meta[name="description"]').first().attr('content'));
  if(archivePage(url,title,metaExcerpt))return {reason:'archive-not-news'};
  const date=dateValues.map(value=>parseDate(value,now)).find(Boolean);
  if(!date)return {reason:'missing-or-invalid-published-date'};
  if(notBefore&&date<notBefore)return {reason:'outside-lookback'};
  let canonical=canonicalUrl(url);
  const declared=$('link[rel="canonical"]').attr('href');
  if(declared){try{const candidate=canonicalUrl(declared,url);if(!allowedUrl(candidate,source))return {reason:'untrusted-canonical'};if(new URL(candidate).pathname==='/'&&!new URL(candidate).hash.startsWith('#/'))return {reason:'canonical-not-article'};canonical=candidate;}catch{return {reason:'invalid-canonical'};}}
  // Extract, never generate: no article text can become executable code/HTML.
  const useful=text=>{const value=clean(text);return value.length>=60&&fold(value)!==fold(title)&&!/^https?:\/\//i.test(value)&&! / - Detail - /.test(value)?value:'';};
  const excerpt=useful($('.article-brief,.entry-summary,.sapo,.article-sapo').first().text())||useful(metaExcerpt)||useful(content.find('p').filter((_,el)=>clean($(el).text()).length>80).first().text());
  const summary=excerpt.length>500?`${excerpt.slice(0,497).replace(/\s+\S*$/,'')}…`:excerpt;
  const assets=content.find('img[src],iframe[src]').map((_,el)=>{try{return canonicalUrl($(el).attr('src'),url);}catch{return '';}}).get().filter(Boolean).sort();
  const keyText=`${fold(title)}\n${fold(body.slice(0,12000))}\n${assets.join('\n')}`;
  const text=fold(`${title} ${summary}`),category=/hoc bong/.test(text)?'scholarship':/tot nghiep thpt|danh gia nang luc|danh gia tu duy/.test(text)?'exam':/quy che|huong dan|thong bao|ke hoach|diem chuan|trung tuyen|xet tuyen|nhap hoc/.test(text)?'guidance':'overview';
  return {article:{id:`${source.id.toLowerCase()}-${hash(canonical).slice(0,16)}`,sourceId:source.id,sourceName:source.name,sourceKind:source.kind,sourceScope:source.scope,admissionYear:year,date,title,summary,summaryKind:'source-excerpt',url:canonical,category,draft:/du thao|lay y kien/.test(fold(title)),contentHash:hash(keyText),verifiedAt:now.toISOString(),discoveredAt:now.toISOString()}};
}
export function discoverLinks(html,url,source){
  const $=load(html),links=[];
  $('a[href]').each((_,el)=>{
    const title=clean($(el).text()||$(el).attr('title'));
    if(!relevantTitle(title))return;
    try{const href=canonicalUrl($(el).attr('href'),url);if(allowedUrl(href,source)&&href!==canonicalUrl(url)&&! /\.(pdf|docx?|xlsx?|png|jpe?g|zip)(?:[?#]|$)/i.test(href))links.push(href);}catch{/* Ignore non-HTTP links. */}
  });
  return [...new Set(links)];
}
export function mergeArticles(existing,incoming){
  const eligible=existing.filter(a=>a.summaryKind==='editorial'||(relevantTitle(a.title)&&!archivePage(a.url,a.title,a.summary)));
  const articles=eligible.map(a=>({...a})),stats={added:0,updated:0,duplicate:0,removed:existing.length-eligible.length};
  for(const candidate of incoming){
    const sameUrl=articles.findIndex(a=>canonicalUrl(a.url)===canonicalUrl(candidate.url));
    if(sameUrl>=0){
      const old=articles[sameUrl];
      // Preserve manually reviewed summaries, dates and draft flags.
      if(old.summaryKind==='editorial'||(old.contentHash===candidate.contentHash&&['title','date','summary','category','draft'].every(key=>old[key]===candidate[key]))){stats.duplicate++;continue;}
      articles[sameUrl]={...candidate,id:old.id,discoveredAt:old.discoveredAt||candidate.discoveredAt};stats.updated++;continue;
    }
    if(articles.some(a=>(a.sourceId===candidate.sourceId&&fold(a.title)===fold(candidate.title)&&a.date===candidate.date)||(a.contentHash&&a.contentHash===candidate.contentHash))){stats.duplicate++;continue;}
    articles.push(candidate);stats.added++;
  }
  return {articles:articles.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)),stats};
}
export function validateNews(document,sources){
  if(document.schemaVersion!==1||!Number.isInteger(document.admissionYear)||!Array.isArray(document.articles)||!parseDate(document.updatedAt))throw new Error('Invalid news document');
  const ids=new Set(),urls=new Set();
  for(const article of document.articles){
    const source=sources.find(s=>s.id===article.sourceId),url=canonicalUrl(article.url);
    if(!source||!allowedUrl(url,source)||ids.has(article.id)||urls.has(url)||!parseDate(article.date)||typeof article.title!=='string'||article.title.length<15||article.title.length>600||typeof article.summary!=='string'||article.summary.length>1000||!['editorial','source-excerpt'].includes(article.summaryKind)||!['guidance','exam','scholarship','overview'].includes(article.category)||typeof article.id!=='string')throw new Error(`Invalid or duplicate article: ${article.id}`);
    if(article.summaryKind==='source-excerpt'&&(article.admissionYear!==document.admissionYear||!article.contentHash||!article.verifiedAt))throw new Error(`Missing verification: ${article.id}`);
    ids.add(article.id);urls.add(url);
  }
}
