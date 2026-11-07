# CỌ NHÍ STUDIO - TÀI LIỆU HƯỚNG DẪN & BÁO CÁO KIỂM THỬ SƯ PHẠM

**Phần mềm Soạn giảng, Trình chiếu & Trợ giảng Mĩ thuật Tiểu Học (Lớp 1 - 5)**
*Phát triển chuyên biệt cho Mĩ thuật GDPT 2018 • Lưu trữ bài giảng cục bộ an toàn • Kết hợp linh hoạt chế độ Ngoại tuyến & Trực tuyến • Bảo vệ dữ liệu học sinh*

> **Lưu ý minh bạch về tính năng:**
> - **Ngoại tuyến (Offline):** Soạn bài, trình chiếu, vẽ bảng, trợ giảng ngân hàng mẫu GDPT 2018, trò chơi mẫu, lưu bài giảng LocalStorage và xuất tệp `.conhi` / `.pptx` hoạt động 100% không cần mạng.
> - **Trực tuyến (Online):** Giọng đọc Microsoft Edge Neural TTS chất lượng cao, AI tạo bài dạy và đồng bộ xác thực đám mây cần kết nối Internet.
> - **Cam chấm tranh & Ảnh học sinh:** Toàn bộ quá trình quét, phân tích và gắn rubric diễn ra cục bộ trên trình duyệt của giáo viên, không lưu ảnh học sinh lên máy chủ công cộng.
> - **Xuất PPTX:** Giữ nguyên 100% màu nền, văn bản, font chữ, hình khối, ảnh và ghi chú sư phạm; video nhúng online hoặc bảng vẽ động tương tác không đóng gói nguyên bản dạng video vào tệp PPTX tĩnh tiêu chuẩn.

---

## I. CÁCH KHỞI CHẠY ỨNG DỤNG
1. **Cách 1 (Nhấp đúp chuột):** Vào thư mục `C:\Users\win 10 pro\Downloads\co-nhi-studio` và nhấp đúp vào tệp `CHAY_CO_NHI_STUDIO.bat`.
2. **Cách 2 (Lệnh Terminal):**
   ```bash
   cd "C:\Users\win 10 pro\Downloads\co-nhi-studio"
   npm run dev
   ```
3. Mở trình duyệt web truy cập: **`http://localhost:3100/`**

---

## II. DANH MỤC CÁC TÍNH NĂNG VÀ KẾT QUẢ KIỂM THỬ THỰC TẾ

### 1. Trình Soạn Thảo & Trình Chiếu Slide Kiểu Quen Thuộc (16:9)
- **Danh sách slide bên trái:** Xem trước thumbnail, thêm trang trắng, thêm theo 6 mẫu sư phạm mĩ thuật GDPT 2018 (Tiêu đề, Mục tiêu, Khám phá, 4 bước thực hành, Trưng bày, Dặn dò), nhân bản, xóa, di chuyển lên/xuống.
- **Thanh công cụ (Ribbon):**
  - Chèn văn bản (Tiêu đề, đoạn văn).
  - Chèn hình khối (Khung bo góc, tròn, tam giác, ngôi sao, mũi tên).
  - Chèn ảnh từ máy tính (ảnh mẫu tranh vẽ, tư liệu).
  - Định dạng: Font size, In đậm, In nghiêng, Căn lề trái/giữa/phải, Màu chữ, Màu nền hình, Màu viền, Z-index.
  - Đổi màu nền slide (các gam màu pastel mĩ thuật hoặc tự chọn).
  - Hoàn tác (Undo Ctrl+Z) và Làm lại (Redo Ctrl+Y).
- **Trình chiếu toàn màn hình:**
  - Nhấn phím **F5** hoặc nút **"Trình Chiếu (F5)"**.
  - Nhấn phím **Esc** để thoát.
  - Phím mũi tên Trái / Phải hoặc click chuột để chuyển slide.
  - Hiển thị đồng hồ đếm thời gian tiết dạy (mm:ss) và thanh điều khiển mờ.
- **Ghi chú lời giảng & Đọc giọng máy:**
  - Nhập lời giảng riêng cho từng slide bên dưới màn hình.
  - Phát âm thanh bằng Web Speech Synthesis tiếng Việt có sẵn trên máy (Microsoft An, NamMinh, Google Tiếng Việt).
  - Tạm dừng / Tiếp tục / Chỉnh tốc độ (0.75x, 1.0x, 1.25x).
- **Lưu trữ:** Tự động lưu `localStorage` (Ctrl+S) + Lưu tệp dự án `.conhi` về máy tính và mở lại dự án.

