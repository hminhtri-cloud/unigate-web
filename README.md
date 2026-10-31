# UniGate — Student Edition (Web)

Ứng dụng web chạy trên máy, tách biệt với dự án WinForms gốc tại `../My_project_UniGate-main`. Frontend React + Vite, API Node.js + Express, database **MySQL 8.4** chạy bằng Docker Compose. Không dùng mật khẩu, tài khoản hoặc database của dự án cũ.

## Chạy lần đầu

Cần **Node.js 22+**, npm và Docker Desktop đang chạy. Dùng terminal:

```bash
cd /Users/huynhminhtri/project/unigate
npm install
npm run setup
npm run db:up
npm run db:seed
npm run dev
```

Mở **http://localhost:5185/** rồi tạo tài khoản học sinh. `npm run setup` sinh mật khẩu MySQL ngẫu nhiên trong `.env`, chỉ thực hiện một lần; không ghi đè file đã có. Docker dùng cổng **127.0.0.1:3310** và volume `unigate_unigate_mysql`, không đụng tới các MySQL khác trên máy.

Những lần sau chỉ cần `npm run db:up` và `npm run dev`. Dừng server bằng `Ctrl+C`; dừng MySQL bằng `docker compose stop` (dữ liệu vẫn lưu). Để chạy một server đơn sau khi build: `npm run build && npm start`, rồi mở **http://localhost:3001/**.

Nếu cổng 3310 đã được sử dụng, đổi `MYSQL_PORT` trong `.env` sang một cổng trống trước khi chạy `npm run db:up`. Nếu 3001 hoặc 5185 đã bị chiếm, dừng ứng dụng trên cổng đó trước khi chạy (Vite proxy và Playwright đã cấu hình dùng các cổng cố định này).

## Chức năng

- Đăng ký, đăng nhập, đổi mật khẩu, cập nhật hồ sơ; dữ liệu từng tài khoản tách biệt.
- Trắc nghiệm 60 câu Holland/RIASEC, tự lưu bản nháp, lưu lịch sử kết quả, biểu đồ, in và xuất JSON.
- Tra cứu 19 trường (8 thuộc ĐHQG-HCM, 10 trường khác tại TP.HCM và **Đại học Cần Thơ**) cùng 423 ngành/chương trình chọn lọc; tìm không dấu, lọc nhóm trường/trường/ngành, học phí, tổ hợp đã đối chiếu, nguồn; gợi ý ngành theo sở thích (tham khảo).
- Bộ lọc **Nhóm trường** cho chọn theo hệ thống (ĐHQG-HCM / 10 trường khác / Đại học Cần Thơ) hoặc loại hình (**Trường công / Trường tư**). Hiện có 18 trường công và 1 trường tư (HUTECH); chọn nhóm sẽ đặt lại trường cụ thể đã chọn.
- Hai tab trên trang Ngành & Trường: **Điểm THPT /30** (160 ngành) và **Xét tổng hợp /100** (122 ngành). Trường chỉ có điểm tổng hợp như Bách khoa, UIT tự mở tab phù hợp khi chọn trường. Điểm /30 trường công bố từ **cùng phương thức tổng hợp** (HCMUS) chỉ nằm ở tab tổng hợp, không xem là một phương thức THPT độc lập. **141 ngành chưa có điểm được xác minh** vẫn có thể tra cứu bằng liên kết “Xem ngành chưa có dữ liệu điểm” bên dưới danh sách, không bị ẩn khỏi hệ thống.
- Trong mỗi tab, chọn **“Holland → điểm cao khi hòa”** để lọc ngành theo Holland trước, xếp **chỉ số phù hợp Holland giảm dần**, và **chỉ khi bằng chỉ số mới dùng điểm cùng phương thức** để phân thứ tự. Tab tổng hợp **gom theo trường trước khi xếp**, không so trực tiếp hai công thức tổng hợp khác trường. Điểm ĐGNL /1200 vẫn hiện trên thẻ và trang chi tiết; không tự quy đổi thành điểm /30 hoặc /100. Nút “Tìm ngành theo sở thích” trên trang kết quả mở tab THPT mặc định và cho đổi sang tổng hợp.
- Lưu, sắp xếp, ghi chú và xuất danh sách nguyện vọng cá nhân; so sánh tối đa 3 ngành.
- Lưu điểm các môn THPT, tính tổng điểm các tổ hợp 3 môn (chưa ưu tiên), lưu riêng điểm ĐGNL (chưa quy đổi), xem biểu đồ điểm cá nhân.

