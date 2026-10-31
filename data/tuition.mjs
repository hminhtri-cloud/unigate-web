const hcmusSource='https://tuyensinh.hcmus.edu.vn/hoc-phi/';
const uelSource='https://tuyensinh.uel.edu.vn/maytech_faq/hoc-phi-cua-truong-nhu-the-nao/';
const hutechSource='https://www.hutech.edu.vn/tuyensinh/tin-tuyen-sinh/14630823-hutech-cong-bo-chinh-sach-hoc-bong-tuyen-sinh-khoa-2026';
const usshSource='https://hcmussh.edu.vn/tuyensinh/hoc-phi';
const ufmSource='https://login.ufm.edu.vn/Resources/Docs/SubDomain/tuyensinh/2026/THONGTINTS2026-FINAL_compressed.pdf';
const uahSource='https://uah.edu.vn/media/6/1002-qd-ve-muc-thu-hoc-phi-dai-hoc-he-cq-nam-hoc-2026-2027-cua-khoa-2026_0001.pdf';
const hcmutSource='https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/chuong-trinh-dao-tao';
const uitSource='https://tuyensinh.uit.edu.vn/hoc-phi-hoc-bong';
const uahRates={'Kiến trúc':1_140_000,'Quy hoạch vùng và đô thị':1_120_000,'Thiết kế nội thất':1_180_000,'Thiết kế đồ họa':950_000,'Thiết kế thời trang':950_000,'Kỹ thuật xây dựng':1_140_000,'Quản lý xây dựng':1_140_000};
const usshFees={
  16_652_000:new Set(['Triết học','Tôn giáo học','Lịch sử','Địa lý học','Thông tin – Thư viện','Lưu trữ học','Ngôn ngữ Nga','Ngôn ngữ Italia','Ngôn ngữ Tây Ban Nha']),
  24_255_000:new Set(['Giáo dục học','Ngôn ngữ học','Văn học','Văn hóa học','Xã hội học','Nhân học','Đông phương học','Quản trị văn phòng','Công tác xã hội','Quản lý giáo dục','Quản trị chất lượng giáo dục','Tâm lý học giáo dục','Đô thị học','Quản lý thông tin','Việt Nam học','Nghệ thuật học','Quốc tế học','Ngôn ngữ Pháp','Ngôn ngữ Đức']),
  29_843_000:new Set(['Quan hệ quốc tế','Tâm lý học','Báo chí','Truyền thông đa phương tiện','Ngôn ngữ Anh','Ngôn ngữ Trung Quốc','Nhật Bản học','Hàn Quốc học','Quản trị dịch vụ du lịch và lữ hành','Kinh doanh thương mại Hàn Quốc']),
};
export function addVerifiedTuition(majors) {
  for (const major of majors) {
    if (major.universityId==='HCMUS' && major.tuition) {
      major.tuition={...major.tuition,year:'2026–2027',source:hcmusSource,note:'Học phí/năm cho đúng mã xét tuyển theo bảng trường. Ngành tuyển theo nhóm có thể có mức học phí khác khi phân ngành.'};
    }
    if (major.universityId==='UEL' && !major.tuition) {
      major.tuition={value:35_800_000,period:'năm học',year:'2026–2027',source:uelSource,note:'Mức dự kiến cho chương trình tiếng Việt; các chương trình tiếng Anh và Co-op có mức khác. Danh mục này chỉ nhập ngành chung, không nhập biến thể tiếng Anh.'};
    }
    if (major.universityId==='HUTECH' && !major.tuition) {
      const engineering=['001','002','003','004','009'].some(suffix=>major.id.endsWith(`-${suffix}`));
      major.tuition={value:engineering?16_500_000:17_000_000,period:'đợt',year:'Khóa 2026',source:hutechSource,note:engineering?'Nhóm 4: 247,5 triệu đồng/15 đợt toàn khóa. Trường thu khoảng 4 đợt/năm; đây là giá gốc theo đợt, chưa trừ học bổng.':'Nhóm 3: 238 triệu đồng/14 đợt toàn khóa. Trường thu khoảng 4 đợt/năm; đây là giá gốc theo đợt, chưa trừ học bổng.'};
    }
    if (major.universityId==='USSH' && !major.tuition) {
      const fee=Object.entries(usshFees).find(([,names])=>names.has(major.name));
      if (fee) major.tuition={value:Number(fee[0]),period:'năm học',year:'2025–2026',source:usshSource,note:'Mức công bố cho chương trình Chuẩn năm học 2025–2026, CHƯA phải học phí 2026–2027. Học phí thực thu tính theo tín chỉ đăng ký; dùng để tham khảo, không dùng để lọc mức học phí năm 2026–2027.'};
    }
    if (major.universityId==='UFM' && !major.tuition) {
      major.tuition={value:30_000_000,period:'năm học',year:'Khóa tuyển 2026',source:ufmSource,note:'Mức học phí chương trình Chuẩn theo trang 11 của thông tin tuyển sinh chính thức 2026 (cả ngành Ngôn ngữ Anh cũng 30 triệu/năm, nhưng đơn giá/tín chỉ khác). Chưa bao gồm học phần Giáo dục quốc phòng và an ninh; các chương trình Đặc thù/Tích hợp có học phí khác.'};
    }
    if (major.universityId==='UAH' && uahRates[major.name] && !major.tuition) {
      major.tuition={value:uahRates[major.name],period:'tín chỉ',year:'2026–2027 · khóa 2026',source:uahSource,note:'Mức theo Quyết định 1002/QĐ-ĐHKT cho chương trình chính quy khóa 2026; KHÔNG phải học phí cả năm. Tổng học phí phụ thuộc số tín chỉ, không bao gồm học phần Giáo dục quốc phòng và an ninh.'};
    }
    if (major.universityId==='HCMUT' && !major.tuition) {
      major.tuition={value:15_750_000,period:'học kỳ',year:'Thông tin tuyển sinh 2026',source:hcmutSource,approximate:true,note:'Cổng trường ghi KHOẢNG 15,75 triệu đồng/học kỳ cho chương trình Tiêu chuẩn; đây là mức tham khảo, KHÔNG phải mức học phí cố định cho toàn bộ khóa. Không tự nhân thành tiền/năm.'};
    }
    if (major.universityId==='UIT' && !major.tuition) {
      major.tuition={value:42_000_000,period:'năm học',year:'2026–2027 · lộ trình khóa 2025',source:uitSource,approximate:true,note:'Bảng lộ trình học phí do UIT công bố cho KHÓA TUYỂN 2025, dự kiến năm học 2026–2027. Chưa có xác nhận đây là học phí áp dụng cho người nhập học khóa 2026. Chỉ tham khảo, không dùng làm bộ lọc học phí hiện tại.'};
    }
  }
}
