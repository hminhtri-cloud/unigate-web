// Second source review, including official Facebook channels linked by schools.
// A missing catalogue row never means that a school has not published cutoffs.
// Public previews were read in the browser when Drive downloads were unavailable.
const checkedAt='2026-11-08';
export const recheckedAdmissionSources={
  HUFLIT:{announcement:'https://huflit.edu.vn/vi/tin-tuc/diem-chuan-huflit-2026/',table:'https://huflit.edu.vn/wp-content/uploads/2026/08/Diem-chuan-HUFLIT-10_8.png',facebook:'https://www.facebook.com/huflit.edu.vn',channelVerification:'https://huflit.edu.vn/',socialReview:'Đã xác nhận fanpage từ website; chưa trích được bài điểm chuẩn công khai. Bảng điểm lấy từ ảnh do trường đăng trên website.'},
  NTTU:{announcement:'https://ntt.edu.vn/diem-chuan-cao-nhat-truong-dh-nguyen-tat-thanh-la-22-diem/',table:'https://ntt.edu.vn/wp-content/uploads/2026/08/NTTU-Diem-chuan.jpg',facebook:'https://www.facebook.com/DaiHocNguyenTatThanh',channelVerification:'https://ntt.edu.vn/',socialReview:'Đọc được phần giới thiệu fanpage chính thức, chưa đọc được bài điểm chuẩn; đã đối chiếu ảnh bảng 70 chương trình trên website.'},
  IUH:{announcement:'https://iuh.edu.vn/vi/thong-bao/thong-bao-diem-trung-tuyen-bac-dai-hoc-he-chinh-quy-nam-2026-2236.html',table:'https://iuh.edu.vn/upload/files/2026/08/TB-971-2026.pdf',facebook:'https://www.facebook.com/sviuh',channelVerification:'https://iuh.edu.vn/',socialReview:'Fanpage được liên kết trên website; số điểm nhập từ thông báo 971/TB-ĐHCN, PDF quét 3 trang, đọc bằng OCR và đối chiếu dòng/ngành.'},
  USSH:{announcement:'https://hcmussh.edu.vn/bai-viet/truong-dh-khxh-nv-dhqg-hcm-cong-bo-diem-chuan-xet-tuyen-dai-hoc-chinh-quy-nam-2026-45197',table:'https://cms.hcmussh.edu.vn/api/file/27b225ec-52d6-479e-84c9-61cce76f35b3.jpg',facebook:'https://www.facebook.com/tuyensinh.hcmussh',channelVerification:'https://hcmussh.edu.vn/',publicPost:'https://www.facebook.com/share/p/19E8Xwak5w/',socialReview:'Đã đọc bài công khai về lịch nhập học 2026 được trường dẫn từ bài công bố điểm; bài này không phải bảng điểm. Điểm lấy từ hai ảnh Chương trình Chuẩn trên website mới, không dùng các đường tin-tuc cũ.'},
  UHS:{announcement:'https://www.uhsvnu.edu.vn/vi/search/diem-trung-tuyen-dai-hoc-nam-2026-10082026',table:'https://drive.google.com/file/d/16DnPzc4avv3NJvif551lLstBxDqKLk0p/preview',facebook:'https://www.facebook.com/VNUHCM.UHS',channelVerification:'https://www.uhsvnu.edu.vn/',socialReview:'Đã xác nhận phần giới thiệu fanpage chính thức. Ảnh điểm tổng hợp được mở qua bản xem trước công khai trên Drive do website trường dẫn; không suy luận từ lỗi tải xuống.'},
  HCMUE:{announcement:'https://tuyensinh.hcmue.edu.vn/index.php?option=com_content&view=article&id=27828&lang=vi&site=183',table:'https://drive.google.com/file/d/1lANt8eWxrU94gXvWcs32j8Jyqy4k40xc/preview',socialReview:'Đã đọc bản xem trước PDF công khai 5 trang được trang tuyển sinh chính thức dẫn. Chỉ ghép các dòng trụ sở chính SPS, không dùng phân hiệu SPT.'},
  UMT:{announcement:'https://www.umt.edu.vn/tin-tuc/truong-dai-hoc-quan-ly-va-cong-nghe-tp-hcm-umt-cong-bo-diem-trung-tuyen-dot-chinh-thuc-nam-2026',table:'https://sdn.umt.edu.vn/TB_71_2026_Diem_trung_tuyen_va_HS_nhap_hoc_DHCQ_2026_dot_chinh_thuc_36f4431fe0.pdf',facebook:'https://www.facebook.com/UMTUniversity/',channelVerification:'https://www.umt.edu.vn/',socialReview:'Đã xác nhận liên kết fanpage nhưng chưa đọc được bài điểm chuẩn bằng truy cập công khai. Đã đọc PDF thông báo 71/2026 và quy tắc 57/2026 trên website.'},
  GDU:{announcement:'https://giadinh.edu.vn/diem-chuan-truong-dai-hoc-gia-dinh-nam-2026',table:'https://giadinh.edu.vn/upload/elfinder/BICH/NewFolder/1786273790919_5885112172890775243_g8309179723613536311_c6f4f3f850d47821e3cd0fefe4f19303.jpg',facebook:'https://www.facebook.com/TruongDaihocGiaDinh',channelVerification:'https://giadinh.edu.vn/',socialReview:'Bài Góc báo chí của trường đăng lại tin Báo Lao động kèm ảnh bảng công bố mang nhận diện GDU; đã đọc từng dòng trong ảnh. Fanpage được liên kết trên website nhưng chưa đọc được bài điểm chuẩn.'},
  EIU:{announcement:'https://eiu.edu.vn/tin-tuc/eiu-cong-bo-diem-chuan-trung-tuyen-nam-2026/',facebook:'https://www.facebook.com/tuyensinheiu/',channelVerification:'https://eiu.edu.vn/tin-tuc/eiu-cong-bo-diem-chuan-trung-tuyen-nam-2026/',socialReview:'Đã đọc trang giới thiệu tuyển sinh chính thức và bài Campus Tour công khai; đây không phải nguồn số điểm. Số điểm dùng bài công bố 2026 của trường, tổ hợp dùng đề án 2026.'},
  BVU:{announcement:'https://bvu.edu.vn/truong-dai-hoc-ba-ria-vung-tau-cong-bo-diem-trung-tuyen-dai-hoc-chinh-quy-va-xet-tuyen-bo-sung-nam-2026/',socialReview:'Đã đọc bảng HTML của trường, tách rõ Điểm chuẩn và Ngưỡng đảm bảo chất lượng. Không nhập các ngưỡng học lực/điểm tốt nghiệp thành điểm chuẩn.'},
};
const patches=new Map();
const rows=table=>table.trim().split('\n').map(line=>line.split('|'));
function programme(school,suffix,code,entries){
  const id=`${school}-${suffix}`;
  if(patches.has(id))throw new Error(`Duplicate rechecked programme ${id}`);
  patches.set(id,{code,scores:entries.map(([method,value,scale,extra={}])=>{
    if(!Number.isFinite(Number(value)))throw new Error(`Invalid rechecked cutoff ${id}`);
    return {method,value:Number(value),scale,year:2026,scoreType:'cutoff',round:'Đợt 1',checkedAt,
      source:recheckedAdmissionSources[school].table||recheckedAdmissionSources[school].announcement,
      announcementSource:recheckedAdmissionSources[school].announcement,combinations:[],
      note:'Điểm chuẩn công bố năm 2026; không phải ngưỡng nhận hồ sơ. Tổ hợp và các điều kiện bổ sung xem nguồn.',...extra};
  })});
}
const huflitComboSource='https://huflit.edu.vn/vi/tin-tuc/huflit-cong-bo-thong-tin-tuyen-sinh-nam-2026/';
const huflitIt='A00,A01,C01,D01,D07,X06,X26,X27';
const huflitLaw='A01,C00,D01,D09,D14,D15,X25,X78';
const huflitMedia='D01,D09,D10,D14,D15,X25,X78';
const huflitTourism='D01,D14,D15,X26,X78';
for(const [suffix,code,thpt,hb,dgnl,combos] of rows(`
001|7220201|17|19.5|600|D01,D11,D12,D14,D15,X78,X79,X80
002|7220204|17|19.5|600|D01,D03,D04,D11,D14,D15,X78,X80
003|7220209|15|18|550|D01,D06,D14,D15
004|7220210|15|18|550|D01,D11,DD2,D14,D15
005|7310608|15|18|550|D01,A01,DD2,D06,D14,D15
006|7480201|15|18|550|${huflitIt}
007|7480103|15|18|550|${huflitIt}
008|7480107|15|18|550|${huflitIt}
009|7380101|20|21|720|${huflitLaw}
010|7380107|20|21|720|${huflitLaw}
011|7310206|15|18|550|${huflitMedia}
012|7320108|15|18|550|${huflitMedia}
013|7320104|17|19.5|600|${huflitMedia}
014|7810103|15|18|550|${huflitTourism}
015|7810201|15|18|550|${huflitTourism}
`))programme('HUFLIT',suffix,code,[
  ['thpt',thpt,30,{combinations:combos.split(','),combinationSource:huflitComboSource,combinationScope:'programme-list'}],
  ['transcript',hb,30,{note:'Cột điểm học bạ của bảng công bố. Đề án và bài điểm chuẩn mô tả phạm vi học bạ khác nhau (3 năm/lớp 12); cần xem quy chế áp dụng và điều kiện bổ sung của ngành luật.'}],
  ['dgnl',dgnl,1200],
]);

