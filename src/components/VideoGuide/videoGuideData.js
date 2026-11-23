/**
 * Bộ dữ liệu 6 chương video hướng dẫn sử dụng Cọ Nhí Studio lưu cục bộ trong app
 * Bám sát 100% các phân hệ thực tế: Bento Dashboard, Soạn Slide & Nhận Diện Mọi Tệp Office,
 * Trình Chiếu F5, Bảng Vẽ 11 Khối 3D & Trò Chơi, Cam Chấm Tranh AI, Sổ Điểm SMAS 35 Tuần
 */

export const VIDEO_CHAPTERS = [
  {
    id: 1,
    partNumber: 'PHẦN 1 / 6',
    title: 'Tổng Quan Bento Dashboard & Lịch Báo Giảng 35 Tuần GDPT 2018',
    time: '0:00 - 0:45',
    durationSec: 45,
    audioSrc: '/video-guide/audio/part1.mp3',
    targetTab: 'dashboard',
    highlights: ['Bento Dashboard Trực Quan', 'Lọc Khối Lớp 1 - 5 Chuẩn SGK', 'Nút Nhập Giáo Án PP 1 Chạm', 'Lưu Cục Bộ Vĩnh Viễn'],
    sentences: [
      'Kính chào quý Thầy Cô giáo dạy môn Mĩ thuật Tiểu học trên toàn quốc!',
      'Chào mừng Thầy Cô đến với Cọ Nhí Studio - nền tảng soạn giảng và quản lý mĩ thuật chuyên biệt chuẩn GDPT 2018.',
      'Tại phân hệ Tổng Quan Bento Dashboard, Thầy Cô quản lý trọn vẹn 35 tuần kế hoạch bài dạy theo bộ sách Kết nối tri thức từ Lớp 1 đến Lớp 5.',
      'Bộ lọc thông minh giúp Thầy Cô lọc nhanh theo khối lớp, theo trạng thái Đã dạy hoặc Sắp dạy, kèm các thẻ thống kê KPI tiến độ trực quan.',
      'Đặc biệt, mỗi bài dạy đều tích hợp nút Nhập Giáo Án PP để tải slide bài giảng và nút Trình Chiếu trực tiếp mà không cần nạp lại!'
    ]
  },
  {
    id: 2,
    partNumber: 'PHẦN 2 / 6',
    title: 'Phòng Soạn Slide 16:9, Bộ Nhận Diện Thông Minh Mọi Tệp & Lưu IndexedDB',
    time: '0:45 - 1:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part2.mp3',
    targetTab: 'editor',
    highlights: ['Nhận Diện Mọi File PPTX/PPT/Word/Excel/PDF', 'Lưu Đa Tầng Vào IndexedDB', 'Tỉ Lệ Vàng 16:9 Chuẩn Tivi', 'Chữ To Hỗ Trợ GV 50+'],
    sentences: [
      'Phân hệ PowerPoint & Office sở hữu Bộ nhận diện thông minh xử lý mọi định dạng tệp người dùng tải lên.',
      'Hệ thống tự động đọc tệp PowerPoint mới .pptx, tệp PowerPoint cũ .ppt 97-2003, văn bản Word .docx, .doc, bảng tính Excel và tệp PDF.',
      'Với tệp PowerPoint cũ .ppt, phần mềm tự động bóc tách chuỗi văn bản tạo slide chuẩn và hướng dẫn lưu sang .pptx chỉ trong 3 giây.',
      'Toàn bộ bài giảng được lưu trữ vĩnh viễn vào bộ nhớ IndexedDB trên máy tính giáo viên, chuyển tab hay làm mới trang F5 đều không bao giờ mất bài.',
      'Khung soạn thảo chuẩn tỉ lệ 16:9 sắc nét, phông chữ Times New Roman từ 14pt trở lên, tích hợp chế độ chữ to hỗ trợ giáo viên lớn tuổi!'
    ]
  },
  {
    id: 3,
    partNumber: 'PHẦN 3 / 6',
    title: 'Trình Chiếu Toàn Màn Hình F5 Lớp Học & Tương Thích Bút Trình Chiếu USB',
    time: '1:45 - 2:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part3.mp3',
    targetTab: 'editor',
    highlights: ['Kích Hoạt F5 / F11 Tức Thì', 'Tương Thích 100% Bút Bấm USB', 'Phím Tắt Đứng Lớp B, W, L', 'Vẽ Trực Tiếp Lên Slide'],
    sentences: [
      'Khi bước vào tiết dạy trên lớp, Thầy Cô chỉ cần bấm phím F5 trên bàn phím hoặc nhấp nút Trình Chiếu trên thanh công cụ.',
      'Chế độ toàn màn hình 16:9 tối ưu cho màn hình tivi 55 đến 85 inch và máy chiếu lớp học, mang lại trải nghiệm thị giác cuốn hút.',
      'Hệ thống tương thích hoàn hảo với bút trình chiếu không dây cổng USB, giúp Thầy Cô tự do di chuyển khắp lớp học để hướng dẫn học sinh.',
      'Các phím tắt sư phạm tiện lợi: phím B chuyển màn hình đen tập trung, phím W mở bảng trắng, phím L kích hoạt tia laser chỉ điểm.',
      'Thầy Cô còn có thể dùng cọ dạ quang và bút vẽ điện tử để gạch chân, khoanh tròn điểm nhấn trực tiếp trên trang slide khi giảng bài!'
    ]
  },
  {
    id: 4,
    partNumber: 'PHẦN 4 / 6',
    title: 'Bảng Vẽ Thị Phạm 11 Khối 3D & Sân Chơi Trò Chơi Mĩ Thuật Tương Tác',
    time: '2:45 - 3:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part4.mp3',
    targetTab: 'drawing',
    highlights: ['11 Khối Không Gian 3D Chuẩn SGK', 'Nét Vẽ Bézier Mượt Mà Bằng Chuột', 'Chèn Tranh Vào Slide 1 Chạm', '3 Mini-Game Khởi Động Hào Hứng'],
    sentences: [
      'Bảng Vẽ Thị Phạm được thiết kế như một bàn vẽ nghệ thuật kỹ thuật số phục vụ giáo viên thị phạm các bước tạo hình mẫu.',
      'Trang bị hệ thống 11 khối hình học 3D chuẩn giáo trình: khối hộp, khối cầu, nón, trụ, lăng trụ cùng quy trình 4 bước vẽ chuẩn mực.',
      'Thuật toán làm mượt Bézier bậc hai giúp Thầy Cô vẽ nét bằng chuột máy tính vẫn tròn trịa, mềm mại như vẽ bằng bút vẽ chuyên dụng.',
      'Chỉ với một cú chạm vào nút "Chèn Tranh Vào Slide", nét vẽ thị phạm mẫu sẽ được tự động đưa ngay vào bài giảng đang soạn thảo.',
      'Bên cạnh đó, phân hệ Trò Chơi Mĩ Thuật với 3 mini-game: Bánh xe màu sắc, Nhận biết hình khối và Ghép tranh nghệ thuật giúp lớp học sôi nổi ngay từ phút đầu tiên!'
    ]
  },
  {
    id: 5,
    partNumber: 'PHẦN 5 / 6',
    title: 'Cam Chấm Tranh Mắt Thần AI (Rubric TT27) & Trợ Giảng Cọ Nhí',
    time: '3:45 - 4:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part5.mp3',
    targetTab: 'camera',
    highlights: ['Quét Webcam & Tải Ảnh Tranh', 'Rubric 4 Tiêu Chí GDPT 2018', 'Quy Đổi T, H, C Theo TT 27', 'Đồng Bộ Thẳng Vào Sổ Điểm'],
    sentences: [
      'Phân hệ Cam Chấm Tranh ứng dụng công nghệ trí tuệ nhân tạo thị giác máy tính Gemini Multimodal để thẩm định bài vẽ của học sinh.',
      'Thầy Cô có thể quét bài trực tiếp qua webcam máy tính hoặc tải ảnh chụp tranh từ điện thoại và máy tính lên.',
      'AI thẩm định theo Rubric 4 tiêu chí chuẩn GDPT 2018: Sáng tạo ý tưởng, Bố cục không gian, Kỹ thuật nét màu và Cảm xúc thẩm mĩ.',
      'Hệ thống tự động quy đổi kết quả sang 3 mức theo Thông tư 27: Hoàn thành tốt (T), Hoàn thành (H), Chưa hoàn thành (C).',
      'Đồng thời, Trợ giảng AI soạn sẵn lời nhận xét sư phạm ấm áp, chỉ ra 3 bước cụ thể để hoàn thiện bức tranh và tự động lưu thẳng vào sổ theo dõi!'
    ]
  },
  {
    id: 6,
    partNumber: 'PHẦN 6 / 6',
    title: 'Sổ Điểm SMAS 35 Tuần, Bộ Lọc Lớp Dạy & Xuất Báo Cáo Chuẩn Quy Định',
    time: '4:45 - 6:00',
    durationSec: 75,
    audioSrc: '/video-guide/audio/part6.mp3',
    targetTab: 'evaluation',
    highlights: ['Lọc Đúng Các Lớp Phụ Trách', '2 Sổ: 35 Tuần & Tổng Hợp Định Kỳ', 'Tổng Hợp GK/CK 1 Chạm', 'Xuất Excel SMAS/vnEdu & Word CV 2345'],
    sentences: [
      'Phân hệ Sổ Điểm SMAS giúp Thầy Cô số hóa toàn diện công tác ghi chép và đánh giá học sinh tiểu học.',
      'Bộ lọc lớp dạy thông minh chỉ hiển thị những lớp giáo viên thực dạy, giúp theo dõi danh sách học sinh chuẩn xác và gọn gàng.',
      'Hệ thống quản lý song song Sổ theo dõi đánh giá thường xuyên 35 tuần và Sổ tổng hợp đánh giá định kỳ Giữa kỳ, Cuối kỳ.',
      'Tính năng Tổng hợp định kỳ 1 chạm tự động tính toán tỷ lệ Hoàn thành tốt và đề xuất câu nhận xét không trùng lặp cho từng học sinh.',
      'Thao tác xuất file cực kỳ linh hoạt: Xuất file Excel chuẩn mẫu nhập điểm hệ thống SMAS Viettel và vnEdu, xuất giáo án Word chuẩn Nghị định 30.',
      'Kính chúc quý Thầy Cô có những tiết dạy mĩ thuật tràn ngập cảm hứng và thành công rực rỡ cùng Cọ Nhí Studio!'
    ]
  }
];
