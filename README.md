# Cọ Nhí Studio - Nền Tảng Trình Chiếu & Soạn Giảng Mĩ Thuật Đạt Chuẩn Thương Mại

Cọ Nhí Studio là ứng dụng Web / PWA chuyên biệt dành cho giáo viên Mĩ thuật tiểu học Việt Nam (Lớp 1 đến Lớp 5), thiết kế bám sát chương trình **GDPT 2018**, cấu trúc bài dạy **Công văn 2345/BGDĐT**, chuẩn đánh giá **Thông tư 27/2020/TT-BGDĐT** và bộ sách giáo khoa **Kết Nối Tri Thức Với Cuộc Sống**.

---

## I. SỔ TAY HƯỚNG DẪN DÀNH CHO GIÁO VIÊN (TEACHER'S MANUAL)

### 1. Điều Khiển Trình Chiếu Bằng Phím Tắt & Bút Trình Chiếu USB
Hệ thống Presentation Engine được tối ưu hóa cho công thái học đứng lớp:
- **Tiến trang slide:** `Phím Cách (Space)`, `Mũi tên phải (→)`, `Mũi tên xuống (↓)`, `PageDown` hoặc nút Next trên Bút USB.
- **Lùi trang slide:** `Mũi tên trái (←)`, `Mũi tên lên (↑)`, `PageUp` hoặc nút Prev trên Bút USB.
- **Tắt màn hình tập trung:**
  - `Phím B` (Blackout): Chuyển màn hình đen khi giáo viên giảng giải trực tiếp.
  - `Phím W` (Whiteout): Chuyển màn hình trắng khi dùng làm bảng viết phấn/bút dạ.
- **Toàn màn hình:** `Phím F` hoặc bấm nút Chiếu trên thanh công cụ.
- **Chế độ Chế Ngự Tiêu Điểm (Focus Guard):** Khi Thầy/Cô gõ văn bản trong ô nhập liệu hay ghi chú, toàn bộ phím tắt chuyển slide tự động vô hiệu hóa để không gây nhảy trang ngoài ý muốn.
- **Màn hình tương tác / Bảng thông minh:** Hỗ trợ cử chỉ vuốt ngón tay (Touch Swipe Left/Right) mượt mà.

### 2. Tỷ Lệ Vàng 16:9 & Công Nghệ Hiển Thị Chống Mờ (Subpixel Rendering)
- Khung hình cố định chuẩn 16:9 (1920x1080 / 1280x720).
- Tự động co giãn Letterboxing / Pillarboxing căn giữa tuyệt đối, không méo hình trên TV và Máy chiếu.
- Áp dụng `transform-style: preserve-3d; backface-visibility: hidden;` giúp font chữ, vector SVG và đường nét sắc nét tuyệt đối khi phóng to.

### 3. Công Cụ Tương Tác Trực Tiếp Khi Đang Trình Chiếu
- **Bút vẽ & Bút dạ quang (Highlighter):** Vẽ tự do hoặc đánh dấu chi tiết tranh trực tiếp trên màn hình chiếu; nét vẽ lưu riêng cho từng trang slide.
- **Con trỏ Laser ảo (Virtual Laser Pointer):** Chấm đỏ phát sáng bám theo chuyển động chuột, giúp thu hút sự chú ý của học sinh.
- **Bộ đếm ngược thời gian (Classroom Timer):** Đồng hồ đếm ngược nổi trên góc màn hình với các mốc nhanh (1p, 2p, 5p, 10p), chuông reo báo hiệu khi hết giờ làm bài tập nhóm.

### 4. Tự Động Lưu Nháp (Auto-Save) & Khôi Phục Sự Cố (Crash Recovery)
- Tự động lưu tiến độ chỉnh sửa (debounce 800ms) vào bộ nhớ cục bộ theo từng tài khoản riêng biệt.
- Nếu xảy ra mất điện, tắt trình duyệt đột ngột: Khi mở lại, hệ thống hiển thị banner **"Phát hiện bản nháp chưa lưu"** kèm mốc thời gian và nút **[Khôi phục dữ liệu]** chỉ với 1 cú click.

