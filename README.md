# Cọ Nhí Studio - Phần Mềm Soạn Giảng & Trình Chiếu Mĩ Thuật Tiểu Học (GDPT 2018)

Cọ Nhí Studio là ứng dụng Web / PWA chuyên biệt dành cho giáo viên Mĩ thuật tiểu học Việt Nam (Lớp 1 đến Lớp 5), thiết kế bám sát chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT.

---

## I. NGUYÊN TẮC HOẠT ĐỘNG & BẢO MẬT DỮ LIỆU
1. **Lưu trữ dữ liệu bài giảng:**
   - Dữ liệu bài giảng được lưu trữ cục bộ trên máy tính giáo viên qua LocalStorage của trình duyệt và tệp định dạng `.conhi`.
   - Có cơ chế tự động lưu (Autosave debounce) và cảnh báo khi rời trang nếu chưa lưu.
   - Không tự động gửi bài giảng lên cloud trừ khi người dùng chủ động xuất file hoặc sử dụng tính năng đồng bộ.
2. **Xử lý ảnh học sinh & Cam chấm tranh:**
   - Ảnh chụp bài vẽ của học sinh từ webcam hoặc tệp tải lên được xử lý và phân tích trực tiếp trên Canvas trình duyệt của máy giáo viên.
   - Tuyệt đối không lưu trữ dữ liệu cá nhân hay hình ảnh học sinh lên máy chủ công cộng.
3. **Chế độ Ngoại tuyến (Offline) và Trực tuyến (Online):**
   - **Hoạt động Offline hoàn toàn:** Trình soạn thảo slide, trình chiếu toàn màn hình (F5), bảng vẽ thị phạm, ngân hàng trợ giảng sư phạm GDPT 2018 mẫu, trò chơi mĩ thuật mẫu, xuất/nhập tệp `.conhi`, xuất tệp PowerPoint `.pptx`, Web Speech API giọng đọc máy có sẵn trên thiết bị.
   - **Yêu cầu kết nối Internet (Online):** Xác thực tài khoản Google/Firebase, giọng đọc Microsoft Edge Neural TTS chất lượng cao (`/api/tts`), và chức năng tạo giáo án / tranh minh họa bằng AI trực tuyến (`/api/teaching-ai`).
4. **Xuất tệp PowerPoint (.pptx):**
   - Xuất chuẩn bố cục 16:9, màu nền, văn bản, font chữ, hình khối, ảnh minh họa và toàn bộ ghi chú lời giảng sư phạm.
   - *Lưu ý kỹ thuật:* Các video YouTube nhúng online hoặc bảng vẽ động tương tác không được đóng gói nguyên bản dạng video vào tệp PPTX tĩnh tiêu chuẩn.
5. **Chi phí & Hạ tầng:**
   - Ứng dụng cung cấp các công cụ cốt lõi miễn phí phục vụ giáo dục tiểu học. Các tính năng AI trực tuyến nâng cao có thể phụ thuộc vào hạn mức API hoặc hạ tầng đám mây.

---

## II. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (DEVELOPMENT)

### Yêu cầu môi trường
- **Node.js:** v18.0.0 trở lên (khuyên dùng Node.js 20 hoặc 22/24 LTS).
- **npm:** v9.0.0 trở lên.

### Cài đặt dependencies
```bash
npm install
```

### Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3100/` (hoặc cổng hiển thị trên terminal).

### Kiểm tra tĩnh mã nguồn (Lint)
```bash
npm run lint
```

### Kiểm thử đơn vị tự động (Unit Test Suite)
```bash
npm test
```

### Biên dịch ứng dụng cho Production (Build)
```bash
npm run build
```

---

## III. CẤU TRÚC PHÂN HỆ CHÍNH
- `src/components/SlideEditor/`: Soạn thảo slide 16:9, chèn text/shape/ảnh, ghi chú sư phạm, xuất/nhập PPTX.
- `src/components/DrawingBoard/`: Bảng vẽ thị phạm 2D và dựng hình khối 3D trực quan.
- `src/components/ArtGames/`: Trò chơi mĩ thuật tương tác (pha màu, hình khối, tranh dân gian).
- `src/components/ArtCamera/`: Camera chấm tranh & bộ Rubric đánh giá năng lực học sinh.
- `src/components/Evaluation/`: Bảng nhận xét đánh giá định kỳ theo Thông tư 27 và xuất bảng điểm SMAS.
- `src/components/Admin/`: Hệ thống phân quyền 3 cấp (Admin Chính, Admin Phụ, Giáo Viên).
- `api/`: Serverless Functions hỗ trợ Edge Neural TTS và AI Teaching Assistant.

## Chế độ miễn phí và rà soát giáo án

Giáo án và trò chơi mặc định dùng ngân hàng/quy tắc cục bộ. `VITE_ENABLE_EXTERNAL_AI` (client) và `ENABLE_EXTERNAL_AI` (server) mặc định tắt; không bật hoặc thêm dịch vụ/khóa API khi chủ ứng dụng chưa phê duyệt chi phí và hạn mức. Endpoint AI từ chối yêu cầu thiếu xác thực hoặc không có quyền. Không đưa khóa bí mật vào biến `VITE_`, Git hoặc log.

Điểm rà soát là điểm đáp ứng bộ quy tắc cấu trúc và từ khóa, không phải chất lượng chuyên môn được chứng nhận. Bộ lọc không thay thế việc giáo viên kiểm tra vật liệu thực tế. Ba nhiệm vụ phân hóa là gợi ý hoạt động, không phải ba mức đánh giá chính thức theo TT27. Khi sửa nội dung, cần rà soát lại trước khi dùng.

Tranh AI hiện thử endpoint công khai cũ của Pollinations, không dùng khóa và không tự chuyển sang API có thể tính phí. Không cam kết dịch vụ này luôn miễn phí, luôn hoạt động hoặc giữ bố cục chính xác giữa các chất liệu. Tham khảo [tài liệu hiện hành](https://gen.pollinations.ai/docs) trước khi thay tích hợp. Khi mạng, HTTP, MIME hoặc giải mã ảnh lỗi, ứng dụng báo thất bại và giữ tranh cũ; có thể dùng ảnh do giáo viên tải từ máy.

Kiểm thử hồi quy có trong `tests/lesson-quality.test.mjs`; các trang và tệp QA nội bộ nằm trong `.work/`, không đưa vào bản phân phối. Kiểm thử có ảnh giả lập chỉ xác minh luồng giao diện, không chứng minh chất lượng ảnh của nhà cung cấp hoặc trạng thái sau đăng nhập của bản live.
