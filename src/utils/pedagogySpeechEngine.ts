/**
 * Động cơ Sư Phạm GDPT 2018 - Tự động xây dựng lời giảng truyền cảm hứng theo từng slide
 * Hoạt động 100% ngoại tuyến độc lập, chuẩn sách Mĩ thuật Kết Nối Tri Thức
 */
export interface SlideSpeechParams {
  slideTitle?: string;
  slideContent?: string;
  slide?: unknown;
  grade?: number | string;
}

export function buildSlideTeacherSpeech({
  slideTitle = '',
  slideContent = '',
  grade = 1,
}: SlideSpeechParams): string {
  const cleanTitle = (slideTitle || '').trim();
  const cleanContent = (slideContent || '').trim();
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();

  // 1. Lời chào & Dẫn nhập theo giai đoạn tiến trình tiết dạy (Công văn 2345)
  let stageGreeting = cleanTitle 
    ? `Thầy/Cô chào các em học sinh yêu quý! Trong bài học "${cleanTitle}", thầy trò chúng mình cùng nhau khám phá những nét đẹp nghệ thuật mĩ thuật nhé.`
    : `Thầy/Cô chào các em học sinh yêu quý! Hôm nay chúng mình cùng bước vào bài học mĩ thuật với tinh thần sáng tạo và hào hứng nhé.`;

  if (/khởi động|trò chơi|đố vui|bắt đầu|mở đầu/i.test(fullText)) {
    stageGreeting = `Thầy/Cô chào cả lớp! Để bắt đầu tiết học thật sôi nổi, chúng mình cùng tham gia một hoạt động khởi động thú vị nhé! Các em hãy chú ý lên màn hình nào.`;
  } else if (/khám phá|quan sát|nhận biết|tìm hiểu/i.test(fullText)) {
    stageGreeting = `Các em thân yêu, bây giờ chúng mình cùng hướng mắt lên màn hình để bước vào phần Khám phá những điều kì diệu của mĩ thuật Kết Nối Tri Thức nhé.`;
  } else if (/thực hành|luyện tập|sáng tạo|vẽ|nặn|xé dán|tạo hình/i.test(fullText)) {
    stageGreeting = `Đã đến giờ thực hành sáng tạo rồi! Các em hãy chuẩn bị đầy đủ đồ dùng học tập và cùng Thầy/Cô thể hiện ý tưởng độc đáo của riêng mình nào.`;
  } else if (/trưng bày|chia sẻ|đánh giá|cảm nhận|tổng kết/i.test(fullText)) {
    stageGreeting = `Thầy/Cô rất vui khi thấy những tác phẩm rực rỡ sắc màu của các em đã hoàn thành. Bây giờ chúng mình cùng bước vào phần Trưng bày và Cảm nhận nhé!`;
  }

  // 2. Nhận diện chất liệu và chủ đề cụ thể
  let inquiryQuestion = `Các em hãy quan sát xem trong hình ảnh này, điểm nào làm các em chú ý và cảm thấy ấn tượng nhất?`;
  let techniqueTip = `Bí quyết mĩ thuật: Phối hợp hài hòa giữa mảng sáng và mảng tối, đặt chi tiết chính ở vị trí cân đối để tác phẩm thật nổi bật nhé.`;
  let encouragement = `Mỗi nét vẽ của các em đều chứa đựng câu chuyện rất riêng. Thầy/Cô chúc các em tự tin sáng tạo tác phẩm độc đáo của mình!`;

  if (/sáp màu|tô màu|màu sắc|gam màu|màu nóng|màu lạnh|phối màu/i.test(fullText)) {
    inquiryQuestion = `Đố các em tìm thấy gam màu nóng rực rỡ và gam màu lạnh mát dịu đang cùng xuất hiện ở những chi tiết nào trên trang?`;
    techniqueTip = `Bí quyết dùng sáp màu: Viền nhẹ theo mép hình trước, sau đó di màu đều tay theo một chiều từ trên xuống dưới để màu mịn và đều nhé.`;
    encouragement = `Hãy tự do chọn những gam màu em yêu thích nhất để bức tranh thật sinh động!`;
  } else if (/đất nặn|tạo khối|nặn/i.test(fullText)) {
    inquiryQuestion = `Để tạo nên hình khối sinh động này, các em thấy cần kết hợp những khối cơ bản nào như khối tròn, khối trụ hay khối dẹt?`;
    techniqueTip = `Bí quyết nặn: Nhào đất thật mềm dẻo, nặn các bộ phận to trước, miết nhẹ mối nối cho thật chắc chắn rồi mới gắn chi tiết nhỏ nhé.`;
    encouragement = `Đôi bàn tay khéo léo của các em sẽ biến những thỏi đất nặn thành những nhân vật vô cùng đáng yêu!`;
  } else if (/xé dán|giấy màu|cắt dán/i.test(fullText)) {
    inquiryQuestion = `Các em có thấy đường viền xé bằng tay tạo nên nét mộc mạc tự nhiên và mềm mại hơn dùng kéo cắt không nào?`;
    techniqueTip = `Bí quyết xé dán: Xé các mảng hình lớn trước để định hình bố cục, chấm hồ vừa đủ ở mặt sau rồi miết phẳng từ giữa ra mép nhé.`;
    encouragement = `Cứ thoải mái xé theo cảm nhận của mình, nét xé tự nhiên luôn mang lại vẻ đẹp độc đáo!`;
  } else if (/chân dung|khuôn mặt|người|bạn|thầy|cô/i.test(fullText)) {
    inquiryQuestion = `Khuôn mặt của nhân vật đang thể hiện nét mặt và cảm xúc gì? Đôi mắt và nụ cười gợi cho em cảm giác như thế nào?`;
    techniqueTip = `Bí quyết vẽ chân dung: Mắt nằm ở khoảng giữa khuôn mặt, miệng ở khoảng một phần ba phía dưới. Vẽ thêm mái tóc và biểu cảm tươi vui nhé.`;
    encouragement = `Hãy nghĩ về nụ cười ấm áp của người thân hay bạn bè để gửi gắm tình cảm chân thành vào bài vẽ!`;
  } else if (/phong cảnh|thiên nhiên|quê hương|biển|cây|núi|nhà/i.test(fullText)) {
    inquiryQuestion = `Trong khung cảnh thiên nhiên này, các em quan sát thấy cảnh vật ở gần và ở xa có kích thước, độ đậm nhạt khác nhau ra sao?`;
    techniqueTip = `Luật xa gần: Cảnh ở gần vẽ to, rõ nét và màu đậm đà; cảnh ở xa vẽ nhỏ hơn, màu nhạt dần để tạo chiều sâu không gian nhé.`;
    encouragement = `Thiên nhiên quê hương ta vô cùng tươi đẹp, các em hãy mang tình yêu đất nước vào từng nét vẽ của mình!`;
  }

  return `${stageGreeting}\n\n` +
    `🤔 Câu hỏi gợi mở cho học sinh:\n${inquiryQuestion}\n\n` +
    `💡 Bí quyết sư phạm & Hướng dẫn thực hành:\n${techniqueTip}\n\n` +
    `❤️ Lời khích lệ của Thầy/Cô:\n${encouragement}`;
}
