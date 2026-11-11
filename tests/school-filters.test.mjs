import {test} from 'node:test';
import assert from 'node:assert/strict';
import {universities} from '../data/catalog.mjs';
import {emptySchoolFilters,matchesSchoolFilter,partitionByAnnualTuition,schoolFiltersFromParams} from '../shared/domain.mjs';

test('school criteria intersect: HCM + university + public, including current locations of campuses',()=>{
  const filters={area:'hcm',level:'university',type:'public',system:''};
  const actual=universities.filter(u=>matchesSchoolFilter(u,filters));
  assert.ok(actual.length>0);
  assert.deepEqual(actual,universities.filter(u=>u.province==='TP. Hồ Chí Minh'&&(u.educationLevel||'university')==='university'&&u.institutionType==='public'));
  assert.ok(actual.some(u=>u.id==='UIT'));
  assert.ok(!actual.some(u=>['HSU','CTTC','CTU'].includes(u.id)));
  const colleges=universities.filter(u=>matchesSchoolFilter(u,{...filters,level:'college'}));
  assert.ok(colleges.some(u=>u.id==='CTTC'));
  assert.ok(!colleges.some(u=>u.id==='UIT'));
  assert.equal(universities.filter(u=>matchesSchoolFilter(u,emptySchoolFilters)).length,universities.length);
});

test('system is an additional constraint; conflicting criteria yield no matches',()=>{
  const filters={area:'hcm',level:'university',type:'public',system:'ĐHQG-HCM'};
  const actual=universities.filter(u=>matchesSchoolFilter(u,filters));
  assert.ok(actual.length>0);
  assert.ok(actual.every(u=>u.system==='ĐHQG-HCM'&&u.province==='TP. Hồ Chí Minh'));
  assert.equal(universities.filter(u=>matchesSchoolFilter(u,{...filters,type:'private'})).length,0);
  assert.ok(!actual.some(u=>u.id==='AGU'));
});

test('checkbox selections use OR within a category and AND between categories',()=>{
  const filters={area:['hcm'],level:['university','college'],type:['public'],system:[]};
  const actual=universities.filter(u=>matchesSchoolFilter(u,filters));
  assert.ok(actual.some(u=>u.id==='UIT'));
  assert.ok(actual.some(u=>u.id==='CTTC'));
  assert.ok(!actual.some(u=>u.id==='HSU'||u.id==='CTU'));
  assert.deepEqual(actual,universities.filter(u=>u.province==='TP. Hồ Chí Minh'&&u.institutionType==='public'));
  assert.equal(universities.filter(u=>matchesSchoolFilter(u,{area:[],level:[],type:[],system:[]})).length,universities.length);
});

test('combined URL filters and legacy single-group links retain their meaning',()=>{
  assert.deepEqual(schoolFiltersFromParams(new URLSearchParams('area=hcm&level=university&type=public&system=ĐHQG-HCM')),{area:'hcm',level:'university',type:'public',system:'ĐHQG-HCM'});
  assert.deepEqual(schoolFiltersFromParams(new URLSearchParams('system=type:private')),{...emptySchoolFilters,type:'private'});
  assert.deepEqual(schoolFiltersFromParams(new URLSearchParams('system=area:hcm')),{...emptySchoolFilters,area:'hcm'});
  assert.deepEqual(schoolFiltersFromParams(new URLSearchParams('system=level:college')),{...emptySchoolFilters,level:'college'});
});

test('requested region and system categories distinguish CTU from other schools and cover the South',()=>{
  const ctu=universities.find(u=>u.id==='CTU'),uit=universities.find(u=>u.id==='UIT'),hsu=universities.find(u=>u.id==='HSU');
  assert.equal(matchesSchoolFilter(ctu,{area:['cantho'],system:['ctu']}),true);
  assert.equal(matchesSchoolFilter(uit,{system:['ctu']}),false);
  assert.equal(matchesSchoolFilter(uit,{system:['vnu-hcm']}),true);
  assert.equal(matchesSchoolFilter(ctu,{system:['other']}),false);
  assert.equal(matchesSchoolFilter(uit,{system:['other']}),false);
  assert.equal(matchesSchoolFilter(hsu,{system:['other']}),true);
  assert.equal(universities.filter(u=>matchesSchoolFilter(u,{area:['south']})).length,universities.length);
  assert.equal(matchesSchoolFilter({...hsu,province:'Hà Nội'},{area:['south']}),false);
});

test('tuition filtering retains unknown annual amounts separately and only excludes known amounts over budget',()=>{
  const annual={value:35_000_000,period:'năm học',year:'Khóa tuyển 2026'};
  const programs=[
    {id:'affordable',tuition:annual},
    {id:'over',tuition:{...annual,value:40_000_000}},
    {id:'missing',tuition:null},
    {id:'semester',tuition:{...annual,period:'học kỳ'}},
    {id:'older-cohort',tuition:{...annual,approximate:true}},
  ];
  const result=partitionByAnnualTuition(programs,'35');
  assert.deepEqual(result.matching.map(m=>m.id),['affordable']);
  assert.deepEqual(result.unknown.map(m=>m.id),['missing','semester','older-cohort']);
  assert.deepEqual(result.overBudget.map(m=>m.id),['over']);
  assert.equal(new Set(Object.values(result).flat().map(m=>m.id)).size,programs.length);
  assert.deepEqual(partitionByAnnualTuition(programs,''),{matching:programs,unknown:[],overBudget:[]});
});
