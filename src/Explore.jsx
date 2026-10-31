import React, {useEffect,useMemo,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,GitCompareArrows,MapPin,Search,SlidersHorizontal} from 'lucide-react';
import {useApp} from './context';
import {normalize} from './api';
import {Button,Empty,Link,MajorCard,MajorDetail,Notice,PageTitle,SourceLink} from './components';
import {admissionGroup,comparableAnnualTuition,fields,interestFit,matchesHolland,sortCatalogMajors} from '../shared/domain.mjs';

const pageSize=12;
export default function Explore({params}) {
  const {catalog,results,compare,scores}=useApp();
  const initialUniversity=params.get('university')||'';
  const initialGroup=initialUniversity && admissionGroup(catalog.majors.find(m=>m.universityId===initialUniversity) || {})==='composite' ? 'composite':'thpt';
  const [tab,setTab]=useState(params.get('mode')==='composite'?'composite':initialGroup);
  const [search,setSearch]=useState(''),[field,setField]=useState(params.get('field')||'');
  const [university,setUniversity]=useState(initialUniversity),[system,setSystem]=useState(params.get('system')||'');
  const [sort,setSort]=useState(params.get('sort')||'name'),[budget,setBudget]=useState(''),[combo,setCombo]=useState(params.get('combo')||'');
  const [verified,setVerified]=useState(false),[page,setPage]=useState(1),[missingPage,setMissingPage]=useState(1);
  const [showMissing,setShowMissing]=useState(Boolean(initialUniversity && catalog.majors.filter(m=>m.universityId===initialUniversity).every(m=>admissionGroup(m)==='unverified')));
  const [detail,setDetail]=useState(null);
  useEffect(()=>{setPage(1);setMissingPage(1);},[search,field,university,system,sort,budget,combo,verified,tab]);

  const matching=useMemo(()=>catalog.majors.map(m=>({...m,fit:interestFit(results[0]?.scores,m.holland)})).filter(m=>{
    const school=catalog.universities.find(u=>u.id===m.universityId);
    return (!search||normalize(`${m.name} ${m.code||''} ${school.name} ${school.id} ${fields[m.field].name}`).includes(normalize(search)))
      &&(!field||m.field===field)&&(!university||m.universityId===university)
      &&(!system||(system.startsWith('type:')?school.institutionType===system.slice(5):school.system===system))
      &&(!sort.startsWith('holland-cutoff-')||matchesHolland(m,results[0]?.code))
      &&(!budget||(comparableAnnualTuition(m)!==null&&comparableAnnualTuition(m)<=Number(budget)*1_000_000))
      &&(!combo||m.combinations.includes(combo))&&(!verified||m.verified);
  }),[catalog,results,search,field,university,system,sort,budget,combo,verified]);

  const thptCount=matching.filter(m=>admissionGroup(m)==='thpt').length;
  const compositeCount=matching.filter(m=>admissionGroup(m)==='composite').length;
  const missing=matching.filter(m=>admissionGroup(m)==='unverified');
  const filtered=useMemo(()=>sortCatalogMajors(matching.filter(m=>admissionGroup(m)===tab),sort,tab),[matching,sort,tab]);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const activePage=Math.min(page,pages);
  const currentPage=filtered.slice((activePage-1)*pageSize,activePage*pageSize);

  function selectUniversity(id) {
    setUniversity(id);
    if (!id) return;
    const schoolMajors=catalog.majors.filter(m=>m.universityId===id);
    if (schoolMajors.some(m=>admissionGroup(m)==='composite')) setTab('composite');
    else if (schoolMajors.some(m=>admissionGroup(m)==='thpt')) setTab('thpt');
    else setShowMissing(true);
  }
  function reset() {
    setSearch('');setField('');setUniversity('');setSystem('');setBudget('');setCombo('');setVerified(false);
    setSort('name');setTab('thpt');setShowMissing(false);
  }
  return <>
    <PageTitle title="Tìm ngành học, mở hướng đi" eyebrow="KHÁM PHÁ NGÀNH & TRƯỜNG">Chọn cách xét điểm để so sánh ngành đúng phương thức và đúng thang điểm tại 19 trường.</PageTitle>
    <div className="explore-layout">
      <aside className="panel filters">
        <h3><SlidersHorizontal size={18}/> Bộ lọc của bạn</h3>
        <label>Nhóm ngành<select value={field} onChange={e=>setField(e.target.value)}><option value="">Tất cả nhóm ngành</option>{Object.entries(fields).map(([id,f])=><option value={id} key={id}>{f.name}</option>)}</select></label>
        <label>Nhóm trường<select value={system} onChange={e=>{setSystem(e.target.value);setUniversity('');}}><option value="">Tất cả trường</option><optgroup label="Theo hệ thống"><option value="ĐHQG-HCM">8 trường thuộc ĐHQG-HCM</option><option value="Trường tại TP.HCM">10 trường khác tại TP.HCM</option><option value="Trường tại Cần Thơ">Đại học Cần Thơ</option></optgroup><optgroup label="Theo loại hình"><option value="type:public">Trường công</option><option value="type:private">Trường tư</option></optgroup></select></label>
        <label>Trường đại học<select value={university} onChange={e=>selectUniversity(e.target.value)}><option value="">Tất cả {catalog.universities.filter(u=>!system||(system.startsWith('type:')?u.institutionType===system.slice(5):u.system===system)).length} trường</option>{['ĐHQG-HCM','Trường tại TP.HCM','Trường tại Cần Thơ'].map(group=><optgroup label={group} key={group}>{catalog.universities.filter(u=>u.system===group&&(!system||(system.startsWith('type:')?u.institutionType===system.slice(5):u.system===system))).map(u=><option key={u.id} value={u.id}>{u.id} – {u.name.replace('Trường Đại học ','')}</option>)}</optgroup>)}</select></label>
        <label>Học phí tối đa / năm<select value={budget} onChange={e=>setBudget(e.target.value)}><option value="">Không giới hạn</option>{[35,45,55,70].map(n=><option key={n} value={n}>{n} triệu đồng</option>)}</select></label>
        <label>Tổ hợp đã đối chiếu<select value={combo} onChange={e=>setCombo(e.target.value)}><option value="">Tất cả tổ hợp</option>{[...new Set(catalog.majors.flatMap(m=>m.combinations))].sort().map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="checkbox-label"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> Chỉ nguồn chính thức</label>
        <p className="caption">Lọc học phí/năm không tính giá theo đợt/tín chỉ/học kỳ, lộ trình dự kiến khóa khác hoặc số liệu năm cũ; tổ hợp chỉ dùng dữ liệu đã đối chiếu.</p>
        <Button className="full" onClick={reset}>Xóa bộ lọc</Button>
        <div className="filter-note"><MapPin size={18}/><strong>Miền Nam</strong><p>Có trường thành viên ĐHQG-HCM ở An Giang và Đại học Cần Thơ.</p></div>
      </aside>
      <section>
        <div className="method-tabs" role="group" aria-label="Nhóm phương thức xét điểm">
          <button type="button" className={tab==='thpt'?'active':''} aria-pressed={tab==='thpt'} onClick={()=>setTab('thpt')}><span>Điểm THPT <small>/30</small></span><b>{thptCount}</b></button>
          <button type="button" className={tab==='composite'?'active':''} aria-pressed={tab==='composite'} onClick={()=>setTab('composite')}><span>Xét tổng hợp <small>/100</small></span><b>{compositeCount}</b></button>
        </div>
        <p className="method-caption">{tab==='thpt'?'Có điểm THPT hoặc mốc thang 30 do trường quy đổi chính thức. Điểm Cần Thơ dùng chung sau quy đổi học bạ/V-SAT.':'Điểm tổng hợp theo công thức riêng từng trường; gom theo trường, không so chéo thang 100. HCMUS có thêm cột /30 của cùng phương thức tổng hợp.'} ĐGNL vẫn hiển thị trên thẻ ngành khi có.</p>
        <div className="search-toolbar"><div className="search-input"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm ngành, trường, mã ngành…" aria-label="Tìm ngành hoặc trường"/></div><select aria-label="Sắp xếp ngành" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Tên ngành A–Z</option><option value="fit" disabled={!results.length}>Sở thích Holland</option><optgroup label="Lọc theo Holland của tôi"><option value="holland-cutoff-desc" disabled={!results.length}>Holland → điểm cao khi hòa</option><option value="holland-cutoff-asc" disabled={!results.length}>Holland → điểm thấp khi hòa</option></optgroup><optgroup label="Danh sách hiện tại"><option value="cutoff-desc">Điểm cao → thấp</option><option value="cutoff-asc">Điểm thấp → cao</option><option value="tuition">Học phí/năm tăng dần</option></optgroup></select></div>
        <div className="result-count"><span><strong>{filtered.length}</strong> ngành / chương trình · {tab==='thpt'?'Điểm THPT':'Xét tổng hợp'}</span>{compare.length>0&&<Link to="compare" className="text-link"><GitCompareArrows size={16}/> So sánh ({compare.length}/3)</Link>}</div>
        {sort.startsWith('holland-cutoff-')&&<Notice>Mã Holland {results[0]?.code}: lọc ngành theo nhóm mạnh nhất và một nhóm khác trong top 3 (nhóm C có thể ở vị trí bất kỳ). <strong>Xếp mức phù hợp Holland trước; khi bằng nhau mới xét điểm {tab==='thpt'?'THPT /30':'tổng hợp /100 trong cùng trường'}.</strong></Notice>}
        {tab==='composite'&&<Notice>Điểm tổng hợp /100 của Bách khoa, UIT, HCMUS và các trường khác có công thức khác nhau. UniGate chỉ sắp điểm <strong>trong cùng trường</strong>; không quy đổi chéo giữa các trường.</Notice>}
        {combo&&scores.combinations.find(c=>c.code===combo)&&<Notice>Điểm {combo} của bạn: <strong>{scores.combinations.find(c=>c.code===combo).total}/30</strong> (chưa ưu tiên, chưa quy đổi). Đây chỉ là lọc tổ hợp, không xác nhận đủ điều kiện trúng tuyển.</Notice>}
        {filtered.length?<>
          {tab==='composite'?[...new Set(currentPage.map(m=>m.universityId))].map(id=><section key={id}><h3 className="method-school-heading">{catalog.universities.find(u=>u.id===id)?.name} <small>· xét tổng hợp /100</small></h3><div className="major-grid explore-grid">{currentPage.filter(m=>m.universityId===id).map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div></section>):<div className="major-grid explore-grid">{currentPage.map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div>}
        </>:<Empty title={search?'Chưa có ngành khớp bộ lọc':'Không có ngành trong nhóm này'}>Thử đổi tab hoặc tìm ngành chưa có dữ liệu điểm ở mục bên dưới.</Empty>}
        {pages>1&&<div className="pagination"><Button disabled={activePage===1} onClick={()=>{setPage(p=>p-1);window.scrollTo(0,0);}} aria-label="Trang trước"><ChevronLeft size={18}/></Button><span>Trang {activePage} / {pages}</span><Button disabled={activePage===pages} onClick={()=>{setPage(p=>p+1);window.scrollTo(0,0);}} aria-label="Trang sau"><ChevronRight size={18}/></Button></div>}
        {missing.length>0&&<section className="unverified-section"><button type="button" className="text-link" aria-expanded={showMissing} onClick={()=>setShowMissing(v=>!v)}>{showMissing?'Ẩn':'Xem'} {missing.length} ngành chưa có dữ liệu điểm <ArrowRight size={16}/></button>{showMissing&&<><p className="caption">Các ngành này vẫn tra cứu, lưu nguyện vọng và so sánh được; UniGate chưa có điểm chuẩn gắn chính xác với chương trình.</p><div className="major-grid explore-grid">{missing.slice((missingPage-1)*pageSize,missingPage*pageSize).map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div>{missing.length>pageSize&&<div className="pagination"><Button disabled={missingPage===1} onClick={()=>setMissingPage(n=>n-1)} aria-label="Trang ngành chưa có điểm trước"><ChevronLeft size={18}/></Button><span>Trang {missingPage} / {Math.ceil(missing.length/pageSize)}</span><Button disabled={missingPage===Math.ceil(missing.length/pageSize)} onClick={()=>setMissingPage(n=>n+1)} aria-label="Trang ngành chưa có điểm sau"><ChevronRight size={18}/></Button></div>}</>}</section>}
      </section>
    </div>
    {detail&&<MajorDetail major={detail} onClose={()=>setDetail(null)}/>}
  </>;
}

export function Universities(){
  const {catalog}=useApp();
  return <><PageTitle title="19 ngôi trường, nhiều hướng khám phá" eyebrow="DANH MỤC TRƯỜNG ĐẠI HỌC">8 trường thành viên ĐHQG-HCM, 10 trường khác tại TP.HCM và Đại học Cần Thơ. Danh sách tuyển chọn, không xếp hạng.</PageTitle>{['ĐHQG-HCM','Trường tại TP.HCM','Trường tại Cần Thơ'].map(system=><section key={system}><div className="section-heading"><h2>{system==='ĐHQG-HCM'?'Thành viên ĐHQG-HCM':system==='Trường tại Cần Thơ'?'Đại học Cần Thơ':'10 trường khác tại TP.HCM'}</h2></div><div className="university-grid">{catalog.universities.filter(u=>u.system===system).map(u=><article className="panel university-card" key={u.id}><div className={`university-cover school-${u.id}`}><span>{u.id}</span><small>{system==='ĐHQG-HCM'?'VNU-HCM':u.province.toUpperCase()}</small></div><div className="university-body"><span className="field-label">Mã trường {u.code} · {u.province}</span><h2>{u.name}</h2><p>{u.description}</p><p className="caption">{u.coverage}</p><div className="section-heading"><strong>{catalog.majors.filter(m=>m.universityId===u.id).length} ngành / chương trình đã nhập</strong><SourceLink source={u.source}/></div><Link className="button full" to={`explore?university=${u.id}`}>Khám phá ngành học <ArrowRight size={16}/></Link></div></article>)}</div></section>)}</>;
}
export function Sources(){
  const {catalog}=useApp();
  return <><PageTitle title="Dữ liệu có nguồn, lựa chọn có cơ sở" eyebrow="MINH BẠCH DỮ LIỆU">Đối chiếu ngày {catalog.updatedAt}. Bạn luôn có thể mở nguồn gốc ngay từ trang chi tiết ngành.</PageTitle><Notice>8 trường thuộc ĐHQG-HCM, 10 trường khác ở TP.HCM và Đại học Cần Thơ được tuyển chọn để khám phá hướng nghiệp; không phải xếp hạng hoặc danh mục toàn bộ chương trình tuyển sinh. Không tự điền điểm chuẩn, học phí hoặc mã ngành khi chưa đối chiếu được.</Notice><div className="panel"><h2>Phạm vi dữ liệu từng trường</h2><div className="source-list">{catalog.universities.map(u=><div key={u.id}><span className={`school-badge school-${u.id}`}>{u.id}</span><div><h3>{u.name}</h3><p className="caption">{u.system} · {u.province}</p><p>{u.coverage}</p><SourceLink source={u.source}/><span className="caption"> · {u.source.title}</span></div></div>)}</div></div><div className="panel"><h2>Trắc nghiệm & cách gợi ý</h2><p>60 câu hỏi tiếng Việt được UniGate biên soạn mới theo 6 nhóm Holland/RIASEC, mỗi nhóm 10 câu. Mức trả lời 1–5; điểm mỗi nhóm là tổng 10 câu (10–50). Khi bằng điểm, mã 3 chữ giữ thứ tự R–I–A–S–E–C để nhất quán và hiển thị thông báo hòa điểm.</p><p>Nhóm ngành, mô tả nghề nghiệp và mã Holland của ngành là nội dung biên tập của UniGate. Chỉ số gợi ý = trung bình có trọng số 3:2:1 của ba nhóm liên quan, sau khi đổi điểm nhóm từ 10–50 về 0–100. Chỉ số phản ánh mức hứng thú tự báo cáo, không đánh giá năng lực hoặc dự báo tuyển sinh.</p><a className="text-link" href="https://www.onetcenter.org/IP.html" target="_blank" rel="noreferrer">Tài liệu tham khảo về mô hình RIASEC / O*NET <ArrowRight size={16}/></a></div></>;
}
