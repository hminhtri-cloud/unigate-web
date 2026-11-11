import {ctuDurations} from './ctu-duration-verified.mjs';
import {guideEvidence} from './major-guide-evidence.mjs';

export const deepResearchDate='2026-11-09';
const hcmuteSource='https://tuyensinh.hcmute.edu.vn/#/dh-chinh-quy/thong-tin-tuyen-sinh-dh-chinh-quy/HCM-UTE-CONG-BO-DIEM-CHUAN-TRUNG-TUYEN-CAC-NGANH-DAI-HOC-CHINH-QUY-NAM-2026-1786270438230';
const hubSource='https://tuyensinh.hub.edu.vn/tin-tuyen-sinh/thong-bao-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026';
const hubInfo='https://tuyensinh.hub.edu.vn/tin-tuyen-sinh/thong-tin-tuyen-sinh-dai-hoc-chinh-quy-nam-2026-truong-dai-hoc-ngan-hang-tp-hcm-ma-truong-nhs';
const utc2Source='https://tuyensinh.utc2.edu.vn/vi/thong-bao-ve-viec-cong-bo-diem-chuan-dai-hoc-chinh-quy-nam-2026-2460';
const ulawSource='https://tuyensinh.hcmulaw.edu.vn/thong-tin-tuyen-sinh-dai-hoc/cong-bo-diem-xet-trung-tuyen-trinh-do-dai-hoc-hinh-thuc-dao-tao-chinh-quy-nam-2026-776.html';
const ulawFees='https://tuyensinh.hcmulaw.edu.vn/thong-tin-tuyen-sinh-dai-hoc/hoc-phi-cac-chuong-trinh-dao-tao-trinh-do-dai-hoc-hinh-thuc-dao-tao-chinh-quy-khoa-51-nam-hoc-2026-2027-779.html';
const tdtuFees='https://admission.tdtu.edu.vn/hoc-tai-tdtu/hoc-phi-hoc-bong-2026';
const uahPlans=[
  ['Kiến trúc',5,156,'kien-truc'],
  ['Quy hoạch vùng và đô thị',5,159,'quy-hoach-vung-va-do-thi'],
  ['Thiết kế nội thất',5,150,'thiet-ke-noi-that'],
  ['Thiết kế đồ họa',4,121,'thiet-ke-do-hoa'],
  ['Thiết kế thời trang',4,121,'thiet-ke-thoi-trang'],
  ['Kỹ thuật xây dựng',5,156,'ky-thuat-xay-dung'],
  ['Quản lý xây dựng',5,156,'quan-ly-xay-dung'],
];
const uahSummaries={
  'Kiến trúc':['Học thực hành thiết kế kiến trúc theo mô hình họa thất/studio, kết hợp lý thuyết, kiến thức cơ sở và chuyên ngành, đồ án, thực tập và trải nghiệm nghề nghiệp.','Thiết kế và tư vấn kiến trúc, triển khai đồ án, tham gia dự án xây dựng và quản lý không gian kiến trúc theo năng lực, điều kiện hành nghề'],
  'Quy hoạch vùng và đô thị':['Học nền tảng kiến trúc, quy hoạch và thiết kế không gian đô thị; kết hợp đồ án chuyên ngành, phân tích lãnh thổ và thực hành nghề nghiệp.','Hỗ trợ quy hoạch, thiết kế đô thị, phân tích không gian và quản lý phát triển đô thị theo chuyên môn'],
  'Thiết kế nội thất':['Học mỹ thuật, kiến trúc, vật liệu, cấu tạo hoàn thiện, chiếu sáng và công nghệ thiết kế; thực hiện đồ án chuyên ngành, thực tập nghề nghiệp và đồ án tốt nghiệp.','Thiết kế và tư vấn nội thất, triển khai bản vẽ, diễn họa, tham gia quản lý thiết kế theo năng lực'],
  'Thiết kế đồ họa':['Học mỹ thuật ứng dụng, kiến thức cơ sở và chuyên ngành thiết kế đồ họa, các học phần thực hành, trải nghiệm và đồ án để phát triển năng lực thiết kế.','Thiết kế đồ họa, truyền thông thị giác, phát triển sản phẩm sáng tạo theo hồ sơ năng lực'],
  'Thiết kế thời trang':['Học kiến thức nền tảng và chuyên ngành mỹ thuật ứng dụng, thiết kế thời trang, thực hành và đồ án để đáp ứng chuẩn đầu ra kiến thức, kỹ năng, thái độ của ngành.','Thiết kế thời trang, phát triển mẫu, tham gia sản xuất và dự án thiết kế theo năng lực'],
  'Kỹ thuật xây dựng':['Học kiến thức khoa học cơ bản, thiết kế kết cấu, thi công và quản lý xây dựng; thực hành, thí nghiệm, đồ án, thực tập và ứng dụng BIM, công nghệ số.','Thiết kế kết cấu, thi công, giám sát và tham gia quản lý dự án xây dựng theo chuyên môn và điều kiện hành nghề'],
  'Quản lý xây dựng':['Học nền tảng kỹ thuật, kinh tế và quản lý; tập trung quản lý dự án, tổ chức thi công, định giá, hợp đồng xây dựng, BIM và trải nghiệm thực tế doanh nghiệp.','Nghiệp vụ quản lý dự án, chi phí, hợp đồng và tổ chức thi công theo năng lực, kinh nghiệm'],
};
const hcmuteRows=[
  ['001','7480201V',24.01,3],['002','7510303V',26.83,4],
  ['003','7510203V',26.09,4],['004','7510205V',24.57,4],
  ['005','7510301V',25.93,4],['006','7510201V',25.78,3],
  ['007','7140246V',23.59,3],['008','7380101V',20.5,3],
];
const hubRows=[['001','7340201',23.48],['002','7340301',23.48],['003','7340101',22.77]];
const tdtuGroup1=new Set(['Kế toán','Kiểm toán','Kinh doanh quốc tế','Marketing','Quản trị nhân lực','Công nghệ tài chính','Luật','Khoa học dữ liệu','Quan hệ quốc tế','Du lịch']);
const tdtuGroup2=new Set(['Khoa học máy tính','Hệ thống thông tin','Kỹ thuật phần mềm','Mạng máy tính và truyền thông dữ liệu','Kỹ thuật điều khiển và tự động hóa','Kỹ thuật xây dựng','Công nghệ sinh học','Thiết kế đồ họa']);

