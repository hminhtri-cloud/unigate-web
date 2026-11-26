# UniGate — Student Edition (Web)

Ứng dụng web tách biệt với dự án WinForms gốc tại `../My_project_UniGate-main`. Frontend React + Vite, API Node.js + Express, database **MySQL 8.4**. Máy local chạy MySQL bằng Docker Compose; Vercel cần một MySQL có thể kết nối qua mạng. Không dùng mật khẩu, tài khoản hoặc database của dự án cũ.

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

## Triển khai Vercel

Kết nối **repository chứa bản web mới nhất** với Vercel, chọn thư mục gốc của dự án. `vercel.json` cấu hình Vite build vào `dist/` và chuyển `/api/*` tới Express function `api/index.js`. Không dùng `npm start` trên Vercel: `server/index.mjs` chỉ dành cho server chạy liên tục ở máy local. Dòng cảnh báo `engines.node >=22` hoặc cảnh báo cấu hình npm xuất hiện khi cài gói không tự nó là lỗi build; xem dòng `Error` cuối log hoặc `/api/health` để phân biệt lỗi build với lỗi kết nối database khi chạy.

**MySQL trên Vercel phải là dịch vụ MySQL bên ngoài mà function kết nối được.** Container Docker ở máy cá nhân (`127.0.0.1:3310`) không thể truy cập từ Vercel. Trong **Project → Settings → Environment Variables**, đặt `MYSQL_HOST`, `MYSQL_PORT` (thường `3306`), `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`; nếu nhà cung cấp yêu cầu kết nối TLS, đặt `MYSQL_SSL=true` (xác minh chứng chỉ máy chủ). Đặt biến cho từng môi trường Vercel muốn chạy; function tự đánh dấu cookie đăng nhập `Secure` trên Vercel. Không đưa mật khẩu vào repository.

Tạo database MySQL bên ngoài và nạp danh mục/câu hỏi **một lần trước khi sử dụng**. Từ máy có thể kết nối tới MySQL đó, đặt các biến production vào một file không theo dõi bởi Git (ví dụ `.env.production.local`), rồi chạy:

```bash
node --env-file=.env.production.local server/seed.mjs
```

Lệnh seed tạo bảng nếu cần và cập nhật danh mục, không xóa người dùng đã có. Sau khi redeploy, kiểm tra `https://<ten-mien>/api/health` trả `{"ok":true,"database":"MySQL"}`, sau đó mở trang web và thử đăng ký/đăng nhập. Vercel báo **Deployment completed** chỉ xác nhận build/deploy, chưa chứng minh MySQL kết nối được. Nếu dùng GitHub `hminhtri-cloud/unigate-web` trên Vercel nhưng Git remote ở máy là `hminhtri-cloud/unigate`, cần chuyển những thay đổi này sang **đúng repo `unigate-web`** trước khi Vercel tự deploy lại.

## Chức năng

- Đăng ký, đăng nhập, đổi mật khẩu, cập nhật hồ sơ; dữ liệu từng tài khoản tách biệt.
- **Tin tuyển sinh** (`#/news`): nguồn Bộ GD&ĐT và các trường, lọc theo nguồn/trường/chủ đề, ngày đăng, trích đoạn và link bài gốc. Bộ thu thập không dùng API AI, chạy bằng GitHub Actions. Xem [hướng dẫn vận hành và kiểm tra xuất bản](docs/admission-news.md).
- Trắc nghiệm 60 câu Holland/RIASEC, tự lưu bản nháp, lưu lịch sử kết quả, biểu đồ, in và xuất JSON.
- Tra cứu **99 trường/cơ sở** (75 trường/cơ sở đại học, học viện và 24 trường/cơ sở cao đẳng tại TP.HCM) cùng **1.262 ngành/chương trình chọn lọc**; tìm không dấu, lọc ngành, trường, bậc đào tạo, học phí, tổ hợp đã đối chiếu, nguồn; gợi ý ngành theo sở thích (tham khảo).

### Rà sâu dữ liệu, học phí tín chỉ và hồ sơ trường — local 09/11/2026

`data/deep-research-2026.mjs` bổ sung dữ liệu sau khi đọc bài thông báo, ảnh bảng, chương trình và tài liệu chính thức; không nhập điểm sàn thành điểm chuẩn hoặc lấy giá/điểm chương trình khác để lấp ô trống.

