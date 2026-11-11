import { majors, universities } from '../data/catalog.mjs';

const hasCutoff = major => major.admissionScores.some(score =>
  Number.isFinite(score.value) && (!score.scoreType || score.scoreType==='cutoff'));
const hasThptScope = major => major.admissionScores.some(score =>
  ['thpt','thpt-equivalent','thpt-weighted','aptitude-thpt'].includes(score.method) &&
  (score.combinations?.length || score.combinationExpression));
const summary = {
  programmes: majors.length,
  withCutoffs: majors.filter(hasCutoff).length,
  scoreRecords: majors.reduce((count,major)=>count+major.admissionScores.length,0),
  withoutCutoffs: majors.filter(major=>!hasCutoff(major)).length,
  withPublishedCombinationList: majors.filter(major=>major.combinations.length).length,
  withThptScoreScope: majors.filter(hasThptScope).length,
};
console.log(JSON.stringify(summary,null,2));
if(process.argv.includes('--missing')) {
  console.log(JSON.stringify(majors.filter(major=>!hasCutoff(major)).map(major=>({
    id:major.id,universityId:major.universityId,name:major.name,
    programme:major.program,source:major.source.url,
    status:major.admissionMissingReason||'UniGate chưa nhập được điểm đối chiếu đúng chương trình/phương thức/năm; không phải kết luận trường không công bố',
    schoolPublicationStatus:universities.find(u=>u.id===major.universityId)?.admissionsReview?.status||'Chưa rà đủ nguồn',
  })),null,2));
} else {
  console.table(universities.map(school=>{
    const programmes=majors.filter(major=>major.universityId===school.id);
    return {school:school.id,programmes:programmes.length,
      withCutoffs:programmes.filter(hasCutoff).length,
      missing:programmes.filter(major=>!hasCutoff(major)).length,
      combinationList:programmes.filter(major=>major.combinations.length).length,
      sourceRechecked:school.admissionsReview?.status==='published'?'Đã thấy công bố':'Chưa rà đủ nguồn'};
  }));
}