## Nguồn dữ liệu và giới hạn

Danh mục ĐHQG-HCM gồm UIT, HCMUS, HCMUT, IU, UEL, USSH, UHS và AGU (trường đặt tại An Giang). Thêm **10 trường tại TP.HCM ngoài ĐHQG-HCM**: UEH, Đại học Y Dược TP.HCM (UMP), ĐH Sư phạm TP.HCM (HCMUE), ĐH Công nghệ Kỹ thuật TP.HCM (HCMUTE), ĐH Luật TP.HCM (ULAW), ĐH Nông Lâm TP.HCM (NLU), ĐH Tài chính – Marketing (UFM), ĐH Kiến trúc TP.HCM (UAH), ĐH Mở TP.HCM (OU), ĐH Công nghệ TP.HCM (HUTECH). Đây là **danh sách tuyển chọn để khám phá, không phải bảng xếp hạng top 10**. Danh mục mở rộng mới gồm 87 ngành chọn lọc; mỗi trường/ngành có nguồn gốc tham khảo, một số chỉ xác nhận là ngành đào tạo chứ chưa xác nhận chỉ tiêu tuyển sinh từng năm. UEH chỉ chọn chương trình tại TP.HCM; HCMUE/NLU/UAH không gộp phân hiệu tỉnh khác; HUTECH không lấy chương trình *dự kiến* năm 2027. Không tự suy đoán học phí, điểm chuẩn, mã xét tuyển hoặc tổ hợp chưa được xác minh.

Đại học Cần Thơ: [danh mục 127 mã xét tuyển 2026](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/841-danh-muc-nganh-va-chi-tieu-tuyen-sinh-dhcq.html), [thông báo 2532 và bảng điểm chuẩn](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/1163-thong-bao-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026.html), [bảng học phí theo mã ngành](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/944-hoc-phi.html). Đã nhập điểm và học phí **đúng 127/127 mã**; điểm /30 là ngưỡng chung cho THPT/học bạ/V-SAT **sau khi trường quy đổi**, không phải điểm thô của ba kỳ thi. Học phí là **mức bình quân/năm học khóa tuyển 2026**; thực thu phụ thuộc tín chỉ. Ngành đào tạo giáo viên có chính sách hỗ trợ học phí theo điều kiện nhà trường. Mã H/S vẫn trong danh mục CTU nhưng học tại cơ sở Hậu Giang/khu Sóc Trăng theo thông báo.

