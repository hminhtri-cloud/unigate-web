import { ctuCombinations, ctuCombinationSource } from './ctu-combinations.mjs';

// Supplementary 2026 cutoffs transcribed from linked official notices/PDFs/images.
// Match stable catalogue IDs, never assign an entire school's minimum to every major.
// null scale means the source column's maximum has not been established; do not guess.
export const admissionSupplementSources = {
  HCMUNRE:'https://tuyensinh.hcmunre.edu.vn/quyet-dinh-ve-diem-trung-tuyen-dai-hoc-chinh-quy-dot-1-nam-2026.html',
  HSU:'https://www.hoasen.edu.vn/tuyensinh/diem-chuan-dai-hoc-hoa-sen-nam-2026/',
  HIU:'https://hiu.vn/tin-tuc/truong-dai-hoc-quoc-te-hong-bang-cong-bo-diem-chuan-2026/',
  BDU:'https://tuyensinh.bdu.edu.vn/dai-hoc-chinh-quy/bdu-cong-bo-diem-trung-tuyen-va-huong-dan-thu-tuc-nhap-hoc-cho-tan-sinh-vien-khoa-29-751.html',
  HUIT:'https://ts.huit.edu.vn/tin-tuyen-sinh/diem-chuan-truong-dai-hoc-cong-thuong-tp-hcm-nam-2026',
  STU:'https://stu.edu.vn/truong-dh-cong-nghe-sai-gon-cong-bo-diem-chuan-nam-2026-cao-nhat-24-diem.html',
  DHV:'https://dhv.edu.vn/truong-dai-hoc-hung-vuong-tp-ho-chi-minh-cong-bo-diem-trung-tuyen-dai-hoc-he-chinh-quy-dot-1-nam-2026/',
  VNUF2:'https://vnuf2.edu.vn/vi/thong-tin-tuyen-sinh-dai-hoc/4291-vnuf2-cong-bo-diem-trung-tuyen-dai-hoc-chinh-quy-nam-2026.html',
  CTUT:'https://tuyensinh.ctuet.edu.vn/tuyen-sinh-dai-hoc-2026/thong-bao-diem-trung-tuyen-dai-hoc-chinh-quy-nam-2026-2285.html',
  BLU:'https://tuyensinh.blu.edu.vn/thong-bao-cong-bo-diem-chuan-trung-tuyen-cac-nganh-dao-tao-trinh-do-dai-hoc-va-nganh-giao-duc-mam-non-trinh-do-cao-dang-dot-1-nam-2026-11291',
  PVU:'https://pvu.edu.vn/tuyen-sinh/tuyen-sinh-2026/thong-bao-diem-chuan-trung-tuyen-dot-1-trinh-do-dai-hoc-he-chinh-quy-va-he-lien-ket-nam-2026',
  CTTC:'https://caothang.edu.vn/tuyensinh/ket-qua-xet-thpt-2026.html',
  NCEHCM:'https://ncehcm.edu.vn/vnt_upload/admissions/08_2026/THONG_BAO_DIEM_TRUNG_TUYEN_NAM_2026.pdf',
  UEF:'https://www.uef.edu.vn/tin-tuyen-sinh/uef-cong-bo-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026-37621',
  VLU:'https://www.vlu.edu.vn/news/truong-dai-hoc-van-lang-cong-bo-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026',
  TDTU:'https://admission.tdtu.edu.vn/dai-hoc/diem-trung-tuyen-va-thu-tuc-nhap-hoc-trinh-do-dai-hoc-nam-2026',
};
const bduCombinationSource='https://tuyensinh.bdu.edu.vn/dai-hoc-chinh-quy/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-nam-2026-568.html';
const huitCombinationSource='https://ts.huit.edu.vn/thong-bao/thong-tin-tuyen-sinh-dai-hoc-nam-2026';
const updates=new Map();
function entry(id,code) {
  if(updates.has(id)) throw new Error(`Duplicate admission supplement: ${id}`);
  const item={id,code,scores:[]};updates.set(id,item);return item;
}
function score(item,method,value,scale,options={}) {
  if(!Number.isFinite(Number(value))) throw new Error(`Invalid cutoff for ${item.id}`);
  item.scores.push({method,value:Number(value),scale,year:2026,scoreType:'cutoff',round:'Đợt 1',
    source:admissionSupplementSources[item.id.split('-')[0]],checkedAt:'2026-11-07',
    combinations:[],note:'Điểm chuẩn theo bảng công bố 2026, không phải điểm sàn.',...options});
}
const lines=table=>table.trim().split('\n').map(r=>r.trim().split('|'));

