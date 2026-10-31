import {fields} from '../shared/domain.mjs';

// Official 2026 admission list, notice 2532 (2026 cutoffs), and CTU's annual tuition table.
// code|program name|published /30 common threshold. No score is inferred from tuition or vice versa.
const rows = `
7420201T|Công nghệ sinh học (chương trình tiên tiến)|15.00
7620301T|Nuôi trồng thủy sản (chương trình tiên tiến)|15.00
7220201C|Ngôn ngữ Anh (chất lượng cao)|23.40
7340101C|Quản trị kinh doanh (chất lượng cao)|20.01
7340120C|Kinh doanh quốc tế (chất lượng cao)|21.50
7340201C|Tài chính – Ngân hàng (chất lượng cao)|20.85
7480102C|Mạng máy tính và truyền thông dữ liệu (chất lượng cao)|18.85
7480103C|Kỹ thuật phần mềm (chất lượng cao)|20.10
7480104C|Hệ thống thông tin (chất lượng cao)|19.28
7480201C|Công nghệ thông tin (chất lượng cao)|21.40
7510401C|Công nghệ kỹ thuật hóa học (chất lượng cao)|17.00
7520103C|Kỹ thuật cơ khí (chất lượng cao)|19.50
7520201C|Kỹ thuật điện (chất lượng cao)|20.86
7520216C|Kỹ thuật điều khiển và tự động hóa (chất lượng cao)|22.00
7540101C|Công nghệ thực phẩm (chất lượng cao)|15.00
7580201C|Kỹ thuật xây dựng (chất lượng cao)|15.00
7620112C|Bảo vệ thực vật (chất lượng cao)|15.00
7640101C|Thú y (chất lượng cao)|17.12
7810103C|Quản trị dịch vụ du lịch và lữ hành (chất lượng cao)|19.20
7140201|Giáo dục mầm non|25.82
7140202|Giáo dục Tiểu học|26.85
7140204|Giáo dục Công dân|26.68
7140206|Giáo dục Thể chất|25.36
7140209|Sư phạm Toán học|28.12
7140210|Sư phạm Tin học|26.16
7140211|Sư phạm Vật lý|27.62
7140212|Sư phạm Hóa học|27.93
7140213|Sư phạm Sinh học|26.60
7140217|Sư phạm Ngữ văn|27.16
7140218|Sư phạm Lịch sử|27.82
7140219|Sư phạm Địa lý|27.25
7140231|Sư phạm Tiếng Anh|27.06
7140233|Sư phạm Tiếng Pháp|23.54
7140247|Sư phạm Khoa học tự nhiên|27.09
7140249|Sư phạm Lịch sử – Địa lý|26.77
7220201|Ngôn ngữ Anh|24.37
7220201H|Ngôn ngữ Anh (cơ sở Hậu Giang)|21.60
7220203|Ngôn ngữ Pháp|20.15
7229001|Triết học|23.55
7229030|Văn học|25.47
7310101|Kinh tế|22.51
7310201|Chính trị học|25.08
7310301|Xã hội học|24.01
7310403|Tâm lý học giáo dục|24.15
7320101|Báo chí|24.90
7320104|Truyền thông đa phương tiện|23.90
7320201|Thông tin – Thư viện|19.65
7340101|Quản trị kinh doanh|22.24
7340101H|Quản trị kinh doanh (cơ sở Hậu Giang)|17.10
7340115|Marketing|23.40
7340120|Kinh doanh quốc tế|23.54
7340121|Kinh doanh thương mại|22.40
7340122|Thương mại điện tử|22.41
7340201|Tài chính – Ngân hàng|23.97
7340205|Công nghệ tài chính|21.68
7340301|Kế toán|23.78
7340301S|Kế toán (khu Sóc Trăng)|19.30
7340302|Kiểm toán|23.09
7380101|Luật|23.88
7380101H|Luật (cơ sở Hậu Giang)|20.00
7380101S|Luật (khu Sóc Trăng)|20.00
7380103|Luật dân sự và tố tụng dân sự|20.55
7380107|Luật kinh tế|24.50
7420101|Sinh học|21.36
7420201|Công nghệ sinh học|21.53
7420203|Sinh học ứng dụng|19.55
7440112|Hóa học|24.63
7440301|Khoa học môi trường|15.00
7460108|Khoa học dữ liệu|19.20
7460112|Toán ứng dụng|23.80
7460201|Thống kê|19.24
7480101|Khoa học máy tính|23.22
7480102|Mạng máy tính và truyền thông dữ liệu|20.70
7480103|Kỹ thuật phần mềm|22.20
7480104|Hệ thống thông tin|20.85
7480106|Kỹ thuật máy tính (Thiết kế vi mạch bán dẫn)|24.03
7480107|Trí tuệ nhân tạo|20.55
7480201|Công nghệ thông tin|23.73
7480201H|Công nghệ thông tin (cơ sở Hậu Giang)|17.60
7480202|An toàn thông tin|22.85
7510401|Công nghệ kỹ thuật hóa học|24.61
7510601|Quản lý công nghiệp|21.83
7510605|Logistics và Quản lý chuỗi cung ứng|24.32
7510605S|Logistics và Quản lý chuỗi cung ứng (khu Sóc Trăng)|17.75
7520103|Kỹ thuật cơ khí|23.84
7520114|Kỹ thuật cơ điện tử|24.22
7520130|Kỹ thuật ô tô|23.20
7520201|Kỹ thuật điện|23.60
7520207|Kỹ thuật điện tử – viễn thông|22.69
7520212|Kỹ thuật y sinh|22.00
7520216|Kỹ thuật điều khiển và tự động hóa|25.33
7520309|Kỹ thuật vật liệu|21.51
7520320|Kỹ thuật môi trường|15.95
7520401|Vật lý kỹ thuật|22.46
7540101|Công nghệ thực phẩm|21.55
7540104|Công nghệ sau thu hoạch|15.00
7540105|Công nghệ chế biến thủy sản|16.30
7540106|Đảm bảo chất lượng và an toàn thực phẩm|19.00
7580101|Kiến trúc|15.50
7580105|Quy hoạch vùng và đô thị|15.00
7580201|Kỹ thuật xây dựng|18.50
7580202|Kỹ thuật xây dựng công trình thủy|15.00
7580205|Kỹ thuật xây dựng công trình giao thông|15.00
7580213|Kỹ thuật cấp thoát nước|15.00
7580302|Quản lý xây dựng|15.00
7620103|Khoa học đất|15.00
7620105|Chăn nuôi|15.00
7620109|Nông học|15.00
7620110|Khoa học cây trồng|15.00
7620112|Bảo vệ thực vật|15.00
7620113|Công nghệ rau hoa quả và cảnh quan|15.00
7620114|Kinh doanh nông nghiệp|17.00
7620114H|Kinh doanh nông nghiệp (cơ sở Hậu Giang)|15.00
7620115|Kinh tế nông nghiệp|20.10
7620115H|Kinh tế nông nghiệp (cơ sở Hậu Giang)|15.00
7620301|Nuôi trồng thủy sản|15.00
7620302|Bệnh học thủy sản|15.00
7620305|Quản lý thủy sản|15.00
7640101|Thú y|22.45
7720203|Hóa dược|23.90
7810101|Du lịch|24.88
7810101H|Du lịch (cơ sở Hậu Giang)|21.85
7810101S|Du lịch (khu Sóc Trăng)|20.15
7810103|Quản trị dịch vụ du lịch và lữ hành|21.85
7850101|Quản lý tài nguyên và môi trường|15.11
7850102|Kinh tế tài nguyên thiên nhiên|19.40
7850103|Quản lý đất đai|16.50
`;

