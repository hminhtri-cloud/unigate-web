import React, {useEffect,useMemo,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,GitCompareArrows,MapPin,Search,SlidersHorizontal} from 'lucide-react';
import {useApp} from './context';
import {normalize} from './api';
import {Button,Empty,Link,MajorCard,MajorDetail,Notice,PageTitle,SourceLink} from './components';
import {admissionGroup,admissionMethodLabel,emptySchoolFilters,fields,interestFit,matchesHolland,matchesSchoolFilter,partitionByAnnualTuition,schoolFiltersFromParams,sortCatalogMajors} from '../shared/domain.mjs';
import SchoolFilters from './SchoolFilters';
import CombinationFilter from './CombinationFilter';

const pageSize=12;
export default function Explore({params}) {
  const {catalog,results,compare,scores}=useApp();
  const sourceMajors=catalog.majors;
  const visibleUniversities=catalog.universities;
  const initialUniversity=params.get('university')||'';
  const initialGroup=initialUniversity && admissionGroup(sourceMajors.find(m=>m.universityId===initialUniversity) || {})==='composite' ? 'composite':'thpt';
  const [tab,setTab]=useState(params.get('mode')==='composite'?'composite':initialGroup);
  const [search,setSearch]=useState(''),[field,setField]=useState(params.get('field')||'');
  const [university,setUniversity]=useState(initialUniversity),[activeSchoolFilters,setSchoolFilters]=useState(()=>schoolFiltersFromParams(params));
  function changeSchoolFilters(next) {setSchoolFilters(next);setUniversity('');}
  const [sort,setSort]=useState(params.get('sort')||'name'),[budget,setBudget]=useState(''),[combo,setCombo]=useState(params.getAll('combo').filter(Boolean));
  const [method,setMethod]=useState(params.get('method')||'');
  const [applicantGroup,setApplicantGroup]=useState(params.get('applicantGroup')||'');
  const [verified,setVerified]=useState(false),[page,setPage]=useState(1),[missingPage,setMissingPage]=useState(1);
  const [showMissing,setShowMissing]=useState(Boolean(initialUniversity && sourceMajors.filter(m=>m.universityId===initialUniversity).every(m=>admissionGroup(m)==='unverified')));
  const [detail,setDetail]=useState(null);
  const [tuitionPage,setTuitionPage]=useState(1);
  useEffect(()=>{setPage(1);setMissingPage(1);setTuitionPage(1);},[search,field,university,activeSchoolFilters,sort,budget,combo,method,applicantGroup,verified,tab]);

  const allMatching=useMemo(()=>sourceMajors.map(m=>({...m,fit:interestFit(results[0]?.scores,m.holland)})).filter(m=>{
    const school=catalog.universities.find(u=>u.id===m.universityId);
    return (!search||normalize(`${m.name} ${m.code||''} ${school.name} ${school.id} ${fields[m.field].name}`).includes(normalize(search)))
      &&(!field||m.field===field)&&(!university||m.universityId===university)
      &&matchesSchoolFilter(school,activeSchoolFilters)
      &&(!sort.startsWith('holland-cutoff-')||matchesHolland(m,results[0]?.code))
      &&(!combo.length||combo.some(code=>m.combinations.includes(code)))&&(!verified||m.verified);
  }).filter(m=>(!method||m.admissionScores.some(s=>s.method===method))&&(!applicantGroup||m.admissionScores.some(s=>s.applicantGroup===applicantGroup)))
    .map(m=>applicantGroup?{...m,admissionScores:m.admissionScores.filter(s=>!s.applicantGroup||s.applicantGroup===applicantGroup)}:m),[catalog,sourceMajors,results,search,field,university,activeSchoolFilters,sort,budget,combo,method,applicantGroup,verified]);
  const tuition=partitionByAnnualTuition(allMatching,budget),matching=tuition.matching;
  const tuitionUnknown=sortCatalogMajors(tuition.unknown,'name');
  const tuitionPages=Math.max(1,Math.ceil(tuitionUnknown.length/pageSize)),activeTuitionPage=Math.min(tuitionPage,tuitionPages);

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
    const schoolMajors=sourceMajors.filter(m=>m.universityId===id);
    if(applicantGroup&&!schoolMajors.some(m=>m.admissionScores.some(s=>s.applicantGroup===applicantGroup)))setApplicantGroup('');
    if (schoolMajors.some(m=>admissionGroup(m)==='composite')) setTab('composite');
    else if (schoolMajors.some(m=>admissionGroup(m)==='thpt')) setTab('thpt');
    else setShowMissing(true);
  }
  function reset() {
    setSearch('');setField('');changeSchoolFilters({...emptySchoolFilters});setBudget('');setCombo([]);setVerified(false);
    setMethod('');
    setApplicantGroup('');
    setSort('name');setTab('thpt');setShowMissing(false);
  }
  return <>
    <PageTitle title="Tra cứu chương trình chi tiết" eyebrow="ĐIỂM CHUẨN & HỌC PHÍ" action={<Link to="universities" className="button">Quay lại Chọn trường</Link>}>Tra cứu toàn bộ danh mục tại {catalog.universities.length} trường/cơ sở, độc lập với ngành và hồ sơ xét tuyển đã chọn. Mỗi chương trình giữ đúng phương thức, thang điểm và học phí được đối chiếu.</PageTitle>
    <div className="explore-layout">
      <aside className="panel filters">
        <h3><SlidersHorizontal size={18}/> Bộ lọc của bạn</h3>
        <label>Nhóm ngành<select value={field} onChange={e=>setField(e.target.value)}><option value="">Tất cả nhóm ngành</option>{Object.entries(fields).map(([id,f])=><option value={id} key={id}>{f.name}</option>)}</select></label>
        <SchoolFilters value={activeSchoolFilters} onChange={changeSchoolFilters}/>
        <label>Trường / cơ sở đào tạo<select value={university} onChange={e=>selectUniversity(e.target.value)}><option value="">Tất cả {visibleUniversities.filter(u=>matchesSchoolFilter(u,activeSchoolFilters)).length} trường</option>{[...new Set(visibleUniversities.map(u=>u.system))].map(group=><optgroup label={group} key={group}>{visibleUniversities.filter(u=>u.system===group&&matchesSchoolFilter(u,activeSchoolFilters)).map(u=><option key={u.id} value={u.id}>{u.id} – {u.name.replace('Trường Đại học ','')}</option>)}</optgroup>)}</select></label>
        <label>Học phí tối đa / năm<select value={budget} onChange={e=>setBudget(e.target.value)}><option value="">Không giới hạn</option>{[35,45,55,70].map(n=><option key={n} value={n}>{n} triệu đồng</option>)}</select></label>
        <CombinationFilter label="Tổ hợp đã đối chiếu" options={[...new Set(sourceMajors.flatMap(m=>m.combinations))].sort().map(code=>({value:code,label:code}))} value={combo} onChange={setCombo}/>
        <label>Phương thức có dữ liệu<select value={method} onChange={e=>{setMethod(e.target.value);setShowMissing(true);}}><option value="">Tất cả phương thức</option>{[...new Set(sourceMajors.flatMap(m=>m.admissionScores.map(s=>s.method)))].map(key=><option key={key} value={key}>{admissionMethodLabel[key]||key}</option>)}</select></label>
        <label>Đối tượng xét tuyển có dữ liệu<select value={applicantGroup} onChange={e=>{setApplicantGroup(e.target.value);setShowMissing(true);}}><option value="">Tất cả đối tượng</option>{[...new Set(catalog.majors.flatMap(m=>m.admissionScores.map(s=>s.applicantGroup).filter(Boolean)))].sort().map(group=><option key={group} value={group}>{group}</option>)}</select></label>
        <label className="checkbox-label"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> Chỉ nguồn chính thức</label>
        <p className="caption">Khi lọc học phí, chương trình phù hợp mức /năm hiện trước; chương trình chưa đủ dữ liệu /năm nằm ở nhóm riêng cuối danh sách. Không tự quy đổi mức theo đợt/tín chỉ/học kỳ hoặc khóa khác.</p>
        <p className="caption">Mã tổ hợp giữ theo công bố từng trường. Lọc tổ hợp là lọc danh mục chương trình; mức điểm áp dụng cho tổ hợp nào được ghi riêng ở từng phương thức. Bộ tính tổng môn không thay thế công thức có trọng số hoặc năng khiếu.</p>
        <p className="caption">ĐT01/ĐT02/ĐT03 là nhóm do trường công bố. Khi các nhóm có điểm khác nhau, cần chọn nhóm trước khi xếp điểm; không tự lấy điểm ĐT01 cho mọi người.</p>
        <Button className="full" onClick={reset}>Xóa bộ lọc</Button>
        <div className="filter-note"><MapPin size={18}/><strong>Miền Nam</strong><p>Có trường ở Đông Nam Bộ, Đồng bằng sông Cửu Long và cơ sở ĐHQG-HCM tại An Giang.</p></div>
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
        {tab==='composite'&&!applicantGroup&&matching.some(m=>m.admissionScores.some(s=>s.applicantGroup))&&<Notice>Có trường công bố điểm theo ĐT01/ĐT02/ĐT03. Chọn <strong>Đối tượng xét tuyển có dữ liệu</strong> để xem và xếp đúng nhóm; khi các nhóm có điểm khác nhau, UniGate không tự lấy điểm của nhóm đầu tiên.</Notice>}
        {combo.some(code=>scores.combinations.some(c=>c.code===code))&&<Notice>Điểm tổ hợp của bạn: <strong>{scores.combinations.filter(c=>combo.includes(c.code)).map(c=>`${c.code}: ${c.total}/30`).join(' · ')}</strong> (chưa ưu tiên, chưa quy đổi). Đây chỉ là lọc tổ hợp, không xác nhận đủ điều kiện trúng tuyển.</Notice>}
        {filtered.length?<>
          {tab==='composite'?[...new Set(currentPage.map(m=>m.universityId))].map(id=><section key={id}><h3 className="method-school-heading">{catalog.universities.find(u=>u.id===id)?.name} <small>· xét tổng hợp /100</small></h3><div className="major-grid explore-grid">{currentPage.filter(m=>m.universityId===id).map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div></section>):<div className="major-grid explore-grid">{currentPage.map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div>}
        </>:<Empty title={search?'Chưa có ngành khớp bộ lọc':'Không có ngành trong nhóm này'}>Thử đổi tab hoặc tìm ngành chưa có dữ liệu điểm ở mục bên dưới.</Empty>}
        {pages>1&&<div className="pagination"><Button disabled={activePage===1} onClick={()=>{setPage(p=>p-1);window.scrollTo(0,0);}} aria-label="Trang trước"><ChevronLeft size={18}/></Button><span>Trang {activePage} / {pages}</span><Button disabled={activePage===pages} onClick={()=>{setPage(p=>p+1);window.scrollTo(0,0);}} aria-label="Trang sau"><ChevronRight size={18}/></Button></div>}
        {missing.length>0&&<section className="unverified-section">
          <button type="button" className="text-link" aria-expanded={showMissing} onClick={()=>setShowMissing(v=>!v)}>{showMissing?'Ẩn':'Xem'} {missing.length} ngành chưa có dữ liệu điểm THPT / tổng hợp <ArrowRight size={16}/></button>
          {showMissing&&<>
            <p className="caption">Có {missing.filter(m=>m.admissionScores.length).length} chương trình có điểm ở phương thức khác (ví dụ học bạ, năng khiếu); {missing.filter(m=>!m.admissionScores.length).length} chương trình chưa có điểm chuẩn đối chiếu. Xem từng phương thức trong chi tiết ngành; không hiểu thiếu điểm là điểm 0.</p>
            <div className="major-grid explore-grid">{missing.slice((missingPage-1)*pageSize,missingPage*pageSize).map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div>
            {missing.length>pageSize&&<div className="pagination"><Button disabled={missingPage===1} onClick={()=>setMissingPage(n=>n-1)} aria-label="Trang ngành chưa có điểm trước"><ChevronLeft size={18}/></Button><span>Trang {missingPage} / {Math.ceil(missing.length/pageSize)}</span><Button disabled={missingPage===Math.ceil(missing.length/pageSize)} onClick={()=>setMissingPage(n=>n+1)} aria-label="Trang ngành chưa có điểm sau"><ChevronRight size={18}/></Button></div>}
          </>}
        </section>}
        {tuitionUnknown.length>0&&<section className="tuition-unknown-section tuition-unknown-programs"><h2>Các ngành chưa có dữ liệu học phí/năm để đối chiếu</h2><p className="caption">{tuitionUnknown.length} chương trình khớp các bộ lọc còn lại, chưa đủ thông tin học phí/năm để xác nhận phù hợp mức {budget} triệu. Mức theo tín chỉ, học kỳ, toàn khóa hoặc khóa khác vẫn xem được trong chi tiết; không coi là học phí bằng 0.</p>
          <div className="major-grid explore-grid">{tuitionUnknown.slice((activeTuitionPage-1)*pageSize,activeTuitionPage*pageSize).map(m=><MajorCard key={m.id} major={m} fit={m.fit} onDetail={setDetail}/>)}</div>
          {tuitionPages>1&&<div className="pagination"><Button disabled={activeTuitionPage===1} onClick={()=>setTuitionPage(p=>p-1)} aria-label="Trang ngành chưa có học phí trước"><ChevronLeft size={18}/></Button><span>Trang {activeTuitionPage} / {tuitionPages}</span><Button disabled={activeTuitionPage===tuitionPages} onClick={()=>setTuitionPage(p=>p+1)} aria-label="Trang ngành chưa có học phí sau"><ChevronRight size={18}/></Button></div>}
        </section>}
      </section>
    </div>
    {detail&&<MajorDetail major={detail} onClose={()=>setDetail(null)}/>}
  </>;
}

export function Universities(){
  const {catalog}=useApp();
  const groups=[...new Set(catalog.universities.map(u=>u.system))];
  const title=system=>`${system} (${catalog.universities.filter(u=>u.system===system).length})`;
  return <><PageTitle title={`${catalog.universities.length} trường và cơ sở đào tạo`} eyebrow="DANH MỤC TRƯỜNG ĐẠI HỌC">Khám phá trường theo khu vực và loại hình đào tạo. Một số mục là phân hiệu, không phải trường độc lập; đây không phải bảng xếp hạng.</PageTitle>{groups.map(system=><section key={system}><div className="section-heading"><h2>{title(system)}</h2></div><div className="university-grid">{catalog.universities.filter(u=>u.system===system).map(u=><article className="panel university-card" key={u.id}><div className={`university-cover school-${u.id}`}><span>{u.id}</span><small>{system==='ĐHQG-HCM'?'VNU-HCM':u.province.toUpperCase()}</small></div><div className="university-body"><span className="field-label">{u.code?`Mã trường ${u.code} · `:''}{u.province} · {u.institutionType==='private'?'Trường tư':'Trường công'}</span><h2>{u.name}</h2><p>{u.description}</p><p className="caption">{u.coverage}</p><div className="section-heading"><strong>{catalog.majors.filter(m=>m.universityId===u.id).length} ngành / chương trình đã nhập</strong><SourceLink source={u.source}/></div><Link className="button full" to={`lookup?university=${u.id}`}>Khám phá ngành học <ArrowRight size={16}/></Link></div></article>)}</div></section>)}</>;
}
export function Sources(){
  const {catalog}=useApp();
  return <><PageTitle title="Dữ liệu có nguồn, lựa chọn có cơ sở" eyebrow="MINH BẠCH DỮ LIỆU">Đối chiếu ngày {catalog.updatedAt}. Bạn luôn có thể mở nguồn gốc ngay từ trang chi tiết ngành.</PageTitle><Notice>{catalog.universities.length} trường/cơ sở được tuyển chọn, gồm {catalog.universities.filter(u=>u.institutionType==='public').length} trường/cơ sở công lập và {catalog.universities.filter(u=>u.institutionType==='private').length} trường tư. Danh mục có các phân hiệu/cơ sở không phải trường độc lập; đây không phải bảng xếp hạng chính thức hoặc danh mục đầy đủ chương trình tuyển sinh. Không tự điền điểm chuẩn, học phí hoặc mã ngành khi chưa đối chiếu được.</Notice><div className="panel"><h2>Phạm vi dữ liệu từng trường</h2><div className="source-list">{catalog.universities.map(u=><div key={u.id}><span className={`school-badge school-${u.id}`}>{u.id}</span><div><h3>{u.name}</h3><p className="caption">{u.system} · {u.province} · {u.institutionType==='private'?'Trường tư':'Trường công'}</p><p>{u.coverage}</p><SourceLink source={u.source}/><span className="caption"> · {u.source.title}</span></div></div>)}</div></div><div className="panel"><h2>Trắc nghiệm & cách gợi ý</h2><p>60 câu hỏi tiếng Việt được UniGate biên soạn mới theo 6 nhóm Holland/RIASEC, mỗi nhóm 10 câu. Mức trả lời 1–5; điểm mỗi nhóm là tổng 10 câu (10–50). Khi bằng điểm, mã 3 chữ giữ thứ tự R–I–A–S–E–C để nhất quán và hiển thị thông báo hòa điểm.</p><p>Nhóm ngành, mô tả nghề nghiệp và mã Holland của ngành là nội dung biên tập của UniGate. Chỉ số gợi ý = trung bình có trọng số 3:2:1 của ba nhóm liên quan, sau khi đổi điểm nhóm từ 10–50 về 0–100. Chỉ số phản ánh mức hứng thú tự báo cáo, không đánh giá năng lực hoặc dự báo tuyển sinh.</p><p>Thứ tự trường ở bước Chọn trường do UniGate biên tập theo lĩnh vực đầu tiên bạn chọn và mức độ chuyên sâu của trường; không phải xếp hạng chất lượng có kiểm định. Bộ lọc STEM phân loại theo nhóm ngành do UniGate biên tập; không thay thế danh sách ngành đủ điều kiện học bổng, hỗ trợ học phí hoặc tín dụng của Nhà nước. Việc xét hỗ trợ phụ thuộc từng chính sách, trường và chương trình cụ thể.</p><a className="text-link" href="https://www.onetcenter.org/IP.html" target="_blank" rel="noreferrer">Tài liệu tham khảo về mô hình RIASEC / O*NET <ArrowRight size={16}/></a></div></>;
}
