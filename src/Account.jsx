import React,{useState} from 'react';
import { ArrowRight,BookOpen,Save,ShieldCheck,UserRound } from 'lucide-react';
import { useApp } from './context';
import { api } from './api';
import { Button,ChoiceSteps,Empty,ErrorMessage,Link,Notice,PageTitle } from './components';
import { subjects,combinationScores } from '../shared/domain.mjs';
import {admissionProfileReady,conflictsWithExamSubjects,otherExams,studentProfileSummary} from '../shared/admission-profile.mjs';
export function Scores({admissionsStep=false}){
  const {scores,setScores,notify,selectedMajors}=useApp();
  const saved=scores.admissionProfile;
  const [useThpt,setUseThpt]=useState(saved?!!saved.examSubjects.length:true);
  const [examSubjects,setExamSubjects]=useState(saved?.examSubjects.length?saved.examSubjects:['math','literature',...Object.keys(scores.subjects).filter(k=>!['math','literature'].includes(k)).slice(0,2)]);
  const [values,setValues]=useState(Object.fromEntries(Object.keys(subjects).map(k=>[k,scores.subjects[k]??''])));
  const [dgnl,setDgnl]=useState(scores.dgnl??''),[extra,setExtra]=useState(Object.fromEntries(Object.keys(otherExams).map(k=>[k,saved?.otherScores?.[k]??''])));
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const selected=useThpt?examSubjects:[];
  const entered=Object.fromEntries(selected.filter(k=>values[k]!=='').map(k=>[k,Number(values[k])]));
  const body={subjects:entered,dgnl:dgnl===''?null:Number(dgnl),admissionProfile:{confirmed:true,examSubjects:selected,otherScores:Object.fromEntries(Object.entries(extra).filter(([,v])=>v!=='').map(([k,v])=>[k,Number(v)]))}};
  const preview=combinationScores(entered);
  const dirty=!saved?.confirmed||selected.length!==saved.examSubjects.length||selected.some(k=>!saved.examSubjects.includes(k))||Object.keys(subjects).some(k=>entered[k]!==scores.subjects[k])||body.dgnl!==scores.dgnl||Object.keys(otherExams).some(k=>body.admissionProfile.otherScores[k]!==saved.otherScores?.[k]);
  function toggleSubject(key){setExamSubjects(current=>current.includes(key)?current.filter(k=>k!==key):current.length<4?[...current,key]:current);}
  async function save(e){
    e.preventDefault();setError('');
    if(useThpt&&(selected.length!==4||Object.keys(entered).length!==4)){setError('Chọn đúng 4 môn thi (Toán, Ngữ văn và 2 môn tự chọn), rồi nhập đủ điểm của 4 môn.');return;}
    if(!admissionProfileReady(body)){setError('Nhập điểm cho ít nhất một phương thức; nếu dùng THPT, cần có tổ hợp trong từ điển hiện tại.');return;}
    setBusy(true);try{const result=await api('/scores','PUT',body);setScores(result);notify('Đã lưu điểm, môn thi, tổ hợp và phương thức xét tuyển.');if(admissionsStep)window.location.hash='#/universities';}catch(e){setError(e.message);}finally{setBusy(false);}
  }
  if(admissionsStep&&!selectedMajors.length)return <><PageTitle title="Nhập điểm trước khi chọn trường"/><ChoiceSteps step={2}/><Empty title="Hãy chọn ngành trước" action={<Link to="explore" className="button primary">Đến Chọn ngành</Link>}>Chọn những ngành bạn quan tâm để lọc trường theo ngành và hồ sơ xét tuyển.</Empty></>;
  return <><PageTitle title={admissionsStep?'Nhập điểm trước khi chọn trường':'Điểm & phương thức xét tuyển'} eyebrow={admissionsStep?'BƯỚC 2 · ĐIỂM & PHƯƠNG THỨC':'HỒ SƠ ĐIỂM SỐ'}>Chọn đúng môn đã thi, nhập điểm THPT và các kỳ thi bạn có. UniGate lưu tổ hợp từ các môn này để lọc chương trình ở bước Chọn trường.</PageTitle>
    <ChoiceSteps step={2}/>
    <form onSubmit={save}>
      <div className="scores-layout"><section className="panel"><h2><BookOpen size={21}/> Điểm thi THPT</h2>
        <label className="checkbox-label score-check"><input type="checkbox" checked={useThpt} onChange={e=>setUseThpt(e.target.checked)}/> Tôi dùng kết quả thi THPT</label>
        {useThpt&&<><p className="muted">Hồ sơ thi 4 môn: Toán, Ngữ văn và đúng 2 môn tự chọn. Chỉ các môn đã chọn mới được dùng tạo tổ hợp, không lấy điểm học bạ thay điểm thi.</p>
          <fieldset className="exam-subjects"><legend>Môn thi của bạn · đã chọn {selected.length}/4</legend>{Object.entries(subjects).map(([key,name])=><label className="score-check" key={key}><input type="checkbox" aria-label={`Thi ${name}`} checked={selected.includes(key)} disabled={['math','literature'].includes(key)||(!selected.includes(key)&&selected.length>=4)||conflictsWithExamSubjects(key,selected)} onChange={()=>toggleSubject(key)}/>{name}{['math','literature'].includes(key)?' · bắt buộc':''}</label>)}</fieldset>
          <div className="subject-inputs">{selected.map(key=><label key={key}>{subjects[key]}<input type="number" min="0" max="10" step="0.01" required value={values[key]} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} placeholder="Điểm thi /10"/></label>)}</div></>}
        {!useThpt&&<p className="caption">Bạn có thể lọc bằng các kỳ thi khác bên dưới; không sử dụng tổ hợp điểm THPT.</p>}
      </section><section className="panel"><h2>Tổ hợp từ môn thi đã chọn</h2><p className="muted">Chỉ nhận diện mã tổ hợp trong từ điển UniGate. Tổng 3 môn chưa cộng ưu tiên, nhân hệ số hoặc quy đổi; không tự thêm môn năng khiếu hay chứng chỉ.</p>
        {preview.length?<div className="combination-list">{preview.map(c=><div key={c.code}><div><strong>{c.code}</strong><small>{c.subjects.map(k=>subjects[k]).join(' · ')}</small></div><b>{c.total.toFixed(2)}<small>/30</small></b></div>)}</div>:<Empty title="Chưa có tổ hợp THPT">Chọn môn thi và nhập đủ điểm để xem các tổ hợp nhận diện được.</Empty>}
      </section></div>
      <section className="panel"><h2>Điểm các kỳ thi khác</h2><p className="caption">Nhập kỳ thi bạn thực sự có điểm; để trống các kỳ thi không tham gia. Mỗi kỳ thi được lưu riêng và giữ đúng thang điểm.</p>
        <div className="other-exam-inputs"><label>Điểm ĐGNL ĐHQG-HCM (thang 1200)<input type="number" min="0" max="1200" step="0.01" value={dgnl} onChange={e=>setDgnl(e.target.value)} placeholder="Chưa có điểm"/></label>
          {Object.entries(otherExams).map(([key,exam])=><label key={key}>{exam.label} (thang {exam.scale})<input type="number" min="0" max={exam.scale} step="0.01" value={extra[key]} onChange={e=>setExtra(v=>({...v,[key]:e.target.value}))} placeholder="Chưa có điểm"/></label>)}
        </div>
        <Notice>ĐGNL ĐHQG-HCM, HSA, TSA và SAT là các kỳ thi khác nhau. Không tự quy đổi giữa các kỳ thi hoặc xem có ĐGNL là đã đủ điều kiện của phương thức tổng hợp/kết hợp.</Notice>
      </section>
      <ErrorMessage>{error}</ErrorMessage><div className="button-row"><Button type="submit" className="primary" busy={busy}><Save size={17}/>{admissionsStep?'Lưu hồ sơ & Chọn trường':'Lưu điểm'}</Button>{dirty&&<span className="caption">Có thay đổi chưa lưu</span>}{!admissionsStep&&admissionProfileReady(scores)&&!dirty&&selectedMajors.length>0&&<Link to="universities" className="button">Đến Chọn trường <ArrowRight size={16}/></Link>}</div>
    </form>
    {admissionProfileReady(scores)&&<p className="caption saved-admission-profile">Hồ sơ đã lưu: {studentProfileSummary(scores)}.</p>}
  </>;
}
export function Profile(){
  const {user,setUser,notify}=useApp(),[busy,setBusy]=useState(false),[passwordBusy,setPasswordBusy]=useState(false),[error,setError]=useState(''),[passwordError,setPasswordError]=useState('');
  async function save(e){e.preventDefault();setBusy(true);setError('');const body=Object.fromEntries(new FormData(e.currentTarget));try{setUser(await api('/me','PUT',body));notify('Đã cập nhật hồ sơ.');}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function changePassword(e){e.preventDefault();const form=e.currentTarget,body=Object.fromEntries(new FormData(form));setPasswordError('');if(body.newPassword!==body.confirm){setPasswordError('Mật khẩu xác nhận chưa khớp.');return;}setPasswordBusy(true);try{await api('/me/password','PUT',body);form.reset();notify('Đã đổi mật khẩu. Các phiên đăng nhập cũ đã kết thúc.');}catch(e){setPasswordError(e.message);}finally{setPasswordBusy(false);}}
  return <><PageTitle title="Một chút thông tin về bạn" eyebrow="HỒ SƠ & TÀI KHOẢN">Cập nhật hồ sơ và quản lý mật khẩu đăng nhập.</PageTitle><div className="dashboard-columns"><section className="panel"><div className="profile-heading"><span className="avatar big">{user.name.trim()[0].toUpperCase()}</span><div><h2>{user.name}</h2><p className="muted">{user.email}</p></div></div><form onSubmit={save}><label>Họ và tên<input name="name" required minLength={2} maxLength={80} defaultValue={user.name}/></label><label>Trường THPT<input name="school" maxLength={120} defaultValue={user.school} placeholder="Tên trường bạn đang học"/></label><label>Lớp<select name="grade" defaultValue={user.grade}><option value="10">Lớp 10</option><option value="11">Lớp 11</option><option value="12">Lớp 12</option><option value="other">Đã tốt nghiệp / khác</option></select></label><ErrorMessage>{error}</ErrorMessage><Button className="primary" busy={busy}><UserRound size={17}/> Cập nhật hồ sơ</Button></form></section><section className="panel"><h2><ShieldCheck size={22}/> Đổi mật khẩu</h2><p className="muted">Mật khẩu tối thiểu 8 ký tự, tối đa 128 ký tự.</p><form onSubmit={changePassword}><label>Mật khẩu hiện tại<input type="password" name="currentPassword" required autoComplete="current-password" maxLength={128}/></label><label>Mật khẩu mới<input type="password" name="newPassword" required minLength={8} maxLength={128} autoComplete="new-password"/></label><label>Nhập lại mật khẩu mới<input type="password" name="confirm" required minLength={8} maxLength={128} autoComplete="new-password"/></label><ErrorMessage>{passwordError}</ErrorMessage><Button busy={passwordBusy}>Đổi mật khẩu</Button></form></section></div></>;
}
