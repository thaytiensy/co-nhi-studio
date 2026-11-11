// Dịch vụ trí tuệ đàm thoại tự nhiên - Trò chuyện như người với người (Natural Pedagogy Chat)
import { findRelevantPedagogyTheme } from './offlineAssistantMatchService.js';
import { PEDAGOGY_BANK } from '../data/pedagogyBank.js';

// Dạng văn bản nói trôi chảy ngắn gọn, độ trễ 0.3s - 0.4s dành cho Cô Giáo Robot phát âm trực tiếp
export function getSpokenDialogueResponse(userText, currentGrade = 1, currentThemeTitle = '') {
  const query = (userText || '').trim();
  const qLower = query.toLowerCase();

  if (/^(chào|xin chào|hello|hi|alo|chào em|chào cô)\b/i.test(qLower) || /bạn là ai|em là ai|tên gì/i.test(qLower)) {
    return 'Dạ em chào Thầy Cô ạ! Em là Cô Giáo Robot AI của Cọ Nhí Studio. Hôm nay Thầy Cô cần em hỗ trợ chuẩn bị bài học hay tình huống nào trong lớp ạ?';
  }
  if (/cảm ơn|thank|tuyệt vời|hay quá|tốt lắm/i.test(qLower)) {
    return 'Dạ không có gì đâu ạ! Được đồng hành cùng Thầy Cô là niềm vui của em. Chúc Thầy Cô và các bé có một tiết học thật vui và sáng tạo nhé!';
  }
  if (/sợ sai|sợ xấu|không dám vẽ|rụt rè|ngại vẽ/i.test(qLower)) {
    return 'Dạ Thầy Cô đừng lo nhé! Với các bé sợ vẽ sai, Thầy Cô hãy bảo bé rằng trong mĩ thuật không có nét nào sai cả, một nét méo có thể biến thành đám mây hay chú sâu ngộ nghĩnh. Bé sẽ tự tin cầm bút ngay ạ!';
  }
  if (/vẽ chậm|không kịp|hết giờ|chậm chạp/i.test(qLower)) {
    return 'Dạ với bé vẽ chậm, Thầy Cô hãy hướng dẫn bé vẽ hình ảnh chính thật to ở giữa giấy trong năm phút đầu, và dùng bản sáp màu nghiêng để tô nền thật nhanh nhé!';
  }
  if (/quên đồ dùng|không mang màu|thiếu giấy/i.test(qLower)) {
    return 'Dạ Thầy Cô có thể cho bé ngồi ghép chung hộp màu với bạn để rèn tinh thần sẻ chia, hoặc hướng dẫn bé vẽ kí họa bằng chính cây bút chì viết bài rất đẹp ạ!';
  }
  if (/hiếu động|nghịch|mất tập trung|nói chuyện/i.test(qLower)) {
    return 'Dạ Thầy Cô hãy giao cho bé vai trò Trợ lý mĩ thuật như phát giấy, chia bảng màu cho bạn, hoặc cho bé tạo hình bằng đất nặn để giải phóng năng lượng tích cực nhé!';
  }
  if (/khởi động|trò chơi|đố vui|khuấy động/i.test(qLower)) {
    return 'Dạ em gợi ý Thầy Cô trò chơi Thám tử mĩ thuật nhé! Thầy Cô chiếu một góc nhỏ bức tranh và đố cả lớp đoán hình. Trò này cực kỳ vui và kích thích các bé tò mò ngay từ phút đầu tiên ạ!';
  }
  if (/câu hỏi|gợi mở|khám phá|tư duy/i.test(qLower)) {
    return 'Dạ Thầy Cô hãy hỏi các bé: Con nhìn thấy màu sắc nào nổi bật nhất, và bức tranh này làm con cảm thấy vui vẻ hay ấm áp? Những câu hỏi mở sẽ giúp các bé hào hứng chia sẻ ngay ạ!';
  }
  if (/nhận xét|đánh giá|thông tư 27|tt27/i.test(qLower)) {
    return 'Dạ nhận xét theo Thông tư hai mươi bảy gồm: Mức T là hoàn thành tốt, sáng tạo độc đáo; Mức H là vẽ đúng chủ đề, màu sắc rõ ràng; và Mức C là cần cố gắng quan sát mẫu kĩ hơn ạ!';
  }
  if (/4 bước|thị phạm|quy trình|các bước/i.test(qLower)) {
    return 'Dạ quy trình bốn bước vẽ gồm: Bước một phác hình lớn ở giữa giấy; Bước hai vẽ chi tiết đặc trưng; Bước ba tô màu hòa sắc; và Bước bốn viền nét tạo điểm nhấn ạ!';
  }

  const bestMatch = findRelevantPedagogyTheme(query, PEDAGOGY_BANK.themes, currentGrade);
  if (bestMatch?.theme) {
    const t = bestMatch.theme;
    return `Dạ về bài ${t.title}, Thầy Cô hãy bắt đầu bằng câu hỏi khám phá hình ảnh xung quanh, rồi hướng dẫn bốn bước vẽ từ hình lớn đến chi tiết nhé!`;
  }
  return `Dạ em đã hiểu ý Thầy Cô về ${query} rồi ạ! Thầy Cô hãy cho các bé quan sát thực tế, khơi gợi cảm xúc tự nhiên và hướng dẫn từng bước tạo hình thật vui nhé!`;
}

