/**
 * Cọ Nhí Studio - Bộ xuất báo cáo chuyên nghiệp chuẩn SIÊU VIP PRO
 * Hỗ trợ xuất file Word (.doc) và Excel (.csv) chuẩn phông Times New Roman,
 * đầy đủ Quốc hiệu Tiêu ngữ, tên cơ quan đơn vị,
 * bảng biểu kẻ khung sắc nét và chữ ký người lập biểu.
 */

import { createWorkbookFromSheets, writeWorkbookToUint8Array } from '../utils/excelService.js';
import { getStoredData } from './storage.ts';
import type { TeachingPlanItem, StudentEvaluationItem, StudioSettings } from './storage.ts';

export interface ExportReportOptions {
  title?: string;
  agencyName?: string;
  schoolName?: string;
  teacherName?: string;
  academicYear?: string;
  semester?: string;
  plans?: TeachingPlanItem[];
  evaluations?: StudentEvaluationItem[];
  filterClass?: string;
  filterWeek?: number;
}

/**
 * Tải file trực tiếp về máy tính người dùng
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Xuất báo cáo ra định dạng file Word (.doc) chuẩn phông Times New Roman
 */
export function exportWordReport(options: ExportReportOptions = {}): string {
  const currentData = getStoredData();
  const settings: StudioSettings = {
    ...currentData.settings,
    agencyName: options.agencyName || currentData.settings?.agencyName || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    schoolName: options.schoolName || currentData.settings?.schoolName || 'TRƯỜNG TIỂU HỌC',
    teacherName: options.teacherName || currentData.settings?.teacherName || 'Giáo viên',
    academicYear: options.academicYear || currentData.settings?.academicYear || '2026 - 2027',
    currentSemester: options.semester || currentData.settings?.currentSemester || 'Học kì I'
  };

  let plans = options.plans || currentData.plans || [];
  let evaluations = options.evaluations || currentData.evaluations || [];

  if (options.filterClass && options.filterClass !== 'all') {
    plans = plans.filter(p => (p.className || '').toLowerCase() === options.filterClass?.toLowerCase());
    evaluations = evaluations.filter(e => (e.className || '').toLowerCase() === options.filterClass?.toLowerCase());
  }

  if (options.filterWeek) {
    plans = plans.filter(p => p.week === Number(options.filterWeek));
    evaluations = evaluations.filter(e => e.week === Number(options.filterWeek));
  }

  const today = new Date();
  const dateStr = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  const taughtCount = plans.filter(p => p.status === 'Đã dạy').length;
  const tCount = evaluations.filter(e => e.level === 'T').length;
  const hCount = evaluations.filter(e => e.level === 'H').length;
  const cCount = evaluations.filter(e => e.level === 'C').length;

  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Báo Cáo Kế Hoạch & Giảng Dạy Mĩ Thuật</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm;
      mso-header-margin: 1.0cm;
      mso-footer-margin: 1.0cm;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10pt;
      margin-bottom: 10pt;
    }
    th, td {
      border: 1px solid #000000;
      padding: 6pt 8pt;
      font-size: 11pt;
      vertical-align: middle;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .header-table, .header-table td {
      border: none !important;
      padding: 0;
      vertical-align: top;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: bold; }
    .title {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      margin-top: 15pt;
      margin-bottom: 4pt;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 12pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 15pt;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 14pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Tiêu ngữ & Tên đơn vị -->
    <table class="header-table">
      <tr>
        <td style="width: 45%; text-align: center;">
          <div style="font-size: 12pt;">${settings.agencyName}</div>
          <div style="font-size: 12pt; font-weight: bold;">${settings.schoolName}</div>
          <div style="font-size: 10pt; margin-top: 2pt;">Số: ......./BC-THLQD</div>
        </td>
        <td style="width: 55%; text-align: center;">
          <div style="font-size: 12pt; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 12pt; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="font-size: 11pt; font-style: italic; margin-top: 4pt;">${dateStr}</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề báo cáo -->
    <div class="title">BÁO CÁO KẾ HOẠCH & KẾT QUẢ GIẢNG DẠY MÔN MĨ THUẬT</div>
    <div class="subtitle">Năm học: ${settings.academicYear} • ${settings.currentSemester} (Chương trình GDPT 2018)</div>

    <!-- I. Kế hoạch giảng dạy theo tuần -->
    <div class="section-title">I. KẾ HOẠCH DẠY HỌC & TIẾN ĐỘ THỰC HIỆN</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35pt;">STT</th>
          <th style="width: 45pt;">Tuần</th>
          <th style="width: 45pt;">Lớp</th>
          <th>Tên Bài Dạy / Chủ Đề (GDPT 2018)</th>
          <th>Yêu Cầu Cần Đạt & Đồ Dùng</th>
          <th style="width: 70pt;">Trạng Thái</th>
          <th style="width: 85pt;">Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${plans.length > 0 ? plans.map((p, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">Tuần ${p.week}</td>
          <td class="text-center text-bold">${p.className}</td>
          <td class="text-bold">${p.title}</td>
          <td>${p.objectives}<br><small><em>Đồ dùng: ${p.materials}</em></small></td>
          <td class="text-center">${p.status}</td>
          <td>${p.notes || ''}</td>
        </tr>
        `).join('') : `
        <tr>
          <td colspan="7" class="text-center">Chưa có kế hoạch bài dạy.</td>
        </tr>
        `}
      </tbody>
    </table>

    <!-- II. Đánh giá chất lượng học sinh theo TT27 -->
    <div class="section-title">II. ĐÁNH GIÁ THƯỜNG XUYÊN HỌC SINH (THÔNG TƯ 27/2020/TT-BGDĐT)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35pt;">STT</th>
          <th style="width: 90pt;">Mã Học Sinh</th>
          <th style="width: 120pt;">Họ và Tên Học Sinh</th>
          <th style="width: 45pt;">Lớp</th>
          <th style="width: 60pt;">Mức Đạt</th>
          <th>Lời Nhận Xét Mĩ Thuật (Thầy/Cô Duyệt & Ký)</th>
        </tr>
      </thead>
      <tbody>
        ${evaluations.length > 0 ? evaluations.map((e, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center" style="font-family: monospace;">${e.studentCode || `HS${String(idx + 1).padStart(3, '0')}`}</td>
          <td class="text-bold">${e.name}</td>
          <td class="text-center">${e.className}</td>
          <td class="text-center text-bold" style="color: ${e.level === 'T' ? '#047857' : e.level === 'H' ? '#1d4ed8' : '#b91c1c'};">
            ${e.level === 'T' ? 'Tốt (T)' : e.level === 'H' ? 'Đạt (H)' : 'Cần Cố Gắng (C)'}
          </td>
          <td>${e.comment}</td>
        </tr>
        `).join('') : `
        <tr>
          <td colspan="6" class="text-center">Chưa có dữ liệu nhận xét học sinh.</td>
        </tr>
        `}
      </tbody>
    </table>

    <!-- III. Tổng hợp số liệu KPI -->
    <div class="section-title">III. TỔNG HỢP & ĐÁNH GIÁ CHUNG</div>
    <p>
      - Tổng số bài dạy đã lập kế hoạch: <strong>${plans.length} bài</strong> (Đã thực hiện: <strong>${taughtCount}</strong> bài, Đạt tỷ lệ: <strong>${plans.length > 0 ? Math.round((taughtCount / plans.length) * 100) : 100}%</strong>).<br>
      - Tổng số học sinh được theo dõi đánh giá: <strong>${evaluations.length} em</strong>.<br>
      - Phân loại chất lượng thẩm mỹ theo Thông tư 27: Mức Hoàn thành tốt (T): <strong>${tCount} em (${evaluations.length > 0 ? Math.round((tCount / evaluations.length) * 100) : 0}%)</strong>; Mức Hoàn thành (H): <strong>${hCount} em (${evaluations.length > 0 ? Math.round((hCount / evaluations.length) * 100) : 0}%)</strong>; Mức Chưa hoàn thành (C): <strong>${cCount} em (${evaluations.length > 0 ? Math.round((cCount / evaluations.length) * 100) : 0}%)</strong>.
    </p>

    <!-- Ký tên xác nhận -->
    <table class="header-table" style="margin-top: 30pt;">
      <tr>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase;">XÁC NHẬN CỦA BAN GIÁM HIỆU</div>
          <div style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên và đóng dấu)</div>
          <br><br><br><br><br>
        </td>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase;">NGƯỜI LẬP BIỂU</div>
          <div style="font-style: italic; font-size: 11pt;">(Ký và ghi rõ họ tên)</div>
          <br><br><br><br><br>
          <div style="font-weight: bold; font-size: 13pt;">${settings.teacherName}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const filename = `Bao_Cao_Mi_Thuat_${settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${today.toISOString().slice(0, 10)}.doc`;
  triggerFileDownload(blob, filename);
  return filename;
}

/**
 * Sinh Blob Báo cáo Word (.doc) phục vụ mở bằng Office trên máy tính
 */
export function buildWordReportBlob(options: ExportReportOptions = {}): { blob: Blob; filename: string } {
  const currentData = getStoredData();
  const settings: StudioSettings = {
    ...currentData.settings,
    agencyName: options.agencyName || currentData.settings?.agencyName || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    schoolName: options.schoolName || currentData.settings?.schoolName || 'TRƯỜNG TIỂU HỌC',
    teacherName: options.teacherName || currentData.settings?.teacherName || 'Giáo viên',
    academicYear: options.academicYear || currentData.settings?.academicYear || '2026 - 2027',
    currentSemester: options.semester || currentData.settings?.currentSemester || 'Học kì I'
  };

  let plans = options.plans || currentData.plans || [];
  let evaluations = options.evaluations || currentData.evaluations || [];

  if (options.filterClass && options.filterClass !== 'all') {
    plans = plans.filter(p => (p.className || '').toLowerCase() === options.filterClass?.toLowerCase());
    evaluations = evaluations.filter(e => (e.className || '').toLowerCase() === options.filterClass?.toLowerCase());
  }

  if (options.filterWeek) {
    plans = plans.filter(p => p.week === Number(options.filterWeek));
    evaluations = evaluations.filter(e => e.week === Number(options.filterWeek));
  }

  const today = new Date();
  const dateStr = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  const taughtCount = plans.filter(p => p.status === 'Đã dạy').length;
  const tCount = evaluations.filter(e => e.level === 'T').length;
  const hCount = evaluations.filter(e => e.level === 'H').length;
  const cCount = evaluations.filter(e => e.level === 'C').length;

  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Báo Cáo Kế Hoạch & Giảng Dạy Mĩ Thuật</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm;
      mso-header-margin: 1.0cm;
      mso-footer-margin: 1.0cm;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10pt;
      margin-bottom: 10pt;
    }
    th, td {
      border: 1px solid #000000;
      padding: 6pt 8pt;
      font-size: 11pt;
      vertical-align: middle;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .header-table, .header-table td {
      border: none !important;
      padding: 0;
      vertical-align: top;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: bold; }
    .title {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      margin-top: 15pt;
      margin-bottom: 4pt;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 12pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 15pt;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 14pt;
      margin-bottom: 4pt;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <table class="header-table">
      <tr>
        <td style="width: 45%; text-align: center;">
          <div style="font-size: 11pt; text-transform: uppercase;">${settings.agencyName}</div>
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${settings.schoolName}</div>
          <div style="border-bottom: 1px solid #000; width: 60%; margin: 3pt auto 0 auto;"></div>
        </td>
        <td style="width: 55%; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="border-bottom: 1px solid #000; width: 50%; margin: 3pt auto 0 auto;"></div>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="text-right" style="padding-top: 8pt; font-style: italic; font-size: 11pt;">
          ..., ${dateStr}
        </td>
      </tr>
    </table>

    <div class="title">BÁO CÁO KẾ HOẠCH & GIẢNG DẠY MĨ THUẬT TIỂU HỌC</div>
    <div class="subtitle">Năm học: ${settings.academicYear} - ${settings.currentSemester}</div>

    <div class="section-title">I. TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH BÀI DẠY (CÔNG VĂN 2345/BGDĐT-GDTH)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35pt;">STT</th>
          <th style="width: 45pt;">Tuần</th>
          <th style="width: 40pt;">Tiết</th>
          <th style="width: 45pt;">Lớp</th>
          <th>Tên Bài Dạy (Theo SGK Kết Nối Tri Thức)</th>
          <th style="width: 75pt;">Thời Lượng</th>
          <th style="width: 75pt;">Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        ${plans.length > 0 ? plans.map((p, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">T.${p.week}</td>
          <td class="text-center">${p.period}</td>
          <td class="text-center text-bold">${p.className}</td>
          <td>${p.title}</td>
          <td class="text-center">${p.duration || '35 phút'}</td>
          <td class="text-center text-bold" style="color: ${p.status === 'Đã dạy' ? '#047857' : '#b45309'};">${p.status}</td>
        </tr>
        `).join('') : `
        <tr>
          <td colspan="7" class="text-center">Chưa có kế hoạch bài dạy.</td>
        </tr>
        `}
      </tbody>
    </table>

    <div class="section-title">II. ĐÁNH GIÁ THƯỜNG XUYÊN HỌC SINH (THÔNG TƯ 27/2020/TT-BGDĐT)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35pt;">STT</th>
          <th style="width: 90pt;">Mã Học Sinh</th>
          <th style="width: 120pt;">Họ và Tên Học Sinh</th>
          <th style="width: 45pt;">Lớp</th>
          <th style="width: 60pt;">Mức Đạt</th>
          <th>Lời Nhận Xét Mĩ Thuật (Thầy/Cô Duyệt & Ký)</th>
        </tr>
      </thead>
      <tbody>
        ${evaluations.length > 0 ? evaluations.map((e, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center" style="font-family: monospace;">${e.studentCode || `HS${String(idx + 1).padStart(3, '0')}`}</td>
          <td class="text-bold">${e.name}</td>
          <td class="text-center">${e.className}</td>
          <td class="text-center text-bold" style="color: ${e.level === 'T' ? '#047857' : e.level === 'H' ? '#1d4ed8' : '#b91c1c'};">
            ${e.level === 'T' ? 'Tốt (T)' : e.level === 'H' ? 'Đạt (H)' : 'Cần Cố Gắng (C)'}
          </td>
          <td>${e.comment}</td>
        </tr>
        `).join('') : `
        <tr>
          <td colspan="6" class="text-center">Chưa có dữ liệu nhận xét học sinh.</td>
        </tr>
        `}
      </tbody>
    </table>

    <table class="header-table" style="margin-top: 25pt;">
      <tr>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase;">XÁC NHẬN CỦA BAN GIÁM HIỆU</div>
          <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
          <div style="height: 50pt;"></div>
        </td>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase;">GIÁO VIÊN BỘ MÔN MĨ THUẬT</div>
          <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
          <div style="height: 50pt;"></div>
          <div style="font-weight: bold;">${settings.teacherName}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const filename = `Bao_Cao_Mi_Thuat_${settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${today.toISOString().slice(0, 10)}.doc`;
  return { blob, filename };
}

/**
 * Tạo cấu hình 2 trang tính cho báo cáo Excel (.xlsx) chuẩn Microsoft Excel
 */
function buildReportSheetsSpec(options: ExportReportOptions = {}) {
  const currentData = getStoredData();
  const settings: StudioSettings = {
    ...currentData.settings,
    agencyName: options.agencyName || currentData.settings?.agencyName || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    schoolName: options.schoolName || currentData.settings?.schoolName || 'TRƯỜNG TIỂU HỌC',
    teacherName: options.teacherName || currentData.settings?.teacherName || 'Giáo viên',
    academicYear: options.academicYear || currentData.settings?.academicYear || '2026 - 2027',
    currentSemester: options.semester || currentData.settings?.currentSemester || 'Học kì I'
  };

  let plans = options.plans || currentData.plans || [];
  let evaluations = options.evaluations || currentData.evaluations || [];

  if (options.filterClass && options.filterClass !== 'all') {
    plans = plans.filter(p => (p.className || '').toLowerCase() === options.filterClass?.toLowerCase());
    evaluations = evaluations.filter(e => (e.className || '').toLowerCase() === options.filterClass?.toLowerCase());
  }

  const planRows = plans.map((p, idx) => ({
    'STT': idx + 1,
    'Tuần': `Tuần ${p.week}`,
    'Tiết': p.period,
    'Khối': `Khối ${p.grade}`,
    'Lớp': p.className,
    'Tên bài học (Kết Nối Tri Thức)': p.title,
    'Yêu cầu cần đạt': p.objectives,
    'Đồ dùng dạy học': p.materials,
    'Trạng thái': p.status,
    'Ghi chú': p.notes
  }));

  const evalRows = evaluations.map((e, idx) => ({
    'STT': idx + 1,
    'Mã học sinh': e.studentCode || `HS${String(idx + 1).padStart(3, '0')}`,
    'Họ và tên': e.name,
    'Lớp': e.className,
    'Tuần': e.week ? `Tuần ${e.week}` : 'Thường xuyên',
    'Mức đánh giá': e.level || 'H',
    'Nội dung nhận xét': e.comment || ''
  }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const safeSchool = (settings.schoolName || 'Tieu_Hoc').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Bang_Bao_Cao_Mi_Thuat_${safeSchool}_${todayStr}.xlsx`;

  const sheetsConfig = [
    {
      name: 'Ke_Hoach_Day_Hoc',
      rows: planRows,
      headers: ['STT', 'Tuần', 'Tiết', 'Khối', 'Lớp', 'Tên bài học (Kết Nối Tri Thức)', 'Yêu cầu cần đạt', 'Đồ dùng dạy học', 'Trạng thái', 'Ghi chú'],
      colWidths: [6, 10, 8, 10, 10, 38, 45, 32, 14, 25],
    },
    {
      name: 'Danh_Gia_Hoc_Sinh_TT27',
      rows: evalRows,
      headers: ['STT', 'Mã học sinh', 'Họ và tên', 'Lớp', 'Tuần', 'Mức đánh giá', 'Nội dung nhận xét'],
      colWidths: [6, 14, 26, 10, 14, 14, 75],
    },
  ];

  return { sheetsConfig, filename };
}

/**
 * Sinh Blob Báo cáo Excel (.xlsx) qua ExcelJS phục vụ tải về hoặc mở bằng Office
 */
export async function buildExcelReportBlob(options: ExportReportOptions = {}): Promise<{ blob: Blob; filename: string }> {
  const { sheetsConfig, filename } = buildReportSheetsSpec(options);
  const wb = await createWorkbookFromSheets(sheetsConfig);
  const wbout = await writeWorkbookToUint8Array(wb);
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return { blob, filename };
}

/**
 * Xuất bảng báo cáo ra file Excel (.xlsx) chuẩn Microsoft Excel
 * Gồm 2 Sheet: Kế Hoạch Dạy Học & Bảng Đánh Giá Học Sinh TT27
 */
export function exportExcelReport(options: ExportReportOptions = {}): string {
  const { filename } = buildReportSheetsSpec(options);

  if (typeof window !== 'undefined') {
    void buildExcelReportBlob(options).then(({ blob, filename: outName }) => {
      triggerFileDownload(blob, outName);
    });
  }

  return filename;
}

/**
 * Xuất bảng báo cáo ra file Excel (.xlsx) chuẩn quy cách
 * Giữ nguyên tên hàm exportCsvReport để tương thích ngược hoàn hảo với các bài kiểm thử và module hiện có
 */
export function exportCsvReport(options: ExportReportOptions = {}): string {
  return exportExcelReport(options);
}
