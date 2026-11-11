import React,{useEffect,useId,useRef,useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {schoolFilterValues} from '../shared/domain.mjs';

export default function CheckboxFilter({label,groups,value,onChange,emptyValue,allLabel,help}) {
  const [open,setOpen]=useState(false),id=useId(),root=useRef(null),trigger=useRef(null);
  const selected=groups.flatMap(group=>group.options.filter(option=>schoolFilterValues(value[group.key]).includes(option.value)).map(option=>option.label));
  const count=Object.values(value).flatMap(schoolFilterValues).length;
  function toggle(key,next) {
    const current=schoolFilterValues(value[key]);
    onChange({...value,[key]:current.includes(next)?current.filter(item=>item!==next):[...current,next]});
  }
  function close() {setOpen(false);trigger.current?.focus({preventScroll:true});}
  useEffect(()=>{
    if(!open)return;
    const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};
    document.addEventListener('pointerdown',outside);
    return()=>document.removeEventListener('pointerdown',outside);
  },[open]);
  return <div className="school-multiselect" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close();}}}>
    <span className="school-filter-label" id={`${id}-label`}>{label}</span>
    <button ref={trigger} type="button" className="school-filter-trigger" aria-label={label} aria-expanded={open} aria-haspopup="dialog" aria-controls={`${id}-options`} title={selected.join(' · ')||allLabel} onClick={()=>setOpen(current=>!current)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);requestAnimationFrame(()=>root.current?.querySelector('input')?.focus());}}}>
      <span>{count?selected.join(' · ')||`${count} mục đã chọn`:allLabel}</span>{count>0&&<small>{count}</small>}<ChevronDown size={16} aria-hidden="true"/>
    </button>
    {open&&<div className="school-filter-menu" id={`${id}-options`} role="dialog" aria-labelledby={`${id}-label`}>
      <label className="school-filter-option school-filter-all"><input type="checkbox" checked={!count} onChange={()=>onChange({...emptyValue})}/>{allLabel}</label>
      {groups.map(group=><fieldset key={group.key} className="school-filter-group"><legend>{group.title}</legend>{group.options.map(option=><label className="school-filter-option" key={option.value}><input type="checkbox" checked={schoolFilterValues(value[group.key]).includes(option.value)} onChange={()=>toggle(group.key,option.value)}/>{option.label}</label>)}</fieldset>)}
      <div className="school-filter-footer"><small>{help}</small><button type="button" className="text-link" onClick={close}>Xong</button></div>
    </div>}
  </div>;
}
