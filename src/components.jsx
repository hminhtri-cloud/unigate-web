import React, { useEffect,useId,useRef,useState } from 'react';
import { ArrowRight, Bookmark, Check, ExternalLink, GitCompareArrows, GraduationCap, Info, Search, X, LoaderCircle } from 'lucide-react';
import { useApp } from './context';
import { money } from './api';
import { fields,groups,interestFit,thptSortingScore,admissionMethodLabel,admissionGroup } from '../shared/domain.mjs';
export function Link({to,children,...props}) { return <a href={`#/${to || ''}`} {...props}>{children}</a>; }
export function Brand() { return <Link to="" className="brand"><span className="brand-mark"><GraduationCap size={27}/></span><span>Uni<span>Gate</span><small>MỞ LỐI TƯƠNG LAI</small></span></Link>; }
export function Button({children,className='',busy=false,...props}) { return <button {...props} disabled={props.disabled || busy} className={`button ${className}`} aria-busy={busy}>{busy && <LoaderCircle size={17} className="spin"/>}{children}</button>; }
export function ErrorMessage({children}) { return children ? <div className="error" role="alert">{children}</div> : null; }
export function Notice({children}) { return <div className="notice"><Info size={18}/><div>{children}</div></div>; }
export function Empty({title,children,action}) { return <div className="empty"><span className="empty-icon"><Search size={30}/></span><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function PageTitle({eyebrow='HÀNH TRÌNH CỦA BẠN',title,children,action}) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</div>{action}</div>; }
export function SourceLink({source}) { return <a className="source-link" href={source.url} target="_blank" rel="noreferrer">{source.kind==='secondary'?'Nguồn tham khảo':'Nguồn chính thức'} <ExternalLink size={13}/></a>; }
export function Modal({title,onClose,children}) {
  const ref=useRef(null),id=useId();
  useEffect(()=>{ const d=ref.current;d.showModal(); const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=prev;}; },[]);
  return <dialog ref={ref} className="modal" aria-labelledby={id} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="modal-inner"><div className="section-heading"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Đóng" onClick={onClose}><X/></button></div>{children}</div></dialog>;
}
export function AdmissionScores({major,compact=false}) {
  const scores=major.admissionScores||[];
  if (!scores.length) return <span className="muted">Chưa có điểm chuẩn đối chiếu theo ngành.</span>;
  return <div className={`admission-scores ${compact?'compact':''}`}>{scores.map((score,i)=><div key={`${score.method}-${score.year}-${i}`}><span>{admissionMethodLabel[score.method]||score.method} {score.year}</span><strong>{score.value.toLocaleString('vi-VN',{minimumFractionDigits:score.scale===30?2:0,maximumFractionDigits:2})}/{score.scale}</strong>{!compact&&<><p className="caption">{score.note}</p><a href={score.source} target="_blank" rel="noreferrer" className="source-link">Thông báo chính thức <ExternalLink size={13}/></a></>}</div>)}</div>;
}
export function MajorCard({major,fit,onDetail}) {
  const {catalog,wishes,toggleWish,compare,toggleCompare,notify}=useApp();
  const [busy,setBusy]=useState(false);
  const university=catalog.universities.find(u=>u.id===major.universityId),saved=wishes.some(w=>w.majorId===major.id);
  return <article className="major-card"><div className="card-top"><span className={`school-badge school-${university.id}`}>{university.id}</span><button disabled={busy} className={`icon-button ${saved?'saved':''}`} aria-label={`${saved?'Bỏ lưu':'Lưu'} ${major.name}`} onClick={async()=>{setBusy(true);try{await toggleWish(major.id);}catch(e){notify(e.message,'error');}finally{setBusy(false);}}}><Bookmark size={20} fill={saved?'currentColor':'none'}/></button></div>
    <span className="field-label">{fields[major.field].name}</span><h3><button className="text-button" onClick={()=>onDetail(major)}>{major.name}</button></h3><p className="school-name">{university.name}</p>
    <div className="major-tags"><span>{major.admissionYear?`Tuyển sinh ${major.admissionYear}`:'Danh mục đào tạo'}</span><span>{major.holland}</span>{!major.verified&&<span className="amber">Nguồn thứ cấp</span>}</div>
    <div className="major-facts"><div><small>Học phí / {major.tuition?.period||'năm'}{major.tuition?.year?` · ${major.tuition.year}`:''}</small><strong>{major.tuition?`${major.tuition.approximate?'≈ ':''}${money(major.tuition.value)}`:'Chưa đối chiếu'}</strong></div>{fit!=null&&<div><small>Chỉ số sở thích</small><strong className="blue">{fit}/100</strong></div>}<div className="cutoff-fact"><small>Điểm chuẩn theo từng phương thức</small><AdmissionScores major={major} compact/></div></div>
    <div className="card-footer"><button className="text-link" onClick={()=>onDetail(major)}>Khám phá ngành <ArrowRight size={15}/></button><button className={`icon-button ${compare.includes(major.id)?'saved':''}`} onClick={()=>toggleCompare(major.id)} aria-label={`So sánh ${major.name}`} aria-pressed={compare.includes(major.id)}>{compare.includes(major.id)?<Check size={18}/>:<GitCompareArrows size={18}/>}</button></div></article>;
}
export function MajorDetail({major,onClose}) {
  const {catalog,results}=useApp();
  const university=catalog.universities.find(u=>u.id===major.universityId);
  const fit=interestFit(results[0]?.scores,major.holland);
  return <Modal title={major.name} onClose={onClose}><p className="muted">{university.name} · {university.id}</p><div className="major-tags"><span>{fields[major.field].name}</span><span>Mã: {major.code || 'Chưa đối chiếu'}</span></div>
    <h3>Khám phá lĩnh vực</h3><p>{major.description}</p><h3>Hướng nghề nghiệp để tìm hiểu</h3><p>{major.careers}.</p><p className="caption">Mô tả lĩnh vực và liên hệ Holland do UniGate biên tập, không phải cam kết việc làm hoặc phân loại chính thức của trường.</p>
    <div className="detail-grid"><div><small>Chương trình</small><strong>{major.program}</strong></div><div><small>Năm tuyển sinh</small><strong>{major.admissionYear || 'Nguồn chưa chỉ rõ'}</strong></div><div><small>Học phí</small><strong>{major.tuition?`${major.tuition.approximate?'≈ ':''}${money(major.tuition.value)}/${major.tuition.period} (${major.tuition.year})`:'Chưa có số liệu đối chiếu'}</strong>{major.tuition?.source&&<><p className="caption">{major.tuition.note}</p><a className="source-link" href={major.tuition.source} target="_blank" rel="noreferrer">Nguồn học phí <ExternalLink size={13}/></a></>}</div><div><small>{admissionGroup(major)==='composite'?'Nhóm xét điểm':'Mốc dùng trong tab THPT'}</small><strong>{admissionGroup(major)==='composite'?'Xét tổng hợp · chỉ xếp điểm trong cùng trường':thptSortingScore(major)?`${thptSortingScore(major).value.toLocaleString('vi-VN')}/30 · ${admissionMethodLabel[thptSortingScore(major).method]}`:'Không có điểm THPT /30 đã xác minh'}</strong></div></div>
    <h3>Điểm chuẩn từng phương thức · Năm 2026</h3><AdmissionScores major={major}/>
    <h3>Tổ hợp và điều kiện tuyển sinh</h3><p>{major.combinations.length?major.combinations.join(' · '):'Xem tổ hợp và yêu cầu cụ thể trên cổng tuyển sinh của trường.'}</p>{major.admissionsNote&&<Notice>{major.admissionsNote}</Notice>}
    <h3>Liên hệ sở thích nghề nghiệp</h3><p>{[...major.holland].map(k=>`${k} – ${groups[k].name}`).join(' / ')}{fit!=null?` · Chỉ số tham khảo ${fit}/100.`:'.'}</p>
    <Notice>{university.coverage}</Notice><div className="source-box"><SourceLink source={major.source}/><p>{major.source.title}</p><small>Đối chiếu ngày {major.source.checkedAt}. {major.source.kind==='secondary'?'Chưa xác minh được với đề án gốc của trường.':''}</small></div></Modal>;
}
export function Radar({scores}) {
  const keys=Object.keys(groups),point=(i,r)=>[160+Math.sin(i*Math.PI/3)*r,150-Math.cos(i*Math.PI/3)*r];
  return <svg viewBox="0 0 320 310" role="img" aria-label="Biểu đồ 6 nhóm sở thích Holland" className="radar">{[.25,.5,.75,1].map(level=><polygon key={level} points={keys.map((_,i)=>point(i,100*level).join(',')).join(' ')} fill={level===1?'#f7fbfe':'none'} stroke="#dce7ef"/>)}{keys.map((k,i)=><line key={k} x1="160" y1="150" x2={point(i,100)[0]} y2={point(i,100)[1]} stroke="#dce7ef"/>)}<polygon points={keys.map((k,i)=>point(i,(scores[k]/50)*100).join(',')).join(' ')} fill="#36a4d938" stroke="#168bc6" strokeWidth="2.5"/>{keys.map((key,i)=><g key={key}><circle cx={point(i,(scores[key]/50)*100)[0]} cy={point(i,(scores[key]/50)*100)[1]} r="4" fill="#168bc6"/><text x={point(i,129)[0]} y={point(i,129)[1]} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="700" fill={groups[key].color}>{key}</text></g>)}</svg>;
}
