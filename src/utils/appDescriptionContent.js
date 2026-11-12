/**
 * Nội dung chi tiết chuẩn mực cho File Mô Tả & Hướng Dẫn Sử Dụng Cọ Nhí Studio
 * Căn cứ pháp lý: Chương trình GDPT 2018, Công văn 2345/BGDĐT, Thông tư 27/2020/TT-BGDĐT
 * Bộ sách giáo khoa: Kết nối tri thức với cuộc sống (Lớp 1 - Lớp 5)
 */

export const APP_DESCRIPTION_META = {
  appName: 'Cọ Nhí Studio',
  version: '2.1 (GDPT 2018 - Kết Nối Tri Thức)',
  publisher: 'Ban Phát Triển Phần Mềm Sư Phạm Mĩ Thuật Tiểu Học',
  targetAudience: 'Giáo viên Mĩ thuật Tiểu học trên toàn quốc',
  schoolYear: '2026 - 2027',
  license: 'Bản quyền giáo dục - Hoàn toàn miễn phí & 100% Lưu trữ cục bộ Offline'
};

export const LEGAL_FRAMEWORK = [
  {
    title: 'Chương trình Giáo dục phổ thông 2018 (môn Mĩ thuật)',
    code: 'Thông tư số 32/2018/TT-BGDĐT ngày 26/12/2018',
    description: 'Phát triển toàn diện 3 năng lực đặc thù: Quan sát và nhận thức thẩm mĩ; Sáng tạo và ứng dụng thẩm mĩ; Phân tích và đánh giá thẩm mĩ.'
  },
  {
    title: 'Kế hoạch bài dạy chuẩn cấu trúc 4 hoạt động',
    code: 'Công văn số 2345/BGDĐT-GDTH ngày 07/06/2021',
    description: 'Quy chuẩn giáo án: Khởi động - Khám phá - Luyện tập sáng tạo - Phân tích đánh giá, kèm mục tiêu và thiết bị dạy học.'
  },
  {
    title: 'Đánh giá học sinh tiểu học môn Mĩ thuật',
    code: 'Thông tư số 27/2020/TT-BGDĐT ngày 04/09/2020',
    description: 'Đánh giá định lượng 3 mức: T (Hoàn thành tốt), H (Hoàn thành), C (Chưa hoàn thành) kết hợp nhận xét thường xuyên không trùng lặp.'
  },
  {
    title: 'Bộ sách giáo khoa giảng dạy',
    code: 'Kết nối tri thức với cuộc sống (Lớp 1 - 5)',
    description: 'Bám sát toàn bộ chủ đề, bài học phân phối 35 tuần/năm học của Nhà xuất bản Giáo dục Việt Nam.'
  }
];