- **Điểm chuẩn:** từ 707 lên **729/1.262 chương trình**, từ 1.760 lên **1.792 bản ghi**. Thêm HCMUTE **8** chương trình tiếng Việt (phương thức kết hợp, giữ thang chưa xác minh); HUB **3** chương trình Chuẩn (mốc quy đổi /30); UTC2 **6** chương trình đúng mã **GSA** với PT1 THPT /30, PT2 kết hợp có điều kiện và PT3 V-ACT /1200; ULAW **5** ngành, riêng Luật tách C00 20,5 và các tổ hợp khác 20. Không mượn điểm của mã GHA Hà Nội, chương trình tiếng Anh/Việt–Nhật, Phân hiệu Quảng Trị hoặc Khánh Hòa. Còn **533 chương trình** chưa có bản ghi điểm chuẩn đối chiếu.
- **Học phí:** từ 324 lên **353 chương trình có thông tin**. Thêm 18 chương trình TDTU Tiêu chuẩn tại TP.HCM (nhóm 31,26 hoặc 36,59 triệu/năm theo công bố 2026–2027), 3 chương trình HUB (12.765.500đ/học kỳ), 5 ngành ULAW theo đơn giá tín chỉ Khóa 51 và 3 chương trình DLSG theo khoảng phí/học kỳ. UIT vẫn chỉ có lộ trình học phí của khóa 2025 ở trang học phí đã đọc; giữ đúng khóa, chưa gán thành giá nhập học 2026.
- **Thời lượng:** **156 chương trình có nguồn**, bao gồm **124/127 mã CTU** từ trang giới thiệu từng mã (`data/ctu-duration-verified.mjs`). Chỉ lấy khi mã trên bài trùng đúng mã danh mục; Logistics Sóc Trăng liên kết sang trang mã khác nên chưa thừa kế thời gian. Thêm chương trình Chuẩn UAH, Khoa học dữ liệu UIT, CNTT TVU, danh mục cao đẳng TDC và các ngành DLSG. Tìm hiểu ngành hiển thị khoảng min–max theo các chương trình có nguồn, **tách đại học/cao đẳng** và ghi độ phủ; không tự gán 3,5–4 năm cho ngành chưa có bằng chứng.
- **Ước tính học phí/năm:** `shared/programme-facts.mjs` chỉ tính khi có đơn giá và lộ trình đúng chương trình/khóa. Giữ giá gốc theo tín chỉ/kỳ, hiển thị khoảng ước tính bên cạnh và công thức/nguồn trong chi tiết. Ví dụ Kiến trúc UAH **156 tín chỉ / 5 năm × 1,14 triệu/tín chỉ = khoảng 35,6 triệu/năm**; Thiết kế đồ họa UAH **121 / 4 × 950.000 = khoảng 28,7 triệu/năm**. DLSG Quản trị khách sạn **12–13 triệu/kỳ × 5 kỳ / 2,5 năm = khoảng 24–26 triệu/năm**. Có **10** chương trình đủ lộ trình để tính trong đợt này. Chỉ là phân bổ đều theo đơn giá tham khảo, chưa gồm tăng giá, học lại hoặc khoản thu riêng; bộ lọc dùng cận trên của khoảng, vẫn giữ nhóm chưa đủ dữ liệu phía dưới.
- **Thông tin trường:** hồ sơ cơ bản lấy từ danh mục cho cả 99 trường/cơ sở; `data/school-profiles.mjs` bổ sung liên hệ, địa chỉ và liên kết tuyển sinh/học bổng/đời sống có nguồn cho **14 trường**. Mở từ tên/nút Thông tin trường ở Chọn trường, phần Tìm hiểu ngành hoặc chương trình chi tiết. “Trường nổi bật trong lĩnh vực” là **danh sách biên tập theo lĩnh vực đào tạo**, có nguồn và tên chương trình thực tế, không phải xếp hạng chất lượng chính thức. Nhóm máy tính/CNTT: UIT, HCMUT, HCMUS.
- **Phạm vi nghiên cứu:** đã đọc trực tiếp bảng ảnh HCMUTE, HUB, UTC2, ULAW; đọc chương trình và bảng phí UAH/TDTU/DLSG, các trang CTU, UIT, TVU, TDC, ITC và cổng tuyển sinh liên quan. Website trường xác nhận fanpage HCMUTE/HUB; đã thử mở công khai nhưng hết thời gian tải, nên số liệu dùng ảnh trên website, không tuyên bố đã đọc được bảng Facebook. UFM có trang livestream công bố điểm 2026 nhưng chưa trích được bảng số từ nguồn này; TVU có trang bảng điểm cũ/điểm sàn 2026, không đổi chúng thành điểm chuẩn 2026. Độ phủ tăng không đồng nghĩa toàn bộ trường/ngành đã được xác minh đủ.

### Hồ sơ xét tuyển trước khi chọn trường — bản local 08/11/2026

Luồng chính: **Chọn ngành → Điểm & phương thức → Chọn trường**. Nút tiếp từ Chọn ngành dẫn đến `#/admission-scores`. Chưa chọn ngành hoặc chưa lưu hồ sơ xét tuyển thì Chọn trường hiển thị bước cần hoàn thành.