Mỗi ngành có liên kết tới nguồn; danh mục **chọn lọc, chưa bao phủ toàn bộ chương trình/tổ hợp**. Phần dữ liệu HCMUS ghi 39 mã xét tuyển từ [trang tuyển sinh 2026](https://tuyensinh.hcmus.edu.vn/2026-thong-tin-tuyen-sinh/) và học phí năm 2026–2027 chỉ với các mã đối chiếu được. HCMUT ghi 29 mã chương trình **tiêu chuẩn** và điểm **xét tuyển tổng hợp / 100** từ [bảng tuyển sinh 2026](https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/nganh-va-chi-tieu), không so trực tiếp với tổng 3 môn / 30. Danh mục 43 ngành AGU dựa trên [nguồn thứ cấp](https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-an-giang-QSA.html) vì cổng tuyển sinh trường yêu cầu CAPTCHA; app ghi nhãn nguồn thứ cấp và không nhập số liệu chưa kiểm chứng.

Ngoài Cần Thơ, điểm chuẩn 2026 có nguồn theo đúng ngành tại **155 bản ghi** của HCMUS, UIT, IU, UEL, HCMUT, UEH, UAH, UMP, NLU và OU. Trên thẻ/chi tiết ngành, mỗi điểm ghi rõ **THPT**, **ĐGNL**, **xét tuyển tổng hợp** hay **quy đổi theo THPT**, năm, thang và thông báo chính thức; nhiều phương thức được hiển thị song song khi trường công bố. HCMUS có cột thang 30 và 100 của **cùng một phương thức tổng hợp**, nên cột 30 được đánh dấu quy đổi, không phải ngưỡng THPT độc lập. UAH công bố điểm đã quy đổi tương đương về THPT; UMP dùng tổ hợp gốc B00; NLU có chung một cột THPT/THPT+HB/THPT+CC và một cột ĐGNL riêng. Không lấy điểm sàn, điểm trung bình trúng tuyển hoặc số liệu của chương trình khác để thay điểm chuẩn. Các trường/ngành còn thiếu số là **chưa có bản ghi xác minh**, không phải điểm 0. Mã và số liệu đã đối chiếu nằm tại `data/admissions.mjs` và `data/ctu.mjs`, kèm URL của trường.

**Tổng độ phủ hiện tại:** 282/423 ngành có điểm chuẩn đúng mã/chương trình; 283/423 ngành có số liệu học phí kèm nguồn. Học phí Nhân văn được trường công bố cho **2025–2026**, chỉ để tham khảo. Học phí UIT dự kiến năm học 2026–2027 được công bố trong **lộ trình khóa tuyển 2025**: không xem là mức đã chốt cho khóa 2026. HUTECH thu **theo đợt** khóa 2026; Kiến trúc thu **theo tín chỉ** khóa 2026; Bách khoa ghi **khoảng 15,75 triệu/học kỳ** cho chương trình Tiêu chuẩn, không tự nhân thành mức phí/năm. UFM công bố **30 triệu/năm** cho chương trình Chuẩn khóa 2026. Bộ lọc học phí/năm không dùng số cũ, dự kiến khóa khác, theo tín chỉ/học kỳ/đợt. Ngành chưa có mức phí chính xác vẫn để trống, không lấy giá trường khác hoặc nhóm ngành không khớp.

60 câu tiếng Việt do UniGate biên soạn mới dựa trên khái niệm [Holland/RIASEC](https://www.onetcenter.org/IP.html); **không phải bộ O*NET chính thức hay thang đo tâm lý đã chuẩn hóa**. Liên hệ giữa Holland và ngành nghề do UniGate biên tập; chỉ số gợi ý **không phải khả năng đỗ**. Nguyện vọng trong ứng dụng **không gửi** tới hệ thống Bộ GD&ĐT. Chi tiết nguồn và cách tính luôn có ở trang **Nguồn dữ liệu**.

## Kiểm tra

```bash
npm test
npm run build
npm run test:e2e
```

`npm test` cần MySQL đã bật và dữ liệu đã nạp; các tài khoản thử nghiệm tự được xóa. `npm run test:e2e` cần cài Chromium lần đầu bằng `npx playwright install chromium`, kiểm thử thao tác học sinh trên trình duyệt thật, desktop lẫn mobile. `npm run db:seed` có thể chạy lại để cập nhật dữ liệu trường/ngành và câu hỏi; không xóa tài khoản hoặc kết quả đã lưu. Sửa dữ liệu tại `data/catalog.mjs`, `data/ctu.mjs`, `data/admissions.mjs`, `data/tuition.mjs` và `data/questions.mjs`, chạy lại `npm run db:seed`.

> Để xóa hoàn toàn database của dự án này, `docker compose down -v` sẽ xóa volume và **toàn bộ dữ liệu học sinh**. Không dùng lệnh đó nếu muốn giữ dữ liệu.
# unigate
