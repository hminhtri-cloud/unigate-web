// Only manually transcribed rows that can be matched UNAMBIGUOUSLY to a catalog program.
// Images were read from the linked university's official 2026 announcement (OCR + review).
// Method names and raw scales are preserved. No inferred 30↔100 or 1200↔30 conversions.
const origin = {
  HCMUS: 'https://tuyensinh.hcmus.edu.vn/diem-chuan-2/',
  UIT: 'https://tuyensinh.uit.edu.vn/2026-thong-bao-diem-trung-tuyen-theo-phuong-thuc-xet-tuyen-tong-hop',
  IU: 'https://tuyensinh.hcmiu.edu.vn/tuyen-sinh/thong-bao-muc-diem-trung-tuyen-vao-cac-nganh-theo-phuong-thuc-xet-tuyen-tong-hop-nam-2026-phuong-thuc-2/',
  UEL: 'https://tuyensinh.uel.edu.vn/truong-dai-hoc-kinh-te-luat-cong-bo-ket-qua-tuyen-sinh-dai-hoc-chinh-quy-nam-2026/',
  UEH: 'https://tuyensinh.ueh.edu.vn/bai-viet/ueh-cong-bo-ket-qua-xet-tuyen-khoa-52-dai-hoc-chinh-quy-nam-2026-gia-tang-co-hoi-hoc-tap-quoc-te/',
  OU: 'https://tuyensinh.ou.edu.vn/thong-bao-diem-chuan-trung-tuyen-va-ket-qua-trung-tuyen-vao-dai-hoc-chinh-quy-nam-2026',
  UAH: 'https://www.uah.edu.vn/diem-chuan-trung-tuyen-cac-chuong-trinh-dao-tao-trinh-do-dai-hoc-hinh-thuc-dao-tao-chinh-quy-nam-2026',
  UMP: 'https://ump.edu.vn/tuyen-sinh-dao-tao/dai-hoc/tuyen-sinh/10836/thong-bao-diem-trung-tuyen-dai-hoc-he-chinh-quy-nam-2026',
  NLU: 'https://ts.hcmuaf.edu.vn/vn/tin-tuc/span-style-color-red-diem-trung-tuyen-diem-chuan-cac-nganh-dao-tao-trinh-do-dai-hoc-va-nganh-giao-duc-mam-non-trinh-do-c-60570',
  HCMUT: 'https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/nganh-va-chi-tieu',
  'PTIT-HCM': 'https://tuyensinh.ptit.edu.vn/thong-bao-diem-chuan-trung-tuyen-vao-dai-hoc-he-chinh-quy-nam-2026/',
  SGU: 'https://tuyensinh.sgu.edu.vn/index.php/tuyen-sinh/diem-san-diem-trung-tuyen/nam-2026/thong-bao-diem-trung-tuyen-dot-1-ki-tuyen-sinh-dai-hoc-he-chinh-quy-nam-2026',
  DTHU: 'https://tuyensinh.dthu.edu.vn/',
};
const record = (method, value, scale, source, note='') => ({ method, value:Number(value),scale,year:2026,source,note });
const admissionRows = {};
function add(school, method, scale, rows, note='') {
  for (const row of rows.trim().split('\n')) {
    const [id,value] = row.trim().split('|');
    const key=`${school}-${id}`;
    (admissionRows[key]??=[]).push(record(method,value,scale,origin[school],note));
  }
}
// HCMUS official table explicitly prints both columns for the SAME composite method.
// Its 30-point column is an official equivalence, not a separate THPT-only cutoff.
const hcmus = `
7140103|23.89|79.63
7420101|23.50|78.33
7420101_DKD|22.60|75.33
7420201|24.75|82.50
7420201_DKD|24.10|80.33
7440102_DKD|24.30|81.00
7440102_NN|25.88|86.27
7440107_DKD|24.86|82.87
7440112|26.15|87.17
7440112_DKD|24.89|82.97
7440122|25.30|84.33
7440122_DKD|24.25|80.83
74401a1|27.34|91.13
7440201_NN|22.60|75.33
7440228|23.92|79.73
7440228_DKD|21.69|72.30
7440301|23.10|77.00
7440301_DKD|21.50|71.67
7460101_NN|26.28|87.60
7460108_DKD|27.48|91.60
7460108_NN|27.63|92.10
7460112_DKD|25.70|85.67
7460117_DKD|25.52|85.07
7480101_TT|29.32|97.73
7480107|28.68|95.60
7480201_DKD|24.70|82.33
7480201_NN|26.30|87.67
7510401_DKD|24.90|83.00
7510402|25.58|85.27
7510402_DKD|24.50|81.67
7510406|23.10|77.00
7520207|26.55|88.50
7520207_DKD|25.60|85.33
75202a1|27.93|93.10
7520402|26.21|87.37
7520403|26.00|86.67
7520403_DKD|24.80|82.67
7520501|23.85|79.50
7850101|22.30|74.33
`;
for (const row of hcmus.trim().split('\n')) {
  const [id,onThirty,onHundred]=row.split('|');
  const key=`HCMUS-${id}`;
  admissionRows[key]=[
    record('thpt-equivalent',onThirty,30,origin.HCMUS,'Cột thang 30 do trường công bố cho xét tuyển tổng hợp; không phải ngưỡng riêng của điểm thi THPT.'),
    record('composite',onHundred,100,origin.HCMUS,'Cùng phương thức xét tuyển tổng hợp với cột thang 30.'),
  ];
}
add('UIT','composite',100,`
001|84.20
002|88.50
003|80.80
004|81.00
005|84.00
006|78.30
007|88.70
008|79.00
009|91.70
010|100.00
011|90.50
012|82.20
`,'Điểm xét tuyển tổng hợp, không phải tổng 3 môn THPT.');
add('IU','composite',100,`
001|53
002|53
003|52
004|62
005|58
006|58
007|52
008|55
009|53
010|53
011|52
012|52
013|50
014|50
015|55
016|68
017|65
018|63
019|72
020|62
021|62
022|65
023|73
024|53
`,'Chỉ 24 ngành do trường Đại học Quốc tế cấp bằng (phương thức 2). Các chương trình liên kết có ngưỡng khác và không được gán chung.');
add('UEL','composite',100,`
004|87.94
005|71.81
006|80.50
007|84.63
008|86.73
009|86.46
010|81.40
011|82.54
012|80.49
013|85.29
`,'Các ngành/chuyên ngành có mã tuyển sinh riêng; chỉ đối chiếu các tên khớp trực tiếp trong danh mục.');
add('UEH','composite',100,`
001|90.20
004|79.40
005|92.50
006|89.20
007|78.50
008|77.00
009|88.70
010|84.50
`,'Phương thức xét tuyển tích hợp KSA tại TP.HCM. Không gán điểm KSV (Vĩnh Long) hoặc chương trình Tiếng Anh khác mã.');
add('UAH','thpt-equivalent',30,`
001|23.30
002|22.00
003|23.13
004|24.52
005|22.91
006|20.50
007|21.35
`,'Trường đã quy đổi tương đương về phương thức điểm thi THPT 2026; số này không phải điểm thi thực tế của từng thí sinh. Chỉ áp dụng chương trình chuẩn tại TP.HCM.');
add('UMP','thpt',30,`
001|27.95
002|23.63
003|20.75
004|24.00
005|27.11
006|22.25
007|23.35
008|22.60
`,'Ngưỡng theo tổ hợp gốc B00 của thông báo 2026; các tổ hợp khác có thể có ngưỡng khác.');
add('NLU','thpt',30,`
001|20.50
002|24.60
003|20.80
004|23.50
005|23.70
 006|20.50
 007|19.70
 008|20.00
009|21.50
010|23.65
`,'Cột THPT/THPT+HB/THPT+CC trong bảng trường 2026; đây là ngưỡng chung của các biến thể, không phải điểm HB hoặc ĐGNL.');
add('NLU','dgnl',1200,`
001|659
002|855
003|669
004|809
005|804
 006|659
 007|635
 008|654
009|697
010|801
`,'ĐGNL ĐHQG-HCM 2026, cột điểm riêng trong thông báo chính thức.');
add('OU','thpt',30,`
001|23.75
002|24.15
003|23.80
004|23.85
005|25.50
006|20.35
007|23.00
009|22.25
010|21.50
`,'Chương trình Chuẩn tại TP.HCM; phương thức thi tốt nghiệp THPT 2026, cùng mức điểm cho các tổ hợp theo thông báo trường.');
add('OU','dgnl',1200,`
001|923
002|940
003|926
004|929
005|1004
006|743
007|884
009|845
010|807
`,'Cột ĐGNL trong phụ lục cùng thông báo; không lấy điểm ĐGNL quy đổi từ điểm THPT của UniGate.');
add('PTIT-HCM','thpt',30,`
7520207|16.60
7520208|17.00
7520216|18.50
7510301|19.05
7480201|17.00
7480202|23.22
7329001|20.00
7320104|24.00
7340101|16.60
7340115|16.75
7340301|16.50
7510301VM|22.75
7480107|17.00
7480102|17.50
7340205|17.00
`,'Chỉ lấy cột THPT 2026 thang 30 của cơ sở phía Nam BVS, không lấy điểm BVH Hà Nội.');
add('PTIT-HCM','dgnl',1200,`
7520207|602.27
7520208|611.33
7520216|645.33
7510301|657.80
7480201|611.33
7480202|774.88
7329001|679.33
7320104|817.00
7340101|602.27
7340115|605.67
7340301|600.00
7510301VM|749.50
7480107|611.33
7480102|622.67
7340205|611.33
`,'Cột bài thi ĐGNL ĐHQG-HCM (V-ACT) thang 1200 công bố riêng cho BVS 2026; không tự quy đổi từ điểm THPT.');
add('SGU','thpt-equivalent',30,`
7140114|24.34
7220201|25.38
7229010|25.48
7310401|24.15
7310501|24.90
7310601|23.06
7310630|23.39
7320201|22.06
7340101|22.06
7340120|23.14
7340201|22.13
7340301|22.69
7340302|23.70
7340406|23.00
7380101|23.84
7440301|22.44
7460108|23.44
7460112|25.89
7480103|22.06
7480107|23.11
7480201|20.69
7510301|23.48
7510406|22.09
7810101|24.58
7140209|28.89
7140231|27.50
`,'Thông báo SGU 2026 ghi điểm đã QUY ĐỔI TƯƠNG ĐƯƠNG về tổ hợp gốc thang 30 cho tất cả phương thức, có thể bao gồm điểm cộng/ưu tiên; không phải ngưỡng điểm THPT độc lập.');
add('DTHU','thpt',30,`
7480208|16.45
7420101|15.00
`,'Cột điểm thi THPT năm 2026 trong bảng ngành trên cổng tuyển sinh Trường ĐH Đồng Tháp; không lấy số của năm 2025 cho các ngành khác.');
add('DTHU','dgnl',1200,`
7480208|612.61
7420101|600.00
`,'Cột điểm thi ĐGNL năm 2026 riêng của hai ngành trên cổng trường; không quy đổi sang thang 30.');