- THPT: chọn **Toán, Ngữ văn và đúng 2 môn tự chọn**, nhập đủ điểm /10. Chỉ nhận một ngoại ngữ và một định hướng Công nghệ trong cùng kỳ thi. Chỉ những môn đã chọn tạo ra tổ hợp trong từ điển `shared/domain.mjs`; không dùng điểm môn ngoài kỳ thi hoặc điểm học bạ để tạo thêm tổ hợp. Có thể không dùng THPT và chỉ nhập kỳ thi khác.
- Lưu riêng **ĐGNL ĐHQG-HCM /1200, HSA /150, TSA /100, SAT /1600**. Để trống kỳ thi không có điểm. Điểm 0 được lưu đúng; không quy đổi giữa các kỳ thi.
- `/api/scores` kiểm tra hồ sơ và tính tổ hợp phía server. Điểm môn và ĐGNL tiếp tục lưu tại `scores`; bảng mới `admission_profiles` lưu môn đã chọn, điểm kỳ thi bổ sung, tổ hợp và các phương thức nhận diện được. Hai phần được ghi cùng transaction, tách theo tài khoản. `server/schema.mjs` tạo bảng bổ sung khi chạy server local; không xóa dữ liệu cũ. Hồ sơ điểm cũ vẫn đọc được nhưng cần xác nhận môn thi theo bước mới trước khi dùng lọc trường.
- `shared/admission-profile.mjs` đối chiếu **từng chương trình**: đúng ngành đã chọn, phương thức có nguồn của năm 2026 và (nếu THPT) ít nhất một tổ hợp cùng phương thức khớp với môn thi. Không lấy tổ hợp học bạ gán sang THPT, không xem HSA là V-ACT, không lấy mốc quy đổi hoặc tổng hợp làm bằng chứng cho phương thức THPT/ĐGNL độc lập. Không tự áp điều kiện tuyển sinh chung của trường lên mọi chương trình.
- Có ba trạng thái **khớp / không khớp dữ liệu hiện có / chưa đủ dữ liệu**. Chỉ chương trình khớp được đưa vào danh sách trường; trường phải có ít nhất một chương trình như vậy. Số chương trình chưa đủ dữ liệu được hiển thị rõ, không hiểu là trường không tuyển sinh. Hiện chưa đối chiếu đủ quy tắc tổ hợp/điều kiện cho mọi phương thức tổng hợp, kết hợp, học bạ, V-SAT hay năng khiếu để tự xác nhận các hồ sơ đó.
- **Chọn trường** chỉ hiển thị chương trình khớp ngành và hồ sơ xét tuyển. **Tra cứu chương trình chi tiết** đã tách thành mục riêng ngay dưới **So sánh lựa chọn**, tại `#/lookup`, tra cứu toàn bộ danh mục độc lập với ngành/hồ sơ đã chọn. Trong Chọn trường, mỗi thẻ chương trình có nút lớn **Chọn nguyện vọng / Đã chọn nguyện vọng**, lưu đúng mã chương trình và cho bỏ chọn bằng cùng nút.
- Bộ lọc **Nhóm trường** giữ một dropdown checkbox với đúng các nhóm: khu vực **TP.HCM / Cần Thơ / Miền Nam**; bậc **Đại học–Học viện / Cao đẳng**; hệ thống **Đại học Quốc gia TP.HCM / Đại học Cần Thơ / Khác**; loại hình **Trường công / Tư thục**. Miền Nam bao gồm TP.HCM và Cần Thơ; “Khác” loại trừ ĐHQG-HCM và CTU, không nhầm CTUT là CTU. Cùng nhóm dùng OR, khác nhóm dùng AND. “Tất cả nhóm trường” đặt lại lựa chọn; Escape, Xong hoặc bấm ngoài đóng dropdown.
- **Tổ hợp** dùng dropdown checkbox ở cả Chọn trường và Tra cứu, cho chọn nhiều mã theo OR. Trong Chọn trường, mã phải khớp cùng phương thức của học sinh; trong Tra cứu, bộ lọc là danh mục tổ hợp chương trình như mô tả ở nguồn.
- **Học phí tối đa / năm** dùng một dropdown: Không giới hạn, 35, 45, 55 hoặc 70 triệu đồng. Mức đã chọn được đối chiếu với học phí/năm của từng chương trình; không nhập ngân sách riêng cho từng ngành. Khi lọc, chương trình có mức /năm phù hợp hiển thị trước; chương trình thiếu số liệu /năm đủ căn cứ được giữ trong nhóm **“Các ngành chưa có dữ liệu học phí/năm để đối chiếu”** bên dưới, vẫn xem chi tiết và chọn nguyện vọng được. Giá theo học kỳ/tín chỉ/toàn khóa, khóa khác hoặc dự kiến chưa đủ căn cứ thuộc nhóm chưa đối chiếu, không tự quy đổi hay coi là 0. Chỉ mức /năm đã xác minh vượt ngân sách mới bị loại. Quy tắc này áp dụng cho cả Chọn trường và Tra cứu; các bộ lọc ngành, trường, phương thức và tổ hợp vẫn có hiệu lực ở nhóm thiếu học phí. Cùng một trường có thể có chương trình ở cả hai nhóm, mỗi chương trình chỉ nằm ở một nhóm.
- Đây là **lọc phương thức/tổ hợp**, không dùng điểm thấp hơn điểm chuẩn để tự loại trường và không kết luận đủ mọi điều kiện hay trúng tuyển. Điểm chuẩn, thang điểm, điều kiện và học phí vẫn được xem trong chi tiết; tổng môn của học sinh chưa có ưu tiên/trọng số/quy đổi.

### Tìm hiểu ngành tại bước Chọn ngành — bản local 08/11/2026

Bấm tên ngành hoặc icon thông tin để mở cửa sổ cho **395/395 lựa chọn ngành**. Có nội dung làm quen lĩnh vực, nghề nghiệp, kỹ năng chuẩn bị, sở thích/Holland và hoạt động thử trước khi chọn. Có thể chọn/bỏ chọn ngay trong cửa sổ; mở hoặc đóng thông tin không tự thay đổi lựa chọn.

Trang Chọn ngành hiển thị **14 nhóm ngành dạng hàng thu gọn**, mỗi hàng có mô tả, số ngành và dấu ›. Bấm hàng để bung danh sách ngành ngay bên dưới; mở nhóm khác sẽ thu nhóm trước. Khi có kết quả Holland, 5 nhóm gợi ý được gắn nhãn và xếp đầu, vẫn xem được các nhóm khác. Tìm kiếm/lọc hiển thị các nhóm có ngành khớp; chọn một nhóm trong bộ lọc tự mở nhóm đó. Phân trang nằm trong nhóm đang mở; các ngành đã chọn được giữ khi chuyển hoặc thu nhóm.

- `data/major-guide-topics.mjs` chứa nội dung **hướng nghiệp do UniGate biên tập**, theo tên lĩnh vực, bao gồm các ngành biến thể và nhóm ngành. Đây không phải danh sách học phần hay chuẩn đầu ra chính thức của mọi trường; Holland không phải điều kiện tuyển sinh hay chẩn đoán tính cách.
- `data/major-guide-evidence.mjs` hiện đối chiếu **19 chương trình cụ thể** (CTU 14, UIT 3, Cao đẳng Du lịch Sài Gòn 2), có URL, ngày đọc, trích đoạn thời lượng và tóm lược nội dung đã đọc. **Chưa xác minh đầy đủ giới thiệu/thời lượng/yêu cầu cho mọi chương trình trong 395 lựa chọn.** Giao diện hiển thị đúng số đã đối chiếu và trạng thái còn thiếu; nguồn danh mục tuyển sinh được ghi riêng, không dùng làm bằng chứng cho các khẳng định chi tiết.
- `shared/major-guides.mjs` chỉ ghép bằng trường + tên + mã (nếu có) + bậc. Không truyền thời lượng sang chương trình CLC, tiên tiến, liên kết hay cơ sở khác. Ví dụ CNTT UIT 4 năm và CTU 4,5 năm; cao đẳng Quản trị khách sạn tại DLSG 2,5 năm, Kỹ thuật chế biến món ăn tại DLSG 2 năm.
- Dữ liệu hướng nghiệp dùng module frontend, không cần seed database. Thay đổi hiện chỉ làm local theo lựa chọn của người dùng.

### Bổ sung 24 trường/cơ sở cao đẳng TP.HCM — 07/11/2026

Theo lựa chọn chỉ TP.HCM và bao gồm cao đẳng, `data/hcm-colleges.mjs` thêm **211 ngành/nghề thuộc 11 nhóm lĩnh vực**. Tất cả đều ghi `educationLevel: 'college'` ở trường và chương trình; có nhãn Cao đẳng trên thẻ ngành và bộ lọc Đại học / Học viện hoặc Cao đẳng. Danh mục trường trong bộ lọc lấy nhóm động để bao gồm cả nhóm 20 trường bổ sung trước đó.

