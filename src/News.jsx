import React,{useState} from 'react';
import {CalendarDays,ExternalLink,Newspaper} from 'lucide-react';
import {Button,Empty,PageTitle} from './components';
import {admissionNews,ministryNewsUrl,newsCategories,newsReviewedAt,newsYear} from '../data/admission-news.mjs';
import './news.css';

const dateLabel=date=>date.split('-').reverse().join('/');
const searchText=text=>text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');

export default function News(){
  const [category,setCategory]=useState(''),[search,setSearch]=useState(''),[publisher,setPublisher]=useState(''),[school,setSchool]=useState(''),[page,setPage]=useState(1);
  const change=(setter,value)=>{setter(value);setPage(1);};
  const reset=()=>{setCategory('');setSearch('');setPublisher('');setSchool('');setPage(1);};
  const query=searchText(search.trim());
  const schools=[...new Map(admissionNews.filter(a=>a.sourceId!=='MOET').map(a=>[a.sourceId,a.sourceName||a.sourceId])).entries()].sort((a,b)=>a[1].localeCompare(b[1],'vi'));
  const articles=admissionNews.filter(article=>(!category||article.category===category)&&(!publisher||(publisher==='ministry'?article.sourceId==='MOET':article.sourceId!=='MOET'))&&(!school||article.sourceId===school)&&(!query||searchText(`${article.title} ${article.summary} ${article.sourceName||'Bộ GD&ĐT'} ${newsCategories[article.category]}`).includes(query)));
  return <>
    <PageTitle eyebrow="THÔNG TIN TỪ BỘ GD&ĐT VÀ CÁC TRƯỜNG" title="Tin tuyển sinh" action={<a className="button" href={ministryNewsUrl} target="_blank" rel="noreferrer">Xem tin mới trên website Bộ <ExternalLink size={16}/></a>}>
      Theo dõi quy chế, hướng dẫn và chính sách dành cho mùa tuyển sinh {newsYear}.
    </PageTitle>
    <section className="news-intro" aria-label="Về nguồn tin">
      <span className="news-symbol" aria-hidden="true"><Newspaper size={27}/></span>
      <div><h2>Nắm thông tin chính thức, chủ động chọn tương lai.</h2><p>Tin từ Bộ GD&ĐT và website chính thức của các trường. Mở bài gốc để đọc đầy đủ thông báo, cơ sở áp dụng và tài liệu đính kèm.</p><small>Dữ liệu cập nhật ngày {dateLabel(newsReviewedAt)} · Đoạn giới thiệu được ghi rõ là trích nguồn hoặc tóm tắt biên tập.</small></div>
    </section>
    <div className="news-publishers"><div className="news-categories" role="group" aria-label="Nguồn tin tuyển sinh">{[['','Tất cả nguồn'],['ministry','Bộ GD&ĐT'],['school','Các trường']].map(([key,label])=><button key={key} className={publisher===key?'active':''} aria-pressed={publisher===key} onClick={()=>{change(setPublisher,key);setSchool('');}}>{label}</button>)}</div>{publisher==='school'&&<label className="news-school">Chọn trường<select aria-label="Chọn trường" value={school} onChange={e=>change(setSchool,e.target.value)}><option value="">Tất cả trường có tin</option>{schools.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>}</div>
    <div className="news-toolbar">
      <div className="news-categories" role="group" aria-label="Chủ đề tin tuyển sinh">{[['','Tất cả'],...Object.entries(newsCategories)].map(([key,label])=><button key={key} className={category===key?'active':''} aria-pressed={category===key} onClick={()=>change(setCategory,key)}>{label}</button>)}</div>
      <label className="news-search">Tìm bài viết<input type="search" placeholder="Tên bài, tên trường, nguyện vọng…" value={search} onChange={e=>change(setSearch,e.target.value)}/></label>
    </div>
    <p className="caption" role="status">{articles.length} bài viết · Năm {newsYear} · Mới đến cũ</p>
    {articles.length?<><div className="news-grid">{articles.slice(0,page*12).map(article=><article className="news-card" key={article.id}>
      <div className="news-card-meta"><span className={`news-category ${article.category}`}>{newsCategories[article.category]}</span><time dateTime={article.date}><CalendarDays size={13}/>{dateLabel(article.date)}</time></div>
      {article.draft&&<span className="news-draft">Dự thảo · Đang lấy ý kiến tại thời điểm đăng</span>}
      <h2><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h2>
      {article.summary&&<p>{article.summary}</p>}
      <small className="news-excerpt-label">{article.summaryKind==='source-excerpt'?(article.summary?'Trích đoạn từ nguồn':'Xem nội dung tại bài gốc'):'Tóm tắt biên tập · UniGate'}{article.sourceScope&&` · ${article.sourceScope}`}</small>
      <div className="news-card-footer"><span>{article.sourceName||'Bộ GD&ĐT'} · {new URL(article.url).hostname}</span><a className="text-link" href={article.url} target="_blank" rel="noreferrer" aria-label={`Đọc bài gốc: ${article.title}`}>Đọc bài gốc <ExternalLink size={14}/></a></div>
    </article>)}</div>{articles.length>page*12&&<Button onClick={()=>setPage(value=>value+1)}>Xem thêm tin ({articles.length-page*12})</Button>}</>:<Empty title="Chưa tìm thấy bài viết phù hợp" action={<Button onClick={reset}>Xem tất cả tin</Button>}>Thử từ khóa khác hoặc chọn một chủ đề khác.</Empty>}
  </>;
}
