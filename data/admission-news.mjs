import news from './admission-news.json' with {type:'json'};
export const newsYear=news.admissionYear;
export const newsReviewedAt=news.updatedAt.slice(0,10);
export const ministryNewsUrl='https://moet.gov.vn/chuyen-de-giao-duc-va-dao-tao/giao-duc-dai-hoc';
export const newsCategories={guidance:'Quy chế & hướng dẫn',exam:'Kỳ thi',scholarship:'Học bổng',overview:'Tổng hợp tuyển sinh'};
export const admissionNews=[...news.articles].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
