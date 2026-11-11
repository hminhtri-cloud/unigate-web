import {test} from 'node:test';
import assert from 'node:assert/strict';
import {majors,universities} from '../data/catalog.mjs';
import {majorChoices} from '../shared/domain.mjs';
import {majorGuide,evidenceForProgram} from '../shared/major-guides.mjs';
import {guideEvidence} from '../data/major-guide-evidence.mjs';

test('every major choice has topic-specific guidance and preserves its exact programs',()=>{
  const choices=majorChoices(majors);
  assert.equal(choices.length,395);
  const programIds=[];
  for(const choice of choices){
    const guide=majorGuide(choice,majors,universities);
    assert.ok(guide.topicCovered,choice.name);
    assert.ok(guide.learn.length>=3&&guide.careers.length>=2&&guide.skills.length>=2,choice.name);
    assert.ok(guide.interests&&guide.tryIt);
    assert.ok(guide.programs.every(p=>p.catalogSource?.url&&['official','secondary'].includes(p.catalogSource.kind)),choice.name);
    programIds.push(...guide.programs.map(p=>p.id));
  }
  assert.equal(new Set(programIds).size,majors.length);
  assert.equal(programIds.length,majors.length);
});

test('duration evidence is confined to exact school, code, name and education level',()=>{
  const uit=majors.find(m=>m.universityId==='UIT'&&m.name==='Công nghệ thông tin');
  const ctu=majors.find(m=>m.id==='CTU-7480201');
  assert.equal(evidenceForProgram(uit).years,4);
  assert.equal(evidenceForProgram(ctu).years,4.5);
  for(const id of ['CTU-7480201C','CTU-7480201H'])assert.equal(evidenceForProgram(majors.find(m=>m.id===id)),null);
  assert.equal(evidenceForProgram({...uit,code:'7480201TA'}),null);
  assert.equal(evidenceForProgram({...uit,educationLevel:'college'}),null);
  assert.equal(evidenceForProgram({...uit,universityId:'AGU'}),null);
  const hotel=majors.find(m=>m.universityId==='DLSG'&&m.name==='Quản trị khách sạn');
  assert.equal(evidenceForProgram(hotel).years,2.5);
  assert.equal(evidenceForProgram({...hotel,educationLevel:'university'}),null);
  assert.equal(evidenceForProgram({...hotel,name:'Quản trị nhà hàng – khách sạn'}),null);
});

test('reviewed sources all map to real programs and teaching guidance stays about teaching',()=>{
  assert.equal(guideEvidence.length,19);
  for(const evidence of guideEvidence){
    assert.ok(majors.some(m=>evidenceForProgram(m)===evidence),evidence.name);
    assert.ok(evidence.durationQuote&&evidence.checkedAt&&new URL(evidence.url).protocol==='https:');
  }
  const chemistry=majorChoices(majors).find(c=>c.name==='Sư phạm Hóa học');
  assert.match(majorGuide(chemistry,majors,universities).learn.join(' '),/dạy học/);
  const ai=majorChoices(majors).find(c=>c.name==='Trí tuệ nhân tạo');
  assert.equal(majorGuide(ai,majors,universities).reviewedPrograms,0);
  const aguOnly=majorChoices(majors).find(c=>c.name==='Phát triển nông thôn');
  assert.ok(majorGuide(aguOnly,majors,universities).programs.every(p=>p.catalogSource.kind==='secondary'&&!p.evidence));
});