for(const [suffix,code,thpt,hb,vact,hsa] of rows(`
001|7720101|22|23|650|85
002|7720501|22|23|600|75
003|7720201|20|21|570|70
004|7720115|20|21|570|70
005|7720301|18|19|550|70
006|7720601|18|19|550|70
007|7720802|15|18|550|70
008|7310109|15|18|550|70
009|7340101|15|18|550|70
010|7340115|15|18|550|70
011|7340301|15|18|550|70
012|7380101|20|18||
013|7380107|20|18||
014|7340120|15|18|550|70
015|7510605|15|18|550|70
017|7480201|15|18|550|70
018|7480101|15|18|550|70
020|7480103|15|18|550|70
021|7480107|15|18|550|70
022|7420201|15|18|550|70
023|7540101|15|18|550|70
024|7310401|15|18|550|70
025|7210403|15|18|550|70
`)){
  const note='Bảng 70 chương trình của NTTU. Học bạ/ĐGNL: nhóm Y–Dược yêu cầu lớp 12 Tốt, tổng thi THPT ≥20 hoặc điểm xét tốt nghiệp ≥8,5; nhóm Điều dưỡng/Xét nghiệm yêu cầu Khá, tổng ≥16,5 hoặc điểm xét tốt nghiệp ≥6,5; ngành Luật yêu cầu Tốt và tổng ≥18 hoặc điểm xét tốt nghiệp ≥8,5. Các ngành còn lại còn có điều kiện nguồn tuyển.';
  const entries=[['thpt',thpt,30],['transcript',hb,30,{note}]];
  if(vact)entries.push(['dgnl',vact,1200,{note}],['dgnl-hn',hsa,150,{note}]);
  programme('NTTU',suffix,code,entries);
}