// PT1 and PT3 are independent raw thresholds. PT2 has combination-specific columns.
// old ID 7440221 is retained so saved wishes are not broken; official code is 7440211.
const unres=lines(`
7510605|7510605|21|808|25|26.5|26|B03,C01,C02,C03,C04,D01,X01,X02,X03
7850102|7850102|15.5|543|19.5|21|20.5|B03,C01,C02,C03,C04,D01,X01,X02
7440222|7440222|15|513|19|20.5|20|B03,C01,C02,C03,C04,D01,X01,X02
7440221|7440211|15|513|19|20.5|20|B03,C01,C02,C03,C04,D01,X01,X02
7480201|7480201|18|664|22|23.5|23|B03,C01,C02,C03,C04,D01,X01,X02
7510401|7510401|18|664|22|23.5|23|B03,C01,C02,C03,C04,D01,X02,X04
7440224|7440224|15|513|19|20.5|20|B03,C01,C02,C03,C04,D01,X01,X02
7850198|7850198|15|513|19|20.5|20|B03,C01,C02,C03,C04,D01,X01,X02
7520503|7520503|15|513|19|20.5|20|B03,C01,C02,C03,C04,D01,X02,X04
7340101|7340101|19|715|23|24.5|24|B03,C01,C02,C03,C04,D01,X01,X02
7850101|7850101|18|664|22|23.5|23|B03,C02,C03,C04,D01,X01,X02
7850103|7850103|18|664|22|23.5|23|B03,C01,C02,C03,C04,D01,X01
7480104|7480104|17|616|21|22.5|22|B03,C01,C02,C03,C04,D01,X01,X02
7340116|7340116|15.5|543|19.5|21|20.5|B03,C01,C02,C03,C04,D01,X01
`);
for(const [suffix,code,thpt,dgnl,hb,hbNew,hbAverage,combos] of unres) {
  const item=entry(`HCMUNRE-${suffix}`,code),all=combos.split(',');
  score(item,'thpt',thpt,30,{source:'https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT1.pdf',combinations:all,combinationScope:'same-cutoff',note:'PT1: một mức điểm chuẩn dùng chung cho các tổ hợp được liệt kê của ngành.'});
  const legacy=all.filter(c=>!c.startsWith('X'));
  const newer=all.filter(c=>c.startsWith('X')&&c!=='X03');
  if(code==='7510605')newer.push('X04'); // PT2 PDF: X04, unlike PT1's X03.
  score(item,'transcript',hb,30,{source:'https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT2.pdf',combinations:legacy,combinationScope:'same-cutoff',methodLabel:'Học bạ · PT2, tổ hợp 3 môn'});
  score(item,'transcript',hbNew,30,{source:'https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT2.pdf',combinations:newer,combinationScope:'same-cutoff',methodLabel:'Học bạ · PT2, tổ hợp 3 môn'});
  score(item,'transcript-average',hbAverage,30,{source:'https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT2.pdf',methodLabel:'Học bạ · PT2, trung bình 3 năm học'});
  score(item,'dgnl',dgnl,1200,{source:'https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT3.pdf',note:'PT3: điểm thi ĐGNL ĐHQG-HCM, không phải số do UniGate quy đổi.'});
}

