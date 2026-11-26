import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {allowedUrl,canonicalUrl,discoverLinks,extractArticle,mergeArticles,parseDate,relevantTitle,targetCycle,validateNews} from '../scripts/news-core.mjs';
import {newsSources} from '../data/news-sources.mjs';

const source={id:'TEST',name:'Trường kiểm thử',kind:'school',hosts:['school.edu.vn']};
const now=new Date('2026-11-26T08:00:00Z');
const title='Thông báo tuyển sinh đại học chính quy năm 2026';
const body='Trường thông báo hướng dẫn đăng ký xét tuyển đại học chính quy năm 2026. Thí sinh đọc kỹ các điều kiện áp dụng, kiểm tra thông tin trên hệ thống và thực hiện theo hướng dẫn tại website chính thức của trường. Không sử dụng thông tin đăng ký cho chương trình của cơ sở khác.';
const html=(extra='',text=body)=>`<html><head><meta property="article:published_time" content="2026-11-20T08:00:00+07:00">${extra}</head><body><article><h1>${title}</h1><div class="entry-content"><p>${text}</p></div></article></body></html>`;
const extract=(markup=html(),url='https://school.edu.vn/tin/bai-2026')=>extractArticle(markup,url,source,{now,year:2026});

test('dates are calendar-valid, publication dates never inferred from URL or footer',()=>{
  assert.equal(parseDate('Thứ ba, 5/2/2026 | 10:00',now),'2026-02-05');
  assert.equal(parseDate('2026-11-20T08:00:00+07:00',now),'2026-11-20');
  assert.equal(parseDate('10 tháng 8, 2026',now),'2026-08-10');
  for(const value of ['31/02/2026','2026-13-01','2027-01-01','2026',''])assert.equal(parseDate(value,now),null);
  const noDate=html().replace(/<meta[^>]+>/,'').replace('</body>','<footer class="date">20/11/2026</footer></body>');
  assert.equal(extract(noDate).reason,'missing-or-invalid-published-date');
});

test('homepages, root canonical and related-article dates cannot masquerade as news',()=>{
  assert.equal(extract(html(),'https://school.edu.vn/').reason,'homepage-not-article');
  assert.equal(extract(html('<link rel="canonical" href="https://school.edu.vn/">')).reason,'canonical-not-article');
  const withoutDate=html().replace(/<meta[^>]+>/,'').replace('</body>','<article><h2>Bài liên quan</h2><time datetime="2026-11-20">20/11/2026</time></article></body>');
  assert.equal(extract(withoutDate).reason,'missing-or-invalid-published-date');
});

test('canonical URL removes tracking but retains article IDs and hash routes',()=>{
  assert.equal(canonicalUrl('/article?id=5&utm_source=fb&fbclid=xx#section','https://school.edu.vn'),'https://school.edu.vn/article?id=5');
  assert.equal(canonicalUrl('https://school.edu.vn/#/news/article-123'),'https://school.edu.vn/#/news/article-123');
  for(const url of ['javascript:alert(1)','file:///etc/passwd'])assert.throws(()=>canonicalUrl(url));
});

test('official hosts are exact; external canonical and lookalike hosts rejected',()=>{
  for(const url of ['https://school.edu.vn.evil.test/a','https://school.edu.vn@evil.test/a','https://evil.test/a','http://127.0.0.1/','https://school.edu.vn:444/a'])assert.equal(allowedUrl(url,source),false);
  assert.equal(allowedUrl('https://www.school.edu.vn/a',source),true);
  assert.equal(extract(html('<link rel="canonical" href="https://evil.test/a">')).reason,'untrusted-canonical');
});

test('extracts trusted article facts and source excerpt; ignores scripts',()=>{
  const {article}=extract(html('<script>throw new Error("not executed")</script>'));
  assert.equal(article.title,title);assert.equal(article.date,'2026-11-20');assert.equal(article.sourceKind,'school');
  assert.equal(article.summary,body);assert.equal(article.summaryKind,'source-excerpt');
  assert.match(article.contentHash,/^[a-f0-9]{64}$/);assert.equal(article.admissionYear,2026);
});

test('year relevance uses content, not publication year; future cycle heading rejected',()=>{
  assert.equal(targetCycle('Tuyển sinh năm 2027',body,2026),false);
  assert.equal(targetCycle(title,'',2026),true);
  assert.equal(extract(html().replace('2026-11-20T08:00:00+07:00','2025-11-20T08:00:00+07:00')).article.date,'2025-11-20');
  assert.equal(extractArticle(html(),'https://school.edu.vn/a',source,{now,year:2026,notBefore:'2026-11-21'}).reason,'outside-lookback');
  assert.equal(extract(html().replace(title,'Thông báo tuyển sinh thạc sĩ năm 2026')).reason,'unrelated-or-not-an-article');
});

test('discovery excludes external sources, documents and unrelated links',()=>{
  const links=discoverLinks(`<a href="/tin/1?utm_source=test">${title}</a><a href="/tin/1">${title}</a><a href="https://evil.test/tin">${title}</a><a href="/file.pdf">${title}</a><a href="/jobs">Tuyển dụng giảng viên</a>`,'https://school.edu.vn/',source);
  assert.deepEqual(links,['https://school.edu.vn/tin/1']);
});