// IUH's combined route is not a stand-alone THPT or V-ACT cutoff. TCTA has
// different points; only non-TCTA catalogue programmes are matched below.
for(const [suffix,code,value] of rows(`
001|7510301|25
002|7510201|24.75
003|7510203|25.5
004|7510205|22.5
005|7510206|23.5
006|7580201|18.02
007|7480201|20
008|7210404|18
009|7720201|20.27
010|7540101|18.02
011|7540106|18.12
012|7720402|18.12
013|7420201|18.12
014|7850101|18.02
015|7510406|18.02
`))programme('IUH',suffix,code,[['combined',value,null,{
  methodLabel:'Xét kết hợp · trụ sở chính, không TCTA',
  note:'Thông báo 971/TB-ĐHCN: phương thức kết hợp xét kết quả THPT, ĐGNL ĐHQG-HCM, học tập lớp 12 và thành tích. Đây không phải điểm THPT độc lập hay điểm ĐGNL thô. Chưa xác minh thang tối đa; không lấy điểm thấp hơn của chương trình tăng cường tiếng Anh (TCTA).',
}]]);

const usshPart1='https://cms.hcmussh.edu.vn/api/file/27b225ec-52d6-479e-84c9-61cce76f35b3.jpg';
const usshPart2='https://cms.hcmussh.edu.vn/api/file/c97fc7e6-2812-4827-9ef2-770c9466e035.jpg';
const usshFormulaSource='https://cms.hcmussh.edu.vn/api/file/df6f4965-6eb7-4d6b-85da-80be554244e9.png';
const groupNotes={DT01:'ĐT01: 45% THPT + 45% ĐGNL + 10% học bạ, có hệ số/độ lệch, điểm cộng và ưu tiên theo quy định.',DT02:'ĐT02: 90% THPT + 10% học bạ, có độ lệch tổ hợp, điểm cộng và ưu tiên theo quy định.',DT03:'ĐT03: 90% ĐGNL + 10% học bạ, có hệ số giữa thành phần điểm, điểm cộng và ưu tiên theo quy định.'};
for(const [code,dt1,dt2,dt3,part] of rows(`
7140101|75.5|76.2|75.5|1
7140107|78.5|78.5|78.5|1
7140114|79|79|79|1
7210213|83.5|83.5|83.5|1
7220104|73|73.5|73|1
7220201|83.1|83.1|83.1|1
7220202|76|77|76|1
7220203|73.5|73.7|73.5|1
7220204|81.5|81.5|81.5|1
7220205|78.7|78.7|78.7|1
7220206|75.1|75.1|75.1|1
7220208|71|71.6|71|1
7229001|76|76.5|76|1
7229009|70|70|70|1
7229010|80|80.3|80|1
7229020|74|74|74|1
7229030|81|81|81|1
7229040|79.5|80|79.5|1
7310206|82.6|82.6|82.6|1
7310301|76.5|77.9|76.5|1
7310302|75|75.3|75|1
7310401|86.3|87|86.3|2
7310403|79.5|79.5|79.5|2
7310501|78.3|78.5|78.3|2
7310601|79.5|79.5|79.5|2
7310608|74.6|74.7|74.6|2
7310613|76.1|76.3|76.1|2
7310614|76.5|77|76.5|2
7310630|76|76.6|76|2
7320101|84.9|84.9|84.9|2
7320104|88.8|88.8|88.8|2
7320108|85.5|85.5|85.5|2
7320201|74.5|74.5|74.5|2
7320205|79|79.5|79|2
7320303|74|75.2|74|2
7340404|80|80.35|80|2
7340406|78|78.8|78|2
7580109|70|70|70|2
7580112|73.3|74.1|73.3|2
7760101|77.25|77.65|77.25|2
7810103|82|82|82|2
73106A1|76.9|76.9|76.9|2
`))programme('USSH',code,code,[dt1,dt2,dt3].map((value,index)=>{
  const applicantGroup=`DT0${index+1}`;
  return ['composite',value,100,{applicantGroup,methodLabel:`Xét tuyển tổng hợp · ĐT0${index+1}`,source:part==='1'?usshPart1:usshPart2,ruleSource:usshFormulaSource,note:`Chương trình Chuẩn, phương thức 500. ${groupNotes[applicantGroup]} Không phải ba phương thức điểm thi độc lập; không dùng điểm của chương trình liên kết 2+2 hay Chuẩn quốc tế.`}];
}));

