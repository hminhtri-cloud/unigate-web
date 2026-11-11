import React, { useEffect,useId,useRef,useState } from 'react';
import { ArrowRight, Bookmark, Check, ExternalLink, GitCompareArrows, GraduationCap, Info, Search, X, LoaderCircle } from 'lucide-react';
import { useApp } from './context';
import { money } from './api';
import { fields,groups,interestFit,thptSortingScore,admissionMethodLabel,admissionGroup } from '../shared/domain.mjs';
import {annualEstimateLabel,durationLabel,estimatedAnnualTuition} from '../shared/programme-facts.mjs';
import {featuredSchools,schoolProfiles} from '../data/school-profiles.mjs';
export function Link({to,children,...props}) { return <a href={`#/${to || ''}`} {...props}>{children}</a>; }
export function Brand() { return <Link to="" className="brand"><span className="brand-mark"><GraduationCap size={27}/></span><span>Uni<span>Gate</span><small>MỞ LỐI TƯƠNG LAI</small></span></Link>; }
export function Button({children,className='',busy=false,...props}) { return <button {...props} disabled={props.disabled || busy} className={`button ${className}`} aria-busy={busy}>{busy && <LoaderCircle size={17} className="spin"/>}{children}</button>; }
export function ErrorMessage({children}) { return children ? <div className="error" role="alert">{children}</div> : null; }
export function Notice({children}) { return <div className="notice"><Info size={18}/><div>{children}</div></div>; }
export function Empty({title,children,action}) { return <div className="empty"><span className="empty-icon"><Search size={30}/></span><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function PageTitle({eyebrow='HÀNH TRÌNH CỦA BẠN',title,children,action}) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</div>{action}</div>; }
export function ChoiceSteps({step}) {return <nav className="choice-step" aria-label="Các bước chọn ngành và trường">{[['explore','1. Chọn ngành'],['admission-scores','2. Điểm & phương thức'],['universities','3. Chọn trường']].map(([to,label],index)=><React.Fragment key={to}>{index>0&&<span aria-hidden="true">→</span>}{step===index+1?<strong aria-current="step">{label}</strong>:<Link to={to}>{label}</Link>}</React.Fragment>)}</nav>;}
export function SourceLink({source}) { return <a className="source-link" href={source.url} target="_blank" rel="noreferrer">{source.kind==='secondary'?'Nguồn tham khảo':'Nguồn chính thức'} <ExternalLink size={13}/></a>; }
export function Modal({title,onClose,children}) {
  const ref=useRef(null),id=useId();
  useEffect(()=>{ const d=ref.current,trigger=document.activeElement;d.showModal(); const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{if(d.open)d.close();document.body.style.overflow=prev;if(trigger?.isConnected)trigger.focus({preventScroll:true});}; },[]);
  return <dialog ref={ref} className="modal" aria-labelledby={id} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="modal-inner"><div className="section-heading"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Đóng" onClick={onClose}><X/></button></div>{children}</div></dialog>;
}
export function AdmissionScores({major,compact=false}) {
  const scores=major.admissionScores||[];
  if (!scores.length) return <><span className="muted">UniGate chưa nhập được điểm chuẩn đối chiếu đúng chương trình; không đồng nghĩa trường không công bố.</span>{!compact&&major.admissionMissingReason&&<p className="caption">{major.admissionMissingReason}</p>}</>;
  const primary=scores.filter(s=>['thpt','thpt-equivalent','dgnl'].includes(s.method));
  const visible=compact?[...primary,...scores.filter(s=>!primary.includes(s))].slice(0,3):scores;
  return <div className={`admission-scores ${compact?'compact':''}`}>
    {visible.map((score,i)=><div key={`${score.method}-${score.year}-${i}`}>
      <span>{score.methodLabel||admissionMethodLabel[score.method]||score.method} {score.year}</span>
      <strong>{score.value.toLocaleString('vi-VN',{minimumFractionDigits:score.scale===30?2:0,maximumFractionDigits:2})}{score.scale!=null?`/${score.scale}`:' điểm'}</strong>
      {(score.combinations?.length>0||score.combinationExpression)&&<p className="caption">{score.combinationExpression||`Tổ hợp: ${score.combinations.join(', ')}`}{score.combinationScope==='same-cutoff'?' · Chung mức điểm cho các tổ hợp này.':''}</p>}
      {!compact&&<>
        {['thpt','thpt-equivalent'].includes(score.method)&&!score.combinations?.length&&!score.combinationExpression&&<p className="caption">Chưa đối chiếu tổ hợp gắn với mức điểm này; không tự áp dụng cho mọi tổ hợp.</p>}
        {score.scale==null&&<p className="caption">Chưa đối chiếu thang điểm tối đa; giữ nguyên số trường công bố.</p>}
        <p className="caption">{score.note}</p>
        <a href={score.source} target="_blank" rel="noreferrer" className="source-link">Thông báo chính thức <ExternalLink size={13}/></a>
        {score.combinationSource&&score.combinationSource!==score.source&&<a href={score.combinationSource} target="_blank" rel="noreferrer" className="source-link">Nguồn tổ hợp <ExternalLink size={13}/></a>}
        {score.ruleSource&&score.ruleSource!==score.source&&<a href={score.ruleSource} target="_blank" rel="noreferrer" className="source-link">Nguồn quy tắc / nhóm xét tuyển <ExternalLink size={13}/></a>}
      </>}
    </div>)}
    {compact&&scores.length>visible.length&&<p className="caption">+{scores.length-visible.length} mức điểm/phương thức khác · xem chi tiết ngành</p>}
  </div>;
}
export function AdmissionMatch({major}) {
  if(!major.admissionMatch?.matches?.length)return null;
  return <div className="profile-match"><strong>Khớp hồ sơ xét tuyển</strong>{major.admissionMatch.matches.map((match,index)=><p key={`${match.method}-${index}`}>{match.label}{match.combinations.length?` · ${match.combinations.map(c=>c.code).join(', ')}`:''} <a className="source-link" href={match.source} target="_blank" rel="noreferrer">Nguồn đối chiếu <ExternalLink size={12}/></a></p>)}</div>;
}
export function TuitionSummary({major}) {
  const tuition=major.tuition,estimate=estimatedAnnualTuition(major);
  if(!tuition)return <strong>Chưa đối chiếu</strong>;
  return <span className="tuition-summary"><strong>{tuition.approximate?'≈ ':''}{money(tuition.value)}{tuition.maxValue&&tuition.maxValue!==tuition.value?`–${money(tuition.maxValue)}`:''}/{tuition.period}</strong>{estimate&&<small className="annual-estimate">({annualEstimateLabel(estimate)})</small>}</span>;
}
export function SchoolDetail({university,onClose,field}) {
  const {catalog}=useApp(),profile=schoolProfiles[university.id],programs=catalog.majors.filter(m=>m.universityId===university.id);
  const offeredFields=[...new Set(programs.map(m=>m.field))];
  const notable=Object.entries(featuredSchools).filter(([,ids])=>ids.includes(university.id)).map(([key])=>key);
  return <Modal title={`Thông tin trường: ${university.name}`} onClose={onClose}>
    <div className="school-profile"><p>{university.description}</p>
      <div className="detail-grid"><div><small>Loại hình · bậc đào tạo</small><strong>{university.institutionType==='private'?'Tư thục':'Trường công'} · {university.educationLevel==='college'?'Cao đẳng':'Đại học / Học viện'}</strong></div><div><small>Khu vực · mã trường</small><strong>{university.province} · {university.code||university.id}</strong></div></div>
      {notable.length>0&&<section className="guide-section"><h3>Trường nổi bật trong lĩnh vực</h3><p>{notable.map(key=>fields[key].name).join(' · ')}</p><p className="caption">Danh sách gợi ý do UniGate biên tập dựa trên lĩnh vực đào tạo trong danh mục và nguồn chương trình của trường; không phải bảng xếp hạng chính thức. {field?`Bạn đang tìm hiểu ${fields[field].name}.`:''}</p></section>}
      <section className="guide-section"><h3>Thông tin hữu ích cho học sinh</h3>
        {profile?.address&&<p><strong>Địa chỉ/cơ sở:</strong> {profile.address}</p>}
        {profile?.phone&&<p><strong>Liên hệ tư vấn:</strong> {profile.phone}</p>}
        {profile?.email&&<p><strong>Email:</strong> <a className="text-link" href={`mailto:${profile.email}`}>{profile.email}</a></p>}
        <p><strong>Lĩnh vực trong danh mục:</strong> {offeredFields.map(key=>fields[key].name).join(' · ')}</p>
        <div className="school-profile-links"><a className="source-link" href={university.website} target="_blank" rel="noreferrer">Website trường <ExternalLink size={13}/></a>{profile?.links.map(([label,url])=><a key={url} className="source-link" href={url} target="_blank" rel="noreferrer">{label} <ExternalLink size={13}/></a>)}</div>
        {profile&&<p className="caption">Liên hệ và liên kết đối chiếu {profile.checkedAt} từ <a href={profile.source} target="_blank" rel="noreferrer" className="text-link">trang chính thức</a>. Cơ sở học có thể khác theo mã chương trình; xem thông báo nhập học của đúng khóa.</p>}
      </section>
      <section className="guide-section"><h3>Dữ liệu chương trình đã đối chiếu</h3><p>{programs.length} chương trình trong danh mục · {programs.filter(m=>m.admissionScores.length).length} có điểm chuẩn · {programs.filter(m=>m.tuition).length} có thông tin học phí · {programs.filter(m=>m.duration).length} có thời lượng.</p><Notice>{university.coverage}</Notice><SourceLink source={university.source}/><p className="caption">Khi so sánh trường, xem thêm chương trình học, học phí và khoản thu khác, địa điểm học thực tế, thực tập, chuẩn ngoại ngữ, điều kiện học bổng và ký túc xá từ các nguồn của trường.</p></section>
    </div>
  </Modal>;
}
export function MajorCard({major,fit,onDetail,showWishButton=false}) {
  const {catalog,wishes,toggleWish,compare,toggleCompare,notify}=useApp();
  const [busy,setBusy]=useState(false);
  const university=catalog.universities.find(u=>u.id===major.universityId),saved=wishes.some(w=>w.majorId===major.id);
  async function changeWish(){if(busy)return;setBusy(true);try{await toggleWish(major.id);}catch(e){notify(e.message,'error');}finally{setBusy(false);}}
  return <article className="major-card"><div className="card-top"><span className={`school-badge school-${university.id}`}>{university.id}</span>{!showWishButton&&<button disabled={busy} className={`icon-button ${saved?'saved':''}`} aria-label={`${saved?'Bỏ lưu':'Lưu'} ${major.name}`} onClick={changeWish}><Bookmark size={20} fill={saved?'currentColor':'none'}/></button>}</div>
    <span className="field-label">{fields[major.field].name}{major.educationLevel==='college'?' · Cao đẳng':''}</span><h3><button className="text-button" onClick={()=>onDetail(major)}>{major.name}</button></h3><p className="school-name">{university.name}</p>
    <div className="major-tags"><span>{major.admissionYear?`Tuyển sinh ${major.admissionYear}`:'Danh mục đào tạo'}</span><span>{major.holland}</span>{!major.verified&&<span className="amber">{major.source.kind==='secondary'?'Nguồn thứ cấp':'Chưa đối chiếu cơ sở tuyển sinh'}</span>}</div>
    <AdmissionMatch major={major}/>
    <div className="major-facts"><div><small>Học phí{major.tuition?.year?` · ${major.tuition.year}`:''}</small><TuitionSummary major={major}/></div>{major.duration&&<div><small>Thời gian đào tạo</small><strong>{durationLabel(major.duration)}</strong></div>}{fit!=null&&<div><small>Chỉ số sở thích</small><strong className="blue">{fit}/100</strong></div>}<div className="cutoff-fact"><small>Điểm chuẩn theo từng phương thức</small><AdmissionScores major={major} compact/></div></div>
    <div className="card-footer"><button className="text-link" onClick={()=>onDetail(major)}>Khám phá ngành <ArrowRight size={15}/></button><button className={`icon-button ${compare.includes(major.id)?'saved':''}`} onClick={()=>toggleCompare(major.id)} aria-label={`So sánh ${major.name}`} aria-pressed={compare.includes(major.id)}>{compare.includes(major.id)?<Check size={18}/>:<GitCompareArrows size={18}/>}</button></div>
    {showWishButton&&<Button busy={busy} className={`wish-choice-button ${saved?'wish-selected':'primary'}`} aria-label={`${saved?'Bỏ chọn':'Chọn'} nguyện vọng ${major.name}`} aria-pressed={saved} onClick={changeWish}>{saved?<Check size={18}/>:<Bookmark size={18}/>} {saved?'Đã chọn nguyện vọng':'Chọn nguyện vọng'}</Button>}
  </article>;
}
export function MajorDetail({major,onClose}) {
  const {catalog,results}=useApp();
  const [schoolOpen,setSchoolOpen]=useState(false);
  const university=catalog.universities.find(u=>u.id===major.universityId);
  const fit=interestFit(results[0]?.scores,major.holland);
  return <Modal title={major.name} onClose={onClose}><p className="muted">{university.name} · {university.id}</p><div className="major-tags"><span>{fields[major.field].name}</span><span>Mã: {major.code || 'Chưa đối chiếu'}</span></div>
    <AdmissionMatch major={major}/>
    <h3>Khám phá lĩnh vực</h3><p>{major.description}</p><h3>Hướng nghề nghiệp để tìm hiểu</h3><p>{major.careers}.</p><p className="caption">Mô tả lĩnh vực và liên hệ Holland do UniGate biên tập, không phải cam kết việc làm hoặc phân loại chính thức của trường.</p>
    <div className="detail-grid"><div><small>Chương trình</small><strong>{major.program}</strong></div><div><small>Năm tuyển sinh</small><strong>{major.admissionYear || 'Nguồn chưa chỉ rõ'}</strong></div><div><small>Học phí{major.tuition?.year?` · ${major.tuition.year}`:''}</small><TuitionSummary major={major}/>{major.tuition?.source&&<><p className="caption">{major.tuition.note}</p><a className="source-link" href={major.tuition.source} target="_blank" rel="noreferrer">Nguồn học phí <ExternalLink size={13}/></a></>}</div><div><small>Thời gian đào tạo</small><strong>{durationLabel(major.duration)}</strong>{major.duration&&<a className="source-link" href={major.duration.source} target="_blank" rel="noreferrer">Nguồn thời lượng / tín chỉ <ExternalLink size={13}/></a>}</div></div>
    {estimatedAnnualTuition(major)&&<div className="source-box tuition-calculation"><h3>Cách tính học phí bình quân/năm</h3><p>{major.tuition.annualBasis.units} {major.tuition.annualBasis.kind==='credits'?'tín chỉ':'kỳ/đợt thu'} ÷ {major.tuition.annualBasis.years} năm × {money(major.tuition.value)}{major.tuition.maxValue?`–${money(major.tuition.maxValue)}`:''} = <strong>{annualEstimateLabel(estimatedAnnualTuition(major))}</strong>.</p><p className="caption">{major.tuition.annualBasis.note}</p><a className="source-link" href={major.tuition.annualBasis.source} target="_blank" rel="noreferrer">Nguồn lộ trình chương trình <ExternalLink size={13}/></a></div>}
    <Button onClick={()=>setSchoolOpen(true)}>Tìm hiểu trường {university.id} <ArrowRight size={15}/></Button>
    <h3>Điểm chuẩn từng phương thức · Năm 2026</h3><AdmissionScores major={major}/>
    <h3>Tổ hợp và điều kiện tuyển sinh</h3><p>{major.combinations.length?major.combinations.join(' · '):'Xem tổ hợp và yêu cầu cụ thể trên cổng tuyển sinh của trường.'}</p>
    {major.combinationsSource&&<a className="source-link" href={major.combinationsSource} target="_blank" rel="noreferrer">Nguồn danh mục tổ hợp <ExternalLink size={13}/></a>}
    {major.admissionMethods?.map((method,i)=><p className="caption" key={`${method.method}-${i}`}>{admissionMethodLabel[method.method]||method.method}: {method.combinations.join(', ')}</p>)}
    {major.combinations.some(code=>/^[MTV]/.test(code))&&<p className="caption">Có tổ hợp năng khiếu; không dùng tổng 3 môn văn hóa để thay thế điểm năng khiếu.</p>}
    {major.admissionsNote&&<Notice>{major.admissionsNote}</Notice>}
    <h3>Liên hệ sở thích nghề nghiệp</h3><p>{[...major.holland].map(k=>`${k} – ${groups[k].name}`).join(' / ')}{fit!=null?` · Chỉ số tham khảo ${fit}/100.`:'.'}</p>
    <Notice>{university.coverage}</Notice><div className="source-box"><SourceLink source={major.source}/><p>{major.source.title}</p><small>Đối chiếu ngày {major.source.checkedAt}. {!major.verified?'Chưa đối chiếu được mã tuyển sinh/cơ sở đào tạo cho chương trình này.':''}</small></div>
    {university.admissionsReview&&<div className="source-box">
      <h3>Đã rà lại nguồn công bố điểm</h3>
      <p className="caption">{university.admissionsReview.note} Đối chiếu {university.admissionsReview.checkedAt}.</p>
      <a className="source-link" href={university.admissionsReview.announcement} target="_blank" rel="noreferrer">Bài công bố của trường <ExternalLink size={13}/></a>
      {university.admissionsReview.facebook&&<a className="source-link" href={university.admissionsReview.facebook} target="_blank" rel="noreferrer">Fanpage chính thức được website trường dẫn <ExternalLink size={13}/></a>}
      <p className="caption">{university.admissionsReview.socialReview}</p>
    </div>}
    {schoolOpen&&<SchoolDetail university={university} field={major.field} onClose={()=>setSchoolOpen(false)}/>}
  </Modal>;
}
export function Radar({scores}) {
  const keys=Object.keys(groups),point=(i,r)=>[160+Math.sin(i*Math.PI/3)*r,150-Math.cos(i*Math.PI/3)*r];
  return <svg viewBox="0 0 320 310" role="img" aria-label="Biểu đồ 6 nhóm sở thích Holland" className="radar">{[.25,.5,.75,1].map(level=><polygon key={level} points={keys.map((_,i)=>point(i,100*level).join(',')).join(' ')} fill={level===1?'#f7fbfe':'none'} stroke="#dce7ef"/>)}{keys.map((k,i)=><line key={k} x1="160" y1="150" x2={point(i,100)[0]} y2={point(i,100)[1]} stroke="#dce7ef"/>)}<polygon points={keys.map((k,i)=>point(i,(scores[k]/50)*100).join(',')).join(' ')} fill="#36a4d938" stroke="#168bc6" strokeWidth="2.5"/>{keys.map((key,i)=><g key={key}><circle cx={point(i,(scores[key]/50)*100)[0]} cy={point(i,(scores[key]/50)*100)[1]} r="4" fill="#168bc6"/><text x={point(i,129)[0]} y={point(i,129)[1]} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="700" fill={groups[key].color}>{key}</text></g>)}</svg>;
}