// HSU: only exact programme names in the official 33-row image are matched.
// No score is assigned to the separate editorial labels for business analytics,
// international commercial law or digital business law.
for(const [suffix,code] of lines(`
001|7340101
003|7340404
004|7340201
005|7340205
006|7480208
007|7480201
008|7480103
009|7480107
010|7340115
011|7320104
012|7320108
013|7210403
014|7340120
015|7510605
016|7380101
017|7380107
020|7310401
021|7810201
`)) {
  const item=entry(`HSU-${suffix}`,code),law=['016','017'].includes(suffix);
  const source='https://www.hoasen.edu.vn/tuyensinh/wp-content/uploads/sites/7/2026/07/DIEM-CHUAN-DH-HSU-2026.png';
  score(item,'thpt',law?20:15,30,{source});
  score(item,'transcript',law?22.45:18,30,{source});
  if(!law){
    score(item,'interview',18,null,{source,note:'PT3: cột Điểm phỏng vấn. Chưa xác minh thang tối đa và điều kiện áp dụng.'});
    score(item,'dgnl',600,1200,{source});
    score(item,'dgnl-hn',75,150,{source});
    score(item,'talent',18,null,{source,note:'PT5: xét tuyển thẳng theo diện riêng của trường, không phải tuyển thẳng không điều kiện. Chưa xác minh thang tối đa.'});
  }
}

const hiuNote='Các phương thức ngoài điểm thi THPT có điều kiện học lực, điểm thi/xét tốt nghiệp bổ sung, nhất là sức khỏe và luật; xem đầy đủ thông báo của trường.';
for(const [suffix,code,thpt,hb,combined,dgnl,vsat,sat,ib,gpa10,gpa4] of lines(`
001|7720101|22|23|22.75|718|270|1100|36|7.5|3.24
002|7720115|20|21|20.77|675|250|1000|30|7|3.11
003|7720501|22|23|22.75|718|270|1100|36|7.5|3.24
004|7720201|20|21|20.77|675|250|1000|30|7|3.11
005|7720301|18|19.5|18.75|650|225|850|28|6.5|2.85
006|7720302|18|19.5|18.75|650|225|850|28|6.5|2.85
007|7720601|18|19.5|18.75|650|225|850|28|6.5|2.85
008|7720603|18|19.5|18.75|650|225|850|28|6.5|2.85
009|7340101|15|18|16.21|650|200|800|20|5|2
010|7340301|15|18|16.21|650|200|800|20|5|2
011|7340205|15|18|16.21|650|200|800|20|5|2
012|7340122|15|18|16.21|650|200|800|20|5|2
013|7380101|20|21|20.77|700|200|800|20|5|2
014|7380107|20|21|20.77|700|200|800|20|5|2
015|7220201|15|18|16.21|650|200|800|20|5|2
016|7310401|15|18|16.21|650|200|800|20|5|2
017|7480201|15|18|16.21|650|200|800|20|5|2
018|7420201|15|18|16.21|650|200|800|20|5|2
`)) {
  const item=entry(`HIU-${suffix}`,code);
  const page=Number(suffix)<=8||suffix==='012'?'01':Number(suffix)<=15?'02':'03';
  const source=`https://hiu.vn/wp-content/uploads/2026/08/cong-bo-diem-chuan-2210-x-3000-${page}.jpg`;
  for(const [method,value,scale] of [['thpt',thpt,30],['transcript',hb,30],['combined',combined,null],['dgnl',dgnl,1200],['vsat',vsat,null],['sat',sat,1600],['ib',ib,45],['gpa10',gpa10,10],['gpa4',gpa4,4]])
    score(item,method,value,scale,{source,note:`${hiuNote}${scale===null?' Cột này chưa xác minh thang tối đa; không đưa vào xếp hạng THPT.':''}`});
}