const admissionUrl='https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/1163-thong-bao-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026.html';
export const ctuTuitionUrl='https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/944-hoc-phi.html';
export const ctuProgramUrl='https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/841-danh-muc-nganh-va-chi-tieu-tuyen-sinh-dhcq.html';
const tuitionMillions=code=>{
  if (code.endsWith('C')||code.endsWith('T')) return 44;
  if (code.startsWith('714')) return 27.38;
  if (code==='7320104'||code==='7850101'||code==='7850103') return 29.2;
  if (code.startsWith('722')||code.startsWith('731')||code.startsWith('732')||code.startsWith('734')||code.startsWith('738')||code.startsWith('781')||['7620114','7620114H','7620115','7620115H','7850102'].includes(code)) return 28.63;
  if (['7420101','7420201','7440112'].includes(code)) return 29.48;
  if (['7420203','7440301'].includes(code)) return 30.07;
  if (code.startsWith('746')||code==='7510605'||code==='7510605S'||code==='7520401'||code==='7720203') return 32.75;
  if (code==='7580101') return 33.12;
  if (code==='7640101') return 33.32;
  return 33.4;
};
const fieldFor=(code,name)=>{
  if (code.startsWith('714')||name.includes('giáo dục')) return 'education';
  if (/Ngôn ngữ|Tiếng Anh|Phiên dịch/.test(name)) return 'language';
  if (/Báo chí|Truyền thông|Kiến trúc/.test(name)) return 'media';
  if (/Luật/.test(name)) return 'law';
  if (/Du lịch/.test(name)) return 'tourism';
  if (/Kinh tế|Kinh doanh|Quản trị|Marketing|Thương mại|Tài chính|Kế toán|Kiểm toán|Logistics/.test(name)) return 'business';
  if (/Môi trường|tài nguyên|đất đai/.test(name)) return 'environment';
  if (/thủy|Sinh học|Thú y|Chăn nuôi|Nông học|cây trồng|thực vật|nông nghiệp|thực phẩm|sau thu hoạch|Hóa dược/.test(name)) return 'bio';
  if (code.startsWith('748')||code==='7460108') return 'it';
  if (code.startsWith('752')||code.startsWith('751')||code.startsWith('758')) return 'engineering';
  if (code.startsWith('746')||code.startsWith('744')) return 'science';
  return 'social';
};
export const ctuPrograms=rows.trim().split('\n').map(line=>{
  const [code,name,cutoff]=line.split('|');
  const field=fieldFor(code,name);
  const tuition=tuitionMillions(code);
  const specialCampus=code.endsWith('H')?'Hậu Giang':code.endsWith('S')?'Sóc Trăng':null;
  return {
    id:`CTU-${code}`,universityId:'CTU',name,code,field,holland:fields[field].holland,
    description:fields[field].description,careers:fields[field].careers,editorial:true,
    program:code.endsWith('T')?'Chương trình tiên tiến':code.endsWith('C')?'Chương trình chất lượng cao':'Đại học chính quy',
    admissionYear:2026,tuition:{value:Math.round(tuition*1_000_000),period:'năm học',year:'Khóa tuyển 2026',source:ctuTuitionUrl,note:code.startsWith('714')?'Sinh viên ngành đào tạo giáo viên đủ điều kiện có thể được hỗ trợ học phí theo Nghị định 116; xem điều kiện của trường.':'Học phí bình quân một năm học; thực thu phụ thuộc số tín chỉ đăng ký.'},
    combinations:[],cutoff:null,
    admissionScores:[{method:'thpt',value:Number(cutoff),scale:30,year:2026,source:admissionUrl,note:'Mốc dùng chung cho điểm thi THPT, học bạ và V-SAT sau khi trường quy đổi; không phải ba ngưỡng điểm thô độc lập.'}],
    source:{url:ctuProgramUrl,title:'ĐH Cần Thơ — 127 mã xét tuyển 2026',kind:'official',checkedAt:'2026-10-31'},
    admissionsNote:specialCampus?`Chương trình tại ${specialCampus}; kiểm tra địa điểm học chi tiết trên cổng tuyển sinh.`:'Mốc học bạ/V-SAT chỉ áp dụng sau khi quy đổi theo quy tắc của trường.',
    verified:true,campus:specialCampus,
  };
});
