/**
 * Bộ dữ liệu 6 chương video hướng dẫn sử dụng Cọ Nhí Studio lưu cục bộ trong app
 * Tương ứng 6 phân hệ cốt lõi với audio Neural Thuyết minh Nam Minh & Nữ Hoài My
 */

export const VIDEO_CHAPTERS = [
  {
    id: 1,
    partNumber: 'PHẦN 1 / 6',
    title: 'Giới Thiệu Tổng Quan & Khởi Đầu Với Trang Trắng',
    time: '0:00 - 0:45',
    durationSec: 45,
    audioSrc: '/video-guide/audio/part1.mp3',
    targetTab: 'editor',
    highlights: ['100% Cục bộ Ngoại tuyến', 'Không quảng cáo • Miễn phí', 'Chuẩn GDPT 2018'],
    sentences: [
      'Kính chào quý Thầy Cô giáo dạy Mĩ thuật Tiểu học trên mọi miền Tổ quốc!',
      'Một tiết học vẽ thành công luôn bắt đầu từ niềm cảm hứng và sự chuẩn bị chu đáo của Thầy Cô.',
      'Làm sao để vừa có slide bài giảng sinh động, vừa thị phạm nét vẽ dễ hiểu, lại vừa chấm bài theo Thông tư 27 thật nhanh chóng mà hoàn toàn miễn phí?',
      'Chào mừng quý Thầy Cô đến với Cọ Nhí Studio - phần mềm soạn giảng và trình chiếu mĩ thuật chuyên biệt theo bộ sách Kết nối tri thức với cuộc sống.',
      'Không gian làm việc trắng tinh, sạch sẽ, không quảng cáo, sẵn sàng cho những ý tưởng sáng tạo tuyệt vời!'
    ]
  },
  {
    id: 2,
    partNumber: 'PHẦN 2 / 6',
    title: 'Soạn Slide 16:9, Tải Lên & Xuất PowerPoint',
    time: '0:45 - 1:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part2.mp3',
    targetTab: 'editor',
    highlights: ['Tỉ lệ vàng 16:9 sắc nét', 'Nhập / Xuất PowerPoint', 'Phím tắt đứng lớp F5'],
    sentences: [
      'Thao tác trên Cọ Nhí Studio vô cùng quen thuộc và trực quan giống như PowerPoint.',
      'Màn hình trung tâm luôn giữ đúng tỉ lệ vàng 16 chia 9, không bao giờ bị méo hình hay tràn viền trên tivi, máy chiếu.',
      'Thầy Cô có thể dễ dàng thêm chữ, đổi màu sắc tươi sáng, chèn hình khối và hình ảnh minh họa.',
      'Khi cần xóa ảnh hay đối tượng, chỉ cần bấm biểu tượng thùng rác màu đỏ hoặc ấn phím Delete trên bàn phím.',
      'Đặc biệt, nếu Thầy Cô đã có bài PowerPoint cũ, chỉ cần bấm "Tải giáo án PowerPoint lên" để mở ngay trong trình duyệt.',
      'Soạn xong, Thầy Cô có thể bấm "Xuất PowerPoint" để mang đi giảng dạy ở bất cứ đâu!'
    ]
  },
  {
    id: 3,
    partNumber: 'PHẦN 3 / 6',
    title: 'Trợ Lý Sư Phạm AI & Giọng Đọc Thầy Nam / Cô Nữ',
    time: '1:45 - 2:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part3.mp3',
    targetTab: 'dashboard',
    highlights: ['Đàm thoại giọng nói 0.3s', 'Tự đổi giọng Nam/Nữ', 'Gợi ý chuẩn Thông tư 32'],
    sentences: [
      'Điểm khác biệt lớn nhất của Cọ Nhí Studio chính là người bạn Trợ Giảng Sư Phạm luôn túc trực ở góc màn hình.',
      'Thầy Cô chỉ cần chọn khối lớp và bài học, Trợ giảng sẽ gợi ý ngay mục tiêu cần đạt theo Thông tư 32 và thiết kế trò chơi khởi động.',
      'Thầy Cô có thể dùng trợ giảng Cục bộ ngoại tuyến không cần mạng, hoặc dùng AI trực tuyến miễn phí 100%.',
      'Hệ thống trang bị giọng đọc tiếng Việt chuẩn Neural: giọng Thầy giáo Nam Minh trầm ấm hào sảng, hoặc Cô giáo Hoài My nhẹ nhàng truyền cảm xuyên suốt ứng dụng!'
    ]
  },
  {
    id: 4,
    partNumber: 'PHẦN 4 / 6',
    title: 'Bảng Vẽ Thị Phạm 11 Khối 3D & Mini-Game Mĩ Thuật',
    time: '2:45 - 3:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part5.mp3',
    targetTab: 'drawing',
    highlights: ['11 Khối không gian 3D', 'Nét vẽ Bézier mượt mà', 'Mini-game thi đấu giữa các tổ'],
    sentences: [
      'Để giúp học sinh nắm vững cách phác hình và dựng khối, tab Bảng Vẽ Thị Phạm được trang bị đầy đủ 11 hình phẳng và khối 3D.',
      'Nét vẽ được tối ưu bằng thuật toán Bézier bậc 2, giúp Thầy Cô vẽ bằng chuột vẫn mềm mại, tròn trịa.',
      'Vẽ xong, chỉ cần bấm "Chèn Tranh Vào Slide" là tác phẩm đã nằm ngay trên bài giảng!',
      'Hệ thống tích hợp 3 Mini-game mĩ thuật tương tác: Ghép màu nóng lạnh, nhận biết hình khối và tìm chi tiết tranh để học sinh thi đua sôi nổi!'
    ]
  },
  {
    id: 5,
    partNumber: 'PHẦN 5 / 6',
    title: 'Cam Chấm Tranh Rubric TT27 & Sổ Điểm SMAS 35 Tuần',
    time: '3:45 - 4:45',
    durationSec: 60,
    audioSrc: '/video-guide/audio/part6.mp3',
    targetTab: 'evaluation',
    highlights: ['Chấm Webcam/Ảnh 4 tiêu chí', 'Sổ 35 tuần & Sổ tổng hợp', 'Xuất Excel Viettel SMAS'],
    sentences: [
      'Đến khâu đánh giá sản phẩm, chức năng Cam Chấm Tranh sẽ là trợ thủ đắc lực cho Thầy Cô.',
      'Thầy Cô có thể dùng webcam máy tính hoặc tải ảnh chụp bài vẽ của học sinh lên để phân tích bố cục và hòa sắc.',
      'Dựa trên Thang Rubric 4 tiêu chí chuẩn GDPT 2018, app sẽ gợi ý 3 bước cải thiện cụ thể và soạn sẵn câu nhận xét ấm áp, khích lệ.',
      'Tại tab Sổ Điểm SMAS, Thầy Cô quản lý song song Sổ theo dõi thường xuyên 35 tuần và Sổ tổng hợp định kỳ, xuất Excel nộp nhà trường trong chớp mắt!'
    ]
  },
  {
    id: 6,
    partNumber: 'PHẦN 6 / 6',
    title: 'Trình Chiếu F5 Lớp Học, Phím Tắt & Lưu Trữ Cục Bộ',
    time: '4:45 - 6:00',
    durationSec: 75,
    audioSrc: '/video-guide/audio/part7.mp3',
    targetTab: 'editor',
    highlights: ['Toàn màn hình F5 sắc nét', 'Phím tắt B, W, L, Space', 'Lưu an toàn trên máy'],
    sentences: [
      'Khi bước vào giờ dạy, Thầy Cô chỉ cần bấm F5 hoặc nút Trình Chiếu.',
      'Giao diện toàn màn hình sắc nét, điều khiển mượt mà bằng phím bấm hoặc chuột, tích hợp đồng hồ bấm giờ và lời giảng sinh động.',
      'Ứng dụng chạy mượt trên mọi máy tính mà không cần cài đặt phức tạp, dữ liệu lưu an toàn 100% trên máy.',
      'Kính chúc quý Thầy Cô có những tiết dạy mĩ thuật tràn đầy niềm vui và chắp cánh cho ước mơ hội họa của các thế hệ học trò thân yêu!',
      'Xin chân thành cảm ơn quý Thầy Cô!'
    ]
  }
];
