import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../data/questions.mjs';
import { majors,universities } from '../data/catalog.mjs';
import { hcmExpansionUniversities, hcmExpansionMajors } from '../data/hcm-expansion.mjs';
import { hcmColleges, hcmCollegeMajors } from '../data/hcm-colleges.mjs';
import { ctuCombinations } from '../data/ctu-combinations.mjs';
import { recheckedAdmissionSources } from '../data/admissions-recheck-2026.mjs';
import { calculateResult,combinationScores,interestFit,groups,fields,combinations,majorChoices,majorChoiceKey,matchesSchoolFilter,matchesSelectedMajor,sortMatchingSchools,sortCatalogMajors,thptSortingScore,compositeSortingScore,admissionGroup,comparableAnnualTuition,matchesHolland } from '../shared/domain.mjs';
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
  assert.equal(universities.length,99);assert.equal(majors.length,1262);assert.equal(new Set(majors.map(m=>m.id)).size,majors.length);
  assert.equal(new Set(universities.map(u=>u.id)).size,universities.length);
  assert.equal(hcmExpansionUniversities.length,20);
  assert.ok(hcmExpansionUniversities.every(u=>matchesSchoolFilter(u,'area:hcm')));
  assert.ok(new Set(hcmExpansionMajors.map(m=>m.field)).size>=12);
  assert.ok(hcmExpansionMajors.every(m=>m.tuition===null&&m.cutoff===null&&m.admissionScores.every(s=>s.scoreType==='cutoff'&&s.source)));
  assert.ok(hcmExpansionMajors.filter(m=>['RMIT-SGS','FPT-HCM','VYA-HCM','ANND'].includes(m.universityId)).every(m=>!m.verified&&m.admissionsNote));
  assert.equal(hcmColleges.length,24);
  assert.ok(hcmColleges.every(u=>matchesSchoolFilter(u,'area:hcm')&&matchesSchoolFilter(u,'level:college')&&!matchesSchoolFilter(u,'level:university')));
  assert.ok(hcmExpansionUniversities.every(u=>matchesSchoolFilter(u,'level:university')&&!matchesSchoolFilter(u,'level:college')));
  assert.ok(new Set(hcmCollegeMajors.map(m=>m.field)).size>=10);
  assert.ok(hcmCollegeMajors.every(m=>m.educationLevel==='college'&&m.program.startsWith('Cao đẳng')&&(m.tuition===null||m.universityId==='DLSG'&&m.tuition.source.startsWith('https://dulichsaigon.edu.vn/'))&&m.cutoff===null&&m.admissionScores.every(s=>s.scoreType==='cutoff'&&s.source)));
  assert.equal(majors.find(m=>m.id==='NCEHCM-001').name,'Giáo dục mầm non');
  assert.ok(!hcmCollegeMajors.some(m=>m.universityId==='CTC3'&&['Thiết kế đồ họa','Thiết kế nội thất'].includes(m.name)));
  assert.equal(universities.filter(u=>u.system==='ĐHQG-HCM').length,8);
  assert.equal(universities.filter(u=>u.system==='Trường tại TP.HCM'&&u.province==='TP. Hồ Chí Minh').length,26);
  assert.equal(universities.filter(u=>u.institutionType==='public').length,69);
  assert.equal(universities.filter(u=>u.institutionType==='private').length,30);
  assert.equal(universities.filter(u=>u.system==='Trường miền Nam khác').length,10);
  assert.equal(universities.filter(u=>u.system==='Trường miền Nam mở rộng').length,10);
  assert.equal(majors.filter(m=>m.universityId==='VNUF2').length,15);
  assert.equal(majors.find(m=>m.id==='HSU-017').field,'law');
  assert.ok(majors.filter(m=>m.universityId==='VLU'&&m.admissionScores.length).every(m=>!m.admissionScores.some(s=>s.method==='dgnl')));
  assert.equal(matchesSchoolFilter(universities.find(u=>u.id==='HSU'),'area:hcm'),true);
  assert.equal(matchesSchoolFilter(universities.find(u=>u.id==='VNUF2'),'area:hcm'),false);
  assert.equal(matchesSchoolFilter(universities.find(u=>u.id==='BDU'),'area:hcm'),true);
  assert.equal(majors.filter(m=>m.universityId==='TGU').length,19);
  assert.equal(majors.find(m=>m.id==='TGU-005').name,'Luật');
  assert.equal(majors.find(m=>m.id==='DTHU-7480208').admissionScores[0].value,16.45);
  assert.equal(majors.find(m=>m.id==='DTHU-7420101').admissionScores[1].scale,1200);
  assert.equal(majors.find(m=>m.id==='DTHU-7140209').admissionScores.length,0);
  assert.deepEqual(universities.filter(u=>u.institutionType==='private'&&u.educationLevel!=='college'&&!hcmExpansionUniversities.some(n=>n.id===u.id)).map(u=>u.id),['HUTECH','HSU','NTTU','LHU','HIU','UEF','BDU','VLU','GDU','MKU']);
  for(const u of universities)assert.ok(majors.some(m=>m.universityId===u.id),`${u.id} cần có ngành thực tế`);
  for(const m of majors.filter(m=>m.universityId==='UEH'))assert.equal(m.tuition,null);
  for(const m of majors){assert.ok(universities.some(u=>u.id===m.universityId));assert.ok(fields[m.field]);assert.ok(/^https:\/\//.test(m.source.url)||m.universityId==='HVC'&&m.source.url==='http://tuyensinh.hcmca.edu.vn/');assert.match(m.holland,/^[RIASEC]{3}$/);for(const c of m.combinations)assert.match(c,/^[A-Z][A-Z0-9]{2}$/);}
  assert.equal(majors.filter(m=>m.universityId==='HCMUS').length,39);
  assert.equal(majors.filter(m=>m.universityId==='AGU'&&m.source.kind==='secondary'&&!m.verified).length,43);
  assert.ok(majors.filter(m=>m.universityId==='HCMUT').every(m=>m.cutoff.scale===100&&m.cutoff.method==='Xét tuyển tổng hợp'));
  assert.ok(majors.filter(m=>m.universityId==='UIT').every(m=>m.tuition?.value===42_000_000&&m.tuition.approximate&&m.cutoff===null));
  assert.equal(majors.filter(m=>m.admissionScores.length).length,729);
  assert.equal(majors.filter(m=>m.universityId==='CTU').length,127);
  assert.ok(majors.filter(m=>m.universityId==='CTU').every(m=>m.admissionScores.length===1&&m.tuition?.source&&m.tuition.value>0));
  assert.equal(majors.find(m=>m.id==='CTU-7480201').admissionScores[0].value,23.73);
  assert.equal(majors.find(m=>m.id==='CTU-7480201').tuition.value,33_400_000);
  assert.equal(majors.find(m=>m.id==='CTU-7140209').tuition.value,27_380_000);
  assert.equal(majors.find(m=>m.id==='CTU-7340101C').tuition.value,44_000_000);
  assert.equal(majors.find(m=>m.id==='CTU-7340101C').admissionScores[0].value,20.01);
  assert.equal(majors.find(m=>m.id==='HUTECH-001').tuition.period,'đợt');
  assert.equal(majors.find(m=>m.id==='HUTECH-001').tuition.value,16_500_000);
  assert.equal(majors.filter(m=>m.tuition).length,353);
  assert.equal(majors.find(m=>m.id==='SGU-7380101').tuition.period,'toàn khóa');
  assert.equal(majors.find(m=>m.id==='SGU-7380101').tuition.value,132_732_600);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='SGU-7380101')),null);
  assert.equal(majors.find(m=>m.id==='OU-001').tuition.value,30_000_000);
  assert.equal(majors.find(m=>m.id==='OU-005').tuition.value,32_000_000);
  assert.equal(majors.find(m=>m.id==='OU-009').tuition.value,26_500_000);
  assert.equal(majors.find(m=>m.id==='OU-008').tuition,null);
  assert.equal(majors.find(m=>m.id==='UMP-001').tuition.value,88_000_000);
  assert.equal(majors.find(m=>m.id==='UMP-004').tuition.value,63_500_000);
  assert.equal(majors.find(m=>m.id==='UMP-005').tuition.value,90_000_000);
  assert.equal(majors.find(m=>m.id==='UMP-008').tuition.value,48_000_000);
  assert.equal(majors.find(m=>m.id==='UAH-001').tuition.value,1_140_000);
  assert.equal(majors.find(m=>m.id==='UAH-001').tuition.period,'tín chỉ');
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UAH-001')),35_568_000);
  assert.equal(majors.find(m=>m.id==='HCMUT-106').tuition.value,15_750_000);
  assert.equal(majors.find(m=>m.id==='HCMUT-106').tuition.approximate,true);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='HCMUT-106')),null);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UIT-001')),null);
  assert.equal(majors.find(m=>m.id==='UFM-001').tuition.value,30_000_000);
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='UFM-001')),30_000_000);
  assert.equal(majors.find(m=>m.id==='USSH-7320101').tuition.year,'2025–2026');
  assert.equal(comparableAnnualTuition(majors.find(m=>m.id==='USSH-7320101')),null);
  assert.equal(majors.filter(m=>m.universityId==='HCMUS'&&m.admissionScores.length===2).length,39);
  assert.equal(majors.filter(m=>m.universityId==='NLU'&&m.admissionScores.length===2).length,10);
  assert.equal(majors.find(m=>m.id==='NLU-007').name,'Lâm học');
  assert.equal(majors.find(m=>m.id==='NLU-007').code,'7620201');
  assert.deepEqual(majors.find(m=>m.id==='NLU-007').admissionScores.map(s=>s.value),[19.7,635]);
  assert.equal(majors.filter(m=>admissionGroup(m)==='thpt').length,519);
  assert.equal(majors.filter(m=>admissionGroup(m)==='composite').length,185);
  assert.equal(majors.filter(m=>admissionGroup(m)==='unverified').length,558);
  assert.equal(majors.find(m=>m.id==='PTIT-HCM-7480201').admissionScores[0].value,17);
  assert.equal(majors.find(m=>m.id==='PTIT-HCM-7480201').admissionScores[1].value,611.33);
  assert.equal(majors.find(m=>m.id==='SGU-7380101').admissionScores[0].method,'thpt-equivalent');
  assert.equal(admissionGroup(majors.find(m=>m.id==='HCMUS-7420201')),'composite');
  assert.equal(admissionGroup(majors.find(m=>m.id==='UAH-001')),'thpt');
  assert.ok(majors.flatMap(m=>m.admissionScores).every(s=>s.year===2026&&Number.isFinite(s.value)&&s.value>=0&&(s.scale===null||s.value<=s.scale)&&/^https:\/\//.test(s.source)));
  assert.ok(majors.filter(m=>m.universityId==='HCMUT').every(m=>thptSortingScore(m)===null));
});
test('2026 supplements keep method, combination, weighting and programme boundaries',()=>{
  const get=id=>majors.find(m=>m.id===id);
  const chemistry=get('HCMUNRE-7510401');
  assert.equal(chemistry.admissionScores.find(s=>s.method==='thpt').value,18);
  assert.equal(chemistry.admissionScores.find(s=>s.method==='transcript'&&s.combinations.includes('B03')).value,22);
  assert.equal(chemistry.admissionScores.find(s=>s.method==='transcript'&&s.combinations.includes('X04')).value,23.5);
  assert.equal(chemistry.admissionScores.find(s=>s.method==='dgnl').value,664);
  assert.ok(chemistry.admissionScores.every(s=>s.scoreType==='cutoff'));
  assert.equal(get('HCMUNRE-7440221').code,'7440211');
  const logistics=get('HCMUNRE-7510605');
  assert.ok(logistics.combinations.includes('X03'));
  assert.ok(logistics.admissionScores.some(s=>s.method==='transcript'&&s.combinations.includes('X04')));
  assert.ok(!logistics.admissionScores.some(s=>s.method==='transcript'&&s.combinations.includes('X03')));
  assert.equal(get('BDU-003').admissionScores.some(s=>s.method==='dgnl'),false);
  assert.equal(get('STU-004').admissionScores.length,0); // Graphical vs Industrial Design is not interchangeable.
  assert.equal(get('HSU-018').admissionScores.length,0); // International commercial law != International law.
  assert.equal(get('UEF-016').admissionScores.find(s=>s.method==='thpt').value,20);
  assert.equal(get('UEF-001').admissionScores.find(s=>s.method==='thpt').value,15);
  assert.ok(get('UEF-023').combinations.includes('X79'));
  assert.ok(!get('UEF-023').combinations.includes('X01'));
  assert.equal(get('VLU-015').admissionScores.find(s=>s.method==='thpt').value,15); // Not Global Elite 20.
  assert.ok(get('VLU-015').admissionScores.some(s=>s.method==='combined-vact'));
  assert.ok(!get('VLU-015').admissionScores.some(s=>s.method==='dgnl'));
  assert.equal(get('CTTC-001').admissionScores.find(s=>s.method==='thpt-weighted').value,32);
  assert.equal(thptSortingScore(get('CTTC-001')).value,24);
  assert.equal(thptSortingScore(get('NCEHCM-001')),null); // One academic subject + two aptitude tests.
  assert.equal(get('NCEHCM-001').admissionScores[0].value,22.51);
  assert.equal(get('PVU-001').admissionScores.find(s=>s.method==='thpt').value,22.5); // Not linked programme 19.
  assert.deepEqual(get('UMP-001').admissionScores[0].combinations,['B00']);
  assert.equal(Object.keys(ctuCombinations).length,127);
  assert.ok(get('CTU-7480201').combinations.includes('X26'));
  assert.ok(!get('CTU-7480201').admissionMethods.find(m=>m.method==='vsat').combinations.includes('X26'));
  assert.ok(get('CTU-7140201').combinations.includes('M01'));
  assert.equal(get('CTU-7480201').admissionScores[0].method,'thpt-equivalent');
  assert.equal(get('TDTU-001').admissionScores.find(s=>s.method==='composite').value,69.7);
  assert.equal(thptSortingScore(get('TDTU-001')),null);
  assert.ok(get('TDTU-001').admissionScores[0].combinationExpression.includes('Tổ hợp gốc'));
  assert.equal(thptSortingScore({admissionScores:[{method:'thpt',year:2026,scale:30,value:15,scoreType:'floor'}]}),null);
});
test('source recheck separates published points, applicant groups and unavailable programme matches',()=>{
  const get=id=>majors.find(m=>m.id===id);
  const ussh=get('USSH-7140101');
  assert.deepEqual(ussh.admissionScores.map(s=>[s.applicantGroup,s.value]),[['DT01',75.5],['DT02',76.2],['DT03',75.5]]);
  assert.equal(compositeSortingScore(ussh),null);
  assert.equal(compositeSortingScore({...ussh,admissionScores:ussh.admissionScores.filter(s=>s.applicantGroup==='DT02')}).value,76.2);
  assert.equal(thptSortingScore(ussh),null);
  assert.ok(majors.filter(m=>m.universityId==='USSH').every(m=>m.admissionScores.length===3&&m.admissionScores.every(s=>s.method==='composite'&&s.scale===100)));
  assert.equal(get('USSH-73106A1').admissionScores[0].value,76.9);
  assert.equal(get('UHS-001').admissionScores[0].value,82.6);
  assert.equal(get('UHS-002').admissionScores[0].value,72.41);
  assert.ok(get('UHS-001').admissionScores[0].source.endsWith('/preview'));
  assert.equal(get('HCMUE-001').admissionScores.find(s=>s.method==='thpt').value,29.49);
  assert.deepEqual(get('HCMUE-001').admissionScores[0].combinations,['A00']);
  assert.ok(get('HCMUE-001').admissionScores[1].combinationExpression.includes('A00TO'));
  assert.equal(get('IUH-001').admissionScores[0].value,25);
  assert.equal(thptSortingScore(get('IUH-001')),null);
  assert.ok(get('IUH-001').admissionScores.every(s=>s.method==='combined'));
  assert.equal(get('NTTU-001').admissionScores.find(s=>s.method==='dgnl').value,650);
  assert.equal(get('NTTU-002').admissionScores.find(s=>s.method==='dgnl').value,600);
  assert.equal(get('NTTU-012').admissionScores.some(s=>s.method==='dgnl'),false);
  assert.equal(get('NTTU-016').admissionScores.length,0);
  assert.ok(get('NTTU-016').admissionMissingReason.includes('Tài chính'));
  assert.equal(get('UMT-003').admissionScores.length,0);
  const umt=get('UMT-001');
  assert.equal(umt.admissionScores.find(s=>s.method==='dgnl-equivalent').value,15);
  assert.equal(umt.admissionScores.find(s=>s.method==='dgnl-equivalent').scale,30);
  assert.ok(!umt.admissionScores.some(s=>s.method==='dgnl'||s.method==='sat'));
  assert.equal(umt.admissionScores.find(s=>s.method==='vsat').scale,450);
  assert.ok(get('HUFLIT-004').combinations.includes('DD2'));
  assert.equal(get('HUFLIT-009').admissionScores.find(s=>s.method==='thpt').value,20);
  assert.equal(get('HUFLIT-013').admissionScores.find(s=>s.method==='transcript').value,19.5);
  assert.equal(get('EIU-001').admissionScores.find(s=>s.method==='dgnl').value,667);
  assert.ok(!get('EIU-001').combinations.includes('X06'));
  assert.ok(get('EIU-005').combinations.includes('X06'));
  assert.equal(get('GDU-005').admissionScores.find(s=>s.method==='transcript').value,20);
  assert.equal(get('BVU-001').admissionScores.find(s=>s.method==='transcript').value,20);
  assert.equal(Object.keys(recheckedAdmissionSources).length,10);
  for(const school of universities.filter(u=>u.admissionsReview)){
    assert.equal(school.admissionsReview.status,'published');
    assert.ok(school.admissionsReview.announcement&&school.admissionsReview.socialReview);
    if(school.admissionsReview.facebook)assert.ok(school.admissionsReview.channelVerification);
  }
});
test('annual tuition sort keeps per-credit, installment and older cohort figures after comparable annual amounts',()=>{
  const ids=['UAH-001','CTU-7480201','HUTECH-001','UFM-001','UIT-001','USSH-7320101'];
  const selected=ids.map(id=>majors.find(m=>m.id===id));
  assert.deepEqual(sortCatalogMajors(selected,'tuition').slice(0,2).map(m=>m.id),['UFM-001','CTU-7480201']);
});
test('major-first discovery groups same named subjects across schools and treats STEM as editorial grouping',()=>{
  const it=majorChoices(majors).find(choice=>choice.key==='it|Công nghệ thông tin');
  assert.ok(it.universities.includes('UIT'));
  assert.ok(it.universities.includes('CTU'));
  assert.equal(majorChoiceKey(majors.find(m=>m.id==='UIT-001')),it.key);
  assert.equal(fields.it.stem,true);
  assert.equal(fields.engineering.stem,true);
  assert.equal(fields.business.stem,undefined);
  assert.equal(fields.health.stem,undefined);
});
test('school suggestions respect selected subject and rank specialist IT schools without inventing HCMUS cutoffs',()=>{
  const chosen=['it|Khoa học máy tính','business|Marketing'];
  const relevant=universities.map(u=>({...u,programs:majors.filter(m=>m.universityId===u.id&&matchesSelectedMajor(m,chosen))})).filter(u=>u.programs.length);
  assert.deepEqual(sortMatchingSchools(relevant,chosen).slice(0,3).map(u=>u.id),['UIT','HCMUT','HCMUS']);
  assert.ok(matchesSelectedMajor(majors.find(m=>m.id==='HCMUS-7480201_NN'),chosen));
  assert.ok(!matchesSelectedMajor(majors.find(m=>m.id==='HCMUS-7420101'),chosen));
  assert.equal(majors.find(m=>m.id==='HCMUS-7480201_NN').admissionScores[0].method,'thpt-equivalent');
  assert.ok(majors.filter(m=>m.field==='law').length>14);
  assert.ok(majors.filter(m=>m.field==='business').length>110);
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
