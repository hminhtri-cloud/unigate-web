import React, { createContext,useContext,useEffect,useState } from 'react';
import { api } from './api';
const Context = createContext(null);
export const useApp = () => useContext(Context);
export function Provider({ children }) {
  const [user,setUser]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState('');
  const [catalog,setCatalog]=useState(null),[results,setResults]=useState([]),[wishes,setWishes]=useState([]),[scores,setScores]=useState({subjects:{},dgnl:null,combinations:[]});
  const [toast,setToast]=useState(null),[compare,setCompare]=useState([]),[selectedMajors,setSelectedMajors]=useState([]);
  useEffect(()=>{
    if(!user?.id)return;
    try {
      const saved=JSON.parse(sessionStorage.getItem(`unigate-major-choices-${user.id}`)||'[]');
      setSelectedMajors(Array.isArray(saved)?saved.filter(key=>typeof key==='string'):[]);
    } catch {setSelectedMajors([]);}
  },[user?.id]);
  function updateSelectedMajors(next) {
    setSelectedMajors(next);
    if(user?.id)sessionStorage.setItem(`unigate-major-choices-${user.id}`,JSON.stringify(next));
  }
  const notify=(message,type='success')=>setToast({message,type,id:Date.now()});
  async function refresh() {
    const [r,w,s]=await Promise.all([api('/results'),api('/wishes'),api('/scores')]);
    setResults(r);setWishes(w);setScores(s);
  }
  async function initialize() {
    setError(''); setReady(false);
    try {
      const c=await api('/catalog'); setCatalog(c);
      try { const u=await api('/me'); await refresh(); setUser(u); }
      catch(e){ if(e.status!==401) throw e; }
    } catch(e) { setError(e.message); }
    finally { setReady(true); }
  }
  useEffect(()=>{ initialize(); const expired=()=>{ setUser(null);setResults([]);setWishes([]);setCompare([]);setSelectedMajors([]);notify('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.','error'); }; window.addEventListener('session-expired',expired);return()=>window.removeEventListener('session-expired',expired); },[]);
  useEffect(()=>{ if(!toast)return; const timer=setTimeout(()=>setToast(null),4500); return()=>clearTimeout(timer); },[toast]);
  async function authenticated(u) { await refresh(); setUser(u);setCompare([]);window.location.hash='#/'; }
  async function logout() { await api('/auth/logout','POST');setUser(null);setResults([]);setWishes([]);setCompare([]);setSelectedMajors([]);setScores({subjects:{},dgnl:null,combinations:[]});window.location.hash='#/'; }
  async function toggleWish(id) {
    const saved=wishes.some(w=>w.majorId===id);
    await api(saved?`/wishes/${encodeURIComponent(id)}`:'/wishes',saved?'DELETE':'POST',{majorId:id});
    setWishes(await api('/wishes'));notify(saved?'Đã bỏ khỏi nguyện vọng.':'Đã lưu vào nguyện vọng của bạn.');
  }
  function toggleCompare(id) {
    setCompare(current=>{
      if(current.includes(id))return current.filter(x=>x!==id);
      if(current.length>=3){ queueMicrotask(()=>notify('Bạn có thể so sánh tối đa 3 ngành cùng lúc.','error'));return current; }
      return [...current,id];
    });
  }
  return <Context.Provider value={{user,setUser,ready,error,catalog,results,wishes,scores,setScores,setWishes,refresh,initialize,authenticated,logout,notify,toast,compare,toggleCompare,toggleWish,selectedMajors,updateSelectedMajors}}>{children}</Context.Provider>;
}