- Kỹ thuật/CNTT: Cao Thắng, Lý Tự Trọng TP.HCM, Công nghệ Thủ Đức, Công Thương TP.HCM, Kỹ nghệ II, Công nghệ Thông tin TP.HCM, Bách Nghệ TP.HCM, FPT Polytechnic tại TP.HCM.
- Kinh tế/vận tải: Kinh tế Đối ngoại, Kinh tế TP.HCM, Kinh tế – Kỹ thuật TP.HCM, Giao thông vận tải TP.HCM, Giao thông vận tải Trung ương III.
- Nghệ thuật/truyền thông/du lịch: Du lịch Sài Gòn, Văn hóa Nghệ thuật và Du lịch Sài Gòn, Văn hóa Nghệ thuật TP.HCM, Phát thanh – Truyền hình II.
- Y dược/giáo dục/đa ngành: Sư phạm Trung ương TP.HCM, Y Dược Sài Gòn, Y Dược Hồng Đức, Viễn Đông, Đại Việt Sài Gòn, Bách khoa Nam Sài Gòn, Bách khoa Sài Gòn.

Chỉ nhập chương trình trình độ cao đẳng, không gộp trung cấp, 9+, chứng chỉ ngắn hạn và đại học liên kết. Nghề Chăm sóc và nuôi dưỡng trẻ không được đồng nhất với ngành Giáo dục mầm non. Bách Nghệ dùng tên hiện hành trên cổng trường, không tính thêm tên cũ Nguyễn Trường Tộ thành một trường khác. FPT Polytechnic tại TP.HCM là cơ sở cao đẳng, khác phân hiệu Đại học FPT; danh mục nghề tại cơ sở cần xác nhận nên được đánh dấu chưa đối chiếu. Nguồn có năm cũ được ghi rõ, không tự chuyển thành thông tin tuyển sinh 2026. Điểm chuẩn và học phí chưa xác minh vẫn để trống.

### Bổ sung 20 trường/cơ sở TP.HCM — 07/11/2026

`data/hcm-expansion.mjs` bổ sung 163 ngành/chương trình thuộc 13 nhóm lĩnh vực, mỗi trường có URL nguồn và ngày đối chiếu:

- Công nghệ/kỹ thuật: IUH, Công nghệ Sài Gòn, Quản lý và Công nghệ TP.HCM, FPT tại TP.HCM, Trần Đại Nghĩa (hệ dân sự), Dầu khí Việt Nam.
- Ngôn ngữ/xã hội/dịch vụ: HUFLIT, Văn Hiến, Quốc tế Sài Gòn, Hùng Vương TP.HCM.
- Nghệ thuật/đào tạo quốc tế: Nhạc viện TP.HCM, Sân khấu – Điện ảnh TP.HCM, Ngoại thương tại TP.HCM (3 chương trình liên kết), RMIT Nam Sài Gòn.
- Sức khỏe/đa ngành: Quốc tế Miền Đông, Kinh tế – Kỹ thuật Bình Dương, Bà Rịa – Vũng Tàu.
- Quản lý công/cộng đồng/an ninh: Học viện Cán bộ TP.HCM, phân hiệu Học viện Thanh thiếu niên Việt Nam tại TP.HCM, An ninh nhân dân.

Địa giới theo TP.HCM hiện hành: EIU/BETU ở Bình Dương cũ; BVU/PVU ở Bà Rịa – Vũng Tàu cũ. Các phân hiệu/cơ sở không được tính là trường độc lập. Danh mục là chọn lọc, không phải toàn bộ mã xét tuyển. FPT/RMIT cần xác nhận địa điểm từng chương trình; VYA-HCM/ANND chưa trích xuất đầy đủ danh mục riêng nên đánh dấu chưa xác minh, ghi rõ phạm vi và không gán dữ liệu của cơ sở khác. HVC hiện chỉ có cổng nguồn HTTP. Không nhập điểm sàn thành điểm chuẩn; chưa có số liệu điểm chuẩn/học phí được đối chiếu cho 163 mục mới.
- Luồng **Chọn ngành → Chọn trường**: cùng một tên ngành hiển thị một lần ở bước đầu; có thể chọn nhiều ngành, xem ngành gợi ý theo Holland và lọc **STEM**. Bước sau chỉ hiện các trường đào tạo ngành đã chọn hoặc chương trình mã nhóm **có nêu rõ ngành đó**; mở trường để xem tên chương trình thực tế, điểm chuẩn và học phí. Lựa chọn ngành tạm lưu trong phiên trình duyệt theo tài khoản. Trang **Tra cứu chi tiết** vẫn cho lọc phương thức xét điểm và từng chương trình khi cần. Khi đổi sang nhóm Luật/Kinh tế, từ khóa tìm kiếm cũ được xóa và STEM tự tắt nếu nhóm mới không thuộc STEM.
- STEM trong bộ lọc là **phân loại hướng nghiệp do UniGate biên tập** (máy tính, kỹ thuật, khoa học tự nhiên, sinh học/nông nghiệp, môi trường), không phải danh sách ngành đủ điều kiện học bổng hoặc hỗ trợ của Nhà nước. Học bổng, miễn giảm và tín dụng là các chính sách khác nhau; cần kiểm tra điều kiện cụ thể theo văn bản và chương trình của trường.
- Bộ lọc **Nhóm trường** cho chọn theo hệ thống (ĐHQG-HCM / 26 trường, cơ sở TP.HCM nhóm gốc / Đại học Cần Thơ / hai nhóm 10 trường miền Nam mở rộng), **tất cả trường tại TP.HCM** theo địa chỉ hiện tại, hoặc loại hình (**Trường công / Trường tư**). Có **45 trường/cơ sở công lập và 10 trường tư**; chọn nhóm sẽ đặt lại trường cụ thể đã chọn. Trong **Chọn trường**, thứ tự gợi ý là biên tập *tương đối theo ngành được chọn đầu tiên*, không phải xếp hạng được kiểm định: với ngành máy tính, **UIT → Bách khoa → Khoa học Tự nhiên** khi cả ba có ngành/chương trình tương ứng trong danh mục.
- Hai tab trên trang Tra cứu chi tiết: **Điểm THPT /30** (204 chương trình) và **Xét tổng hợp /100** (122 chương trình). Trường chỉ có điểm tổng hợp như Bách khoa, UIT tự mở tab phù hợp khi chọn trường. Điểm /30 trường công bố từ **cùng phương thức tổng hợp** (HCMUS) chỉ nằm ở tab tổng hợp, không xem là một phương thức THPT độc lập. **562 chương trình chưa có điểm được xác minh** vẫn có thể tra cứu bằng liên kết “Xem ngành chưa có dữ liệu điểm” bên dưới danh sách, không bị ẩn khỏi hệ thống.
- Trong mỗi tab, chọn **“Holland → điểm cao khi hòa”** để lọc ngành theo Holland trước, xếp **chỉ số phù hợp Holland giảm dần**, và **chỉ khi bằng chỉ số mới dùng điểm cùng phương thức** để phân thứ tự. Tab tổng hợp **gom theo trường trước khi xếp**, không so trực tiếp hai công thức tổng hợp khác trường. Điểm ĐGNL /1200 vẫn hiện trên thẻ và trang chi tiết; không tự quy đổi thành điểm /30 hoặc /100. Nút “Chọn ngành theo sở thích” trên trang kết quả đưa tới bước Chọn ngành.
- Lưu, sắp xếp, ghi chú và xuất danh sách nguyện vọng cá nhân; so sánh tối đa 3 ngành.
- Lưu điểm các môn THPT, tính tổng điểm các tổ hợp 3 môn (chưa ưu tiên), lưu riêng điểm ĐGNL (chưa quy đổi), xem biểu đồ điểm cá nhân.