for(const [suffix,code,value] of rows('001|7720101|82.6\n002|7720115|72.41\n003|7720201|73\n004|7720501|81.8\n005|7720301|67'))
  programme('UHS',suffix,code,[['composite',value,100,{note:'Phương thức 500: tổng hợp THPT + ĐGNL ĐHQG-HCM + học tập THPT; điểm đã bao gồm điểm cộng/ưu tiên. Bảng được xem trực tiếp qua ảnh Drive công khai do website trường dẫn, không lấy điểm của HIU/NTTU cùng tên ngành.'}]]);

const hcmueOffsetSource='https://tuyensinh.hcmue.edu.vn/index.php?option=com_content&view=article&id=27822&lang=vi&site=183';
for(const [suffix,code,combo,thpt,specialCombo,special] of rows(`
001|7140209|A00|29.49|A00TO|27.99
002|7140217|C00|29.8|C00VA|29.17
003|7140231|D01|27.79|D01TA|26.77
004|7140211|A00|29.78|A00LI|28.28
005|7140212|A00|29.83|A00HO|28.33
006|7140213|B00|27.66|B00SI|26.16
007|7140210|A01|25.3|A01TO|23.8
008|7140101|A00|24.25|A00TO|22.75
009|7760103|C00|23.35|C00VA|23.35
`))programme('HCMUE',suffix,code,[
  ['thpt',thpt,30,{combinations:[combo],combinationScope:'specific',ruleSource:hcmueOffsetSource,note:'Điểm của TỔ HỢP GỐC tại trụ sở SPS. Tổ hợp khác phải theo độ lệch trường công bố; không gán điểm gốc cho mọi tổ hợp và không dùng điểm phân hiệu Long An SPT.'}],
  ['dgnl-special-hcmue',special,30,{combinationExpression:`Tổ hợp gốc của phương thức kết hợp: ${specialCombo}`,ruleSource:hcmueOffsetSource,note:'Kết quả học tập THPT kết hợp thi ĐGNL chuyên biệt, không phải học bạ độc lập hay ĐGNL ĐHQG-HCM. Điểm tổ hợp gốc tại SPS; xem độ lệch và điều kiện bổ sung.'}],
]);

