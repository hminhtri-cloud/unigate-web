import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../data/questions.mjs';
import { majors,universities } from '../data/catalog.mjs';
import { calculateResult,combinationScores,interestFit,groups,fields,combinations,sortCatalogMajors,thptSortingScore,compositeSortingScore,admissionGroup,comparableAnnualTuition,matchesHolland } from '../shared/domain.mjs';
test('60 unique questions, 10 per RIASEC group; strong I/R profile is scored correctly',()=>{
  assert.equal(questions.length,60);assert.equal(new Set(questions.map(q=>q.content)).size,60);
  for(const g of Object.keys(groups))assert.equal(questions.filter(q=>q.group===g).length,10);
  const answers=Object.fromEntries(questions.map(q=>[q.id,q.group==='I'?5:q.group==='R'?4:q.group==='C'?3:1]));
  const r=calculateResult(questions,answers);assert.equal(r.code,'IRC');assert.equal(r.scores.I,50);assert.equal(r.scores.R,40);assert.equal(r.scores.A,10);assert.equal(r.uniform,false);
  assert.throws(()=>calculateResult(questions,{...answers,1:0}));
});
test('tied profiles disclose no differentiation; recommendation is bounded and neutral at 50',()=>{
  const r=calculateResult(questions,Object.fromEntries(questions.map(q=>[q.id,3])));
  assert.equal(r.uniform,true);assert.equal(r.tie,true);assert.equal(r.code,'RIA');assert.equal(interestFit(r.scores,'IRC'),50);
  assert.equal(interestFit(Object.fromEntries(Object.keys(groups).map(k=>[k,10])),'IRC'),0);
  assert.equal(interestFit(Object.fromEntries(Object.keys(groups).map(k=>[k,50])),'IRC'),100);
  assert.equal(interestFit(undefined,'IRC'),null);
});
test('zero score is valid, incomplete combinations are excluded, totals are rounded',()=>{
  const r=combinationScores({math:0,physics:7.12,chemistry:8.13});
  assert.equal(r.length,1);assert.equal(r[0].code,'A00');assert.equal(r[0].total,15.25);
  assert.deepEqual(combinationScores({math:10,physics:10}),[]);
});
test('catalog integrity: independent IDs, source provenance, non-invented missing statistics',()=>{
  assert.equal(universities.length,19);assert.equal(majors.length,423);assert.equal(new Set(majors.map(m=>m.id)).size,majors.length);
  assert.equal(universities.filter(u=>u.system==='ĐHQG-HCM').length,8);
  assert.equal(universities.filter(u=>u.system==='Trường tại TP.HCM'&&u.province==='TP. Hồ Chí Minh').length,10);
  assert.equal(universities.filter(u=>u.institutionType==='public').length,18);
  assert.deepEqual(universities.filter(u=>u.institutionType==='private').map(u=>u.id),['HUTECH']);
  for(const u of universities)assert.ok(majors.some(m=>m.universityId===u.id),`${u.id} cần có ngành thực tế`);
  for(const m of majors.filter(m=>m.universityId==='UEH'))assert.equal(m.tuition,null);
  for(const m of majors){assert.ok(universities.some(u=>u.id===m.universityId));assert.ok(fields[m.field]);assert.ok(/^https:\/\//.test(m.source.url));assert.match(m.holland,/^[RIASEC]{3}$/);for(const c of m.combinations)assert.ok(combinations[c]);}
  assert.equal(majors.filter(m=>m.universityId==='HCMUS').length,39);
  assert.equal(majors.filter(m=>m.universityId==='AGU'&&m.source.kind==='secondary'&&!m.verified).length,43);
  assert.ok(majors.filter(m=>m.universityId==='HCMUT').every(m=>m.cutoff.scale===100&&m.cutoff.method==='Xét tuyển tổng hợp'));
  assert.ok(majors.filter(m=>m.universityId==='UIT').every(m=>m.tuition?.value===42_000_000&&m.tuition.approximate&&m.cutoff===null));
  assert.equal(majors.filter(m=>m.admissionScores.length).length,282);
  assert.equal(majors.filter(m=>m.universityId==='CTU').length,127);
  assert.ok(majors.filter(m=>m.universityId==='CTU').every(m=>m.admissionScores.length===1&&m.tuition?.source&&m.tuition.value>0));
  assert.equal(majors.find(m=>m.id==='CTU-7480201').admissionScores[0].value,23.73);
  assert.equal(majors.find(m=>m.id==='CTU-7480201').tuition.value,33_400_000);
  assert.equal(majors.find(m=>m.id==='CTU-7140209').tuition.value,27_380_000);
  assert.equal(majors.find(m=>m.id==='CTU-7340101C').tuition.value,44_000_000);
  assert.equal(majors.find(m=>m.id==='CTU-7340101C').admissionScores[0].value,20.01);
  assert.equal(majors.find(m=>m.id==='HUTECH-001').tuition.period,'đợt');
  assert.equal(majors.find(m=>m.id==='HUTECH-001').tuition.value,16_500_000);
  assert.equal(majors.filter(m=>m.tuition).length,283);
  assert.equal(majors.find(m=>m.id==='UAH-001').tuition.value,1_140_000);
  assert.equal(majors.find(m=>m.id==='UAH-001').tuition.period,'tín chỉ');
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UAH-001')),null);
  assert.equal(majors.find(m=>m.id==='HCMUT-106').tuition.value,15_750_000);
  assert.equal(majors.find(m=>m.id==='HCMUT-106').tuition.approximate,true);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='HCMUT-106')),null);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UIT-001')),null);
  assert.equal(majors.find(m=>m.id==='UFM-001').tuition.value,30_000_000);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UFM-001')),30_000_000);
  assert.equal(majors.find(m=>m.id==='USSH-7320101').tuition.year,'2025–2026');
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='USSH-7320101')),null);
  assert.equal(majors.filter(m=>m.universityId==='HCMUS'&&m.admissionScores.length===2).length,39);
  assert.equal(majors.filter(m=>m.universityId==='NLU'&&m.admissionScores.length===2).length,9);
  assert.equal(majors.filter(m=>admissionGroup(m)==='thpt').length,160);
  assert.equal(majors.filter(m=>admissionGroup(m)==='composite').length,122);
  assert.equal(majors.filter(m=>admissionGroup(m)==='unverified').length,141);
  assert.equal(admissionGroup(majors.find(m=>m.id==='HCMUS-7420201')),'composite');
  assert.equal(admissionGroup(majors.find(m=>m.id==='UAH-001')),'thpt');
  assert.ok(majors.flatMap(m=>m.admissionScores).every(s=>s.year===2026&&s.value>=0&&s.value<=s.scale&&/^https:\/\//.test(s.source)));
  assert.ok(majors.filter(m=>m.universityId==='HCMUT').every(m=>thptSortingScore(m)===null));
});
test('annual tuition sort keeps per-credit, installment and older cohort figures after comparable annual amounts',()=>{
  const ids=['UAH-001','CTU-7480201','HUTECH-001','UFM-001','UIT-001','USSH-7320101'];
  const selected=ids.map(id=>majors.find(m=>m.id===id));
  assert.deepEqual(sortCatalogMajors(selected,'tuition').slice(0,2).map(m=>m.id),['UFM-001','CTU-7480201']);
});
test('THPT sort never compares /100 or old cutoffs, and keeps officially converted /30 points distinct',()=>{
  const sample=[
    {id:'missing',name:'A',admissionScores:[],fit:90},
    {id:'low',name:'B',admissionScores:[{value:20,year:2026,method:'thpt',scale:30}],fit:80},
    {id:'old',name:'C',admissionScores:[{value:27,year:2025,method:'thpt',scale:30}],fit:99},
    {id:'high',name:'D',admissionScores:[{value:28,year:2026,method:'thpt',scale:30}],fit:80},
    {id:'converted',name:'E',admissionScores:[{value:25,year:2026,method:'thpt-equivalent',scale:30}],fit:80},
    {id:'composite',name:'F',admissionScores:[{value:99,year:2026,method:'composite',scale:100}],fit:80},
  ];
  assert.deepEqual(sortCatalogMajors(sample,'cutoff-desc').map(m=>m.id),['high','converted','low','missing','old','composite']);
  assert.deepEqual(sortCatalogMajors(sample,'cutoff-asc').map(m=>m.id),['low','converted','high','missing','old','composite']);
  assert.deepEqual(sortCatalogMajors(sample,'fit').map(m=>m.id),['old','missing','high','converted','low','composite']);
  assert.deepEqual(sortCatalogMajors(sample,'holland-cutoff-desc').map(m=>m.id),['old','missing','high','converted','low','composite']);
  assert.deepEqual(sortCatalogMajors(sample,'holland-cutoff-asc').map(m=>m.id),['old','missing','low','converted','high','composite']);
  assert.equal(thptSortingScore(sample[2]),null);
  assert.equal(thptSortingScore(sample[5]),null);
  assert.equal(thptSortingScore(sample[4]).method,'thpt-equivalent');
});
test('Holland-first shortlist prioritizes fit then uses THPT as tie-breaker',()=>{
  const shortlist=majors.filter(m=>matchesHolland(m,'IRA'));
  const scores={I:49,R:40,A:31,S:31,E:31,C:30};
  const ordered=sortCatalogMajors(shortlist.map(m=>({...m,fit:interestFit(scores,m.holland)})),'holland-cutoff-desc');
  assert.ok(ordered.length>0 && ordered.length<majors.length);
  assert.ok(ordered.every(m=>m.holland[0]==='I'));
  assert.equal(ordered[0].id,'HCMUS-7420201');
  assert.ok(ordered.every((m,i)=>i===0||ordered[i-1].fit>=m.fit));
  assert.ok(majors.some(m=>matchesHolland(m,'CIR')));
  assert.equal(matchesHolland({holland:'AES'},'IRA'),false);
});
test('composite ranking groups by university and only compares scores within that university',()=>{
  const sample=[
    {id:'A-low',universityId:'A',name:'Thấp',fit:80,admissionScores:[{method:'composite',year:2026,scale:100,value:62}]},
    {id:'B-high',universityId:'B',name:'Cao',fit:95,admissionScores:[{method:'composite',year:2026,scale:100,value:99}]},
    {id:'A-high',universityId:'A',name:'Cao',fit:80,admissionScores:[{method:'composite',year:2026,scale:100,value:76}]},
  ];
  assert.deepEqual(sortCatalogMajors(sample,'cutoff-desc','composite').map(m=>m.id),['A-high','A-low','B-high']);
  assert.deepEqual(sortCatalogMajors(sample,'holland-cutoff-desc','composite').map(m=>m.id),['A-high','A-low','B-high']);
  assert.equal(compositeSortingScore(sample[1]).value,99);
  assert.equal(thptSortingScore(sample[1]),null);
});