const bduSocial='A01,A09,C00,C03,C04,C14,D01,D14,D15,D66';
const bduBusiness='A00,A09,C01,C03,C04,C14,D01,D16,D20,D21';
const bduLaw='A00,A09,C00,C03,C04,C14,D01,D16,D20,D21';
const bduPharmacy='A00,A02,A11,B00,B0C,B0D,B03,C02,C08,D07';
for(const [suffix,code,thpt,hb,dgnl,combos] of lines(`
001|7480201|15|16|600|A00,A01,C01,C03,C04,C14,D01,D16,X02,X03
002|7540101|15|16|600|A00,A01,B00,B03,C02,C03,C04,C14,D01
003|7720201|20|20||${bduPharmacy}
004|7720203|15|16|600|${bduPharmacy}
005|7510605|15|16|600|A00,A01,A09,C01,C03,C04,C14,D01,D66
006|7340201|15|16|600|${bduBusiness}
007|7340101|15|16|600|${bduBusiness}
008|7340301|15|16|600|${bduBusiness}
009|7310301|15|16|600|${bduBusiness}
010|7380101|20|18||${bduLaw}
011|7380107|20|18||${bduLaw}
012|7220201|15|16|600|A01,D01,D07,D09,D14,D15,D19,D66
013|7310613|15|16|600|${bduSocial}
014|7310614|15|16|600|${bduSocial}
015|7510301|15|16|600|A00,A01,C01,C03,C04,C14,D01,D17,D18
016|7510205|15|16|600|A00,A09,C01,C03,C04,C14,D01,D16,D17,D18
017|7580101|15|16|600|A00,V00,V01,V02,V03,V04,V05,V06,V07,V08,V10
`)) {
  const item=entry(`BDU-${suffix}`,code);
  score(item,'thpt',thpt,30,{combinations:combos.split(','),combinationSource:bduCombinationSource,combinationScope:'programme-list',note:'Tổ hợp theo đề án 2026 của BDU, giữ nguyên mã của trường (có mã khác quy ước trường khác). Kiến trúc có tổ hợp năng khiếu; xem điều kiện môn vẽ.'});
  score(item,'transcript',hb,30,{note:['003','010','011'].includes(suffix)?'Kèm điều kiện học bạ lớp 12 loại Tốt theo ảnh công bố; điểm số riêng chưa đủ xác nhận trúng tuyển.':'Điểm học bạ theo cột riêng của thông báo.'});
  if(dgnl)score(item,'dgnl',dgnl,1200);
}

for(const [suffix,code,thpt,hb,dgnl,special,combos] of lines(`
001|7480107|20.5|23.75|725|23|D01,A00,C01,X26
002|7510601|20.5|23.75|725|23|D01,A01,C01,A00
003|7540101|22|24.88|775|23.81|B00,B08,A00,D07
004|7220204|22.5|25.25|800|24.13|D01,A01,D09,D14
005|7220201|22.5|25.25|800|24.13|D01,A01,D09,D14
006|7810201|21.5|24.5|750|23.5|D01,C03,D15,C00
007|7810202|21|24.13|737.5|23.25|D01,C03,D15,C00
008|7810103|21.75|24.69|762.5|23.66|D01,C03,D15,C00
009|7380107|21.75|24.69|762.5|23.66|D01,C03,X01,C00
010|7340101|20.5|23.75|725|23|D01,A01,C01,A00
011|7340115|21.75|24.69|762.5|23.66|D01,A01,C01,A00
012|7340201|21|24.13|737.5|23.25|D01,A01,C01,A00
013|7480201|20|23.38|712.5|22.75|D01,A00,C01,X26
`)) {
  const item=entry(`HUIT-${suffix}`,code);
  score(item,'thpt',thpt,30,{combinations:combos.split(','),combinationSource:huitCombinationSource,combinationScope:'programme-list',note:'Tổ hợp theo thông tin tuyển sinh 2026. Kiểm tra quy tắc tương quan bách phân vị giữa tổ hợp của trường; không tự coi điểm các tổ hợp tương đương.'});
  score(item,'transcript',hb,30,{note:'Xét kết quả học tập THPT lớp 10, 11, 12, cột điểm học bạ riêng.'});
  score(item,'dgnl',dgnl,1200);
  score(item,'dgnl-special-hcmue',special,30,{note:'Điểm thi ĐGNL chuyên biệt ĐH Sư phạm TP.HCM kết hợp kết quả học tập THPT. Không phải ĐGNL ĐHQG-HCM.'});
}

