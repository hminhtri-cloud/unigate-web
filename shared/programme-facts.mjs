export function estimatedAnnualTuition(major) {
  const tuition=major.tuition,basis=tuition?.annualBasis;
  if(!basis||basis.programId!==major.id||basis.cohort!==major.admissionYear||!basis.source||!tuition.source)return null;
  if(!['credits','periods'].includes(basis.kind)||!Number.isFinite(basis.units)||basis.units<=0||!Number.isFinite(basis.years)||basis.years<=0)return null;
  if(basis.kind==='credits'&&tuition.period!=='tín chỉ')return null;
  if(basis.kind==='periods'&&!['học kỳ','đợt'].includes(tuition.period))return null;
  const min=tuition.value,max=tuition.maxValue??min;
  if(!Number.isFinite(min)||min<0||!Number.isFinite(max)||max<min)return null;
  return {...basis,min:Math.round(min*basis.units/basis.years),max:Math.round(max*basis.units/basis.years),unitsPerYear:basis.units/basis.years};
}
export function annualEstimateLabel(estimate) {
  if(!estimate)return '';
  const display=n=>(n/1_000_000).toLocaleString('vi-VN',{maximumFractionDigits:1});
  return `khoảng ${display(estimate.min)}${estimate.max!==estimate.min?`–${display(estimate.max)}`:''} triệu/năm`;
}
export function durationLabel(duration) {
  if(!duration)return 'Chưa đối chiếu';
  return `${duration.years.toLocaleString('vi-VN')} năm${duration.credits?` · ${duration.credits} tín chỉ`:''}`;
}
export function durationRanges(programs) {
  return ['university','college'].flatMap(level=>{
    const known=programs.filter(p=>(p.educationLevel||'university')===level&&Number.isFinite(p.duration?.years));
    if(!known.length)return [];
    return [{level,min:Math.min(...known.map(p=>p.duration.years)),max:Math.max(...known.map(p=>p.duration.years)),count:known.length,total:programs.filter(p=>(p.educationLevel||'university')===level).length}];
  });
}
