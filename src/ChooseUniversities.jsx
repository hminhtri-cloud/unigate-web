import React,{useMemo,useState} from 'react';
import {ArrowRight,Search} from 'lucide-react';
import {useApp} from './context';
import {money,normalize} from './api';
import {Button,ChoiceSteps,Empty,Link,MajorCard,MajorDetail,Notice,PageTitle,SchoolDetail,SourceLink} from './components';
import {annualEstimateLabel,estimatedAnnualTuition} from '../shared/programme-facts.mjs';
import SchoolFilters from './SchoolFilters';
import CombinationFilter from './CombinationFilter';
import {admissionMethodLabel,comparableAnnualTuition,emptySchoolFilters,interestFit,matchesSchoolFilter,matchesSelectedMajor,partitionByAnnualTuition,schoolFiltersFromParams,sortMatchingSchools} from '../shared/domain.mjs';
import {admissionProfileReady,matchAdmissionProfile,profileCombinations,studentProfileSummary} from '../shared/admission-profile.mjs';

export function ChooseUniversities({params=new URLSearchParams()}) {
  const {catalog,results,selectedMajors,scores}=useApp();
  const [search,setSearch]=useState(''),[schoolFilters,setSchoolFilters]=useState(()=>schoolFiltersFromParams(params)),[budget,setBudget]=useState(''),[expanded,setExpanded]=useState(''),[detail,setDetail]=useState(null);
  const [method,setMethod]=useState(''),[combos,setCombos]=useState([]);
  const [schoolDetail,setSchoolDetail]=useState(null);
  const assessed=useMemo(()=>catalog.majors.filter(m=>matchesSelectedMajor(m,selectedMajors)).map(m=>({...m,fit:interestFit(results[0]?.scores,m.holland),admissionMatch:matchAdmissionProfile(m,scores)})),[catalog,selectedMajors,results,scores]);
  const matched=assessed.filter(m=>m.admissionMatch.status==='matched');
  const filtered=matched.filter(m=>(!method||m.admissionMatch.matches.some(r=>r.method===method))&&(!combos.length||m.admissionMatch.matches.some(r=>(!method||r.method===method)&&r.combinations.some(c=>combos.includes(c.code)))));
  const tuition=partitionByAnnualTuition(filtered,budget);
  const exactCode=catalog.universities.some(u=>normalize(u.id)===normalize(search));
  function groupedSchools(programs){return sortMatchingSchools(catalog.universities.map(u=>({...u,programs:programs.filter(m=>m.universityId===u.id)})).filter(u=>u.programs.length&&(!search||(exactCode?normalize(u.id)===normalize(search):normalize(`${u.name} ${u.id} ${u.province}`).includes(normalize(search))))&&matchesSchoolFilter(u,schoolFilters)),selectedMajors);}
  const schools=groupedSchools(tuition.matching),unknownSchools=groupedSchools(tuition.unknown);
  function renderSchools(items,group){return <div className="school-choice-list">{items.map(u=>{
    const key=`${group}-${u.id}`;
    return <article className="panel school-choice-card" key={key}>
      <div className="school-choice-heading"><span className={`school-badge school-${u.id}`}>{u.id}</span><div><h2><button className="text-button" onClick={()=>setSchoolDetail(u)}>{u.name}</button></h2><p className="caption">{u.system} · {u.province} · {u.programs.length} chương trình khớp</p></div></div>
      <div className="school-program-fees">{u.programs.map(program=><div key={program.id}><span>{program.name}</span><strong>{estimatedAnnualTuition(program)?annualEstimateLabel(estimatedAnnualTuition(program)):comparableAnnualTuition(program)!==null?`${money(comparableAnnualTuition(program))}/năm`:'Chưa đối chiếu học phí/năm'}</strong></div>)}</div>
      <div className="button-row"><Button onClick={()=>setExpanded(expanded===key?'':key)} aria-expanded={expanded===key} aria-controls={`programs-${key}`}>{expanded===key?'Ẩn':'Xem'} {u.programs.length} chương trình <ArrowRight size={15}/></Button><Button onClick={()=>setSchoolDetail(u)}>Thông tin trường</Button><SourceLink source={u.source}/></div>
      {expanded===key&&<div id={`programs-${key}`} className="major-grid explore-grid">{[...u.programs].sort((a,b)=>(b.fit??-1)-(a.fit??-1)||a.name.localeCompare(b.name,'vi')).map(m=><MajorCard major={m} fit={m.fit} key={m.id} onDetail={setDetail} showWishButton/>)}</div>}
    </article>;
  })}</div>;}
  if(!selectedMajors.length)return <><PageTitle title="Chọn trường phù hợp với ngành" eyebrow="BƯỚC 3 · CHỌN TRƯỜNG"/><ChoiceSteps step={3}/><Empty title="Hãy chọn ngành trước" action={<Link to="explore" className="button primary">Đến Chọn ngành <ArrowRight size={16}/></Link>}>Chọn ngành bạn quan tâm trước khi lọc trường theo hồ sơ xét tuyển.</Empty></>;
  if(!admissionProfileReady(scores))return <><PageTitle title="Nhập hồ sơ xét tuyển trước khi chọn trường"/><ChoiceSteps step={3}/><Empty title="Cần lưu điểm và phương thức xét tuyển" action={<Link to="admission-scores" className="button primary">Nhập điểm & phương thức <ArrowRight size={16}/></Link>}>Chọn đúng môn thi THPT hoặc nhập điểm kỳ thi khác để UniGate đối chiếu với phương thức của từng chương trình.</Empty></>;
  return <>
    <PageTitle title="Chọn trường cho ngành bạn thích" eyebrow="BƯỚC 3 · CHỌN TRƯỜNG" action={<Link to="admission-scores" className="button">Sửa điểm & phương thức</Link>}>Có {matched.length} chương trình tại {new Set(matched.map(m=>m.universityId)).size} trường khớp ngành đã chọn và dữ liệu phương thức/tổ hợp trong hồ sơ của bạn. Xem điểm chuẩn, học phí, nguồn và chi tiết chương trình ngay tại đây.</PageTitle>
    <ChoiceSteps step={3}/>
    <Notice><strong>Hồ sơ đang dùng:</strong> {studentProfileSummary(scores)}. Đây là đối chiếu phương thức/tổ hợp, không phải kết luận trúng tuyển hoặc đủ mọi điều kiện của trường.</Notice>
    <p className="caption admission-coverage">Đã đối chiếu {assessed.length} chương trình thuộc ngành đã chọn: {matched.length} khớp; {assessed.filter(m=>m.admissionMatch.status==='not-matched').length} không khớp dữ liệu hiện có; {assessed.filter(m=>m.admissionMatch.status==='unknown').length} chưa đủ dữ liệu phương thức/tổ hợp hoặc điều kiện kết hợp. Chương trình chưa đủ dữ liệu không xuất hiện trong danh sách khớp; không đồng nghĩa trường không tuyển sinh theo hồ sơ của bạn.</p>
      <div className="school-choice-filters panel">
        <label className="school-search-field"><span>Tìm trường</span><div className="search-input"><Search size={18}/><input value={search} aria-label="Tìm trường" placeholder="Tên trường hoặc mã trường…" onChange={e=>setSearch(e.target.value)}/></div></label>
        <SchoolFilters value={schoolFilters} onChange={setSchoolFilters}/>
        <label><span>Học phí tối đa / năm</span><select aria-label="Học phí tối đa / năm" value={budget} onChange={e=>setBudget(e.target.value)}><option value="">Không giới hạn</option>{[35,45,55,70].map(n=><option value={n} key={n}>{n} triệu đồng</option>)}</select></label>
        <label><span>Phương thức khớp hồ sơ</span><select aria-label="Phương thức khớp hồ sơ" value={method} onChange={e=>{setMethod(e.target.value);setCombos([]);}}><option value="">Tất cả phương thức khớp</option>{[...new Set(matched.flatMap(m=>m.admissionMatch.matches.map(r=>r.method)))].map(key=><option value={key} key={key}>{admissionMethodLabel[key]||key}</option>)}</select></label>
        <CombinationFilter options={profileCombinations(scores).map(c=>({value:c.code,label:`${c.code} · ${c.total.toLocaleString('vi-VN')}/30`}))} value={combos} onChange={setCombos}/>
        <Button onClick={()=>{setSchoolFilters({...emptySchoolFilters});setSearch('');setBudget('');setMethod('');setCombos([]);setExpanded('');}}>Xóa bộ lọc trường</Button>
      </div>
      {budget&&<p className="caption">Học phí/năm công bố hoặc ước tính có đủ đơn giá và lộ trình phù hợp được xếp trước; với khoảng ước tính dùng mức trên để lọc. Ước tính chia đều số tín chỉ/kỳ cho số năm, chưa gồm tăng học phí và khoản thu riêng. Chương trình chưa đủ dữ liệu nằm ở nhóm bên dưới.</p>}
      <p className="caption">Thứ tự trường là gợi ý biên tập theo ngành đã chọn, không phải bảng xếp hạng chất lượng chính thức.</p>
      <section className="tuition-primary-schools"><div className="section-heading"><h2>{schools.length} trường {budget?'phù hợp mức học phí':'khớp hồ sơ'}</h2><span className="caption">Chỉ các chương trình khớp phương thức/tổ hợp được hiển thị.</span></div>
        {schools.length?renderSchools(schools,'primary'):<Empty title={unknownSchools.length?'Chưa có chương trình xác nhận phù hợp mức học phí':'Không có trường khớp hồ sơ và bộ lọc'}>{unknownSchools.length?'Bạn vẫn có thể tham khảo các chương trình chưa đủ dữ liệu học phí ở nhóm bên dưới.':'Thử đổi bộ lọc hoặc cập nhật điểm/phương thức thực sự có.'}</Empty>}
      </section>
      {unknownSchools.length>0&&<section className="tuition-unknown-schools tuition-unknown-section"><h2>Các ngành chưa có dữ liệu học phí/năm để đối chiếu</h2><p className="caption">{unknownSchools.reduce((sum,u)=>sum+u.programs.length,0)} chương trình tại {unknownSchools.length} trường vẫn khớp ngành và hồ sơ xét tuyển. Một số có mức theo tín chỉ, học kỳ, toàn khóa hoặc khóa khác; chưa đủ cơ sở xác nhận phù hợp ngân sách. Bạn vẫn có thể xem chi tiết và chọn nguyện vọng.</p>{renderSchools(unknownSchools,'unknown')}</section>}
    {detail&&<MajorDetail major={detail} onClose={()=>setDetail(null)}/>}
    {schoolDetail&&<SchoolDetail university={schoolDetail} onClose={()=>setSchoolDetail(null)}/>}
  </>;
}