## Nguồn dữ liệu và giới hạn

Danh mục ĐHQG-HCM gồm UIT, HCMUS, HCMUT, IU, UEL, USSH, UHS và AGU (trường đặt tại An Giang). Thêm **10 trường tại TP.HCM ngoài ĐHQG-HCM**: UEH, Đại học Y Dược TP.HCM (UMP), ĐH Sư phạm TP.HCM (HCMUE), ĐH Công nghệ Kỹ thuật TP.HCM (HCMUTE), ĐH Luật TP.HCM (ULAW), ĐH Nông Lâm TP.HCM (NLU), ĐH Tài chính – Marketing (UFM), ĐH Kiến trúc TP.HCM (UAH), ĐH Mở TP.HCM (OU), ĐH Công nghệ TP.HCM (HUTECH). Đây là **danh sách tuyển chọn để khám phá, không phải bảng xếp hạng top 10**. Danh mục mở rộng mới gồm 87 ngành chọn lọc; mỗi trường/ngành có nguồn gốc tham khảo, một số chỉ xác nhận là ngành đào tạo chứ chưa xác nhận chỉ tiêu tuyển sinh từng năm. UEH chỉ chọn chương trình tại TP.HCM; HCMUE/NLU/UAH không gộp phân hiệu tỉnh khác; HUTECH không lấy chương trình *dự kiến* năm 2027. Không tự suy đoán học phí, điểm chuẩn, mã xét tuyển hoặc tổ hợp chưa được xác minh.