for(const [suffix,code] of lines('001|7480201\n002|7540101\n003|7340101')){
  const item=entry(`STU-${suffix}`,code);
  score(item,'thpt',15,30);
  score(item,'transcript-average',17,30,{methodLabel:'Học bạ · PT01.01, trung bình 3 năm'});
  score(item,'transcript',17,30,{methodLabel:'Học bạ · PT01.02, tổ hợp 3 môn'});
  score(item,'dgnl',550,1200);
  score(item,'combined',19,null,{methodLabel:'Học bạ kết hợp thi THPT · PT04',note:'Chưa xác minh thang điểm tối đa và công thức PT04; không đưa vào xếp điểm THPT.'});
}
// STU-004 is Thiết kế đồ họa; the cutoff table lists Thiết kế công nghiệp.
// Leave it unmatched rather than borrowing the design programme's score.
for(const [suffix,code,thpt,hb,dgnl] of lines(`
001|7220201|15|18|600
002|7220209|15|18|600
003|7220204|15|18|600
004|7220210|15|18|600
005|7810201|15|18|600
006|7810103|15|18|600
007|7380101|20|20|762
008|7380107|20|20|762
009|7720802|15|18|600
010|7310401|20|22.5|762
011|7480201|15|18|600
012|7480106|15|18|600
`)){
  const item=entry(`DHV-${suffix}`,code),source='https://dhv.edu.vn/wp-content/uploads/2026/08/POST-TONG-CONG-BO-DIEM-CHUAN-DHV-2026.png';
  score(item,'thpt',thpt,30,{source});
  score(item,'transcript',hb,30,{source,note:['007','008'].includes(suffix)?'Lớp 12 mức Tốt; tổng 3 môn thi TN THPT ≥18; điểm trung bình môn Toán và Văn cấp THPT ≥6, theo chú thích (*) của bảng.':'Cột Học tập THPT trong bảng điểm chuẩn.'});
  score(item,'dgnl',dgnl,1200,{source});
}

for(const suffix of ['001','002','003','004','005','006','007','008','010','011','012','013','014','015']){
  const item=entry(`VNUF2-${suffix}`,null),source='https://vnuf2.edu.vn/vi/images/stories/anh26/tin1008262.jpg';
  score(item,'thpt',15,30,{source});score(item,'transcript',18,30,{source});score(item,'dgnl',600,1200,{source});
}
score(entry('VNUF2-009',null),'combined',18,null,{source:'https://vnuf2.edu.vn/vi/images/stories/anh26/tin1008262.jpg',methodLabel:'Kết hợp điểm học tập THPT',note:'Thiết kế nội thất: chỉ cột Kết hợp điểm học tập THPT có số 18; không có ngưỡng THPT hay ĐGNL riêng trong bảng. Chưa xác minh thang tối đa.'});

for(const [suffix,code,value] of lines(`
001|7480101|19
002|7460108|17.82
003|7480104|18.4
004|7480201|21.78
005|7480103|19.65
006|7520118|15.11
007|7510601|20.15
008|7510605|20.5
009|7510203|22.01
010|7510301|22.33
011|7540101|19.15
012|7420201|16.46
013|7340101|19.74
014|7380101|20.79
015|7340301|21.03
016|7340201|20.46
`))score(entry(`CTUT-${suffix}`,code),'thpt-equivalent',value,30,{note:'Mức điểm sau quy đổi tương đương về điểm thi THPT cho tất cả phương thức, không phải các điểm thô học bạ/ĐGNL riêng.'});

