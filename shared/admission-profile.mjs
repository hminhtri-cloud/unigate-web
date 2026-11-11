import {combinationScores,combinations,admissionMethodLabel} from './domain.mjs';

export const otherExams={
  hsa:{label:'ĐGNL ĐHQG Hà Nội (HSA)',method:'dgnl-hn',scale:150},
  tsa:{label:'Đánh giá tư duy Bách khoa Hà Nội (TSA)',method:'tsa',scale:100},
  sat:{label:'SAT',method:'sat',scale:1600},
};
export const exclusiveSubjectGroups=[['english','russian','french','chinese','german','japanese','korean'],['technology','agriculture']];
export function conflictsWithExamSubjects(key,selected) {
  return !selected.includes(key)&&exclusiveSubjectGroups.some(group=>group.includes(key)&&group.some(subject=>selected.includes(subject)));
}

export function profileCombinations(scores) {
  const selected=scores.admissionProfile?.examSubjects||[];
  const values=Object.fromEntries(selected.filter(key=>Object.hasOwn(scores.subjects||{},key)).map(key=>[key,scores.subjects[key]]));
  return combinationScores(values);
}
export function availableStudentMethods(scores) {
  const methods=[];
  if(scores.admissionProfile?.examSubjects?.length===4&&profileCombinations(scores).length)methods.push('thpt');
  if(Number.isFinite(scores.dgnl))methods.push('dgnl');
  for(const [key,exam] of Object.entries(otherExams))if(Number.isFinite(scores.admissionProfile?.otherScores?.[key]))methods.push(exam.method);
  return methods;
}
export function admissionProfileReady(scores) {
  return !!scores.admissionProfile?.confirmed&&availableStudentMethods(scores).length>0;
}

// Only explicit, current programme/method evidence can establish a match.
// A converted /30 or a composite cutoff does not identify its underlying routes.
// Missing evidence is kept distinct from a confirmed incompatible route.
export function matchAdmissionProfile(major,scores) {
  const methods=availableStudentMethods(scores),studentCombos=profileCombinations(scores);
  const routes=[];
  for(const route of major.admissionMethods||[]){
    if((route.year??major.admissionYear)!==2026||!route.source)continue;
    routes.push({...route,origin:'method'});
  }
  for(const score of major.admissionScores||[]){
    if(score.year!==2026||!score.source||score.scoreType==='floor')continue;
    // Do not use generic programme-level combinations to attribute them to a
    // particular score method, and never reinterpret equivalent/composite scores.
    routes.push({...score,origin:'score'});
  }
  const matches=[],unknown=[];
  let incompatible=false;
  for(const route of routes){
    if(!['thpt','thpt-weighted','dgnl','dgnl-hn','tsa','sat'].includes(route.method)){
      unknown.push(route.method);continue;
    }
    const studentMethod=route.method==='thpt-weighted'?'thpt':route.method;
    if(!methods.includes(studentMethod)){incompatible=true;continue;}
    if(studentMethod==='thpt'){
      const codes=route.combinations||[];
      if(!codes.length){unknown.push(route.method);continue;}
      const shared=studentCombos.filter(combo=>codes.includes(combo.code));
      if(!shared.length){
        // Codes not in our dictionary (e.g. aptitude) cannot be declared a
        // definitive mismatch just from four academic-subject marks.
        if(codes.some(code=>!combinations[code]))unknown.push(route.method);
        else incompatible=true;
        continue;
      }
      matches.push({method:route.method,label:admissionMethodLabel[route.method],combinations:shared,source:route.combinationSource||route.source});
    }else{
      // A raw DGNL/HSA/TSA/SAT score is specific to its exam; never interconvert.
      matches.push({method:route.method,label:admissionMethodLabel[route.method],combinations:[],source:route.source});
    }
  }
  const unique=[...new Map(matches.map(m=>[`${m.method}|${m.combinations.map(c=>c.code).sort().join(',')}`,m])).values()];
  return {status:unique.length?'matched':unknown.length||!routes.length?'unknown':incompatible?'not-matched':'unknown',matches:unique};
}

export function studentProfileSummary(scores) {
  const combos=profileCombinations(scores).map(c=>c.code).join(', ');
  return availableStudentMethods(scores).map(method=>method==='thpt'?`THPT: ${combos}`:admissionMethodLabel[method]).join(' · ');
}