Mở rộng thêm **16 trường/cơ sở công lập tại TP.HCM**: Tôn Đức Thắng (TDTU), Ngân hàng TP.HCM (HUB), Sài Gòn (SGU), Giao thông vận tải TP.HCM (UTH), **phân hiệu** Giao thông vận tải tại TP.HCM (UTC2), **cơ sở phía Nam** Học viện Công nghệ Bưu chính Viễn thông (PTIT-HCM/BVS), Tài nguyên và Môi trường TP.HCM (HCMUNRE), Văn hóa TP.HCM (HCMUC), Mỹ thuật TP.HCM (HCMUFA), **cơ sở II** Lao động – Xã hội (ULSA2), Sư phạm Thể dục Thể thao TP.HCM (UPES), Y khoa Phạm Ngọc Thạch (PNTU), Học viện Hàng không Việt Nam (VAA), Thể dục Thể thao TP.HCM (USH), Công Thương TP.HCM (HUIT), **phân hiệu** Thủy lợi tại TP.HCM (TLUS). Danh mục và đường dẫn nguồn của từng nơi nằm trong `data/public-hcm.mjs`. Các phân hiệu/cơ sở **không phải 4 trường độc lập**; UTC2 mới đối chiếu danh mục toàn trường, chưa khẳng định mã tuyển sinh riêng tại phân hiệu. SGU có 26 ngành/mã đúng [Phụ lục 1 tuyển sinh 2026](https://tuyensinh.sgu.edu.vn/index.php/tuyen-sinh/thong-tin-de-an-tuyen-sinh/nam-2026/thong-tin-tuyen-sinh-nam-2026-chinh-thuc). PTIT-HCM chỉ lấy ngành thuộc **BVS** (không lấy BVH Hà Nội). Ngành ở các trường khác chủ yếu là danh mục đào tạo chọn lọc; chưa mặc nhiên có điểm chuẩn, học phí, tổ hợp hoặc chỉ tiêu năm 2026.

Mở rộng tiếp **10 trường miền Nam, 132 ngành chọn lọc**: ĐH Thủ Dầu Một (TDMU), ĐH Việt Đức (VGU), ĐH Đồng Nai (DNU), ĐH Trà Vinh (TVU), ĐH Đồng Tháp (DTHU), ĐH Tiền Giang (TGU), ĐH Bạc Liêu (BLU), ĐH Công nghệ Kỹ thuật Vĩnh Long (VLUTE; trước đây là ĐH Sư phạm Kỹ thuật Vĩnh Long), ĐH Xây dựng Miền Tây (MTU), ĐH Kỹ thuật – Công nghệ Cần Thơ (CTUT). Từng trường/ngành liên kết tới trang chính thức trong `data/south.mjs`; TDMU/VGU hiện ở TP.HCM (khu Bình Dương cũ), TGU nay thuộc Đồng Tháp, TVU thuộc Vĩnh Long và BLU thuộc Cà Mau theo địa chỉ trường. CTUT là **trường khác** Đại học Cần Thơ (CTU). Nhiều trang ngành vẫn hiển thị điểm **2025**; chỉ hai ngành DTHU có cột **2026** trực tiếp đã được đối chiếu và nhập điểm, không tự sao điểm cũ cho ngành khác. Danh mục chỉ ghi ngành đại học, không nhập ngành cao đẳng hoặc chương trình dự kiến chưa có xác nhận.

Đợt tiếp theo thêm **10 trường/cơ sở, 191 ngành/chương trình chọn lọc** từ website chính thức: **phân hiệu công lập** ĐH Lâm nghiệp tại Đồng Nai (VNUF2), cùng 9 **trường tư thục** là ĐH Hoa Sen (HSU), Nguyễn Tất Thành (NTTU), Lạc Hồng (LHU), Quốc tế Hồng Bàng (HIU), Kinh tế – Tài chính TP.HCM (UEF), Bình Dương (BDU), Văn Lang (VLU), Gia Định (GDU) và Cửu Long (MKU). HSU/NTTU/HIU/UEF/VLU/GDU ở TP.HCM, BDU tại khu Bình Dương nay thuộc TP.HCM; VNUF2/LHU ở Đồng Nai, MKU ở Vĩnh Long. Trang `data/more-south.mjs` ghi danh mục và URL từng trường; VLU cần mở trình duyệt để trang nạp danh mục ngành Tiêu chuẩn. Mới đối chiếu **tên ngành đào tạo**, không suy ra điểm chuẩn, mã xét tuyển, học phí hoặc việc cùng tên ngành được tuyển bằng cùng mã ở các trường.

Đại học Cần Thơ: [danh mục 127 mã xét tuyển 2026](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/841-danh-muc-nganh-va-chi-tieu-tuyen-sinh-dhcq.html), [thông báo 2532 và bảng điểm chuẩn](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/1163-thong-bao-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026.html), [bảng học phí theo mã ngành](https://tuyensinh.ctu.edu.vn/chuong-trinh-dai-tra/177-thong-tin/944-hoc-phi.html). Đã nhập điểm và học phí **đúng 127/127 mã**; điểm /30 là ngưỡng chung cho THPT/học bạ/V-SAT **sau khi trường quy đổi**, không phải điểm thô của ba kỳ thi. Học phí là **mức bình quân/năm học khóa tuyển 2026**; thực thu phụ thuộc tín chỉ. Ngành đào tạo giáo viên có chính sách hỗ trợ học phí theo điều kiện nhà trường. Mã H/S vẫn trong danh mục CTU nhưng học tại cơ sở Hậu Giang/khu Sóc Trăng theo thông báo.

Mỗi ngành có liên kết tới nguồn; danh mục **chọn lọc, chưa bao phủ toàn bộ chương trình/tổ hợp**. Phần dữ liệu HCMUS ghi 39 mã xét tuyển từ [trang tuyển sinh 2026](https://tuyensinh.hcmus.edu.vn/2026-thong-tin-tuyen-sinh/) và học phí năm 2026–2027 chỉ với các mã đối chiếu được. HCMUT ghi 29 mã chương trình **tiêu chuẩn** và điểm **xét tuyển tổng hợp / 100** từ [bảng tuyển sinh 2026](https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/nganh-va-chi-tieu), không so trực tiếp với tổng 3 môn / 30. Danh mục 43 ngành AGU dựa trên [nguồn thứ cấp](https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-an-giang-QSA.html) vì cổng tuyển sinh trường yêu cầu CAPTCHA; app ghi nhãn nguồn thứ cấp và không nhập số liệu chưa kiểm chứng.

Ngoài Cần Thơ, điểm chuẩn 2026 có nguồn theo đúng ngành tại **197 bản ghi** của HCMUS, UIT, IU, UEL, HCMUT, UEH, UAH, UMP, NLU, OU, **SGU và PTIT-HCM**. SGU công bố điểm **đã quy đổi tương đương** về tổ hợp gốc /30 cho mọi phương thức; PTIT-HCM có cột THPT /30 và ĐGNL V-ACT /1200 **riêng cho BVS** từ [thông báo điểm 2026](https://tuyensinh.ptit.edu.vn/thong-bao-diem-chuan-trung-tuyen-vao-dai-hoc-he-chinh-quy-nam-2026/). Trên thẻ/chi tiết ngành, mỗi điểm ghi rõ **THPT**, **ĐGNL**, **xét tuyển tổng hợp** hay **quy đổi theo THPT**, năm, thang và thông báo chính thức; nhiều phương thức được hiển thị song song khi trường công bố. HCMUS có cột thang 30 và 100 của **cùng một phương thức tổng hợp**, nên cột 30 được đánh dấu quy đổi, không phải ngưỡng THPT độc lập. UAH công bố điểm đã quy đổi tương đương về THPT; UMP dùng tổ hợp gốc B00; NLU có chung một cột THPT/THPT+HB/THPT+CC và một cột ĐGNL riêng. Không lấy điểm sàn, điểm trung bình trúng tuyển hoặc số liệu của chương trình khác để thay điểm chuẩn. Các trường/ngành còn thiếu số là **chưa có bản ghi xác minh**, không phải điểm 0. Mã và số liệu đã đối chiếu nằm tại `data/admissions.mjs` và `data/ctu.mjs`, kèm URL của trường.

**Tổng độ phủ hiện tại (09/11/2026):** 729/1.262 chương trình có điểm chuẩn đối chiếu (1.792 bản ghi theo phương thức/nhóm đối tượng); 279 chương trình có danh mục tổ hợp; 353/1.262 có học phí kèm nguồn; 156 có thời lượng đào tạo. Còn 533 chương trình chưa có điểm chuẩn đối chiếu trong UniGate, không được hiểu là điểm 0 hoặc là trường không công bố điểm.

### Rà lại website và fanpage chính thức — 08/11/2026

`data/admissions-recheck-2026.mjs` nhập thêm **165 chương trình tại 10 trường**, đồng thời lưu nguồn thông báo, ảnh/PDF, fanpage được website trường xác nhận và kết quả đọc nguồn. Đã kiểm tra công khai các fanpage HUFLIT, NTTU, Nhân văn, Khoa học Sức khỏe, UMT, Gia Định và EIU. Trạng thái đọc được phần giới thiệu/bài tuyển sinh/bài điểm chuẩn được ghi riêng; không tuyên bố đọc được bảng điểm Facebook khi chỉ thấy hồ sơ trang hoặc màn hình đăng nhập.

| Trường | Chương trình nhập thêm | Nguồn và lưu ý |
|---|---:|---|
| KHXH&NV ĐHQG-HCM | 42 | [Bài trên website mới](https://hcmussh.edu.vn/bai-viet/truong-dh-khxh-nv-dhqg-hcm-cong-bo-diem-chuan-xet-tuyen-dai-hoc-chinh-quy-nam-2026-45197), hai ảnh bảng Chuẩn; tách ĐT01/02/03, đều là tổng hợp /100. Không dùng bảng Chuẩn quốc tế hoặc 2+2. |
| Khoa học Sức khỏe ĐHQG-HCM | 5 | [Bài công bố](https://www.uhsvnu.edu.vn/vi/search/diem-trung-tuyen-dai-hoc-nam-2026-10082026) dẫn ảnh Drive; đọc được bản xem trước công khai dù tải xuống bị lỗi. |
| Sư phạm TP.HCM | 9 | [Trang tuyển sinh](https://tuyensinh.hcmue.edu.vn/index.php?option=com_content&view=article&id=27828&lang=vi&site=183) dẫn PDF 5 trang; đã đọc preview, chỉ lấy trụ sở SPS và tổ hợp gốc. |
| Nguyễn Tất Thành | 23 | [Bảng 70 chương trình](https://ntt.edu.vn/diem-chuan-cao-nhat-truong-dh-nguyen-tat-thanh-la-22-diem/); ngành Luật không có ngưỡng ĐGNL, không lấy điểm Tài chính–Ngân hàng thay Công nghệ tài chính. |
| Gia Định | 21 | [Website trường](https://giadinh.edu.vn/diem-chuan-truong-dai-hoc-gia-dinh-nam-2026) đăng lại bài báo cùng ảnh bảng điểm mang nhận diện GDU; lưu rõ nguồn ảnh và điều kiện học lực. |
| Công nghiệp TP.HCM | 15 | [PDF 971/TB-ĐHCN](https://iuh.edu.vn/upload/files/2026/08/TB-971-2026.pdf) là bản quét; đọc OCR. Điểm xét kết hợp không phải điểm THPT độc lập, không lấy ngưỡng TCTA gán cho chương trình thường. |
| HUFLIT | 15 | [Bài điểm chuẩn](https://huflit.edu.vn/vi/tin-tuc/diem-chuan-huflit-2026/) và ảnh đề án có tổ hợp theo từng nhóm ngành. |
| UMT | 9 | [Thông báo 71/2026](https://www.umt.edu.vn/tin-tuc/truong-dai-hoc-quan-ly-va-cong-nghe-tp-hcm-umt-cong-bo-diem-trung-tuyen-dot-chinh-thuc-nam-2026); PT03 ghi 15 là điểm quy đổi /30, không phải 15/1200. Mục An ninh mạng chưa ghép với An toàn thông tin. |
| Quốc tế Miền Đông | 10 | [Điểm chuẩn](https://eiu.edu.vn/tin-tuc/eiu-cong-bo-diem-chuan-trung-tuyen-nam-2026/) và đề án 2026 có tổ hợp riêng từng ngành. |
| Bà Rịa – Vũng Tàu | 16 | [Bảng công bố](https://bvu.edu.vn/truong-dai-hoc-ba-ria-vung-tau-cong-bo-diem-trung-tuyen-dai-hoc-chinh-quy-va-xet-tuyen-bo-sung-nam-2026/) tách Điểm chuẩn với Ngưỡng ĐBCL; chỉ nhập Điểm chuẩn. |

Một [bài công khai của fanpage Nhân văn](https://www.facebook.com/share/p/19E8Xwak5w/) được đọc và xác nhận lịch công bố/nhập học, nhưng **không dùng bài lịch nhập học làm nguồn số điểm**. Chi tiết ngành hiện có liên kết bài công bố và fanpage chính thức, trạng thái rà nguồn và lý do cụ thể cho các mã chưa khớp. Khi nhiều nhóm đối tượng có điểm khác nhau, chọn nhóm trước khi sắp điểm; không mặc định lấy ĐT01 cho mọi thí sinh.

### Bổ sung điểm chuẩn, phương thức và tổ hợp 2026

`data/admissions-verified-2026.mjs` bổ sung **216 chương trình tại 16 trường/cơ sở**: HCMUNRE, HSU, HIU, BDU, HUIT, STU, DHV, VNUF2, CTUT, BLU, PVU, Cao Thắng, Sư phạm Trung ương TP.HCM, UEF, Văn Lang và Tôn Đức Thắng. Mỗi mức điểm giữ riêng năm, phương thức, thang điểm, nguồn, tổ hợp hoặc biểu thức môn nếu công bố. Chỉ dùng điểm chuẩn, không dùng ngưỡng nhận hồ sơ/điểm sàn.

- HCMUNRE: điểm THPT theo [PT1](https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT1.pdf), học bạ theo từng tổ hợp và trung bình 3 năm theo [PT2](https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT2.pdf), ĐGNL riêng theo [PT3](https://tuyensinh.hcmunre.edu.vn/wp-content/uploads/2026/08/PT3.pdf). Logistics có X03 ở PT1 nhưng X04 ở PT2; không hoán đổi hai danh mục. Mã ngành Biến đổi khí hậu sửa thành 7440211, giữ ID nội bộ để bảo toàn nguyện vọng đã lưu.
- Cần Thơ: `data/ctu-combinations.mjs` ghi đủ **127 mã xét tuyển**, tách danh mục THPT và V-SAT vì có khác biệt. Một mốc /30 dùng chung sau quy đổi không được nhân thành ba điểm thô THPT/học bạ/V-SAT. Giữ nguyên mã tổ hợp năng khiếu và mã trường công bố; bộ tính tổng 3 môn chỉ hỗ trợ các tổ hợp đã có định nghĩa, không tự tạo cách tính cho các mã khác.
- Cao Thắng: lưu cả điểm Toán nhân 2 thang 40 và cột quy đổi /30 do trường công bố; tổ hợp được ghi bằng biểu thức Toán + 2 môn, không tự bịa mã tổ hợp. Giáo dục mầm non tại NCEHCM dùng môn văn hóa + hai môn năng khiếu, không xếp thành tổng 3 môn văn hóa.
- TDTU: chỉ ghép chương trình tiêu chuẩn tại Tân Hưng; lưu PT1 /100 **của tổ hợp gốc** và PT2 ĐGNL /1200. Tổ hợp khác có độ lệch trong phụ lục, không dùng chung điểm gốc cho mọi tổ hợp.
- Văn Lang: chỉ ghép chương trình Tiêu chuẩn, không lấy ngưỡng Global Elite. Các cột V-ACT/HSA/TSA/V-SAT/SAT thuộc phương thức **kết hợp học bạ với bài thi**, không ghi thành phương thức bài thi độc lập.
- Không gán điểm Thiết kế công nghiệp STU cho Thiết kế đồ họa; không gán Luật quốc tế HSU cho các mục Luật thương mại quốc tế/Luật kinh doanh số. Trường hợp chưa xác minh được thang điểm tối đa giữ `scale: null`, giao diện ghi rõ và không quy đổi/xếp hạng THPT.

Kiểm tra độ phủ và danh sách còn thiếu:

```bash
npm run data:audit
npm run data:audit -- --missing
```

Phần bổ sung điểm này **chỉ cập nhật local** theo lựa chọn của người dùng; chưa commit/push và chưa đồng bộ điểm mới vào TiDB. Các mục còn thiếu cần tiếp tục đối chiếu đúng chương trình/năm/phương thức, đặc biệt những thông báo chỉ có ảnh/PDF, chương trình quốc tế, năng khiếu hoặc chỉ xét điều kiện tốt nghiệp.

SGU ghi học phí **dự kiến tổng cộng toàn khóa** cho 24 ngành có tên khớp từ [Phụ lục 6 khóa 2026](https://tuyensinh.sgu.edu.vn/images/files/2026/MPhuLuc6_Hocphi.pdf), **không phải phí/năm** và không tham gia bộ lọc phí/năm. Điểm Lâm học (mã 7620201) lấy từ [bảng Nông Lâm 2026](https://ts.hcmuaf.edu.vn/vn/tin-tuc/span-style-color-red-diem-trung-tuyen-diem-chuan-cac-nganh-dao-tao-trinh-do-dai-hoc-va-nganh-giao-duc-mam-non-trinh-do-c-60570), thay cho tên chung Lâm nghiệp không phải mã xét tuyển. [Đại học Mở công bố học phí dự kiến bình quân/năm khóa 2026](https://tuyensinh.ou.edu.vn/hoc-phi-du-kien-khoa-2025) theo từng nhóm ngành chương trình Chuẩn: nhập 9 ngành khớp tên, không gán chung cho mục “Kinh tế và quản lý công” vì trường tách thành hai ngành. [Đại học Y Dược TP.HCM công bố học phí dự kiến theo từng ngành ở trang 12 thông tin tuyển sinh 2026](https://ump.edu.vn/uploads/ckeditor/files/Truong/DaoTaoDaiHoc/TuyenSinh/2026/1608_06042026_Thongtintuyensinh2026.pdf): nhập đủ 8 ngành đã có trong danh mục. Học phí Nhân văn được trường công bố cho **2025–2026**, chỉ để tham khảo. Học phí UIT dự kiến năm học 2026–2027 được công bố trong **lộ trình khóa tuyển 2025**: không xem là mức đã chốt cho khóa 2026. HUTECH thu **theo đợt** khóa 2026; Kiến trúc thu **theo tín chỉ** khóa 2026; Bách khoa ghi **khoảng 15,75 triệu/học kỳ** cho chương trình Tiêu chuẩn, không tự nhân thành mức phí/năm. UFM công bố **30 triệu/năm** cho chương trình Chuẩn khóa 2026. Bộ lọc học phí/năm không dùng số cũ, dự kiến khóa khác, theo tín chỉ/học kỳ/đợt. Ngành chưa có mức phí chính xác vẫn để trống, không lấy giá trường khác hoặc nhóm ngành không khớp.

60 câu tiếng Việt do UniGate biên soạn mới dựa trên khái niệm [Holland/RIASEC](https://www.onetcenter.org/IP.html); **không phải bộ O*NET chính thức hay thang đo tâm lý đã chuẩn hóa**. Liên hệ giữa Holland và ngành nghề do UniGate biên tập; chỉ số gợi ý **không phải khả năng đỗ**. Nguyện vọng trong ứng dụng **không gửi** tới hệ thống Bộ GD&ĐT. Chi tiết nguồn và cách tính luôn có ở trang **Nguồn dữ liệu**.

## Kiểm tra

```bash
npm test
npm run build
npm run test:e2e
```

`npm test` cần MySQL đã bật và dữ liệu đã nạp; các tài khoản thử nghiệm tự được xóa. `npm run test:e2e` cần cài Chromium lần đầu bằng `npx playwright install chromium`, kiểm thử thao tác học sinh trên trình duyệt thật, desktop lẫn mobile. `npm run db:seed` có thể chạy lại để cập nhật dữ liệu trường/ngành và câu hỏi; không xóa tài khoản hoặc kết quả đã lưu. Sửa dữ liệu tại `data/catalog.mjs`, `data/public-hcm.mjs`, `data/south.mjs`, `data/more-south.mjs`, `data/ctu.mjs`, `data/admissions.mjs`, `data/tuition.mjs` và `data/questions.mjs`, chạy lại `npm run db:seed`.

> Để xóa hoàn toàn database của dự án này, `docker compose down -v` sẽ xóa volume và **toàn bộ dữ liệu học sinh**. Không dùng lệnh đó nếu muốn giữ dữ liệu.
# unigate