function duration(major,years,source,extra={}) {
  major.duration={years,source,checkedAt:deepResearchDate,quote:`Thời gian đào tạo: ${years.toLocaleString('vi-VN')} năm`,programId:major.id,universityId:major.universityId,code:major.code,educationLevel:major.educationLevel||'university',...extra};
}
function appendScore(major,score) {
  if(major.admissionScores.some(s=>s.source===score.source&&s.method===score.method&&s.value===score.value&&JSON.stringify(s.combinations||[])===JSON.stringify(score.combinations||[])&&s.combinationExpression===score.combinationExpression))throw new Error(`Duplicate deep research score ${major.id}`);
  major.admissionYear=2026;
  major.admissionScores.push({year:2026,scoreType:'cutoff',round:'Đợt 1',checkedAt:deepResearchDate,combinations:[],...score});
}

export function addDeepResearch2026(majors,universities) {
  for(const major of majors){
    const guide=guideEvidence.find(e=>e.universityId===major.universityId&&e.educationLevel===(major.educationLevel||'university')&&e.name.toLocaleLowerCase('vi')===major.name.toLocaleLowerCase('vi')&&(!e.code||e.code===major.code));
    if(guide)duration(major,guide.years,guide.url,{quote:guide.durationQuote,checkedAt:guide.checkedAt});
    if(major.universityId==='CTU'){
      const row=ctuDurations.get(major.code);
      if(row)duration(major,row.years,row.source,{quote:row.quote});
    }
    if(major.universityId==='TDTU'&&(tdtuGroup1.has(major.name)||tdtuGroup2.has(major.name))){
      major.tuition={value:tdtuGroup1.has(major.name)?31_260_000:36_590_000,period:'năm học',year:'2026–2027 · chương trình Tiêu chuẩn tại TP.HCM',source:tdtuFees,publishedAverage:true,checkedAt:deepResearchDate,note:'Mức trung bình năm học 2026–2027 do trường công bố (dự kiến) cho đúng nhóm ngành chương trình Tiêu chuẩn tại TP.HCM; không dùng mức của Phân hiệu Khánh Hòa hoặc chương trình Tiên tiến/tiếng Anh.'};
    }
    if(major.universityId==='UAH'){
      const plan=uahPlans.find(([name])=>name===major.name);
      if(plan){
        const [,years,credits,slug]=plan,source=`https://uah.edu.vn/${slug}-chinh-quy-chuong-trinh-chuan`;
        major.program='Đại học chính quy · Chương trình Chuẩn tại TP.HCM';
        [major.description,major.careers]=uahSummaries[major.name];
        duration(major,years,source,{credits,quote:`TỔNG CỘNG: ${credits} tín chỉ / ${years} năm`});
        if(major.tuition?.period==='tín chỉ')major.tuition={...major.tuition,checkedAt:deepResearchDate,annualBasis:{kind:'credits',units:credits,years,source,programId:major.id,cohort:2026,note:'Ước tính lấy đơn giá tín chỉ khóa 2026 × tổng tín chỉ chương trình Chuẩn đang công bố ÷ số năm. Phân bổ đều để tham khảo; chưa tính tăng học phí, học lại, học phần ngoài chương trình và khoản thu riêng. Trang chương trình không khẳng định tất cả tín chỉ được thu cùng đơn giá.'}};
      }
    }
    if(major.universityId==='TDC'&&major.educationLevel==='college')duration(major,2.5,'https://tuyensinh.tdc.edu.vn/',{quote:'30 ngành cao đẳng chính quy · 2,5 năm (5 học kỳ)',note:'Chỉ áp dụng danh mục cao đẳng chính quy; không áp dụng trung cấp 2 năm trên cùng trang.'});
    if(major.id==='UIT-009')duration(major,4,'https://tuyensinh.uit.edu.vn/nganh-dao-tao/nganh-khoa-hoc-du-lieu',{credits:129,quote:'Chương trình trong 4 năm (08 học kỳ chính), tối thiểu 129 tín chỉ (bao gồm 12 tín chỉ ngoại ngữ).'});
    if(major.id==='TVU-7480201')duration(major,4,'https://tuyensinh.tvu.edu.vn/nganh-cong-nghe-thong-tin-7480201-dat-kiem-dinh-chat-luong-giao-duc-quoc-te-abet/',{credits:150,quote:'Kỹ sư ngành Công nghệ thông tin: 4 năm (8 học kỳ, 150 tín chỉ).'});
    if(major.id==='DLSG-002'||major.id==='DLSG-003')duration(major,2.5,`https://dulichsaigon.edu.vn/${major.id==='DLSG-002'?'quan-tri-lu-hanh':'huong-dan-du-lich'}/`,{quote:'Thời gian 2,5 năm · 5 học kỳ'});
    if(major.universityId==='DLSG'){
      major.admissionYear=2026;
      const row={
        'DLSG-001':[12_000_000,13_000_000,5,2.5,'quan-tri-khach-san'],
        'DLSG-002':[11_000_000,12_000_000,5,2.5,'quan-tri-lu-hanh'],
        'DLSG-003':[12_000_000,14_000_000,5,2.5,'huong-dan-du-lich'],
      }[major.id];
      if(row){const [min,max,units,years,slug]=row,source=`https://dulichsaigon.edu.vn/${slug}/`;major.tuition={value:min,maxValue:max,period:'học kỳ',year:'Khóa tuyển 2026',source,checkedAt:deepResearchDate,annualBasis:{kind:'periods',units,years,source,programId:major.id,cohort:2026,note:'Ước tính từ khoảng phí/học kỳ × 5 học kỳ ÷ 2,5 năm theo lộ trình trường; không trừ học bổng/hỗ trợ hoặc cộng chi phí thực tập, sinh hoạt.'},note:'Khoảng học phí trung bình/học kỳ do trường công bố; thực thu và khoản ngoài học phí xem nguồn.'};}
    }
  }
  for(const [suffix,code,value,page] of hcmuteRows){
    const major=majors.find(m=>m.id===`HCMUTE-${suffix}`);
    if(!major)throw new Error(`Missing HCMUTE programme ${suffix}`);
    if(suffix==='002'){major.originalCatalogName=major.name;major.name='Công nghệ kỹ thuật điều khiển và tự động hóa';}
    major.code=code;major.program='Đại học chính quy · đào tạo bằng tiếng Việt';
    appendScore(major,{method:'combined',value,scale:null,source:`https://tuyensinh.hcmute.edu.vn/pictures/HCM-UTE-CONG-BO-DIEM-CHUAN-TRUNG-TUYEN-CAC-NGANH-DAI-HOC-CHINH-QUY-NAM-2026-${page}-1786270438239.jpg`,announcementSource:hcmuteSource,methodLabel:'Xét tuyển kết hợp · chương trình tiếng Việt',note:'Quyết định 76/QĐ-HĐTSĐHCQ ngày 09/08/2026, đúng mã hậu tố V; không lấy chương trình tiếng Anh, Việt–Nhật hoặc Bình Phước. Bảng không ghi thang tối đa; giữ nguyên điểm kết hợp, không gán thành điểm THPT độc lập.'});
  }
  for(const [suffix,code,value] of hubRows){
    const major=majors.find(m=>m.id===`HUB-${suffix}`);major.code=code;
    appendScore(major,{method:'thpt-equivalent',value,scale:30,source:hubSource,note:'Mốc trúng tuyển 2026 dùng chung cho các tổ hợp, đã quy về thang 30 và gồm ưu tiên. Tổng hợp/V-SAT được trường quy đổi; không phải điểm thô riêng của các kỳ thi.'});
    major.tuition={value:12_765_500,period:'học kỳ',year:'2026–2027 · chương trình chính quy Chuẩn',source:hubInfo,checkedAt:deepResearchDate,note:'Mức dự kiến/học kỳ của chương trình Chuẩn theo mục 4.3 thông tin tuyển sinh 2026; không dùng mức của tiếng Anh bán phần, Đặc biệt hoặc Elite. Chưa có đủ lộ trình tín chỉ/học kỳ đúng chương trình để quy đổi năm.'};
  }
  for(const [suffix,code,thpt,combined,dgnl] of [
    ['001','GSA18',20.08,24.73,688.22],['002','GSA19',21.49,25.86,736.16],
    ['003','GSA08',25.45,null,915.64],['004','GSA07',20.32,null,696.38],
    ['005','GSA20',20.95,25.43,717.8],['006','GSA11',23.65,null,828.6],
  ]){
    const major=majors.find(m=>m.id===`UTC2-${suffix}`);major.code=code;major.verified=true;
    appendScore(major,{method:'thpt',value:thpt,scale:30,source:utc2Source,note:'PT1, đúng mã GSA tại Phân hiệu TP.HCM; không lấy bảng GHA Hà Nội. Chưa trích đủ tổ hợp gắn với PT1; tiêu chí phụ thứ tự nguyện vọng chỉ áp dụng khi đúng bằng điểm trúng tuyển, xem bảng gốc.'});
    if(combined!==null)appendScore(major,{method:'combined',value:combined,scale:30,source:utc2Source,methodLabel:'PT2 · học bạ kết hợp điều kiện điểm thi THPT',note:'PT2 là xét kết hợp học bạ và điều kiện điểm thi, không phải học bạ độc lập.'});
    appendScore(major,{method:'dgnl',value:dgnl,scale:1200,source:utc2Source,note:'PT3 GSA: điểm ĐGNL ĐHQG-HCM thang 1200; không dùng cột HSA /150 của GHA.'});
  }
  for(const [suffix,value] of [['001',20.5],['002',21.25],['003',20],['004',17],['005',19.5]]){
    const major=majors.find(m=>m.id===`ULAW-${suffix}`);
    appendScore(major,{method:'thpt-equivalent',value,scale:30,source:ulawSource,...(suffix==='001'?{combinations:['C00'],combinationScope:'specific',combinationSource:ulawSource}:{}),note:'Điểm xét trúng tuyển không nhân hệ số, áp dụng THPT PT5 và điểm sau quy đổi PT2/3/4; khu vực 3. Không coi đây là điểm thô ĐGNL hoặc học bạ.'});
    if(suffix==='001')appendScore(major,{method:'thpt-equivalent',value:20,scale:30,source:ulawSource,combinationExpression:'Các tổ hợp khác C00',note:'Ngành Luật: C00 có ngưỡng 20,5; các tổ hợp khác 20. Giữ nguyên mô tả của bảng, chưa tự liệt kê các mã tổ hợp khác.'});
    major.tuition={value:1_200_000,...(suffix==='002'?{maxValue:1_800_000}:{}),period:'tín chỉ',year:'2026–2027 · Khóa 51 tại cơ sở chính',source:ulawFees,checkedAt:deepResearchDate,note:suffix==='002'?'Luật thương mại quốc tế: 1,2 triệu/tín chỉ giảng dạy tiếng Việt, 1,8 triệu/tín chỉ giảng dạy tiếng nước ngoài. Chưa đối chiếu số tín chỉ từng nhóm để ước tính/năm.':'Đơn giá cho chương trình tiếng Việt/cử nhân Ngôn ngữ Anh pháp lý tương ứng tại cơ sở chính. Không lấy mức 720.000đ/tín chỉ ngành Luật ở Phân hiệu Quảng Trị.'};
  }
  const reviews={
    HCMUTE:{announcement:hcmuteSource,facebook:'https://www.facebook.com/SPKT.tuyensinh',note:'Đã mở nội dung động và đọc ảnh quyết định trang 1–5, chỉ ghép đúng 8 chương trình tiếng Việt; không dùng nhầm điểm chương trình ngôn ngữ khác.',socialReview:'Website trường dẫn fanpage SPKT.tuyensinh. Đã thử mở fanpage công khai ngày 09/11/2026 nhưng không tải xong; không tuyên bố đọc được bảng Facebook. Điểm lấy từ ảnh công bố trên website.'},
    HUB:{announcement:hubSource,facebook:'https://www.facebook.com/tuyensinhdaihocnganhang/',note:'Đã đọc bảng ảnh nhúng trong bài chính thức. Ghép 3 mã chương trình Chuẩn; mục Ngân hàng trong danh mục cũ chưa đối chiếu được thành mã riêng nên không mượn điểm Tài chính–Ngân hàng.',socialReview:'Fanpage được dẫn trong thông tin tuyển sinh chính thức; đã thử truy cập nhưng hết thời gian tải ngày 09/11/2026. Số liệu dùng bảng website, không dùng khoảng học phí FAQ chung thay mức của đúng chương trình.'},
    UTC2:{announcement:utc2Source,facebook:'https://www.facebook.com/utc2hcmc',note:'Đã đọc ảnh có tiêu đề GSA và cột PT1 /30, PT2 /30, PT3 /1200 cho đúng cơ sở TP.HCM, ghép 6 chương trình.',socialReview:'Website phân hiệu dẫn fanpage; dùng bảng website, không mượn bảng GHA hoặc lời bình luận.'},
    ULAW:{announcement:ulawSource,facebook:'https://www.facebook.com/tuyensinhdhluattphochiminh',note:'Đã đọc ảnh điểm 2026 và ảnh học phí Khóa 51; tách riêng Luật C00/các tổ hợp khác và loại Phân hiệu Quảng Trị khỏi dữ liệu TP.HCM.',socialReview:'Fanpage được dẫn ở cổng tuyển sinh. Bảng số liệu lấy từ bài/ảnh trên website chính thức.'},
  };
  for(const university of universities)if(reviews[university.id]){
    university.admissionsReview={...reviews[university.id],status:'published',channelVerification:'Fanpage được dẫn từ cổng tuyển sinh chính thức của trường.',announcementReadable:true,checkedAt:deepResearchDate};
    const programs=majors.filter(m=>m.universityId===university.id);
    university.coverage=`${programs.length} chương trình chọn lọc trong danh mục; ${programs.filter(m=>m.admissionScores.length).length} có điểm trúng tuyển 2026 đã đối chiếu. ${reviews[university.id].note} Đợt rà nguồn ${deepResearchDate}.`;
  }
}
