import {test} from 'node:test';
import assert from 'node:assert/strict';
import {majors,universities} from '../data/catalog.mjs';
import {comparableAnnualTuition,majorChoices,partitionByAnnualTuition} from '../shared/domain.mjs';
import {annualEstimateLabel,durationRanges,estimatedAnnualTuition} from '../shared/programme-facts.mjs';
import {majorGuide} from '../shared/major-guides.mjs';
import {ctuDurations} from '../data/ctu-duration-verified.mjs';
import {featuredForField,schoolProfiles} from '../data/school-profiles.mjs';

test('tuition estimates multiply units per year by the rate and require programme/cohort evidence',()=>{
  const sample={id:'example',admissionYear:2026,tuition:{value:700_000,period:'tín chỉ',source:'https://example.edu.vn/fees',annualBasis:{kind:'credits',units:100,years:4,programId:'example',cohort:2026,source:'https://example.edu.vn/programme'}}};
  assert.equal(estimatedAnnualTuition(sample).unitsPerYear,25);
  assert.equal(estimatedAnnualTuition(sample).max,17_500_000);
  assert.equal(annualEstimateLabel(estimatedAnnualTuition(sample)),'khoảng 17,5 triệu/năm');
  for(const change of [{years:0},{units:0},{programId:'other'},{cohort:2025},{source:null}])assert.equal(estimatedAnnualTuition({...sample,tuition:{...sample.tuition,annualBasis:{...sample.tuition.annualBasis,...change}}}),null);
  const architecture=majors.find(m=>m.id==='UAH-001');
  assert.equal(architecture.tuition.value,1_140_000);
  assert.equal(estimatedAnnualTuition(architecture).max,35_568_000);
  assert.equal(comparableAnnualTuition(architecture),35_568_000);
  assert.equal(partitionByAnnualTuition([architecture],'35').overBudget.length,1);
  assert.equal(partitionByAnnualTuition([architecture],'45').matching.length,1);
  const hotel=majors.find(m=>m.id==='DLSG-001');
  assert.deepEqual([estimatedAnnualTuition(hotel).min,estimatedAnnualTuition(hotel).max],[24_000_000,26_000_000]);
  assert.equal(estimatedAnnualTuition(majors.find(m=>m.id==='UIT-001')),null); // fee schedule is for an older cohort.
});

test('duration evidence is exact to programme and degree level; ranges come only from reviewed programmes',()=>{
  assert.equal(ctuDurations.size,124);
  assert.equal(majors.filter(m=>m.duration).length,156);
  assert.equal(majors.find(m=>m.id==='CTU-7510605S').duration,undefined);
  assert.equal(majors.find(m=>m.id==='CTU-7480201C').duration.years,4.5);
  assert.equal(majors.find(m=>m.id==='TDC-001').duration.years,2.5);
  const choice=majorChoices(majors).find(c=>c.key==='it|Công nghệ thông tin');
  const ranges=majorGuide(choice,majors,universities).durationRanges;
  assert.deepEqual(ranges.map(r=>[r.level,r.min,r.max]),[['university',4,4.5],['college',2.5,2.5]]);
  assert.deepEqual(durationRanges([{educationLevel:'college',duration:{years:2}}]).map(r=>r.level),['college']);
  for(const m of majors.filter(m=>m.duration)){assert.equal(m.duration.programId,m.id);assert.equal(m.duration.universityId,m.universityId);assert.ok(m.duration.source&&m.duration.checkedAt&&m.duration.years>0);}
});

test('new score sources preserve programme, campus, method, scales and combination-specific thresholds',()=>{
  const get=id=>majors.find(m=>m.id===id);
  assert.equal(get('HCMUTE-001').code,'7480201V');
  assert.equal(get('HCMUTE-001').admissionScores[0].value,24.01);
  assert.equal(get('HCMUTE-001').admissionScores[0].method,'combined');
  assert.equal(get('HCMUTE-001').admissionScores[0].scale,null);
  assert.equal(get('HUB-001').admissionScores[0].value,23.48);
  assert.equal(get('HUB-004').admissionScores.length,0); // a concentration is not a separate programme code.
  assert.equal(get('UTC2-004').code,'GSA07');
  assert.equal(get('UTC2-004').admissionScores.find(s=>s.method==='dgnl').value,696.38);
  assert.equal(get('UTC2-004').admissionScores.find(s=>s.method==='dgnl').scale,1200);
  assert.equal(get('ULAW-001').admissionScores.find(s=>s.combinations.includes('C00')).value,20.5);
  assert.equal(get('ULAW-001').admissionScores.find(s=>s.combinationExpression).value,20);
  assert.equal(get('ULAW-001').tuition.value,1_200_000); // not the Quang Tri campus fee.
  assert.equal(get('TDTU-001').tuition.value,36_590_000); // not the Khanh Hoa campus fee.
  assert.equal(get('TDTU-013').tuition.value,31_260_000);
  assert.equal(Object.keys(schoolProfiles).length,14);
  assert.deepEqual(featuredForField('it',universities,majors).map(s=>s.university.id),['UIT','HCMUT','HCMUS']);
  for(const profile of Object.values(schoolProfiles))assert.ok(profile.source&&profile.checkedAt&&profile.links.length);
});
