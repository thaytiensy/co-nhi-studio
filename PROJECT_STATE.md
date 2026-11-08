# BÁO CÁO TRẠNG THÁI DỰ ÁN CỌ NHÍ STUDIO (PROJECT STATE)

> **Cập nhật lúc:** 2026-11-08 10:30:00 (Giờ Việt Nam)  
> **Trạng thái tổng thể:** SUCCESS - 0 LỖI BIÊN DỊCH - 67/67 TEST PASS - HOÀN TẤT ĐĂNG NHẬP GMAIL VÀ SỬA TẠO TRANH AI

---

## 1. Kết Quả Xử Lý Yêu Cầu Cốt Lõi

### A. Sửa Triệt Để Đăng Nhập Kiểu Gmail (Dual-Mode Authentication)
- **Vấn đề trước đó:** Khi giáo viên đăng nhập trực tiếp bằng Gmail đã cấp quyền (như `hoangthanhtam1980@gmail.com`), sự kiện `onAuthStateChanged` của Firebase chạy ngầm với `user === null` đã vô tình hủy trạng thái `isAuthenticated`, khiến app bị reset hoặc báo lỗi không đăng nhập được. Ngoài ra, bản dựng trên Vercel chưa được cập nhật code mới nên nút đăng nhập Google bị vô hiệu hóa vì thiếu biến môi trường Firebase.
- **Giải pháp:**
  1. Trong `src/App.jsx`, tại hàm lắng nghe `onAuthStateChanged`, bổ sung kiểm tra `getCurrentSession()`. Nếu đã có phiên đăng nhập Gmail cục bộ hợp lệ và không phải người dùng bấm Đăng xuất, ứng dụng giữ nguyên trạng thái phiên và quyền của giáo viên.
  2. Bổ sung cơ chế tự động đọc tham số `?email=...` từ URL trong `LoginGateModal.jsx`. Khi Admin bấm nút "Sao chép link đăng nhập" trong mục Quản trị tài khoản và gửi cho giáo viên, trang web sẽ tự động điền sẵn Gmail để giáo viên vào lớp học mĩ thuật tức thì.
  3. Cấp quyền mặc định sẵn sàng cho các tài khoản: Super Admin (`dotiensy.8785@gmail.com`, `thaytiensy@gmail.com`, `ngathuyphu2@gmail.com`, `admin@conhi.vn`), Giáo viên (`hoangthanhtam1980@gmail.com`, `giaovien@gmail.com`).

### B. Khắc Phục AI Không Hiểu Ngôn Ngữ & Sinh Tranh Sai Lệch (Pollinations Semantic Mapping)
- **Vấn đề trước đó:**
  - Nhập "chủ đề 3 lớp 5" -> AI sinh tranh xe hơi màu trắng trên đường rừng.
  - Nhập "Cảnh đẹp quê hương" -> AI sinh tranh chân dung bé gái.
- **Nguyên nhân kỹ thuật:** Mô hình khuếch tán hình ảnh (Flux/Pollinations) là mô hình tiếng Anh. Khi nhận chuỗi tiếng Việt thô không kèm ngữ cảnh thị giác cụ thể, mô hình bị nhiễu token từ vựng và tự chọn hình ngẫu nhiên (xe hơi hoặc khuôn mặt).
- **Giải pháp:**
  1. Tách module chuyên biệt `src/utils/aiArtworkService.js` (dưới 200 dòng).
  2. Xây dựng bảng ánh xạ ngữ nghĩa sư phạm `TOPIC_ENGLISH_MAP`:
     - `chủ đề 3 lớp 5` tự động phân giải thành `Gia đình` -> ánh xạ sang phong cách gia đình Việt Nam sum vầy ấm cúng, bữa cơm chiều vui vẻ.
     - `Cảnh đẹp quê hương` -> ánh xạ sang phong cảnh làng quê Việt Nam thanh bình (cánh đồng lúa, dòng sông uốn lượn, lũy tre làng, đồi núi xa xăm, luật xa gần).
  3. Áp dụng bộ lọc âm tính nghiêm ngặt (`negativeExclusions`) khi vẽ phong cảnh: tuyệt đối loại trừ khuôn mặt người (`strictly no people, no human face, no portraits, no girl, no boy`) để không còn bị vẽ chân dung bé gái khi yêu cầu phong cảnh quê hương.

---

## 2. Báo Cáo Tuân Thủ Quy Định (Strict Rules Compliance)
1. **Khóa chặt Data Contract:** Quản lý toàn bộ phiên đăng nhập, vai trò qua `src/contracts/authContract.js`. Không sử dụng kiểu `any`.
2. **Quy định độ dài tệp <= 200 dòng:**
   - `src/contracts/authContract.js`: 58 dòng.
   - `src/utils/localAuthStore.js`: 58 dòng.
   - `src/utils/adminAuthService.js`: 186 dòng.
   - `src/utils/aiArtworkService.js`: 89 dòng.
   - `src/utils/aiLessonGenerator.js`: 145 dòng.
   - `src/components/Admin/LoginGateModal.jsx`: 145 dòng.
   - `src/components/Admin/AdminAccountsTab.jsx`: 163 dòng.
   - `src/components/Admin/AdminRolesTab.jsx`: 58 dòng.
   - `src/components/Admin/AdminModal.jsx`: 176 dòng.
3. **Không thêm thư viện bên ngoài:** Sử dụng nguyên trạng `package.json`.
4. **Kiểm thử tự động & Biên dịch:**
   - `npm test`: **67/67 test passed 100%** trên 12 bộ kiểm thử.
   - `npx oxlint`: **0 lỗi (0 errors)**.
   - `npm run build`: Hoàn thành trong **3.98s** với **Exit code 0**.
   - Dev server: Hoạt động ổn định tại `http://127.0.0.1:3100/` (HTTP 200 OK).