const umtRuleSource='https://sdn.umt.edu.vn/TB_57_2026_Nguong_diem_DBCL_dau_vao_va_quy_doi_diem_TS_HDCQ_2026_d33eed919f.pdf';
// An ninh mạng in the catalogue is NOT An toàn thông tin (7480202) in the table.
for(const [suffix,code] of rows('001|7480201\n002|7480101\n004|7320104\n005|7210403\n006|7810301\n007|7340115\n008|7340101\n009|7340120\n010|7510605'))
  programme('UMT',suffix,code,[
    ['thpt',15,30,{note:'PT01: tổng điểm tổ hợp không nhân hệ số, gồm ưu tiên và điểm cộng theo Thông báo 71/2026.'}],
    ['transcript',18,30],
    ['dgnl-equivalent',15,30,{ruleSource:umtRuleSource,note:'PT03 ghi 15 trên thang quy đổi /30. Quy tắc 57/2026 xác nhận ĐGNL gốc /1200 được quy đổi về /30; đây KHÔNG phải 15/1200. Không biến điểm sàn 600 trong quy tắc thành bản ghi điểm chuẩn thô.'}],
    ['vsat',225,450,{ruleSource:umtRuleSource,note:'PT04: 225 trong Thông báo điểm chuẩn 71/2026; thang 450 xác minh bằng quy tắc 57/2026. Không phải điểm THPT /30.'}],
    ['prior-qualification',18,30,{note:'PT05 (TC01): chỉ dành cho người có trình độ Trung cấp/cùng nhóm ngành và điều kiện tương đương theo trường; không phải học bạ đại trà cho mọi thí sinh.'}],
  ]);

for(const [suffix,code,thpt,hb,dgnl] of rows(`
001|7840104|15|15|550
002|7720301|18|16.5|650
003|7720603|18|16.5|650
004|7480208|15|15|550
005|7720501|22|20|700
006|7480107|15|15|550
007|7310401|15|15|550
008|7480201|15|15|550
009|7460108|15|15|550
010|7480103|15|15|550
011|7340101|15|15|550
012|7340115|15|15|550
013|7340201|15|15|550
014|7340120|15|15|550
015|7340205|15|15|550
016|7340122|15|15|550
017|7340301|15|15|550
018|7380101|20|18|700
019|7380107|20|18|700
020|7220201|15|15|550
021|7320104|15|15|550
`)){
  const note='Ảnh bảng công bố GDU được đăng trên website trường trong mục Góc báo chí. Học bạ/ĐGNL: Răng Hàm Mặt và nhóm Luật cần học lực Giỏi; Điều dưỡng/Phục hồi chức năng cần Khá. Các ngành còn lại theo học bạ trung bình chung 6 học kỳ; xem đầy đủ điều kiện.';
  programme('GDU',suffix,code,[['thpt',thpt,30,{note}],['transcript',hb,30,{note}],['dgnl',dgnl,1200,{note}]]);
}

