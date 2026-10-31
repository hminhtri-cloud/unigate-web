import React,{useState} from 'react';
import { ArrowRight,Compass,BookOpen,ShieldCheck,Eye,EyeOff } from 'lucide-react';
import { useApp } from './context';
import { api } from './api';
import { Brand,Button,ErrorMessage } from './components';
export default function Auth() {
  const {authenticated,catalog}=useApp();
  const [register,setRegister]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[visible,setVisible]=useState(false);
  async function submit(e){e.preventDefault();setBusy(true);setError('');const data=Object.fromEntries(new FormData(e.currentTarget));
    if(register&&data.password!==data.confirm){setError('Hai mật khẩu chưa khớp.');setBusy(false);return;}
    try{const user=await api(`/auth/${register?'register':'login'}`,'POST',data);await authenticated(user);}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <div className="auth-page"><section className="auth-story"><Brand/><div className="story-content"><span className="pill">DÀNH CHO HỌC SINH THPT</span><h1>Hiểu mình hơn.<br/>Chọn đường đi<br/><em>của riêng bạn.</em></h1><p>Mỗi hành trình lớn đều bắt đầu từ một khám phá nhỏ. Cùng UniGate tìm ngành học phù hợp với chính bạn.</p><div className="story-features"><div><Compass/><span>Khám phá 6 nhóm sở thích Holland</span></div><div><BookOpen/><span>{catalog.majors.length} ngành & chương trình có nguồn</span></div><div><ShieldCheck/><span>{catalog.universities.length} trường được tuyển chọn</span></div></div></div><small>UNIGATE · KHÁM PHÁ BẢN THÂN, KIẾN TẠO TƯƠNG LAI</small><div className="decor-orbit" aria-hidden="true"/></section>
    <section className="auth-form-wrap"><div className="auth-form"><span className="eyebrow">CHÀO MỪNG ĐẾN VỚI UNIGATE</span><h2>{register?'Bắt đầu hành trình mới':'Rất vui được gặp bạn!'}</h2><p>{register?'Tạo tài khoản để lưu kết quả và kế hoạch đại học.':'Đăng nhập để tiếp tục khám phá tương lai của bạn.'}</p><div className="auth-tabs"><button className={!register?'active':''} onClick={()=>{setRegister(false);setError('');}}>Đăng nhập</button><button className={register?'active':''} onClick={()=>{setRegister(true);setError('');}}>Tạo tài khoản</button></div><form onSubmit={submit} key={register?'register':'login'}>
      {register&&<label>Họ và tên<input name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Nguyễn Minh Anh"/></label>}
      <label>Email<input type="email" name="email" autoComplete="email" required maxLength={254} placeholder="ban@example.com"/></label>
      <label>Mật khẩu<div className="password-field"><input name="password" type={visible?'text':'password'} autoComplete={register?'new-password':'current-password'} required minLength={register?8:1} maxLength={128} placeholder={register?'Ít nhất 8 ký tự':'Nhập mật khẩu của bạn'}/><button type="button" aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
      {register&&<label>Nhập lại mật khẩu<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/></label>}
      <ErrorMessage>{error}</ErrorMessage><Button className="primary full" busy={busy}>{register?'Tạo tài khoản':'Đăng nhập'}<ArrowRight size={18}/></Button></form><p className="auth-footnote">Dữ liệu của bạn được lưu trong MySQL trên máy này.<br/>Bạn có thể đổi mật khẩu trong phần Tài khoản.</p></div></section></div>;
}
