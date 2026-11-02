import { fields } from '../shared/domain.mjs';
import { addAdmissionScores } from './admissions.mjs';
import {ctuPrograms,ctuProgramUrl} from './ctu.mjs';
import {addVerifiedTuition} from './tuition.mjs';
import {publicHcmUniversities,publicHcmMajors} from './public-hcm.mjs';
import {southernUniversities,southernMajors} from './south.mjs';
import {moreSouthernUniversities,moreSouthernMajors} from './more-south.mjs';
export const checkedAt = '2026-11-01';
const source = (url, title, kind='official') => ({ url,title,kind,checkedAt });
const sources = {
  UIT: source('https://tuyensinh.uit.edu.vn/nganh-dao-tao','UIT — Ngành đào tạo'),
  HCMUS: source('https://tuyensinh.hcmus.edu.vn/2026-thong-tin-tuyen-sinh/','HCMUS — Tuyển sinh 2026, bảng cập nhật 10/7/2026'),
  HCMUT: source('https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/nganh-va-chi-tieu','Bách khoa — Ngành, chỉ tiêu và điểm chuẩn 2026'),
  IU: source('https://tuyensinh.hcmiu.edu.vn/','Quốc tế — 24 chương trình do trường cấp bằng'),
  UEL: source('https://tuyensinh.uel.edu.vn/dao-tao/dai-hoc-chinh-quy/','Kinh tế–Luật — Ngành/chuyên ngành đào tạo'),
  USSH: source('https://hcmussh.edu.vn/chuong-trinh-dao-tao?page=1&bacDaoTao=DH&loaiHinhDaoTaoId=1','Nhân văn — Chương trình chuẩn, đối chiếu trang 1–5'),
  UHS: source('https://www.uhsvnu.edu.vn/vi/tuyen-sinh-dao-tao/dai-hoc/chuong-trinh-dao-tao','Khoa học Sức khỏe — Chương trình đại học'),
  AGU: source('https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-an-giang-QSA.html','Tuyensinh247 — Danh mục An Giang 2026 (nguồn thứ cấp)','secondary'),
  UEH: source('https://tuyensinh.ueh.edu.vn/cu-nhan-chinh-quy/','UEH — Chương trình cử nhân chính quy tại TP.HCM'),
  UMP: source('https://ump.edu.vn/tuyen-sinh-dao-tao/dai-hoc/tuyen-sinh','Đại học Y Dược TP.HCM — Tuyển sinh đại học chính quy'),
  HCMUE: source('https://tuyensinh.hcmue.edu.vn/index.php?option=com_content&view=article&id=27820&lang=vi&site=183','ĐH Sư phạm TP.HCM — Ngành tuyển sinh 2026, mã SPS'),
  HCMUTE: source('https://tuyensinh.hcmute.edu.vn/','ĐH Công nghệ Kỹ thuật TP.HCM — Cổng tuyển sinh'),
  ULAW: source('https://hcmulaw.edu.vn/vi/chuong-trinh-dao-tao-534/cac-chuong-trinh-dao-tao-he-cu-nhan','ĐH Luật TP.HCM — Chương trình cử nhân'),
  NLU: source('https://ts.hcmuaf.edu.vn/vn/tin-tuc/nganh-dao-tao-60362','ĐH Nông Lâm TP.HCM — Ngành đào tạo đại học chính quy'),
  UFM: source('https://tuyensinh.ufm.edu.vn/','ĐH Tài chính – Marketing — Cổng tuyển sinh và ngành đào tạo'),
  UAH: source('https://www.uah.edu.vn/tuyen-sinh-dai-hoc-chinh-quy-nam-2026','ĐH Kiến trúc TP.HCM — Tuyển sinh đại học chính quy 2026'),
  OU: source('https://tuyensinh.ou.edu.vn/thong-tin-nganh-khoa-1581036727','ĐH Mở TP.HCM — Thông tin khoa và ngành đào tạo'),
  HUTECH: source('https://www.hutech.edu.vn/tuyensinh/tin-tuyen-sinh/14630721-hutech-cong-bo-phuong-an-tuyen-sinh-dai-hoc-chinh-quy-du-kien-nam-2026','HUTECH — Thông tin tuyển sinh đại học 2026'),
};
export const universities = [
  ['UIT','Trường Đại học Công nghệ Thông tin','QSC','TP. Hồ Chí Minh','https://www.uit.edu.vn/','Công nghệ thông tin và các lĩnh vực công nghệ số.','12 ngành trên trang ngành đào tạo; chưa bao gồm chương trình liên kết quốc tế.'],
  ['HCMUS','Trường Đại học Khoa học tự nhiên','QST','TP. Hồ Chí Minh','https://hcmus.edu.vn/','Khoa học cơ bản, nghiên cứu và công nghệ ứng dụng.','39 mã xét tuyển theo bảng công bố 10/7/2026; học phí có năm học riêng.'],
  ['HCMUT','Trường Đại học Bách khoa','QSB','TP. Hồ Chí Minh','https://hcmut.edu.vn/','Kỹ thuật, công nghệ và quản lý công nghiệp.','29 mã chương trình tiêu chuẩn; các chương trình tiếng Anh, chuyển tiếp và liên kết chưa nhập. Điểm chuẩn là xét tuyển tổng hợp, không phải tổng 3 môn.'],
  ['IU','Trường Đại học Quốc tế','QSQ','TP. Hồ Chí Minh','https://hcmiu.edu.vn/','Chương trình đào tạo bằng tiếng Anh, đa lĩnh vực.','24 chương trình do trường cấp bằng; chưa bao gồm chương trình liên kết.'],
  ['UEL','Trường Đại học Kinh tế – Luật','QSK','TP. Hồ Chí Minh','https://uel.edu.vn/','Kinh tế, kinh doanh, quản lý và luật.','15 ngành theo trang giới thiệu; chưa tách các chuyên ngành hoặc mã chương trình tiếng Anh.'],
  ['USSH','Trường Đại học Khoa học Xã hội và Nhân văn','QSX','TP. Hồ Chí Minh','https://hcmussh.edu.vn/','Khoa học xã hội, nhân văn, ngôn ngữ và truyền thông.','42 chương trình chuẩn phù hợp học sinh trong nước; loại chương trình Việt Nam học riêng cho sinh viên nước ngoài. Đây là danh mục đào tạo, không khẳng định tất cả đều tuyển mới trong năm 2026.'],
  ['UHS','Trường Đại học Khoa học Sức khỏe','QSY','TP. Hồ Chí Minh','https://uhsvnu.edu.vn/','Đào tạo và nghiên cứu trong lĩnh vực khoa học sức khỏe.','5 ngành trên trang chương trình đại học; chưa đối chiếu trọn đề án tuyển sinh 2026.'],
  ['AGU','Trường Đại học An Giang','QSA','An Giang','https://agu.edu.vn/','Đào tạo đa ngành, từ giáo dục đến nông nghiệp và công nghệ.','43 ngành tham khảo nguồn Tuyensinh247. Cổng trường yêu cầu xác minh người truy cập, chưa đối chiếu được đề án gốc; không nhập điểm chuẩn, học phí hay tổ hợp từ nguồn thứ cấp.'],
].map(([id,name,code,province,website,description,coverage]) => ({ id,name,code,province,website,description,coverage,source:sources[id],system:'ĐHQG-HCM',institutionType:'public',region:'Miền Nam' }));
// Danh sách mở rộng do UniGate tuyển chọn theo ngành đào tạo đa dạng; không phải bảng xếp hạng.
const additionalUniversities = [
  ['UEH','Đại học Kinh tế Thành phố Hồ Chí Minh','KSA','https://ueh.edu.vn/','Kinh tế, kinh doanh, quản lý và công nghệ.','Chỉ ghi một số chương trình cử nhân tại cơ sở TP.HCM; không gồm UEH Mekong (Vĩnh Long).'],
  ['UMP','Đại học Y Dược Thành phố Hồ Chí Minh','YDS','https://ump.edu.vn/','Y khoa, dược và các lĩnh vực chăm sóc sức khỏe.','Danh mục ngành chọn lọc từ cổng đại học; chưa trích xuất điểm chuẩn từ các ảnh thông báo 2026.'],
  ['HCMUE','Trường Đại học Sư phạm Thành phố Hồ Chí Minh','SPS','https://hcmue.edu.vn/','Đào tạo giáo viên, khoa học giáo dục và ngôn ngữ.','Ngành chọn lọc từ thông tin tuyển sinh chính quy 2026 tại trụ sở chính (SPS), không tính phân hiệu.'],
  ['HCMUTE','Trường Đại học Công nghệ Kỹ thuật Thành phố Hồ Chí Minh','SPK','https://hcmute.edu.vn/','Kỹ thuật ứng dụng, công nghệ, sư phạm kỹ thuật.','Ngành chọn lọc; xem cổng trường để xác nhận mã/ngành, cơ sở và điều kiện tuyển sinh từng năm.'],
  ['ULAW','Trường Đại học Luật Thành phố Hồ Chí Minh','LPS','https://hcmulaw.edu.vn/','Đào tạo luật và các lĩnh vực kinh doanh liên quan.','Một số ngành/chương trình cử nhân; không đồng nhất chuyên ngành với mã ngành xét tuyển.'],
  ['NLU','Trường Đại học Nông Lâm Thành phố Hồ Chí Minh','NLS','https://hcmuaf.edu.vn/','Nông nghiệp, thú y, công nghệ và môi trường.','Ngành chọn lọc từ trang đào tạo chính quy; chỉ xét cơ sở tại TP.HCM, không tính phân hiệu.'],
  ['UFM','Trường Đại học Tài chính – Marketing','DMS','https://ufm.edu.vn/','Tài chính, kinh doanh, marketing và dịch vụ.','Ngành chọn lọc từ cổng tuyển sinh; không gộp chuyên ngành thành mã tuyển sinh mới.'],
  ['UAH','Trường Đại học Kiến trúc Thành phố Hồ Chí Minh','KTS','https://uah.edu.vn/','Kiến trúc, quy hoạch, xây dựng và thiết kế.','Một số lĩnh vực/ngành đào tạo tại TP.HCM; lưu ý môn năng khiếu và cơ sở tuyển sinh khi xem đề án gốc.'],
  ['OU','Trường Đại học Mở Thành phố Hồ Chí Minh','MBS','https://ou.edu.vn/','Đào tạo đa ngành, từ công nghệ đến khoa học xã hội.','Ngành chọn lọc từ trang khoa/ngành của trường; không nhập học phí hay điểm chuẩn chưa đối chiếu.'],
  ['HUTECH','Trường Đại học Công nghệ Thành phố Hồ Chí Minh','DKC','https://www.hutech.edu.vn/','Đào tạo đa lĩnh vực: kỹ thuật, kinh doanh, truyền thông và dịch vụ.','Chọn lọc ngành từ thông tin chính quy năm 2026; không lấy các ngành dự kiến mở hoặc thông tin năm 2027.'],
].map(([id,name,code,website,description,coverage]) => ({ id,name,code,province:'TP. Hồ Chí Minh',website,description,coverage,source:sources[id],system:'Trường tại TP.HCM',institutionType:id==='HUTECH'?'private':'public',region:'Miền Nam' }));
universities.push(...additionalUniversities);
universities.push(...publicHcmUniversities);
universities.push(...southernUniversities);
universities.push(...moreSouthernUniversities);
universities.push({id:'CTU',name:'Đại học Cần Thơ',code:'TCT',province:'TP. Cần Thơ',website:'https://www.ctu.edu.vn/',description:'Đào tạo đa lĩnh vực tại Đồng bằng sông Cửu Long, từ sư phạm đến công nghệ và nông nghiệp.',coverage:'Đã nhập 127/127 mã xét tuyển 2026, điểm chuẩn từng mã và học phí bình quân/năm từ công bố chính thức; mã H/S học tại cơ sở ngoài TP. Cần Thơ theo thông báo.',source:{url:ctuProgramUrl,title:'ĐH Cần Thơ — danh mục 127 mã xét tuyển 2026',kind:'official',checkedAt:'2026-10-31'},system:'Trường tại Cần Thơ',institutionType:'public',region:'Miền Nam'});