for(const [suffix,code,thpt,hb,dgnl] of lines(`
001|7480201|15|18|500
002|7620301|15|18|500
003|7620112|15|18|500
004|7620105|15|18|500
005|7440301|15|18|500
006|7340301|15|18|500
007|7340101|15|18|500
008|7340201|15|18|500
009|7220201|15|18|500
010|7140202|23.13|26.76|647.8
011|7140209|24.66|28.29|858.4
012|7140212|23.6|27.47|795
013|7140213|22.6|26.05|768.18
`)){
  const item=entry(`BLU-${suffix}`,code),source='https://tuyensinh.blu.edu.vn/admin/Uploads/Images/2026/8/image_77203772121786329030369_1c8f1e42-e971-475d-a9c9-7fc3f7c8040b.png';
  score(item,'thpt',thpt,30,{source});score(item,'transcript',hb,30,{source});score(item,'dgnl',dgnl,1200,{source});
}
const pvuCombos='A00,A01,A02,B00,C01,C02,D07,X06,X07,X10,X11'.split(',');
for(const suffix of ['001','002','003']){
  const item=entry(`PVU-${suffix}`,null);
  score(item,'thpt',22.5,30,{combinations:pvuCombos,combinationScope:'same-cutoff',note:'Phần I: hệ chính quy; mức chung cho 11 tổ hợp, đã gồm ưu tiên. Không lấy ngưỡng 19 điểm của hệ liên kết.'});
  score(item,'transcript',25.5,30,{combinations:pvuCombos,combinationScope:'same-cutoff',note:'Tổng trung bình 6 học kỳ của 3 môn thuộc tổ hợp, đã gồm ưu tiên, hệ chính quy.'});
  score(item,'dgnl',752,1200);score(item,'dgnl-hn',97,150);score(item,'tsa',60.22,100);
}

for(const [suffix,weighted,equivalent] of lines(`
001|32|24
002|28|21
003|28|21
004|29.5|22.13
005|26|19.5
006|27.5|20.63
007|24|18
008|24|18
009|28.5|21.38
010|31|23.25
011|28.5|21.38
012|30|22.5
013|22|16.5
`)){
  const item=entry(`CTTC-${suffix}`,null);
  const options={combinationExpression:'Toán (hệ số 2) + 2 môn trong: Vật lý, Hóa học, Ngữ văn, Tiếng Anh, Tin học, Công nghệ',note:'Nguồn công bố cả điểm Toán nhân 2 và cột quy đổi /30. Không tự tạo mã tổ hợp, không dùng tổng 3 môn không trọng số để so.'};
  score(item,'thpt-weighted',weighted,40,options);
  score(item,'thpt-equivalent',equivalent,30,options);
}
{
  const item=entry('NCEHCM-001',null);
  const options={combinationExpression:'Môn văn hóa xét tuyển + Năng khiếu 1 + Năng khiếu 2',note:'Mức chung 22,51 đã gồm ưu tiên. Học bạ: lớp 12 Khá trở lên, NK1/NK2 ≥5. THPT: môn văn hóa ≥5,66, NK1/NK2 ≥5. Không phải tổng 3 môn văn hóa THPT; chưa đối chiếu mã tổ hợp.'};
  score(item,'aptitude-thpt',22.51,30,options);
  score(item,'aptitude-transcript',22.51,30,options);
}

const uefCommonCombos='A01,C01,C03,C04,D01,D09,D10,D11,D14,D15,X01,X02'.split(',');
const uefLanguageCombos='A01,C01,C03,C04,D01,D09,D10,D11,D14,D15,X78,X79'.split(',');
const uefCombinationSource='https://www.uef.edu.vn/tin-tuyen-sinh/uef-cong-bo-thong-tin-tuyen-sinh-nam-2026-33917';
for(const [suffix,code] of lines(`
001|7340101
002|7340121
003|7340120
004|7510605
005|7340115
006|7340114
007|7340404
008|7340201
009|7340301
010|7340302
011|7340205
012|7340122
013|7310106
014|7310109
015|7340116
016|7380101
017|7380107
018|7380108
019|7380109
020|7480201
021|7460108
022|7480103
023|7220201
024|7310401
`)){
  const item=entry(`UEF-${suffix}`,code),law=code.startsWith('738');
  score(item,'thpt',law?20:15,30,{combinations:suffix==='023'?uefLanguageCombos:uefCommonCombos,combinationScope:'programme-list',combinationSource:uefCombinationSource});
  const note=law?'Ngành luật: phương thức ngoài THPT còn có điều kiện lớp 12 mức Tốt/Giỏi và tổng 3 môn thi THPT ≥18 hoặc điểm xét tốt nghiệp ≥8,5, xem thông báo.':'Học bạ: điểm trung bình 6 học kỳ theo phương thức riêng của trường.';
  score(item,'transcript',law?20:18,30,{note});
  score(item,'dgnl',law?650:600,1200,{note});
  score(item,'vsat',law?250:225,null,{note:`${note} Chưa đối chiếu thang tối đa V-SAT; không tự quy đổi.`});
}

