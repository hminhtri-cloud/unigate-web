import {fields,majorChoiceKey} from './domain.mjs';
import {guideTopics,guidePreparation} from '../data/major-guide-topics.mjs';
import {guideEvidence} from '../data/major-guide-evidence.mjs';
import {durationRanges} from './programme-facts.mjs';

const sameName=(a,b)=>a.toLocaleLowerCase('vi')===b.toLocaleLowerCase('vi');
export function evidenceForProgram(program) {
  return guideEvidence.find(e=>e.universityId===program.universityId
    &&e.educationLevel===(program.educationLevel||'university')
    &&sameName(e.name,program.name)&&(!e.code||e.code===program.code))||null;
}

export function majorGuide(choice,majors,universities) {
  const topic=guideTopics.find(item=>item.pattern.test(choice.name));
  const programs=majors.filter(m=>majorChoiceKey(m)===choice.key).map(m=>({
    id:m.id,name:m.name,code:m.code,universityId:m.universityId,
    school:universities.find(u=>u.id===m.universityId)?.name||m.universityId,
    educationLevel:m.educationLevel||'university',evidence:evidenceForProgram(m),duration:m.duration||null,
    // Danh mục tuyển sinh chỉ chứng minh ngành có trong danh mục; không dùng
    // để chứng minh các nội dung học/thời lượng chưa đối chiếu.
    catalogSource:m.source,
  }));
  let preparationField=choice.field;
  // Một số tên ngành nằm ở nhóm tổng hợp trong dữ liệu tuyển sinh cũ.
  if(/công nghệ sinh học|khoa học đất|rau hoa quả/i.test(choice.name))preparationField='bio';
  if(/công nghệ tài chính/i.test(choice.name))preparationField='business';
  if(/kỹ thuật xây dựng/i.test(choice.name))preparationField='engineering';
  const [skills,interests]=guidePreparation[preparationField];
  return {
    name:choice.name,field:fields[choice.field].name,holland:choice.holland,
    topicCovered:!!topic,
    learn:topic?.learn||[fields[choice.field].description],
    careers:topic?.careers||[fields[choice.field].careers],
    tryIt:topic?.tryIt||'Trao đổi với sinh viên và người đang làm việc đúng chuyên ngành.',
    skills:skills.split(';'),interests,programs,
    isGroup:/^nhóm ngành|^song ngành/i.test(choice.name),
    isVariant:/\([^)]*\)/.test(choice.name),
    reviewedPrograms:programs.filter(p=>p.evidence).length,
    durationRanges:durationRanges(programs),durationReviewed:programs.filter(p=>p.duration).length,
  };
}