test('repeat runs are idempotent; changed original replaces same record, preserves discovery',()=>{
  const a=extract().article;
  const first=mergeArticles([], [a,a]);assert.equal(first.stats.added,1);assert.equal(first.stats.duplicate,1);
  const again=mergeArticles(first.articles,[{...a,verifiedAt:'2026-11-27T00:00:00Z'}]);
  assert.deepEqual(again.articles,first.articles);assert.equal(again.stats.updated,0);
  const changed=mergeArticles(first.articles,[{...a,contentHash:'changed',summary:'Thông tin đã sửa',discoveredAt:'2026-11-27T00:00:00Z'}]);
  assert.equal(changed.stats.updated,1);assert.equal(changed.articles[0].discoveredAt,a.discoveredAt);
  const editorial={...a,summaryKind:'editorial',summary:'Nội dung đã biên tập'};
  assert.equal(mergeArticles([editorial],[a]).articles[0].summary,editorial.summary);
});

test('duplicate canonical, source/title/date and copied content do not create extra records',()=>{
  const a=extract().article;
  const duplicates=[{...a,id:'other',url:'https://school.edu.vn/other'},{...a,id:'another',url:'https://school.edu.vn/third',title:'Một tiêu đề bài viết khác'}];
  assert.equal(mergeArticles([a],duplicates).articles.length,1);
});

test('JSON-LD graph and draft status are supported',()=>{
  const markup=html().replace(/<meta[^>]+>/,'<script type="application/ld+json">{"@graph":[{"@type":"NewsArticle","datePublished":"2026-11-19"}]}</script>').replace(title,'Lấy ý kiến dự thảo quy chế tuyển sinh năm 2026');
  assert.equal(extract(markup).article.date,'2026-11-19');assert.equal(extract(markup).article.draft,true);
});

test('student news excludes postgraduate, second-degree, distance courses and archives',()=>{
  for(const title of ['Thông tin tuyển sinh văn bằng thứ hai năm 2026','Thông báo tuyển sinh chuyên khoa cấp I năm 2026','Thông báo tuyển sinh đại học thường xuyên năm 2026','Tuyển sinh đào tạo từ xa năm 2026','Thông báo chuyển tiền học bổng năm 2026','Thông báo về việc tuyển sinh Trung cấp năm 2026','Thông báo Tuyển sinh hệ Cao đẳng 9+ năm 2026'])assert.equal(relevantTitle(title),false);
  const a={...extract().article,title:'Thông báo tuyển sinh chuyên khoa cấp I năm 2026'};
  assert.equal(mergeArticles([a],[]).stats.removed,1);
  assert.equal(extract(html(),'https://school.edu.vn/thong-tin-tuyen-sinh-cac-nam/').reason,'archive-not-news');
});

test('invalid template descriptions and bare links are not excerpts',()=>{
  assert.equal(extract(html('<meta property="og:description" content="%">')).article.summary,body);
  assert.equal(extract(html('<meta property="og:description" content="Thông báo tuyển sinh năm 2025 body font-family: Times New Roman; font-size: 16px; line-height: 1.6">')).article.summary,body);
  const original=extract().article;
  const fixed=mergeArticles([{...original,summary:'%'}],[original]);
  assert.equal(fixed.stats.updated,1);assert.equal(fixed.articles[0].summary,body);
});

test('view counters do not change fingerprints; article image changes do',()=>{
  const first=extract(html().replace('<p>','<div class="entry-meta">123 lượt xem</div><p>'));
  const again=extract(html().replace('<p>','<div class="entry-meta">124 lượt xem</div><p>'));
  assert.equal(first.article.contentHash,again.article.contentHash);
  const image=extract(html().replace('</p>','</p><img src="/new-table.png">'));
  assert.notEqual(first.article.contentHash,image.article.contentHash);
});

test('alternative postgraduate and continuing-education wording stays outside student news',()=>{
  for(const title of ['Danh sách thí sinh đăng ký xét tuyển cao học khóa 31 năm 2026','Thông báo tuyển sinh đại học hình thức thường xuyên năm 2026','Thông báo tuyển sinh hình thức đào tạo thường xuyên năm 2026'])assert.equal(relevantTitle(title),false);
});

test('configured schools only grant catalogue official hosts, never third-party score sites',async()=>{
  assert.equal(newsSources.length,100);
  assert.ok(newsSources.every(s=>s.hosts.length&&s.entries.every(url=>allowedUrl(url,s))));
  const agu=newsSources.find(s=>s.id==='AGU');assert.ok(!agu.hosts.includes('diemthi.tuyensinh247.com'));
  const data=JSON.parse(await readFile(new URL('../data/admission-news.json',import.meta.url),'utf8'));
  validateNews(data,newsSources);
  const invalid=structuredClone(data);invalid.articles.push(invalid.articles[0]);
  assert.throws(()=>validateNews(invalid,newsSources));
});
