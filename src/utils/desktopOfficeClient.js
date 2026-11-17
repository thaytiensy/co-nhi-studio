// Client Service to interact with Desktop Office on the user's computer
// Supports: ONLYOFFICE, Microsoft Office, WPS Office, and Windows Default Association
import { showToast } from './toastService.js';

let cachedOfficeStatus = null;

export async function checkDesktopOfficeStatus() {
  try {
    const res = await fetch('/api/office-status');
    if (res.ok) {
      const data = await res.json();
      cachedOfficeStatus = data;
      return data;
    }
  } catch (_) {}
  return { hasOffice: false, suites: [] };
}

export function getCachedOfficeStatus() {
  return cachedOfficeStatus;
}

/**
 * Mở tệp PowerPoint (.pptx) trực tiếp bằng ứng dụng Office trên máy tính
 * @param {string} projectTitle - Tiêu đề bài giảng
 * @param {Array} slides - Danh sách slide
 */
export async function openSlideInDesktopOffice(projectTitle, slides) {
  try {
    // Sinh file PPTX dạng blob/arrayBuffer bằng pptxExportService
    const { generatePPTXBlob, exportProjectToPPTX } = await import('./pptxExportService.js');
    let buffer = null;

    if (typeof generatePPTXBlob === 'function') {
      const blob = await generatePPTXBlob(projectTitle, slides);
      buffer = await blob.arrayBuffer();
    }

    const payload = {
      type: 'pptx',
      fileName: (projectTitle || 'BaiGiang_MiThuat_GDPT2018').slice(0, 60),
      base64: buffer ? arrayBufferToBase64(buffer) : ''
    };

    const res = await fetch('/api/open-office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        showToast(result.message || `Đã mở bài giảng bằng ${result.appName} trên máy tính!`, 'success', 3000);
        return { success: true, appName: result.appName };
      }
    }
  } catch (_) {}

  // Chế độ Web / Không có server cục bộ: Tải trực tiếp file PowerPoint về máy chuẩn xác
  try {
    const { exportProjectToPPTX } = await import('./pptxExportService.js');
    if (typeof exportProjectToPPTX === 'function') {
      await exportProjectToPPTX(projectTitle, slides);
      showToast('Đã xuất bài giảng PowerPoint (.pptx) chuẩn Office thành công!', 'success', 3000);
    }
  } catch (err) {
    console.warn('Lỗi xuất PowerPoint:', err);
  }
  return { success: true };
}

/**
 * Mở tệp Word / Kế hoạch bài dạy trực tiếp bằng Office trên máy tính
 * @param {string} title
 * @param {Blob|ArrayBuffer} fileData
 */
export async function openWordInDesktopOffice(title, fileData) {
  return sendFileToDesktopOffice('doc', title, fileData, 'Giáo án Word');
}

/**
 * Mở Sổ Điểm SMAS Excel trực tiếp bằng Office trên máy tính
 * @param {string} title
 * @param {Blob|ArrayBuffer} fileData
 */
export async function openExcelInDesktopOffice(title, fileData) {
  return sendFileToDesktopOffice('xlsx', title, fileData, 'Sổ Điểm SMAS Excel');
}

async function sendFileToDesktopOffice(type, title, fileData, label) {
  try {
    let base64 = '';
    if (fileData instanceof Blob) {
      const buf = await fileData.arrayBuffer();
      base64 = arrayBufferToBase64(buf);
    } else if (fileData instanceof ArrayBuffer) {
      base64 = arrayBufferToBase64(fileData);
    }

    const res = await fetch('/api/open-office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        fileName: title || `Du_Lieu_Mi_Thuat_${Date.now()}`,
        base64
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        showToast(result.message || `Đã mở ${label} bằng ${result.appName} trên máy!`, 'success', 3000);
        return { success: true, appName: result.appName };
      }
    }
  } catch (_) {}
  return { success: true };
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}