const eiuComboSource='https://eiu.edu.vn/tuyen-sinh/tuyen-sinh-2026/de-an-tuyen-sinh/';
const eiuEngineering='A00,A01,X05,X06,B00,C01,C02,X01,D01,X02,D07,X25,X26';
const eiuBusiness='A00,A01,X05,X06,A07,B00,C01,C02,C03,C04,X01,D01,X02,D07,D09,D10,X25,X26';
const eiuNursing='A00,A01,B00,B03,B08,D08,C02,X01,D01,D07,D09,D10,X25';
for(const [suffix,code] of rows('001|7720301\n002|7340101\n003|7310101\n004|7480102\n005|7480103\n006|7520207\n007|7520114\n008|7520216\n009|7520103\n010|7520201')){
  const nursing=suffix==='001',combos=(nursing?eiuNursing:['002','003'].includes(suffix)?eiuBusiness:eiuEngineering).split(',');
  programme('EIU',suffix,code,[
    ['thpt',nursing?18:15,30,{combinations:combos,combinationSource:eiuComboSource,combinationScope:'programme-list'}],
    ['transcript',nursing?21:18,30,{combinations:combos,combinationSource:eiuComboSource,methodLabel:'Học bạ 3 năm THPT',note:nursing?'Ngành Điều dưỡng còn phải đáp ứng ngưỡng chất lượng/điều kiện học lực theo quy định; xem đề án và thông báo trường.':'Điểm học bạ 3 năm theo bài công bố điểm chuẩn.'}],
    ['dgnl',nursing?667:600,1200],
  ]);
}
for(const [suffix,code] of rows('001|7720201\n002|7720301\n003|7310401\n004|7310608\n005|7220201\n006|7220204\n007|7810103\n008|7810201\n009|7840101\n010|7840104\n011|7510605\n012|7510201\n013|7510102\n014|7510205\n015|7480201\n016|7380101')){
  const special=['001','002','016'].includes(suffix),value=suffix==='002'?18:20;
  const note='Bảng BVU có cột Điểm chuẩn và Ngưỡng ĐBCL riêng; chỉ nhập cột Điểm chuẩn. Dược yêu cầu học lực Tốt và tổng thi THPT ≥20 hoặc xét tốt nghiệp ≥8,5; Điều dưỡng cần Khá và tổng ≥16,5 hoặc xét tốt nghiệp ≥6,5; Luật cần Tốt và tổng ≥18 hoặc xét tốt nghiệp ≥8,5 khi xét học bạ. Xem nguồn tuyển của trường.';
  programme('BVU',suffix,code,[['thpt',special?value:15,30,{note}],['transcript',special?value:18,30,{note}]]);
}

const unmatchedNotes={
  'NTTU-016':'Đã tìm được bảng điểm 70 chương trình 2026, chưa khớp được Công nghệ tài chính như một mã độc lập trong bảng; không mượn điểm ngành Tài chính – Ngân hàng.',
  'NTTU-019':'Đã tìm được bảng điểm 70 chương trình 2026 nhưng chưa khớp Khoa học dữ liệu như một mã độc lập; không dùng điểm Khoa học máy tính hoặc Khoa học vật liệu để thay.',
  'UMT-003':'Website hiện giới thiệu An ninh mạng, nhưng bảng điểm chính thức 2026 ghi An toàn thông tin mã 7480202; cần xác minh thay đổi tên/mã trước khi ghép điểm.',
};
export function addRechecked2026Admissions(majors,universities){
  const byId=new Map(majors.map(m=>[m.id,m]));
  for(const [id,patch] of patches){
    const major=byId.get(id);
    if(!major)throw new Error(`Rechecked cutoff has no catalogue programme ${id}`);
    if(major.admissionScores.length)throw new Error(`Recheck would overwrite existing cutoffs ${id}`);
    major.admissionScores=patch.scores;major.admissionYear=2026;major.code=patch.code;
    const thpt=patch.scores.find(s=>s.method==='thpt'&&s.combinations.length);
    if(thpt){major.combinations=[...thpt.combinations];major.combinationsSource=thpt.combinationSource||thpt.source;}
  }
  for(const [id,note] of Object.entries(unmatchedNotes))if(byId.has(id))byId.get(id).admissionMissingReason=note;
  for(const school of universities){
    const review=recheckedAdmissionSources[school.id];
    if(review)school.admissionsReview={...review,checkedAt,status:'published',note:'Trường có công bố điểm chuẩn. Mục chưa có điểm trong UniGate không đồng nghĩa trường không công bố.'};
  }
}
