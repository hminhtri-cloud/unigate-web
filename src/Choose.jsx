import React,{useMemo,useState} from 'react';
import {ArrowRight,Check,ChevronLeft,ChevronRight,Info,Search,Sparkles} from 'lucide-react';
import {MajorGuide} from './MajorGuide';
import {useApp} from './context';
import {normalize} from './api';
import {Button,ChoiceSteps,Empty,Link,Notice,PageTitle} from './components';
import {fields,interestFit,majorChoices} from '../shared/domain.mjs';
export {ChooseUniversities} from './ChooseUniversities';

const pageSize=18;
export function ChooseMajors({params}) {
  const {catalog,results,selectedMajors,updateSelectedMajors}=useApp();
  const [search,setSearch]=useState(''),[field,setField]=useState(params.get('field')||''),[stem,setStem]=useState(false),[recommended,setRecommended]=useState(false),[page,setPage]=useState(1);
  const [guideChoice,setGuideChoice]=useState(null);
  const [expandedField,setExpandedField]=useState(params.get('field')||'');
  const latest=results[0];
  const choices=useMemo(()=>majorChoices(catalog.majors).map(choice=>({...choice,fit:interestFit(latest?.scores,choice.holland)})),[catalog,latest]);
  const orderedFields=Object.entries(fields).map(([key,value])=>({key,...value,fit:interestFit(latest?.scores,value.holland)})).sort((a,b)=>(b.fit??-1)-(a.fit??-1)||a.name.localeCompare(b.name,'vi'));
  const matches=choices.filter(choice=>(!field||choice.field===field)&&(!stem||fields[choice.field].stem)
    &&(!recommended||!latest||[...latest.code].filter(code=>choice.holland.includes(code)).length>=2)
    &&(!search||normalize(`${choice.name} ${fields[choice.field].name}`).includes(normalize(search))));
  matches.sort((a,b)=>(latest?(b.fit-a.fit):0)||a.name.localeCompare(b.name,'vi')||a.field.localeCompare(b.field));
  const visibleFields=orderedFields.map((item,index)=>({...item,suggested:!!latest&&index<5,choices:matches.filter(choice=>choice.field===item.key)})).filter(item=>item.choices.length);
  const selectedChoices=choices.filter(choice=>selectedMajors.includes(choice.key));
  function changeFilters(change) {change();setPage(1);}
  function chooseField(next) {setField(next);setExpandedField(next);setSearch('');setRecommended(false);if(next&&!fields[next].stem)setStem(false);setPage(1);}
  function toggleField(key) {setExpandedField(expandedField===key?'':key);setPage(1);}
  function toggle(key) {updateSelectedMajors(selectedMajors.includes(key)?selectedMajors.filter(item=>item!==key):[...selectedMajors,key]);}
  return <>
    <PageTitle title="Chọn ngành bạn muốn tìm hiểu" eyebrow="BƯỚC 1 · CHỌN NGÀNH">Xem ngành trước, rồi mới chọn trường đào tạo ngành đó. {latest?'Kết quả Holland mới nhất giúp xếp ngành phù hợp với sở thích lên trước.':'Bạn có thể tự chọn ngành ngay, hoặc làm bài Holland để xem gợi ý theo sở thích.'}</PageTitle>
    <ChoiceSteps step={1}/>
    {latest?<Notice><Sparkles size={16}/> Mã Holland {latest.code}: xếp theo mức hứng thú tham khảo, không phải khả năng trúng tuyển. Bạn có thể chọn cả ngành ngoài nhóm được gợi ý.</Notice>:<Notice><Link to="holland" className="text-link">Làm bài Holland <ArrowRight size={15}/></Link> để nhận gợi ý cá nhân; bạn vẫn có thể chọn ngành ngay.</Notice>}
    <div className="major-choice-filters panel"><div className="search-input"><Search size={18}/><input aria-label="Tìm tên ngành" placeholder="Tìm ngành học…" value={search} onChange={e=>changeFilters(()=>setSearch(e.target.value))}/></div><label>Nhóm ngành<select aria-label="Nhóm ngành" value={field} onChange={e=>chooseField(e.target.value)}><option value="">Tất cả nhóm ngành</option>{Object.entries(fields).map(([key,value])=><option key={key} value={key}>{value.name}</option>)}</select></label><label className="checkbox-label"><input type="checkbox" checked={stem} onChange={e=>changeFilters(()=>setStem(e.target.checked))}/> Chỉ ngành STEM</label>{latest&&<label className="checkbox-label"><input type="checkbox" checked={recommended} onChange={e=>changeFilters(()=>setRecommended(e.target.checked))}/> Gợi ý theo Holland</label>}<Button onClick={()=>{setField('');setExpandedField('');setStem(false);setRecommended(false);setSearch('');setPage(1);}}>Xóa bộ lọc ngành</Button></div>
    {stem&&<Notice>STEM (khoa học, công nghệ, kỹ thuật, toán và lĩnh vực liên quan) ở đây là <strong>phân nhóm hướng nghiệp do UniGate biên tập</strong>. Việc ngành thuộc bộ lọc không đồng nghĩa được nhận học bổng Nhà nước; đối chiếu ngành, chương trình, trường và điều kiện của chính sách cụ thể trước khi đăng ký.</Notice>}
    <div className="selection-summary panel"><div><strong>Đã chọn {selectedMajors.length} ngành</strong><p className="caption">Chọn nhiều ngành; tiếp theo nhập điểm và phương thức để lọc những trường có chương trình khớp hồ sơ.</p>{selectedChoices.length>0&&<div className="selected-chips">{selectedChoices.map(choice=><button key={choice.key} type="button" onClick={()=>toggle(choice.key)} aria-label={`Bỏ chọn ${choice.name}`}>{choice.name} ×</button>)}</div>}</div><Link to="admission-scores" className={`button primary ${selectedMajors.length?'':'disabled-link'}`} aria-disabled={!selectedMajors.length} onClick={e=>{if(!selectedMajors.length)e.preventDefault();}}>Tiếp: Nhập điểm <ArrowRight size={16}/></Link></div>
    <div className="section-heading"><h2>{latest?'Khám phá nhóm ngành theo Holland':'Khám phá các nhóm ngành'}</h2><span className="caption">{visibleFields.length} nhóm · {matches.length} ngành</span></div>
    <p className="caption">{latest?'5 nhóm gợi ý từ Holland được xếp đầu. ':''}Bấm vào hàng nhóm ngành để mở các ngành bên trong. Bạn có thể chọn ngành ở nhiều nhóm.</p>
    {visibleFields.length?<div className="major-field-list">{visibleFields.map(item=>{
      const open=expandedField===item.key;
      const selectedCount=choices.filter(choice=>choice.field===item.key&&selectedMajors.includes(choice.key)).length;
      return <section className={`major-field ${open?'expanded':''}`} key={item.key}>
        <h3 className="major-field-heading"><button type="button" className="major-field-toggle" id={`field-toggle-${item.key}`} aria-label={`Nhóm ${item.name}`} aria-expanded={open} aria-controls={`field-choices-${item.key}`} onClick={()=>toggleField(item.key)}>
          <span className="major-field-copy"><span className="major-field-title">{item.name}{item.suggested&&<span className="field-suggestion">Gợi ý Holland</span>}</span><span className="major-field-description">{item.description}</span><span className="major-field-meta">{item.choices.length} ngành{item.fit!==null?` · Holland ${item.fit}/100`:''}{item.stem?' · STEM':''}{selectedCount?` · Đã chọn ${selectedCount} ngành`:''}</span></span>
          <ChevronRight size={24} className="major-field-chevron" aria-hidden="true"/>
        </button></h3>
        <div id={`field-choices-${item.key}`} role="region" aria-labelledby={`field-toggle-${item.key}`} hidden={!open} className="major-field-content">
          {open&&<><p className="caption">Bấm tên ngành hoặc biểu tượng thông tin để tìm hiểu trước khi chọn.</p><div className="choice-grid">{item.choices.slice((page-1)*pageSize,page*pageSize).map(choice=><article key={choice.key} className={`panel choice-card ${selectedMajors.includes(choice.key)?'selected':''}`}><span className="field-label">{fields[choice.field].name} {fields[choice.field].stem?'· STEM':''}</span><div className="choice-name"><h3><button type="button" className="text-button" aria-label={`Tìm hiểu ngành ${choice.name}`} onClick={()=>setGuideChoice(choice)}>{choice.name}</button></h3><button type="button" className="icon-button" aria-label={`Thông tin ngành ${choice.name}`} onClick={()=>setGuideChoice(choice)}><Info size={19}/></button></div><p className="caption">{choice.universities.length} trường trong danh mục · Holland {choice.holland}{choice.fit!==null?` · Phù hợp ${choice.fit}/100`:''}</p><Button className={selectedMajors.includes(choice.key)?'selected-button':'full'} aria-pressed={selectedMajors.includes(choice.key)} aria-label={`${selectedMajors.includes(choice.key)?'Bỏ chọn':'Chọn'} ngành ${choice.name}`} onClick={()=>toggle(choice.key)}>{selectedMajors.includes(choice.key)?<><Check size={16}/> Đã chọn</>:'Chọn ngành này'}</Button></article>)}</div>
          {item.choices.length>pageSize&&<div className="pagination"><Button aria-label="Trang ngành trước" disabled={page===1} onClick={()=>setPage(n=>n-1)}><ChevronLeft size={18}/></Button><span>Trang {page} / {Math.ceil(item.choices.length/pageSize)}</span><Button aria-label="Trang ngành sau" disabled={page>=Math.ceil(item.choices.length/pageSize)} onClick={()=>setPage(n=>n+1)}><ChevronRight size={18}/></Button></div>}</>}
        </div>
      </section>;
    })}</div>:<Empty title="Chưa có ngành khớp bộ lọc">Thử tìm bằng tên khác hoặc bỏ bớt bộ lọc.</Empty>}
    {guideChoice&&<MajorGuide key={guideChoice.key} choice={guideChoice} catalog={catalog} selected={selectedMajors.includes(guideChoice.key)} onToggle={()=>toggle(guideChoice.key)} onClose={()=>setGuideChoice(null)}/>}
  </>;
}
