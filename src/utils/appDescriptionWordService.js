/**
 * Dịch vụ xuất file Word (.doc) Mô tả và Hướng dẫn sử dụng Cọ Nhí Studio
 * Chuẩn phông Times New Roman, Quốc hiệu Tiêu ngữ, Căn lề chuẩn văn bản giáo dục
 */

import {
  APP_DESCRIPTION_META,
  LEGAL_FRAMEWORK,
  CORE_MODULES,
  CLASSROOM_SHORTCUTS,
  TEACHING_STEPS
} from './appDescriptionContent.js';

const DOC_CSS = `
  @page { size: A4 portrait; margin: 2.0cm 2.0cm 2.0cm 3.0cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.35; color: #000; }
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .header-table td { border: none; vertical-align: top; padding: 0; }
  .text-center { text-align: center; }
  .bold { font-weight: bold; }
  .italic { font-style: italic; }
  .uppercase { text-transform: uppercase; }
  h1 { font-size: 16pt; text-align: center; margin: 16px 0 6px 0; color: #b45309; }
  h2 { font-size: 14pt; margin: 14px 0 6px 0; color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 2px; }
  h3 { font-size: 13pt; margin: 10px 0 4px 0; color: #0f172a; }
  table.content-table { width: 100%; border-collapse: collapse; margin: 8px 0 14px 0; }
  table.content-table th, table.content-table td { border: 1pt solid #333; padding: 5px 7px; font-size: 12pt; }
  table.content-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
  .highlight-box { border: 1pt dashed #b45309; background-color: #fffbeb; padding: 8px 12px; margin: 10px 0; }
`;

/**
 * Sinh chuỗi HTML định dạng Word XML chuẩn văn bản giáo dục
 * @returns {string}
 */
export function generateAppDescriptionDocHtml() {
  const today = new Date();
  const dateStr = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Tai_Lieu_Mo_Ta_Va_Huong_Dan_Su_Dung_Co_Nhi_Studio</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
  <style>${DOC_CSS}</style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <span class="bold uppercase" style="font-size: 11pt;">BỘ GIÁO DỤC VÀ ĐÀO TẠO</span><br>
        <span class="bold uppercase" style="font-size: 11pt;">DỰ ÁN PHẦN MỀM SƯ PHẠM</span><br>
        <span style="font-size: 11pt;">Số: 2026/HDSD-CNSTUDIO</span>
      </td>
      <td style="width: 55%; text-align: center;">
        <span class="bold uppercase" style="font-size: 12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br>
        <span class="bold" style="font-size: 12pt;">Độc lập - Tự do - Hạnh phúc</span><br>
        <span style="font-size: 11pt;">---------------</span><br>
        <span class="italic" style="font-size: 11pt;">Hà Nội, ${dateStr}</span>
      </td>
    </tr>
  </table>

  <h1>TÀI LIỆU MÔ TẢ PHẦN MỀM & HƯỚNG DẪN SỬ DỤNG</h1>
  <div class="text-center bold" style="font-size: 14pt; color: #b45309; margin-bottom: 4px;">
    CỌ NHÍ STUDIO - PHIÊN BẢN ${APP_DESCRIPTION_META.version}
  </div>
  <div class="text-center italic" style="font-size: 11pt; margin-bottom: 12px;">
    Nền tảng soạn giảng và trình chiếu mĩ thuật chuyên biệt cho giáo viên Tiểu học (Kết nối tri thức)
  </div>

  <div class="highlight-box">
    <span class="bold">⭐ Tóm lược:</span> Ứng dụng hoạt động 100% Cục bộ Ngoại tuyến (Offline-First), không quảng cáo, bảo mật dữ liệu học sinh tuyệt đối, tích hợp Trợ Giảng Sư Phạm AI 3D đàm thoại phản hồi 0,3s và xuất sổ điểm Viettel SMAS theo Thông tư 27/2020/TT-BGDĐT.
  </div>

  <h2>I. CĂN CỨ PHÁP LÝ & TIÊU CHUẨN SƯ PHẠM</h2>
  <table class="content-table">
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 32%;">Văn bản quy định</th>
        <th style="width: 25%;">Số hiệu văn bản</th>
        <th style="width: 35%;">Áp dụng trong Cọ Nhí Studio</th>
      </tr>
    </thead>
    <tbody>
      ${LEGAL_FRAMEWORK.map((item, i) => `
        <tr>
          <td class="text-center bold">${i + 1}</td>
          <td class="bold">${item.title}</td>
          <td>${item.code}</td>
          <td>${item.description}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <h2>II. CHI TIẾT 6 PHÂN HỆ CỐT LÕI CỦA ỨNG DỤNG</h2>
  ${CORE_MODULES.map(m => `
    <h3>${m.name}</h3>
    <p><span class="bold">Đặc điểm nổi bật:</span> ${m.highlights}</p>
    <p><span class="bold">Chi tiết tính năng:</span> ${m.details}</p>`).join('')}

  <h2>III. QUY TRÌNH 5 BƯỚC SOẠN & GIẢNG DẠY TIẾT MĨ THUẬT</h2>
  <table class="content-table">
    <thead>
      <tr><th style="width: 22%;">Tiến trình</th><th style="width: 78%;">Nội dung hướng dẫn thao tác chi tiết</th></tr>
    </thead>
    <tbody>
      ${TEACHING_STEPS.map(s => `<tr><td class="bold">${s.step}</td><td>${s.desc}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>IV. BẢNG PHÍM TẮT ĐIỀU KHIỂN TRÌNH CHIẾU ĐỨNG LỚP</h2>
  <table class="content-table">
    <thead>
      <tr><th style="width: 30%;">Phím bấm</th><th style="width: 70%;">Tác vụ sư phạm</th></tr>
    </thead>
    <tbody>
      ${CLASSROOM_SHORTCUTS.map(sc => `<tr><td class="bold text-center">${sc.key}</td><td>${sc.action}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>V. CAM KẾT BẢO MẬT & HỖ TRỢ KỸ THUẬT</h2>
  <p>- <span class="bold">Bảo vệ dữ liệu:</span> Toàn bộ hình ảnh, bài vẽ và sổ SMAS lưu 100% cục bộ trên máy tính giáo viên.</p>
  <p>- <span class="bold">Cơ động:</span> Xuất/nhập file sao lưu (.json), giáo án PowerPoint (.pptx) và Excel (.xlsx) mượt mà.</p>

  <table class="header-table" style="margin-top: 35px;">
    <tr>
      <td style="width: 50%; text-align: center;">
        <span class="bold uppercase">GIÁO VIÊN BỘ MÔN MĨ THUẬT</span><br>
        <span class="italic">(Ký và ghi rõ họ tên)</span><br><br><br>
      </td>
      <td style="width: 50%; text-align: center;">
        <span class="bold uppercase">BAN PHÁT TRIỂN PHẦN MỀM</span><br>
        <span class="italic">(Ký số & Đóng dấu xác nhận)</span><br><br><br>
        <span class="bold" style="color: #b45309;">CỌ NHÍ STUDIO GDPT 2018</span>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Tải file Word (.doc) về máy tính người dùng ngay lập tức
 * @returns {void}
 */
export function downloadAppDescriptionWordDoc() {
  if (typeof window === 'undefined') return;
  const html = generateAppDescriptionDocHtml();
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  const filename = `Co_Nhi_Studio_Huong_Dan_Su_Dung_Va_Mo_Ta_Phan_Mem.doc`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