export function getNaturalPedagogyResponse(userText, currentGrade = 1, currentThemeTitle = '') {
  const query = (userText || '').trim();
  const qLower = query.toLowerCase();

  // 1. Chào hỏi xã giao & Nhận diện danh tính
  if (/^(chào|xin chào|hello|hi|alo|chào em|chào cô|chào bạn|chào thầy)\b/i.test(qLower) || /bạn là ai|em là ai|tên gì|giới thiệu/i.test(qLower)) {
    return `Dạ em chào Thầy/Cô ạ! ❤️ Em là Cô Trợ Giảng AI của Cọ Nhí Studio, người bạn đồng hành sư phạm mĩ thuật của Thầy/Cô.\n\nHôm nay Thầy/Cô đang chuẩn bị bài giảng cho khối lớp nào, hoặc lớp mình có bé nào gặp khó khăn khi vẽ không ạ? Thầy/Cô cứ trò chuyện tự nhiên, em sẵn sàng cùng Thầy/Cô lên ý tưởng khởi động, soạn câu hỏi gợi mở hay xử lý tình huống lớp học nhé!`;
  }

  // 2. Cảm ơn & Khen ngợi & Tạm biệt
  if (/cảm ơn|thank|tuyệt vời|hay quá|tốt lắm|rất thích|ok em|chuẩn rồi/i.test(qLower)) {
    return `Dạ không có gì đâu ạ! Được đồng hành và hỗ trợ Thầy/Cô mang niềm vui hội họa đến các em học sinh là niềm hạnh phúc lớn của em. Thầy/Cô cần thêm gợi ý nào cho bài giảng cứ nhắn em ngay nhé! Chúc Thầy/Cô có một tiết dạy tràn ngập tiếng cười! 🎨✨`;
  }
  if (/tạm biệt|bye|hẹn gặp lại|nghỉ thôi|hết giờ/i.test(qLower)) {
    return `Dạ em chào Thầy/Cô nhé! Chúc Thầy/Cô có những giờ lên lớp thật thăng hoa cùng các họa sĩ nhí. Hẹn gặp lại Thầy/Cô trong bài giảng tiếp theo ạ! 👋🌸`;
  }

  // 3. Xử lý tâm lý học sinh & Tình huống lớp học mĩ thuật
  if (/sợ sai|sợ xấu|không dám vẽ|rụt rè|ngại vẽ|tự ti|khóc/i.test(qLower)) {
    return `Dạ tình huống này rất phổ biến ở lứa tuổi tiểu học Thầy/Cô ạ! Các bé sợ vẽ sai thường do tâm lý sợ bị chê méo hoặc so sánh với bạn. Em xin chia sẻ 3 bí quyết mà các giáo viên dạy giỏi thường áp dụng:\n\n` +
      `🌱 1. "Nét vẽ biến hóa": Nói với bé rằng trong mĩ thuật không có nét nào là sai! Một nét cong lỡ tay có thể biến thành chiếc cầu vồng, một vệt lem có thể hóa thành đám mây hay chú bọ cánh cam.\n\n` +
      `✏️ 2. Tạm cất tẩy gôm: Khuyến khích bé vẽ bằng bút chì màu hoặc sáp màu nhẹ, không dùng tẩy để tránh bé tẩy xóa nhiều làm rách giấy và mất hứng thú.\n\n` +
      `👏 3. Khen ngợi chi tiết nhỏ: Thay vì khen chung chung, hãy khen: "Cô thích cách con chọn màu đỏ này rất ấm áp", bé sẽ tự tin cầm bút ngay ạ!`;
  }

  if (/vẽ chậm|không kịp|hết giờ|chậm chạp|lề mề/i.test(qLower)) {
    return `Dạ với các bé vẽ chậm, Thầy/Cô có thể áp dụng mẹo phân đoạn thời gian (Scaffolding) rất hiệu quả này ạ:\n\n` +
      `⏱️ 1. Quy tắc hình lớn trước: Yêu cầu bé vẽ ngay 1-2 hình ảnh chính to bằng bàn tay ở giữa giấy trong 5 phút đầu, không sa đà vào mắt mũi hay chi tiết li ti.\n\n` +
      `🖍️ 2. Kỹ thuật tô mảng màu rộng: Hướng dẫn bé dùng bản sáp màu nghiêng để lót màu nền nhanh chóng thay vì dùng đầu nhọn tô từng milimet.\n\n` +
      `🎯 3. Thang đánh giá phân hóa: Bé vẽ chậm chỉ cần hoàn thành hình ảnh chính rõ ràng, tô màu kín mảng là đã đạt yêu cầu (Mức H) rồi Thầy/Cô nhé!`;
  }

  if (/quên đồ dùng|không mang màu|thiếu giấy|quên vở/i.test(qLower)) {
    return `Dạ khi học sinh quên đồ dùng, Thầy/Cô có thể biến đây thành cơ hội rèn luyện tinh thần chia sẻ và sáng tạo:\n\n` +
      `🤝 1. Thành lập "Đôi bạn cùng tiến": Cho bé ngồi cùng bàn chia sẻ hộp màu hoặc giấy với bạn, cùng thảo luận ý tưởng.\n\n` +
      `✏️ 2. Vẽ tranh đen trắng bằng bút chì: Cho bé luyện sắc độ đậm - nhạt bằng chính cây bút chì viết bài, tạo nên một tác phẩm kí họa rất nghệ thuật.\n\n` +
      `🍃 3. Tạo hình từ vật liệu tự nhiên: Tận dụng lá cây rụng ngoài sân trường hoặc giấy vụn để xé dán sáng tạo!`;
  }

  if (/hiếu động|nghịch|mất tập trung|nói chuyện|quậy/i.test(qLower)) {
    return `Dạ với các em học sinh hiếu động, năng lượng dồi dào, Thầy/Cô hãy giao cho bé vai trò "trọng trách" trong tiết học:\n\n` +
      `🌟 1. Cử làm "Trợ lý mĩ thuật": Nhờ bé phát giấy, chia bảng màu hoặc kiểm tra đồ dùng giúp các bạn, bé sẽ cảm thấy được tin tưởng và tập trung hơn.\n\n` +
      `🖐️ 2. Đổi chất liệu xúc giác: Những bé hiếu động thường rất mê đất nặn hoặc xé dán giấy vì được dùng tay vận động trực tiếp.\n\n` +
      `🎯 3. Thử thách tính giờ: "Thầy/Cô đố con tìm và tô xong 3 bông hoa màu vàng trước khi nhạc dừng nhé!"`;
  }

  // 4. Trò chơi khởi động & Khơi gợi hứng thú
  if (/khởi động|trò chơi|đố vui|khuấy động|hứng thú|game/i.test(qLower)) {
    return `Dạ em gợi ý Thầy/Cô 2 trò chơi khởi động 5 phút cực kỳ hào hứng cho giờ Mĩ thuật ạ:\n\n` +
      `🎯 Trò chơi 1: "Thám Tử Mĩ Thuật"\n` +
      `• Thầy/Cô chiếu một góc nhỏ xíu của một bức tranh (hoặc phóng to chi tiết vân lá, mắt chú mèo...).\n` +
      `• Cho các tổ thi tài đoán xem đây là bức tranh hay sự vật gì. Tổ nào đoán nhanh nhất sẽ nhận điểm thưởng!\n\n` +
      `🌈 Trò chơi 2: "Vũ Điệu Sắc Màu"\n` +
      `• Giáo viên hô tên màu sắc (Đỏ, Vàng, Lam, Lục...), học sinh phải nhanh tay chỉ vào một đồ vật hoặc trang phục có màu đó trong lớp. Vừa rèn phản xạ nhận biết màu vừa tạo không khí sôi nổi!`;
  }

  // 5. Câu hỏi gợi mở khám phá thẩm mĩ
  if (/câu hỏi|gợi mở|khám phá|tư duy|hỏi gì/i.test(qLower)) {
    return `Dạ để kích thích tư duy sáng tạo của học sinh, Thầy/Cô nên tránh câu hỏi Đúng/Sai mà hãy dùng hệ thống câu hỏi "Đa giác quan" này ạ:\n\n` +
      `👀 1. Quan sát trực quan: "Con nhìn thấy những hình khối và màu sắc nào nổi bật nhất trong bức tranh này?"\n` +
      `💭 2. Cảm xúc & Liên tưởng: "Bức tranh này gợi cho con nhớ đến kỉ niệm nào, hoặc con cảm thấy vui vẻ, ấm áp hay mát mẻ khi ngắm nhìn nó?"\n` +
      `🎨 3. Thử thách sáng tạo: "Nếu được thêm một chi tiết kì diệu vào bức tranh của mình, con sẽ vẽ thêm điều gì?"`;
  }

  // 6. Nhận xét học sinh theo Thông tư 27/2020/TT-BGDĐT
  if (/nhận xét|đánh giá|thông tư 27|tt27|smas|xếp loại/i.test(qLower)) {
    return `Dạ theo Thông tư 27, nhận xét mĩ thuật cần mang tính khích lệ, cụ thể và không phán xét. Em gợi ý Thầy/Cô các mẫu nhận xét chuẩn SMAS:\n\n` +
      `⭐ Mức T (Hoàn thành tốt): "Em có năng khiếu mĩ thuật nổi bật, biết phối màu hài hòa tươi sáng, đường nét giàu cảm xúc và có ý tưởng sáng tạo độc đáo."\n\n` +
      `⭐ Mức H (Hoàn thành): "Hoàn thành bài vẽ đúng chủ đề, hình ảnh chính rõ ràng, biết sắp xếp bố cục hợp lý và có ý thức giữ gìn sản phẩm sạch đẹp."\n\n` +
      `⭐ Mức C (Cần cố gắng): "Em cần quan sát mẫu kĩ hơn, tự tin đưa nét vẽ to rõ ràng và hoàn thiện bài vẽ đúng thời gian quy định nhé."`;
  }

  // 7. Quy trình 4 bước thị phạm vẽ tranh
  if (/4 bước|thị phạm|quy trình|các bước|hướng dẫn vẽ/i.test(qLower)) {
    return `Dạ quy trình 4 bước thị phạm chuẩn của Bộ sách Kết nối tri thức gồm có:\n\n` +
      `✏️ Bước 1 - Phác hình tổng thể: Dùng nét chì mờ xác định vị trí hình ảnh chính ở trung tâm giấy (luật 1/3), ước lượng tỉ lệ cân đối.\n\n` +
      `🔍 Bước 2 - Vẽ chi tiết: Hoàn thiện các nét đặc trưng của sự vật, thêm các hình ảnh phụ xung quanh làm nền sinh động.\n\n` +
      `🎨 Bước 3 - Tô màu hòa sắc: Chọn gam màu chủ đạo (nóng hoặc lạnh), tô mảng chính trước, mảng phụ sau, tạo độ đậm nhạt.\n\n` +
      `✨ Bước 4 - Hoàn thiện & Tạo điểm nhấn: Dùng sáp màu đậm viền lại nét chính, chấm sáng hoặc trang trí họa tiết tạo sự lung linh.`;
  }

  // 8. Tra cứu theo chủ đề SGK Kết nối tri thức
  const bestMatch = findRelevantPedagogyTheme(query, PEDAGOGY_BANK.themes, currentGrade);
  if (bestMatch?.theme) {
    const t = bestMatch.theme;
    return `Dạ về bài dạy "${t.title}" (Mĩ thuật Lớp ${bestMatch.grade} - SGK Kết nối tri thức), em xin chia sẻ cùng Thầy/Cô:\n\n` +
      `🎙️ Lời giảng gợi mở: "${t.teacherScript}"\n\n` +
      `🔍 Câu hỏi gợi ý cho học sinh:\n${t.questions.map(q => `• ${q}`).join('\n')}\n\n` +
      `🎨 4 Bước thị phạm bài này:\n${t.fourSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `💡 Lời khuyên sư phạm: Khuyến khích các bé vẽ theo cảm xúc tự nhiên của mình, Thầy/Cô không cần ép các nét phải quá chuẩn xác đâu ạ!`;
  }

  // 9. Phản hồi đàm thoại thông minh đa năng
  return `Dạ em đã hiểu ý Thầy/Cô về "${query}" rồi ạ! ❤️\n\n` +
    `Dưới góc nhìn sư phạm mĩ thuật tiểu học GDPT 2018, Thầy/Cô có thể triển khai theo hướng: lấy học sinh làm trung tâm, kết hợp quan sát thực tế và thực hành sáng tạo tự do. Thầy/Cô có thể bấm vào các gợi ý bên dưới hoặc hỏi cụ thể hơn về: trò chơi khởi động, câu hỏi gợi mở, hay cách hướng dẫn từng bước vẽ để em hỗ trợ chi tiết nhất nhé ạ! 🎨`;
}