### 2. Trợ Giảng Sư Phạm Cục Bộ GDPT 2018 (Offline Assistant)
- Chạy 100% bằng ngân hàng tri thức sư phạm mĩ thuật GDPT 2018 cục bộ (Thông tư 32/2018/TT-BGDĐT).
- Bộ lọc Khối Lớp 1 - 5 và các chủ đề SGK.
- Nút gợi ý nhanh: Mục tiêu bài học, Đố vui khởi động, Câu hỏi gợi mở, Lời giảng mẫu, 4 bước vẽ tranh.
- Nút "Chèn vào ghi chú", "Nghe đọc thử", "Sao chép".
- **Minh bạch:** Không tự nhận là Gemini/AI trực tuyến; giáo viên xem và duyệt trước khi dùng.

### 3. Xưởng Ý Tưởng Mĩ Thuật
- Bộ lọc: Khối lớp (1-5), Chủ đề SGK, Chất liệu (Sáp màu, Màu nước, Xé dán, Đất nặn, Tái chế), Thời lượng (1 tiết 35p, 2 tiết 70p).
- Sinh kế hoạch bài dạy chi tiết: Mục tiêu, Chuẩn bị, Tiến trình 4 bước, Câu hỏi gợi mở, Rubric đánh giá.
- Nút "Tạo Slide Bài Giảng" tự động tạo bộ slide sang trình soạn thảo.

### 4. Bảng Vẽ Thị Phạm Tương Tác
- Dụng cụ: Bút vẽ nét mềm, Bút dạ quang trong suốt, Tẩy, Hình khối (Chữ nhật, Tròn, Đường thẳng).
- Điều chỉnh độ dày nét (2, 6, 12, 24px) và bảng màu mĩ thuật phong phú.
- Nút "Chèn Tranh Vào Slide" đưa ảnh phác thảo trực tiếp vào bài giảng để thị phạm.
- Nút "Tải Ảnh (PNG)" lưu tranh về máy.

### 5. Trò Chơi Mĩ Thuật Cục Bộ
- 3 trò chơi tương tác:
  1. *Ghép & Pha Màu Vui Nhộn:* Pha màu cơ bản và phân biệt gam màu Nóng / Lạnh.
  2. *Thám Tử Hình Khối:* Nhận diện hình học trong sự vật mĩ thuật đời sống.
  3. *Tìm Chi Tiết Tranh Mĩ Thuật:* Tranh dân gian Đông Hồ và luật xa gần.
- Điểm số, hiệu ứng pháo hoa ăn mừng, giải thích kiến thức, không cần đăng nhập.

### 6. Cam Chấm Tranh & Rubric Tự Duyệt
- Mở Camera (Webcam) hoặc Chọn ảnh bài vẽ từ máy.
- 100% xử lý trong trình duyệt, không tải ảnh lên máy chủ, bảo mật dữ liệu học sinh.
- Rubric 4 tiêu chí chuẩn GDPT 2018: Đề tài, Kỹ thuật (Nét-Hình-Màu), Sáng tạo riêng, Khả năng trình bày ý tưởng.
- Giáo viên tự tay tick chọn mức độ và sửa nội dung nhận xét.
- Nút "Đưa Vào Slide Trưng Bày" chèn cả ảnh bài vẽ và nhận xét vào slide.

### 7. Media & Tìm Kiếm YouTube An Toàn
- Chèn tệp nhạc (MP3) và video (MP4) từ máy vào slide, điều khiển phát an toàn, KHÔNG tự động phát.
- Hộp thoại tìm video YouTube mở trang kết quả YouTube trên tab mới (không cần API key).
- Hỗ trợ dán link video YouTube để nhúng iframe chính thức.

### 8. Xuất Tệp PPTX Thực Tế & Nhận Xét SMAS Chuẩn Thông Tư 27
- **Xuất PPTX:** Dùng `PptxGenJS` xuất tệp `.pptx` chuẩn 16:9, giữ nguyên văn bản, định dạng font, hình khối, ảnh và toàn bộ ghi chú lời giảng sư phạm.
- **Nhận xét học sinh:** Căn cứ Thông tư 27/2020/TT-BGDĐT ngày 04/9/2020 (Nguồn moet.gov.vn, kiểm tra ngày 02/11/2026).
- Phân loại 3 mức T (Hoàn thành tốt), H (Hoàn thành), C (Chưa hoàn thành).
- Nút "Sao chép nhanh" để dán vào cổng web SMAS Viettel.
- Nút "Xuất File Excel (.xlsx)" xuất bảng tổng hợp chuẩn cấu trúc các cột nhập liệu của SMAS.

---

## III. MINH CHỨNG MIỄN PHÍ 100% & BẢO MẬT
- **Chi phí phát sinh:** 0 đồng (Hoàn toàn miễn phí).
- **API Key & Cloud Billing:** Không sử dụng, không yêu cầu bất kỳ API key nào.
- **Tài khoản học sinh:** Không yêu cầu tạo tài khoản, không lưu dữ liệu trẻ em lên mạng.
- **Biên dịch:** Đạt chuẩn `npm run build` với 0 lỗi (0 errors).