### 5. Cô Trợ Giảng AI 3D (Bám Sát SGK Kết Nối Tri Thức)
- Nút bấm Trợ Giảng AI 3D dạng Pill Button với huy hiệu online luôn túc trực ở góc màn hình và thanh ghi chú.
- Tự động gợi ý lời giảng truyền cảm hứng, câu hỏi gợi mở, hoạt động khởi động và 4 bước thị phạm chuẩn theo từng chủ đề bài học.
- 100% hoạt động ngoại tuyến không cần Internet và không phát sinh chi phí.

### 6. Cam Chấm Tranh Liên Kết Sổ Điểm SMAS Viettel (Chuẩn TT27)
- Chụp và phân tích bài vẽ học sinh trực tiếp qua camera theo 4 tiêu chí chuẩn TT27.
- Tự động quy đổi mức đánh giá: **T** (Hoàn thành tốt), **H** (Hoàn thành), **C** (Chưa hoàn thành).
- Đồng bộ trực tiếp vào danh sách lớp trong **Sổ Điểm SMAS**.
- Hỗ trợ tổng hợp đánh giá định kỳ Giữa kì (GK), Cuối kì (CK) và xuất file Excel (.xlsx) chuẩn quy cách Viettel SMAS.

### 7. Xuất Bản & Trình Chiếu Ngoại Tuyến 100% (PWA & USB HTML)
- **Xuất file HTML độc lập:** Đóng gói toàn bộ bài giảng thành 1 tệp `.html` duy nhất, copy vào USB cắm vào bất kỳ máy tính nào cũng mở chiếu được ngay không cần Internet hay cài đặt phần mềm.
- **In ấn & Xuất PDF:** Chuẩn khổ giấy A4 hành chính Việt Nam (lề trên/dưới 20mm, lề trái 30mm, lề phải 15mm) với lặp lại tiêu đề bảng biểu.

---

## II. HƯỚNG DẪN DÀNH CHO KỸ SƯ PHÁT TRIỂN (DEVELOPER GUIDE)

### 1. Kiến Trúc Kỹ Thuật Cốt Lõi
- **Frontend Stack:** React 19, TypeScript (Strict Zero `any`), Vite 8, Tailwind CSS 3, Lucide Icons.
- **Data Contracts:** Được định nghĩa tập trung tại `src/types/presentation.ts` (`Slide`, `SlideElement`, `DrawingStroke`, `LessonPlan`, `StudentRecord`, `DraftRecord`, `PresenterState`).
- **File Size Discipline:** Tuân thủ nghiêm ngặt quy tắc tách module nhỏ (< 200 dòng/file).
- **Multi-Tenant User Isolation:** Phân vùng không gian dữ liệu hoàn toàn độc lập qua `userWorkspaceService.js`.

### 2. Đường Ống Kiểm Định Tự Động 4 Bước (`verify.bat` / `verify.sh`)
Chạy kiểm định toàn diện chất lượng phần mềm:
```bash
# Trên Windows:
./verify.bat

# Trên Linux/macOS:
chmod +x verify.sh
./verify.sh
```
Quy trình kiểm định gồm:
1. `npm run typecheck` (Kiểm tra TypeScript `tsc --noEmit`)
2. `npm run lint` (Kiểm tra cú pháp ESLint)
3. `npm test` (Chạy 104/104 kiểm thử đơn vị & hồi quy)
4. `npm run build` (Biên dịch đóng gói Production qua Vite Rollup)

### 3. Kiểm Tra Trực Quan Khung Hình (Visual Responsive Check)
```bash
npx tsx scripts/visual-check.ts
```
Kiểm tra độ co giãn và tỷ lệ 16:9 trên 5 kích thước màn hình: Full HD 1080p, Laptop 900p, Màn tương tác 4:3, iPad và Mobile.

---

## III. GIẤY PHÉP & BẢN QUYỀN
Phát triển phục vụ cộng đồng giáo viên Mĩ thuật Tiểu học Việt Nam theo chương trình GDPT 2018.
Bản quyền thuộc về **Cọ Nhí Studio**.
