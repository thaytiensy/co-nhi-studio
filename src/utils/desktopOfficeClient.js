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
    showToast('Đang tạo tệp và kích hoạt Office trên máy tính...', 'info', 2500);

    // Sinh file PPTX dạng blob/arrayBuffer bằng pptxExportService
    const { generatePPTXBlob } = await import('./pptxExportService.js');
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
        showToast(result.message || `Đã mở bài giảng bằng ${result.appName} trên máy tính!`, 'success', 4000);
        return { success: true, appName: result.appName };
      }
      throw new Error(result.error || 'Máy chủ không thể mở Office');
    }
    throw new Error('Lỗi kết nối máy chủ cục bộ');
  } catch (err) {
    showToast(`Không thể mở Office trên máy: ${err.message}. Thầy/Cô có thể tải tệp .PPTX về máy để mở trực tiếp nhé!`, 'warning', 4500);
    return { success: false, error: err.message };
  }
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
    showToast(`Đang mở ${label} bằng Office trên máy tính...`, 'info', 2500);

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
        showToast(result.message || `Đã mở ${label} bằng ${result.appName} trên máy!`, 'success', 4000);
        return { success: true, appName: result.appName };
      }
    }
    throw new Error('Lỗi gửi tệp lên ứng dụng Office');
  } catch (err) {
    showToast(`Không thể kích hoạt Office: ${err.message}. Tệp vẫn được lưu an toàn trong máy!`, 'warning', 4000);
    return { success: false, error: err.message };
  }
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