// VLU table: the five test columns belong to the route combining school records
// with a test, NOT five unconditional stand-alone test routes. Standard only.
for(const [suffix,thpt,hb,vact,hsa,tsa,vsat,sat] of lines(`
001|15|18|600|70|50|200|1000
002|15|18|600|70|50|200|1000
003|15|18|600|70|50|200|1000
004|15|18|600|70|50|200|1000
005|15|18|600|70|50|200|1000
006|15|18|600|70|50|200|1000
007|18|19|650|75|55|220|1050
008|20|22|700|85|65|260|1180
009|18|19|650|75|55|220|1050
010|22|23|750|90|65|265|1200
011|15|18|600|70|50|200|1000
012|15|18|600|70|50|200|1000
013|15|18|600|70|50|200|1000
014|15|18|600|70|50|200|1000
015|15|18|600|70|50|200|1000
016|15|18|600|70|50|200|1000
017|15|18|600|70|50|200|1000
018|20|20|700|80|60|240|1100
019|20|20|700|80|60|240|1100
020|15|18|600|70|50|200|1000
`)){
  const item=entry(`VLU-${suffix}`,null),source='https://vluwebmedia.s3.ap-southeast-1.amazonaws.com/Bang_diem_chuan_1_ce6f50ad9f.png';
  const note='Chương trình Tiêu chuẩn (Standard), không dùng ngưỡng Global Elite. Sức khỏe/luật có điều kiện học lực và điểm thi/xét tốt nghiệp bổ sung; xem bài công bố.';
  score(item,'thpt',thpt,30,{source,note});score(item,'transcript',hb,30,{source,note});
  for(const [method,value,scale] of [['combined-vact',vact,1200],['combined-hsa',hsa,150],['combined-tsa',tsa,100],['combined-vsat',vsat,null],['combined-sat',sat,1600]])
    score(item,method,value,scale,{source,note:`${note} Cột điểm bài thi dùng cho phương thức kết hợp học bạ + bài thi; chưa xác nhận đủ điều kiện chỉ bằng điểm thi này.`});
}
// VLU design/architecture routes need their specific aptitude requirements;
// do not label a general table's minimum as a verified three-academic-subject cutoff.

