# BÁO CÁO TRẠNG THÁI DỰ ÁN CỌ NHÍ STUDIO (PROJECT_STATE.md)

> **Cập nhật hệ thống:** 2026-11-11 23:25:00 (Giờ Việt Nam)  
> **Kiến trúc:** React 19 + Vite 8 + Tailwind CSS + Strict TypeScript (Zero `any`)  
> **Tiêu chuẩn:** GDPT 2018 • Công văn 2345/BGDĐT • Thông tư 27/2020/TT-BGDĐT • SMAS Viettel

---

## 1. Project Overview & Scope
- **Mục tiêu:** Web Application chuyên biệt hỗ trợ giáo viên tiểu học soạn bài giảng mĩ thuật tương tác, trình chiếu chuyên nghiệp chuẩn thương mại 16:9, bảng vẽ thị phạm 4 bước, chấm tranh camera AI, và quản lý sổ điểm học sinh đồng bộ định dạng SMAS Viettel.
- **Phạm vi hoàn thiện 10 Phases:**
  - [x] Phase 1: Quản trị trạng thái (`PROJECT_STATE.md`) & Rào chắn an toàn (`verify.sh`, `verify.bat`)
  - [x] Phase 2: Khóa Data Contract & Nghiệp vụ Sư phạm VN (CV 2345, TT27, SGK Kết nối tri thức - `src/types/presentation.ts`, `src/utils/smasValidator.ts`)
  - [x] Phase 3: Engine Trình Chiếu Khóa Tỷ Lệ 16:9 & Subpixel Antialiasing (`PresentationStage.tsx`, `useStageScale.ts`)
  - [x] Phase 4: Điều khiển diễn giả, Presenter View, USB Clicker & Focus Guard (`usePresenterControls.ts`, `PresenterViewModal.tsx`)
  - [x] Phase 5: Bộ công cụ lớp học: Bút vẽ Canvas, Laser ảo, Hẹn giờ thảo luận (`ClassroomTimer.tsx`, `SlideDrawingCanvas.tsx`)
  - [x] Phase 6: Auto-Save Resilience, Crash Recovery Banner & State Feedback Zero-State (`useAutoSaveDraft.ts`, `CrashRecoveryBanner.tsx`, `StateFeedback.tsx`)
  - [x] Phase 7: Engine Xuất bản: PDF chuẩn in ấn A4 & Standalone HTML chạy offline USB (`exportEngine.ts`, `htmlSlideExportService.js`)
  - [x] Phase 8: Virtualization DOM 3 slide, Media Lifecycle tự ngắt & PWA Service Worker 100% (`useSlideVirtualization.ts`, `public/sw.js`)
  - [x] Phase 9: Kiểm định thị giác đa màn hình & Cẩm nang giáo viên toàn diện (`scripts/visual-check.ts`, `README.md`)
  - [x] Phase 10: Chạy kiểm định `./verify.bat`, 0 lỗi biên dịch, cập nhật nút Trợ Giảng AI 3D chuẩn hình mẫu & Bàn giao (`HANDOFF.json`)

---

## 2. Approved Libraries & Tools
- **Giao diện & Biểu tượng:** React 19, Lucide React, Tailwind CSS 3, Canvas-Confetti
- **Trình chiếu & Tài liệu:** PPTXGenJS, JSZip, SheetJS (`xlsx`)
- **Âm thanh & Giọng đọc:** Web Speech API, `speechService` (Nam Minh & Hoài My)
- **Kiểm định chất lượng:** TypeScript 5.8+ (`tsc --noEmit`), Oxlint, Node.js Test Runner (`node test.cjs`), Vite 8

---

## 3. Data Contracts Locked
- `src/types/presentation.ts`: Định nghĩa chặt chẽ 100% không `any`:
  - `SlideElement`, `Slide`, `DrawingStroke`, `LessonPlan` (CV 2345), `StudentRecord` (TT27), `DraftRecord`, `PresenterState`
- `src/contracts/authContract.js`: Quản lý phiên làm việc đa người dùng và phân quyền quản trị
- `src/utils/smasValidator.ts`: Kiểm định cell-by-cell từng dòng/cột sổ điểm SMAS Viettel

---

## 4. Completed Modules
- Presentation Engine chuẩn thương mại: Khóa tỷ lệ 16:9 Letterboxing, chống mờ Subpixel, Focus Guard chống xung đột nhập liệu
- Presenter View chuyên nghiệp: Hiển thị slide hiện tại, xem trước slide kế tiếp, ghi chú sư phạm và đồng hồ tính giờ
- Bộ công cụ tương tác lớp học: Bút vẽ canvas, bút dạ quang, tẩy, con trỏ laser ảo đỏ bám chuột, Classroom Countdown Timer
- Cơ chế bảo toàn dữ liệu: Auto-Save debounce 800ms, Crash Recovery Banner nhận diện bản nháp chưa lưu, phân vùng cách ly người dùng
- Trợ Giảng AI 3D: Nút Pill Button thiết kế chuẩn hình mẫu với avatar cô giáo robot 3D, hỗ trợ SGK Kết Nối Tri Thức Lớp 1-5, không lỗi
- Xuất bản đa định dạng: File HTML độc lập cắm USB trình chiếu offline, In ấn / Xuất PDF lề A4 hành chính Việt Nam
- Sổ Điểm SMAS Viettel: Cam chấm tranh tự động lưu xếp loại T, H, C, tổng hợp định kỳ Giữa kì / Cuối kì và xuất file Excel .xlsx chuẩn

---

## 5. In-Progress & Blockers
- **Trạng thái:** Toàn bộ 10 Phase đã hoàn thành 100%.
- **Rào cản (Blockers):** Không có blocker. Hệ thống đạt 104/104 kiểm thử đơn vị, 0 lỗi TypeScript, 0 lỗi Build.
