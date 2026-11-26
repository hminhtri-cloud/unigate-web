import {universities} from './catalog.mjs';
import {schoolProfiles} from './school-profiles.mjs';

// Only explicit official catalogue/profile URLs seed the collector. No search
// engine result or user-supplied URL can grant a new host permission.
const ministry='https://moet.gov.vn';
const overrides={
  UIT:['https://tuyensinh.uit.edu.vn/'],
  ULAW:['https://tuyensinh.hcmulaw.edu.vn/thong-tin-tuyen-sinh-dai-hoc'],
  UTC2:['https://tuyensinh.utc2.edu.vn/'],
  CTU:['https://tuyensinh.ctu.edu.vn/'],
};
const seeds={
  HUB:['https://tuyensinh.hub.edu.vn/tin-tuyen-sinh/thong-bao-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026'],
  UTC2:['https://tuyensinh.utc2.edu.vn/vi/thong-bao-ve-viec-cong-bo-diem-chuan-dai-hoc-chinh-quy-nam-2026-2460'],
  ULAW:['https://tuyensinh.hcmulaw.edu.vn/thong-tin-tuyen-sinh-dai-hoc/cong-bo-diem-xet-trung-tuyen-trinh-do-dai-hoc-hinh-thuc-dao-tao-chinh-quy-nam-2026-776.html'],
};
const normalizeHost=url=>new URL(url).hostname.toLowerCase().replace(/^www\./,'');
const adapters={
  UIT:{bodySelectors:['.field-name-body','.field--name-body','.node-content'],dateSelectors:['.submitted [property~="dc:created"]','.submitted']},
  TDTU:{bodySelectors:['.field--name-body','.node__content'],dateSelectors:['.post-created']},
  HUB:{bodySelectors:['.news-detail__content','.admissions-detail-content'],dateSelectors:['.news-detail__header .post-meta__text']},
  UTC2:{bodySelectors:['.noidungtrong'],dateSelectors:['#ndlxbviet']},
  CTU:{bodySelectors:['.item-page [itemprop="articleBody"]','.item-page'],dateSelectors:['.published time','.published']},
};
export const newsSources=[
  {id:'MOET',name:'Bộ GD&ĐT',kind:'ministry',hosts:['moet.gov.vn'],entries:[`${ministry}/chuyen-de-giao-duc-va-dao-tao/giao-duc-dai-hoc`,`${ministry}/tin-tuc/tin-tong-hop2`],render:true},
  ...universities.map(university=>{
    const profile=schoolProfiles[university.id];
    const official=[university.website,university.source?.kind==='official'&&university.source.url,profile?.source,...(overrides[university.id]||[])].filter(Boolean);
    const preferred=overrides[university.id]||[profile?.source||official[1]||official[0]];
    const entries=[...new Set([...preferred.map(url=>new URL('/',url).href),...preferred,...[new URL('/',university.website).href]])].slice(0,3);
    return {id:university.id,name:university.name,kind:'school',hosts:[...new Set(official.map(normalizeHost))],entries,seeds:seeds[university.id]||[],render:university.id==='HCMUTE',...adapters[university.id],scope:'Tin từ website trường; xem bài gốc để xác nhận chương trình và cơ sở áp dụng.'};
  }),
];
