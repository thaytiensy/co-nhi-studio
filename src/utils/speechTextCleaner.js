// Tiện ích tiền xử lý và cắt đoạn văn bản thông minh tiếng Việt cho Trợ lý giọng nói Cọ Nhí Studio
// Chuẩn hóa phát âm sư phạm, triệt tiêu lỗi XML SSML (& -> và), loại bỏ emoji và watermark

export function cleanSmartVietnameseSpeechText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // 1. Loại bỏ watermark, số điện thoại, zalo, bản quyền mẫu
  text = text
    .replace(/(zalo|sđt|hotline|liên hệ|thiết kế|template|bản quyền)[^\n.?!]*/gi, '')
    .replace(/0[35789]\d{8}/g, '');

  // 2. Loại bỏ các tiền tố khô khan, máy móc
  text = text.replace(/^(Tiêu đề|Tên bài|Tên chủ đề|Nội dung|Ghi chú|Lời giảng)\s*[:：-]\s*/gi, '');

  // 3. Mở rộng từ viết tắt sư phạm quen thuộc thành tiếng Việt đầy đủ, tự nhiên
  text = text
    .replace(/\bSGK\b/gi, 'Sách giáo khoa')
    .replace(/\bGDPT\b/gi, 'Giáo dục phổ thông')
    .replace(/\bTT\s*27\b/gi, 'Thông tư hai mươi bảy')
    .replace(/\bVBT\b/gi, 'Vở bài tập')
    .replace(/\bGV\b/g, 'Thầy Cô')
    .replace(/\bHS\b/g, 'các em học sinh')
    .replace(/\bHĐ\b/gi, 'Hoạt động')
    .replace(/\bMT\b/gi, 'Mĩ thuật')
    .replace(/\bĐDDH\b/gi, 'Đồ dùng dạy học');

  // 4. QUAN TRỌNG: Thay thế dấu & thành "và" để triệt tiêu 100% lỗi cú pháp XML SSML ở các slide 2+
  text = text.replace(/\s*&\s*/g, ' và ');

  // 5. Chuẩn hóa bước thị phạm mĩ thuật rõ ràng
  text = text
    .replace(/\bB1\s*[:.-]\s*/gi, 'Bước một: ')
    .replace(/\bB2\s*[:.-]\s*/gi, 'Bước hai: ')
    .replace(/\bB3\s*[:.-]\s*/gi, 'Bước ba: ')
    .replace(/\bB4\s*[:.-]\s*/gi, 'Bước bốn: ')
    .replace(/\bBước\s*1\b/gi, 'Bước một')
    .replace(/\bBước\s*2\b/gi, 'Bước hai')
    .replace(/\bBước\s*3\b/gi, 'Bước ba')
    .replace(/\bBước\s*4\b/gi, 'Bước bốn');

  // 6. Lọc emoji, ký tự markdown, ký hiệu đầu dòng và thẻ XML đặc biệt
  text = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
    .replace(/[#*_\x60~<>{}[\]\\]/g, ' ')
    .replace(/[•●▪▫➢➔✔✅\-+❓❗]/g, ', ')
    .replace(/\s*;\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

export function splitTextIntoChunks(text, maxLength = 140) {
  const rawSentences = String(text).match(/[^.!?;\n]+[.!?;]*|\n+/g) || [];
  const chunks = [];
  let current = '';

  for (const rawSentence of rawSentences) {
    const part = rawSentence.replace(/\s+/g, ' ').trim();
    if (!part) continue;

    if (part.length > maxLength) {
      if (current) chunks.push(current);
      current = '';
      for (const word of part.split(/\s+/)) {
        if (current && `${current} ${word}`.length > maxLength) {
          chunks.push(current);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
    } else if (current && `${current} ${part}`.length > maxLength) {
      chunks.push(current);
      current = part;
    } else {
      current = current ? `${current} ${part}` : part;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text.trim()];
}
