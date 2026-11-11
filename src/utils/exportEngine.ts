/**
 * Engine Xuất Bản Tài Liệu & Trình Chiếu Chuẩn Thương Mại
 * Hỗ trợ xuất Standalone HTML trình chiếu USB và in ấn PDF chuẩn hành chính Việt Nam (A4)
 */

import type { Slide } from '../types/presentation';
import { generateStandaloneHtmlString } from './htmlSlideExportService';

export interface PrintPdfOptions {
  title?: string;
  orientation?: 'landscape' | 'portrait';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Tạo thẻ <style> chuẩn hành chính Việt Nam phục vụ xuất file PDF / In ấn
 * Lề trên: 20-25mm, Lề dưới: 20-25mm, Lề trái: 30-35mm, Lề phải: 15-20mm
 */
export function generatePrintPdfStyle(options: PrintPdfOptions = {}): string {
  const top = options.margin?.top || '20mm';
  const right = options.margin?.right || '15mm';
  const bottom = options.margin?.bottom || '20mm';
  const left = options.margin?.left || '30mm';
  const orientation = options.orientation || 'landscape';

  return `
    @page {
      size: A4 ${orientation};
      margin: ${top} ${right} ${bottom} ${left};
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: #ffffff !important;
        color: #000000 !important;
      }
      .no-print, nav, header, button, .toolbar {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      thead {
        display: table-header-group;
      }
      tr {
        page-break-inside: avoid;
      }
      .print-slide-frame {
        width: 100%;
        max-height: 100vh;
        aspect-ratio: 16 / 9;
        page-break-inside: avoid;
        page-break-after: always;
        box-shadow: none !important;
        border: none !important;
      }
    }
  `;
}

/**
 * Mở hộp thoại In / Lưu PDF chuẩn hành chính
 */
export function printSlidesPdf(options: PrintPdfOptions = {}): void {
  if (typeof window === 'undefined') return;

  const styleId = 'co-nhi-print-pdf-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = generatePrintPdfStyle(options);

  window.print();
}

/**
 * Xuất file HTML độc lập chứa đầy đủ nội dung, ảnh và phím điều khiển phục vụ cắm USB chiếu ngoại tuyến
 */
export function exportStandaloneHtml(slides: Slide[], title: string = 'Bai_Giang_Mi_Thuat'): void {
  if (typeof window === 'undefined') return;

  const htmlContent = generateStandaloneHtmlString(slides, title);
  if (!htmlContent) return;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeFilename = title.replace(/[^\w\s-]/gi, '_').trim() || 'Bai_Giang_Mi_Thuat';
  a.download = `${safeFilename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