export const CORE_MODULES = [
  {
    id: 1,
    name: 'Phân hệ 1: Tổng Quan (Dashboard) & Lịch Báo Giảng SMAS',
    highlights: 'Quản lý 35 tuần thực dạy, thống kê KPI trực quan, nhập giáo án PP tự động',
    details: 'Theo dõi tiến độ giảng dạy Khối 1 - Khối 5. Cho phép lọc nhanh theo khối và trạng thái Đã dạy/Sắp dạy. Tích hợp nút Nhập Giáo Án PP chuyển thẳng sang chế độ soạn bài giảng. Hỗ trợ sao lưu và đồng bộ dữ liệu an toàn.'
  },
  {
    id: 2,
    name: 'Phân hệ 2: Soạn Thảo Slide Chuẩn 16:9 & Giáo Án Công Văn 2345',
    highlights: 'Khung hình vàng 16:9 không méo hình, xuất/nhập PowerPoint (.pptx) nguyên vẹn',
    details: 'Soạn giáo án điện tử trực quan với đầy đủ công cụ vẽ, chèn ảnh, hình khối, bảng màu nóng/lạnh. Tự động sinh tiến trình 4 hoạt động theo Công văn 2345 chỉ với 1 cú nhấp chuột. Xuất file PowerPoint để trình chiếu cơ động.'
  },
  {
    id: 3,
    name: 'Phân hệ 3: Trợ Giảng Sư Phạm AI 3D (Đàm Thoại Giọng Nói 0,3s)',
    highlights: 'Cô giáo robot 3D có cử chỉ biểu cảm, đàm thoại song ngữ, độ trễ 0.3s - 0.4s',
    details: 'Đồng hành cùng giáo viên trong từng tiết dạy. Hỗ trợ chuyển đổi linh hoạt giữa giọng Thầy giáo Nam Minh trầm ấm và Cô giáo Hoài My truyền cảm xuyên suốt ứng dụng. Tư vấn phương pháp sư phạm, câu hỏi gợi mở chuẩn TT32.'
  },
  {
    id: 4,
    name: 'Phân hệ 4: Bảng Vẽ Thị Phạm 11 Khối 3D & Quy Trình 4 Bước',
    highlights: '11 khối không gian 3D, nét vẽ mượt Bézier, nút 1 chạm "Chèn Tranh Vào Slide"',
    details: 'Hỗ trợ giáo viên thị phạm vẽ nét, vẽ hình phẳng và 11 khối 3D (cầu, trụ, nón, lập phương, hộp). Ngân hàng thị phạm 4 bước vẽ con vật, đồ vật, phong cảnh theo chuẩn SGK Kết nối tri thức.'
  },
  {
    id: 5,
    name: 'Phân hệ 5: Trò Chơi Mĩ Thuật Tương Tác Lớp Học',
    highlights: 'Mini-game khởi động hào hứng: Ghép màu nóng lạnh, Đố vui hình khối, Ghép tranh',
    details: 'Tạo không khí học tập sôi nổi đầu giờ hoặc củng cố cuối tiết. Tích hợp âm thanh khích lệ, tính điểm theo tổ/nhóm, học sinh tương tác hào hứng và ghi nhớ kiến thức thẩm mĩ sâu sắc.'
  },
  {
    id: 6,
    name: 'Phân hệ 6: Cam Chấm Tranh Rubric TT27 & Xuất Sổ Điểm SMAS',
    highlights: 'Chấm qua Webcam/ảnh theo 4 tiêu chí Rubric TT27, 2 sổ điểm (35 tuần & Định kỳ)',
    details: 'Nhận diện bố cục và hòa sắc bài vẽ của học sinh cục bộ trên máy. Tự động phân loại T, H, C kèm gợi ý 3 bước tiến bộ. Quản lý đồng thời Sổ theo dõi thường xuyên 35 tuần và Sổ tổng hợp định kỳ, xuất file Excel chuẩn Viettel SMAS.'
  }
];

export const CLASSROOM_SHORTCUTS = [
  { key: 'F5 / F11', action: 'Bật / Tắt chế độ trình chiếu toàn màn hình lớp học' },
  { key: 'Mũi tên Trái / Phải (← / →)', action: 'Chuyển đổi slide trước / sau mượt mà' },
  { key: 'Phím Cách (Space)', action: 'Chuyển sang trang slide kế tiếp' },
  { key: 'Phím B (Black screen)', action: 'Màn hình đen tạm thời để học sinh tập trung lắng nghe' },
  { key: 'Phím W (White screen)', action: 'Màn hình trắng để giáo viên dùng bút vẽ thị phạm' },
  { key: 'Phím L (Laser pointer)', action: 'Bật/tắt con trỏ laser chỉ điểm thẩm mĩ trên tranh' },
  { key: 'Phím Esc', action: 'Thoát chế độ trình chiếu quay về giao diện soạn thảo' }
];

export const TEACHING_STEPS = [
  { step: 'Bước 1: Chuẩn bị', desc: 'Chọn khối lớp và bài dạy trong Lịch Báo Giảng, xem gợi ý mục tiêu năng lực từ Trợ Giảng AI.' },
  { step: 'Bước 2: Soạn Slide', desc: 'Tận dụng mẫu slide 16:9 hoặc tải giáo án PowerPoint cũ lên để chỉnh sửa bổ sung.' },
  { step: 'Bước 3: Vẽ thị phạm', desc: 'Sử dụng Bảng vẽ 11 khối 3D để phác thảo các bước vẽ mẫu, chèn trực tiếp vào bài giảng.' },
  { step: 'Bước 4: Đứng lớp', desc: 'Bấm F5 trình chiếu, cho học sinh chơi mini-game khởi động và nghe Cô Trợ Giảng AI đàm thoại.' },
  { step: 'Bước 5: Đánh giá & Xuất SMAS', desc: 'Dùng Cam Chấm Tranh nhận xét sản phẩm của học sinh, lưu sổ điểm 35 tuần và xuất Excel nộp nhà trường.' }
];
