import React,{useMemo,useState} from 'react';
import {Check,ExternalLink} from 'lucide-react';
import {Button,Modal,Notice,SchoolDetail} from './components';
import {groups} from '../shared/domain.mjs';
import {durationLabel} from '../shared/programme-facts.mjs';
import {featuredForField} from '../data/school-profiles.mjs';
import {majorGuide} from '../shared/major-guides.mjs';

function OfficialLink({url,children}) {
  return <a className="source-link" href={url} target="_blank" rel="noreferrer">{children} <ExternalLink size={13}/></a>;
}
function List({items}) {return <ul>{items.map(item=><li key={item}>{item}</li>)}</ul>;}

export function MajorGuide({choice,catalog,selected,onToggle,onClose}) {
  const guide=useMemo(()=>majorGuide(choice,catalog.majors,catalog.universities),[choice,catalog]);
  const reviewed=guide.programs.filter(p=>p.duration);
  const featured=featuredForField(choice.field,catalog.universities,catalog.majors);
  const [schoolDetail,setSchoolDetail]=useState(null);
  const schools=[...new Map(guide.programs.map(p=>[p.universityId,p.school])).entries()].sort((a,b)=>a[1].localeCompare(b[1],'vi'));
  const [school,setSchool]=useState(reviewed[0]?.universityId||schools[0]?.[0]||'');
  const programs=guide.programs.filter(p=>p.universityId===school);
  return <Modal title={`Tìm hiểu ngành: ${guide.name}`} onClose={onClose}>
    <div className="major-guide">
      <p className="caption">{guide.field} · {schools.length} trường · {guide.programs.length} chương trình trong danh mục</p>
      {guide.isGroup&&<Notice>Đây là lựa chọn nhóm hoặc song ngành. Nội dung, bằng cấp và nghề nghiệp phụ thuộc ngành thành viên, lộ trình và quy tắc phân ngành của trường.</Notice>}
      {guide.isVariant&&<Notice>Nội dung hướng nghiệp mô tả nền tảng lĩnh vực. Với chương trình tăng cường ngoại ngữ, chất lượng cao, liên kết hoặc cơ sở khác, hãy kiểm tra chương trình cụ thể bên dưới.</Notice>}
      <section className="guide-section">
        <span className="field-label">THÔNG TIN THEO CHƯƠNG TRÌNH CỦA TRƯỜNG</span>
        <h3>Học mấy năm?</h3>
        <p>Thời lượng khác nhau theo trường, bậc và chương trình. Các mốc dưới đây là thời gian trường công bố; tiến độ tốt nghiệp thực tế còn phụ thuộc việc hoàn thành yêu cầu đào tạo.</p>
        {guide.durationRanges.map(range=><div className="duration-range" key={range.level}><strong>{range.level==='college'?'Cao đẳng':'Đại học'}: {range.min.toLocaleString('vi-VN')}{range.max!==range.min?`–${range.max.toLocaleString('vi-VN')}`:''} năm</strong><p className="caption">Khoảng từ {range.count}/{range.total} chương trình đã đối chiếu trong danh mục; tùy trường, chương trình và tiến độ học, không phải giới hạn chung cho mọi trường.</p></div>)}
        {reviewed.length?<ul className="guide-durations">{reviewed.map(p=><li key={p.id}><strong>{durationLabel(p.duration)}</strong><div>{p.school}<small>{p.educationLevel==='college'?'Cao đẳng':'Đại học'} · {p.name}{p.code?` · ${p.code}`:''}</small><OfficialLink url={p.duration.source}>Nguồn thời lượng chương trình</OfficialLink></div></li>)}</ul>:<Notice>Chưa đối chiếu thời lượng từ trang giới thiệu hoặc chương trình đào tạo cụ thể cho lựa chọn này. Xem nguồn từng trường bên dưới để hỏi đúng khóa và chương trình.</Notice>}
        <p className="caption">Thời lượng đã đối chiếu: {guide.durationReviewed}/{guide.programs.length} chương trình. Thông tin của một trường không áp dụng cho các trường còn lại.</p>
      </section>
      <section className="guide-section">
        <span className="field-label">HƯỚNG NGHIỆP · UNIGATE BIÊN TẬP</span>
        <p className="caption">Các nội dung dưới đây giúp khám phá lĩnh vực; không phải danh sách học phần, chuẩn đầu ra hoặc điều kiện tuyển sinh chính thức của mọi trường.</p>
        <div className="guide-grid">
          <div><h3>Học và làm quen với gì?</h3><List items={guide.learn}/></div>
          <div><h3>Có thể làm công việc gì?</h3><List items={guide.careers}/><p className="caption">Vị trí thực tế phụ thuộc bậc học, chuyên môn và kinh nghiệm; một số nghề cần điều kiện hành nghề hoặc tuyển dụng riêng.</p></div>
          <div><h3>Cần chuẩn bị kỹ năng gì?</h3><List items={guide.skills}/></div>
          <div><h3>Sở thích, tính cách nào có thể phù hợp?</h3><p>{guide.interests}.</p><div className="major-tags">{[...guide.holland].map(code=><span key={code}>{code} · {groups[code].name}</span>)}</div><p className="caption">Holland là gợi ý sở thích do UniGate biên tập, không phải chẩn đoán tính cách, đánh giá năng lực hay điều kiện tuyển sinh. Các kỹ năng đều có thể rèn luyện.</p></div>
        </div>
        <div className="guide-try"><h3>Thử trước khi chọn</h3><p>{guide.tryIt}</p></div>
      </section>
      {featured.length>0&&<section className="guide-section featured-schools"><h3>Trường nổi bật trong lĩnh vực {guide.field}</h3><p className="caption">Gợi ý biên tập của UniGate theo lĩnh vực đào tạo, không phải xếp hạng chính thức. Danh sách thuộc lĩnh vực rộng; xem tên chương trình thực tế của từng trường trước khi chọn ngành cụ thể.</p><div className="featured-school-grid">{featured.map(({university,programs:offered,reason,source})=><article key={university.id}><h4>{university.name}</h4><p>{reason}</p><p className="caption">Chương trình trong danh mục: {offered.slice(0,3).map(p=>p.name).join(' · ')}{offered.length>3?'…':''}</p><Button onClick={()=>setSchoolDetail(university)}>Thông tin trường {university.id}</Button><OfficialLink url={source.url}>Căn cứ lĩnh vực đào tạo</OfficialLink></article>)}</div></section>}
      <section className="guide-section">
        <h3>Đối chiếu nội dung và yêu cầu theo trường</h3>
        <label className="guide-school">Trường có chương trình này<select aria-label="Trường trong thông tin ngành" value={school} onChange={e=>setSchool(e.target.value)}>{schools.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
        {programs.map(p=><article className="guide-program" key={p.id}>
          <h4>{p.name}</h4><p className="caption">{p.educationLevel==='college'?'Cao đẳng':'Đại học'}{p.code?` · Mã ${p.code}`:''}</p>
          {p.evidence?<>
            <strong className="blue">Đã đối chiếu trang giới thiệu chương trình</strong>
            {p.evidence.learn.length>0&&<><h4>Trường giới thiệu nội dung gì?</h4><List items={p.evidence.learn}/></>}
            {p.evidence.careers.length>0&&<><h4>Hướng nghề nghiệp trường nêu</h4><List items={p.evidence.careers}/></>}
            <p>Thời gian: <strong>{p.evidence.years.toLocaleString('vi-VN')} năm</strong>.</p>
            <blockquote>{p.evidence.durationQuote}</blockquote>
            {p.evidence.requirement&&<p>{p.evidence.requirement}</p>}
            <OfficialLink url={p.evidence.url}>Giới thiệu chương trình chính thức</OfficialLink>
            <p className="caption">Tóm lược theo trang trường · Đối chiếu {p.evidence.checkedAt}. Điều kiện đầu vào và yêu cầu tốt nghiệp khác cần đọc theo đúng khóa.</p>
          </>:<>{p.duration&&<><p><strong>Thời gian đã đối chiếu: {durationLabel(p.duration)}</strong></p><OfficialLink url={p.duration.source}>Thời lượng / chương trình chính thức</OfficialLink><p className="caption">{p.duration.quote} · Đối chiếu {p.duration.checkedAt}.</p></>}<p>Chưa đối chiếu đầy đủ nội dung học và yêu cầu đầu vào/đầu ra của chương trình. Nguồn danh mục bên dưới chỉ giúp tra cứu ngành tại trường, không chứng minh các nội dung hướng nghiệp biên tập ở trên.</p></>}
          <Button onClick={()=>setSchoolDetail(catalog.universities.find(u=>u.id===p.universityId))}>Tìm hiểu trường {p.universityId}</Button>
          {p.catalogSource&&<OfficialLink url={p.catalogSource.url}>{p.catalogSource.kind==='secondary'?'Danh mục tham khảo — nguồn thứ cấp':'Danh mục / tuyển sinh của trường'}</OfficialLink>}
        </article>)}
        <p className="caption">Khi liên hệ trường, hãy hỏi: khóa áp dụng, thời gian và tín chỉ, thực tập, chuẩn ngoại ngữ, học phần bắt buộc, môn năng khiếu hoặc điều kiện chuyên ngành. Điểm chuẩn và tổ hợp theo phương thức nằm ở bước Chọn trường / Tra cứu.</p>
      </section>
      <div className="guide-actions"><Button className={selected?'selected-button':'primary'} aria-pressed={selected} onClick={onToggle}>{selected?<><Check size={16}/> Đã chọn · Bỏ chọn ngành</>:'Chọn ngành này'}</Button><Button onClick={onClose}>Tiếp tục khám phá</Button></div>
    </div>{schoolDetail&&<SchoolDetail university={schoolDetail} field={choice.field} onClose={()=>setSchoolDetail(null)}/>}
  </Modal>;
}