const verifiedCodes = {
  UIT: '7480201,7480101,7480104,7480103,7480106,7480102,7480202,7340122,7460108,7480107,75202A1,7320104',
  IU: '7340122,7340115,7460201,7310101,7520301,7440112,7540101,7420201,7340301,7340201,7520121,7460112,7580302,7580201,7520207,7520212,7520216,7520118,7510605,7460108,7480201,7480101,7220201,7340101',
  UEL: ',,,408,418,407,410,411,406,404,414,405,409,,',
  UMP: '7720101,7720115,7720110,7720201,7720501,7720301,7720601,7720602',
  UAH: '7580101,7580105,7580108,7210403,7210404,7580201,7580302',
  OU: '7340201,7340301,7340302,7380101,7220201,7420201,7340101,,7310301,7480201',
  UEH: '734011501,,,734010101,734012001,7340122,748020101,7480202,7340205,748020102',
  NLU: '7480201,7640101,7620105,7420201,7540101,7620109,7620201,7620301,7850101,',
};

export function addAdmissionScores(majors) {
  for (const major of majors) {
    const rows = admissionRows[major.id] || major.admissionScores || [];
    if (major.universityId==='HCMUT' && major.cutoff) {
      rows.push(record('composite',major.cutoff.value,100,origin.HCMUT,'Xét tuyển tổng hợp riêng của Bách khoa; không so trực tiếp với điểm tổng hợp của trường khác.'));
    }
    major.admissionScores = rows;
    if (rows.length && !major.admissionYear) major.admissionYear = 2026;
    if (!major.code && verifiedCodes[major.universityId]) {
      const index=Number(major.id.split('-').at(-1))-1;
      const code=verifiedCodes[major.universityId].split(',')[index];
      if (code && rows.length) major.code=code;
    }
  }
  for (const id of Object.keys(admissionRows)) {
    if (!majors.some(major=>major.id===id)) throw new Error(`Admission row has no exact matching program: ${id}`);
  }
}