// TDTU: match standard Tân Hưng programmes, record ONLY the base combination's
// composite cutoff. Other combinations have explicit offsets in PL1; never
// copy the base cutoff to them. Unqualified Tourism/Auditing labels stay unmatched.
const tdtuPt1='https://admission.tdtu.edu.vn/sites/admission/files/Tuyen-sinh/2026/TB-Diemtrungtuyen/PL1-Diem-trung-tuyen-DH-2026-PT1-TanHung.pdf';
const tdtuPt2='https://admission.tdtu.edu.vn/sites/admission/files/Tuyen-sinh/2026/TB-Diemtrungtuyen/PL2-Diem-trung-tuyen-DH-2026-PT2-TanHung.pdf';
for(const [suffix,code,composite,dgnl,expression] of lines(`
001|7480101|69.7|821.01|Toán hệ số 2, Vật lý, Tiếng Anh
002|7480104|67.7|794.26|Toán hệ số 2, Vật lý, Tiếng Anh
003|7480103|67|786.65|Toán hệ số 2, Vật lý, Tiếng Anh
004|7480102|62.5|739.53|Toán hệ số 2, Vật lý, Tiếng Anh
005|7520216|77.84|921.61|Toán hệ số 2, Vật lý, Tiếng Anh
006|7580201|60.6|718.81|Toán hệ số 2, Vật lý, Tiếng Anh
007|7420201|55|634.26|Toán hệ số 2, Tiếng Anh, Sinh học
008|7460108|64.1|755.82|Toán hệ số 2, Vật lý, Tiếng Anh
009|7380101|66.45|771.54|Toán, Ngữ văn hệ số 2, Tiếng Anh
010|7340301|70.05|823.25|Toán hệ số 2, Ngữ văn, Tiếng Anh
012|7340120|75.7|900.71|Toán hệ số 2, Ngữ văn, Tiếng Anh
013|7340115|76|902.53|Toán hệ số 2, Ngữ văn, Tiếng Anh
014|7340205|70.9|831.89|Toán hệ số 2, Ngữ văn, Tiếng Anh
015|7340404|72.7|862.49|Toán hệ số 2, Ngữ văn, Tiếng Anh
016|7310206|73.25|872.81|Toán, Ngữ văn hệ số 2, Tiếng Anh
017|7210403|75.8|850.77|Ngữ văn hệ số 2, Tiếng Anh, Vẽ HHMT
`)){
  const item=entry(`TDTU-${suffix}`,code);
  score(item,'composite',composite,100,{source:tdtuPt1,combinationExpression:`Tổ hợp gốc: ${expression}`,note:'PT1 xét tuyển tổng hợp THPT + quá trình học, không phải tổng 3 môn thi. Điểm chỉ của tổ hợp gốc; tổ hợp khác có mức chênh lệch và điều kiện môn riêng trong Phụ lục 1. Chỉ chương trình tiêu chuẩn tại Tân Hưng.'});
  score(item,'dgnl',dgnl,1200,{source:tdtuPt2,note:'PT2: ĐGNL ĐHQG-HCM kèm điều kiện điểm thành phần/môn học và ngưỡng đầu vào riêng trong Phụ lục 2; không xác nhận trúng tuyển chỉ bằng điểm tổng.'});
}

export function addVerified2026Admissions(majors){
  const byId=new Map(majors.map(m=>[m.id,m]));
  for(const [id,item] of updates){
    const major=byId.get(id);
    if(!major)throw new Error(`Admission supplement has no programme: ${id}`);
    major.admissionScores=item.scores;
    major.admissionYear=2026;
    if(item.code)major.code=item.code;
    const thpt=item.scores.find(s=>s.method==='thpt'&&s.combinations.length);
    if(thpt){major.combinations=[...thpt.combinations];major.combinationsSource=thpt.combinationSource||thpt.source;}
  }
  for(const major of majors){
    if(major.universityId==='CTU'){
      const combos=ctuCombinations[major.code];
      if(!combos)throw new Error(`CTU missing 2026 combination row: ${major.code}`);
      major.combinations=[...combos.thpt];major.combinationsSource=ctuCombinationSource;
      major.admissionMethods=[{method:'thpt',combinations:combos.thpt,source:ctuCombinationSource},{method:'vsat',combinations:combos.vsat,source:ctuCombinationSource}];
      major.admissionScores=major.admissionScores.map(s=>({...s,method:'thpt-equivalent',combinations:combos.thpt,combinationScope:'programme-list',combinationSource:ctuCombinationSource,note:`${s.note} Danh mục tổ hợp THPT và V-SAT khác nhau ở một số mã; đây không phải điểm V-SAT thô.`}));
    }
    if(major.universityId==='UMP'){
      major.admissionScores=major.admissionScores.map(s=>s.method==='thpt'?{...s,combinations:['B00'],combinationScope:'specific',combinationSource:s.source}:s);
      major.combinations=['B00'];major.combinationsSource=major.admissionScores[0].source;
    }
  }
}