const all = [];
function add(school, rows, options={}) {
  for (const [index,line] of rows.trim().split('\n').entries()) {
    const [code,name,field,tuition,combos,cutoff] = line.trim().split('|');
    const fieldData = fields[field];
    if (!fieldData) throw new Error(`Unknown field: ${line}`);
    all.push({ id:`${school}-${code || String(index+1).padStart(3,'0')}`, universityId:school, name, code:code || null, field, holland:fieldData.holland,
      description:fieldData.description, careers:fieldData.careers, editorial:true,
      program:options.program || 'Xem chương trình tại nguồn', admissionYear:options.year ?? null,
      tuition:tuition ? { value:Number(tuition)*1000000,period:'năm',year:'2026–2027' } : null,
      combinations:combos ? combos.split(',') : [],
      cutoff:cutoff ? { value:Number(cutoff),year:2026,method:'Xét tuyển tổng hợp',scale:100 } : null,
      source:sources[school], verified:school!=='AGU', ...options.extra,
    });
  }
}
add('UIT',`
|Công nghệ thông tin|it
|Khoa học máy tính|it
|Hệ thống thông tin|it
|Kỹ thuật phần mềm|it
|Kỹ thuật máy tính|engineering
|Mạng máy tính và truyền thông dữ liệu|it
|An toàn thông tin|it
|Thương mại điện tử|business
|Khoa học dữ liệu|it
|Trí tuệ nhân tạo|it
|Thiết kế vi mạch|engineering
|Truyền thông đa phương tiện|media
`);
add('HCMUS',`
7420101|Sinh học|bio|38.6|A02,B00,B03,B08,X15,X16
7420101_DKD|Sinh học (tăng cường tiếng Anh)|bio|54.6|A02,B00,B03,B08,X15,X16
7420201|Công nghệ sinh học|bio|38.6|A02,B00,B03,B08,X15,X16
7420201_DKD|Công nghệ sinh học (tăng cường tiếng Anh)|bio|54.6|A02,B00,B03,B08,X15,X16
7440102_DKD|Vật lý học (tăng cường tiếng Anh)|science|50.8|A00,A01,A02,A03,C01,X06
7440102_NN|Nhóm ngành Vật lý học, Công nghệ vật lý điện tử và tin học|science||A00,A01,A02,A03,C01,X06
7440107_DKD|Công nghệ vật lý điện tử và tin học (tăng cường tiếng Anh)|engineering|50.8|A00,A01,A02,A03,C01,X06
74401a1|Công nghệ bán dẫn|engineering|38.6|A00,A01,A02,A03,C01,X06
7440112|Hóa học|science|38.6|A00,B00,C02,D07,X11,X12
7440112_DKD|Hóa học (tăng cường tiếng Anh)|science|58.9|A00,B00,C02,D07,X11,X12
7440122|Khoa học vật liệu|science|38.6|A00,A01,B00,C01,C02,D07
7440122_DKD|Khoa học vật liệu (tăng cường tiếng Anh)|science|54.6|A00,A01,B00,C01,C02,D07
7440201_NN|Nhóm ngành Địa chất học, Kinh tế đất đai|environment||A00,A07,C01,C04,D01,D10
7440228|Hải dương học|science|32.6|A00,A01,A02,A04,C01,X06
7440228_DKD|Hải dương học (tăng cường tiếng Anh)|science|45|A00,A01,A02,A04,C01,X06
7440301|Khoa học môi trường|environment|32.6|A00,B00,D07,B08,X10,X14
7440301_DKD|Khoa học môi trường (tăng cường tiếng Anh)|environment|54.6|A00,B00,D07,B08,X10,X14
7460101_NN|Nhóm ngành Toán học, Toán ứng dụng, Toán tin|science||A00,A01,B00,B08,D01,X06
7460112_DKD|Toán ứng dụng (tăng cường tiếng Anh)|science|50.8|A00,A01,B00,B08,D01,X06
7460117_DKD|Toán tin (tăng cường tiếng Anh)|science|50.8|A00,A01,B00,B08,D01,X06
7460108_NN|Nhóm ngành Khoa học dữ liệu, Thống kê|it||A00,A01,B00,B08,D01,X06
7460108_DKD|Khoa học dữ liệu (tăng cường tiếng Anh)|it|50.8|A00,A01,B00,B08,D01,X06
7480101_TT|Khoa học máy tính (chương trình tiên tiến)|it|70|A00,A01,B08,D07,X06,X26
7480107|Trí tuệ nhân tạo|it|40.5|A00,A01,B08,D07,X06,X26
7480201_DKD|Công nghệ thông tin (tăng cường tiếng Anh)|it|49.5|A00,A01,B08,D07,X06,X26
7480201_NN|Nhóm ngành Máy tính và Công nghệ thông tin (CNTT, Kỹ thuật phần mềm, Hệ thống thông tin, Khoa học máy tính)|it|40.5|A00,A01,B08,D07,X06,X26
7510401_DKD|Công nghệ kỹ thuật hóa học (tăng cường tiếng Anh)|engineering|59.8|A00,B00,C02,D07,X11,X12
7510402|Công nghệ vật liệu|engineering|40.5|A00,A01,B00,C01,C02,D07
7510402_DKD|Công nghệ vật liệu (tăng cường tiếng Anh)|engineering|54.6|A00,A01,B00,C01,C02,D07
7510406|Công nghệ kỹ thuật môi trường|environment|32.6|A00,B00,B08,D07,X10,X14
7520207|Kỹ thuật điện tử – viễn thông|engineering|40.5|A00,A01,A02,B08,X06,X26
75202a1|Thiết kế vi mạch|engineering|40.5|A00,A01,A02,B08,X06,X26
7520207_DKD|Kỹ thuật điện tử – viễn thông (tăng cường tiếng Anh)|engineering|49|A00,A01,A02,B08,X06,X26
7520402|Kỹ thuật hạt nhân|engineering|32.6|A00,A01,A02,A03,C01,X06
7520403|Vật lý y khoa|science|37|A00,A01,A02,A03,C01,X06
7520403_DKD|Vật lý y khoa (tăng cường tiếng Anh)|science|50.8|A00,A01,A02,A03,C01,X06
7520501|Kỹ thuật địa chất|engineering|32.6|A00,C01,C02,C04,D01,D10
7850101|Quản lý tài nguyên và môi trường|environment|32.6|A00,B00,D07,B08,X10,X14
7140103|Công nghệ giáo dục|education|35.8|A00,A01,B00,C01,D01,D07
`,{ year:2026 });
add('HCMUT',`
106|Khoa học máy tính|it|||85.45
107|Kỹ thuật máy tính|engineering|||84.98
108|Nhóm ngành Điện – Điện tử – Viễn thông – Tự động hóa – Thiết kế vi mạch|engineering|||84.29
109|Kỹ thuật cơ khí|engineering|||80.75
110|Kỹ thuật cơ điện tử|engineering|||84.36
112|Nhóm ngành Dệt – May|engineering|||69.62
114|Nhóm ngành Hóa – Thực phẩm – Sinh học|bio|||79.08
115|Nhóm ngành Xây dựng và Quản lý dự án xây dựng|engineering|||68.69
117|Kiến trúc|media|||71.57
123|Quản lý công nghiệp|business|||80.17
125|Nhóm ngành Tài nguyên và Môi trường|environment|||69.38
128|Nhóm ngành Logistics và Hệ thống công nghiệp|business|||82.40
129|Kỹ thuật vật liệu|engineering|||78.88
137|Vật lý kỹ thuật|science|||82.01
138|Cơ kỹ thuật|engineering|||79.62
140|Kỹ thuật nhiệt|engineering|||79.91
141|Bảo dưỡng công nghiệp|engineering|||75.31
142|Kỹ thuật ô tô|engineering|||79.30
145|Song ngành Tàu thủy – Hàng không|engineering|||80.37
146|Khoa học dữ liệu|it|||84.97
147|Địa kỹ thuật xây dựng|engineering|||64.37
148|Kinh tế xây dựng|business|||69.35
150|Kỹ thuật dầu khí|engineering|||73.82
151|Kỹ thuật địa chất|engineering|||65.60
152|Kỹ thuật đường sắt|engineering|||76.06
153|Quản trị kinh doanh|business|||73.59
155|Kinh tế tuần hoàn (chuyên ngành Kinh tế tài nguyên thiên nhiên)|environment|||61.43
156|Kỹ thuật hạt nhân|engineering|||80.61
159|Kỹ thuật bán dẫn|engineering|||85.80
`,{ year:2026, program:'Chương trình tiêu chuẩn' });
add('IU',`
|Thương mại điện tử|business
|Marketing|business
|Thống kê|science
|Kinh tế|business
|Kỹ thuật hóa học|engineering
|Hóa học (Hóa sinh)|science
|Công nghệ thực phẩm|bio
|Công nghệ sinh học|bio
|Kế toán|business
|Tài chính – Ngân hàng|business
|Kỹ thuật không gian|engineering
|Kỹ thuật tài chính và quản trị rủi ro (Toán ứng dụng)|science
|Quản lý xây dựng|engineering
|Kỹ thuật xây dựng|engineering
|Kỹ thuật điện tử – viễn thông|engineering
|Kỹ thuật y sinh|engineering
|Kỹ thuật điều khiển và tự động hóa|engineering
|Kỹ thuật hệ thống công nghiệp|engineering
|Logistics và quản lý chuỗi cung ứng|business
|Khoa học dữ liệu|it
|Công nghệ thông tin|it
|Khoa học máy tính|it
|Ngôn ngữ Anh|language
|Quản trị kinh doanh|business
`,{ year:2026, program:'Do trường Đại học Quốc tế cấp bằng, giảng dạy bằng tiếng Anh' });
add('UEL',`
|Kinh tế|business
|Kinh tế quốc tế|business
|Toán kinh tế|science
|Kinh doanh quốc tế|business
|Quản lý công|business
|Quản trị kinh doanh|business
|Marketing|business
|Thương mại điện tử|business
|Hệ thống thông tin quản lý|it
|Tài chính – Ngân hàng|business
|Công nghệ tài chính|business
|Kế toán|business
|Kiểm toán|business
|Luật|law
|Luật kinh tế|law
`);
add('USSH',`
7320101|Báo chí|media
7760101|Công tác xã hội|social
7310501|Địa lý học|environment
7310608|Đông phương học|language
7580112|Đô thị học|social
7140101|Giáo dục học|education
7220104|Hán Nôm|language
7310614|Hàn Quốc học|language
73106A1|Kinh doanh thương mại Hàn Quốc|business
7229010|Lịch sử|social
7320303|Lưu trữ học|social
7210213|Nghệ thuật học|media
7220201|Ngôn ngữ Anh|language
7220205|Ngôn ngữ Đức|language
7229020|Ngôn ngữ học|language
7220208|Ngôn ngữ Italia|language
7220202|Ngôn ngữ Nga|language
7220203|Ngôn ngữ Pháp|language
7220206|Ngôn ngữ Tây Ban Nha|language
7220204|Ngôn ngữ Trung Quốc|language
7310302|Nhân học|social
7310613|Nhật Bản học|language
7320108|Quan hệ công chúng|media
7310206|Quan hệ quốc tế|language
7140114|Quản lý giáo dục|education
7580109|Quản lý phát triển đô thị và bất động sản|social
7320205|Quản lý thông tin|social
7140107|Quản trị chất lượng giáo dục|education
7810103|Quản trị dịch vụ du lịch và lữ hành|tourism
7340404|Quản trị nhân lực|business
7340406|Quản trị văn phòng|business
7310601|Quốc tế học|language
7310401|Tâm lý học|social
7310403|Tâm lý học giáo dục|education
7320201|Thông tin – Thư viện|social
7229009|Tôn giáo học|social
7229001|Triết học|social
7320104|Truyền thông đa phương tiện|media
7229040|Văn hóa học|social
7229030|Văn học|social
7310630|Việt Nam học|social
7310301|Xã hội học|social
`,{ program:'Chương trình chuẩn' });
add('UHS',`
|Y khoa|health
|Y học cổ truyền|health
|Dược học|health
|Răng – Hàm – Mặt|health
|Điều dưỡng|health
`);
add('AGU',`
|Giáo dục mầm non|education
|Giáo dục tiểu học|education
|Giáo dục chính trị|education
|Sư phạm Toán học|education
|Sư phạm Vật lý|education
|Sư phạm Hóa học|education
|Sư phạm Sinh học|education
|Sư phạm Ngữ văn|education
|Sư phạm Lịch sử|education
|Sư phạm Địa lý|education
|Sư phạm Tiếng Anh|education
|Sư phạm Khoa học tự nhiên|education
|Sư phạm Lịch sử – Địa lý|education
|Ngôn ngữ Anh|language
|Triết học|social
|Văn học|social
|Kinh tế quốc tế|business
|Chính trị học|social
|Việt Nam học|social
|Quản trị kinh doanh|business
|Marketing|business
|Thương mại điện tử|business
|Tài chính – Ngân hàng|business
|Kế toán|business
|Luật|law
|Công nghệ sinh học|bio
|Khoa học dữ liệu|it
|Kỹ thuật phần mềm|it
|Công nghệ thông tin|it
|Công nghệ kỹ thuật hóa học|engineering
|Công nghệ kỹ thuật môi trường|environment
|Công nghệ thực phẩm|bio
|Công nghệ sau thu hoạch|bio
|Đảm bảo chất lượng và an toàn thực phẩm|bio
|Chăn nuôi|bio
|Khoa học cây trồng|bio
|Bảo vệ thực vật|bio
|Phát triển nông thôn|bio
|Công nghệ nông nghiệp số|bio
|Kinh doanh nông nghiệp số|business
|Nuôi trồng thủy sản|bio
|Thú y|bio
|Quản lý tài nguyên và môi trường|environment
`,{ year:2026 });
// Mỗi bản ghi mới là ngành/chương trình chọn lọc, chỉ ghi mã hoặc số liệu khi đã đối chiếu.
add('UEH',`
|Marketing|business
|Kế toán|business
|Tài chính – Ngân hàng|business
|Quản trị kinh doanh|business
|Kinh doanh quốc tế|business
|Thương mại điện tử|business
|Công nghệ thông tin|it
|An toàn thông tin|it
|Công nghệ tài chính|business
|Công nghệ nghệ thuật – ArtTech|media
`);
add('UMP',`
|Y khoa|health
|Y học cổ truyền|health
|Y học dự phòng|health
|Dược học|health
|Răng – Hàm – Mặt|health
|Điều dưỡng|health
|Kỹ thuật xét nghiệm y học|health
|Kỹ thuật hình ảnh y học|health
`);
add('HCMUE',`
|Sư phạm Toán học|education
|Sư phạm Ngữ văn|education
|Sư phạm Tiếng Anh|education
|Sư phạm Vật lý|education
|Sư phạm Hóa học|education
|Sư phạm Sinh học|education
|Sư phạm Tin học|education
|Giáo dục học|education
|Hỗ trợ giáo dục người khuyết tật|education
`,{ year:2026 });
add('HCMUTE',`
|Công nghệ thông tin|it
|Kỹ thuật điều khiển và tự động hóa|engineering
|Công nghệ kỹ thuật cơ điện tử|engineering
|Công nghệ kỹ thuật ô tô|engineering
|Công nghệ kỹ thuật điện, điện tử|engineering
|Công nghệ kỹ thuật cơ khí|engineering
|Sư phạm công nghệ|education
|Luật|law
`);
add('ULAW',`
|Luật|law
|Luật thương mại quốc tế|law
|Quản trị – Luật|law
|Quản trị kinh doanh|business
|Ngôn ngữ Anh (tiếng Anh pháp lý)|language
`);
add('NLU',`
|Công nghệ thông tin|it
|Thú y|bio
|Chăn nuôi|bio
|Công nghệ sinh học|bio
|Công nghệ thực phẩm|bio
|Nông học|bio
 |Lâm học|bio
|Nuôi trồng thủy sản|bio
|Quản lý tài nguyên và môi trường|environment
|Cơ khí công nghệ|engineering
`);
add('UFM',`
|Marketing|business
|Tài chính – Ngân hàng|business
|Kế toán|business
|Kinh doanh quốc tế|business
|Quản trị kinh doanh|business
|Bất động sản|business
|Ngôn ngữ Anh|language
|Luật kinh tế|law
|Toán kinh tế|science
|Công nghệ tài chính|business
`);
add('UAH',`
|Kiến trúc|media
|Quy hoạch vùng và đô thị|engineering
|Thiết kế nội thất|media
|Thiết kế đồ họa|media
|Thiết kế thời trang|media
|Kỹ thuật xây dựng|engineering
|Quản lý xây dựng|engineering
`);
add('OU',`
|Tài chính – Ngân hàng|business
|Kế toán|business
|Kiểm toán|business
|Luật|law
|Ngôn ngữ Anh|language
|Công nghệ sinh học|bio
|Quản trị kinh doanh|business
|Kinh tế và quản lý công|business
|Xã hội học|social
|Công nghệ thông tin|it
`);
add('HUTECH',`
|Công nghệ thông tin|it
|An toàn thông tin|it
|Khoa học máy tính|it
|Trí tuệ nhân tạo|it
|Quản trị kinh doanh|business
|Marketing|business
|Kế toán|business
|Thương mại điện tử|business
|Công nghệ kỹ thuật ô tô|engineering
|Công nghệ sinh học|bio
`);
// Store the original subject expression for HCMUT rather than fabricating combination codes.
for (const major of all.filter(m=>m.universityId==='HCMUT')) major.admissionsNote = 'Tổ hợp và điều kiện chi tiết xem bảng gốc. Điểm tổng hợp thang 100; không quy đổi từ tổng 3 môn THPT bằng phép nhân đơn giản.';
all.push(...ctuPrograms);
all.push(...publicHcmMajors);
all.push(...southernMajors);
all.push(...moreSouthernMajors);
addAdmissionScores(all);
addVerifiedTuition(all);
export const majors = all;
