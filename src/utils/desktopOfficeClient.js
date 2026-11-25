// Client Service to interact with Desktop Office on the user's computer
// Supports: ONLYOFFICE, Microsoft Office, WPS Office, and Windows Default Association
import { showToast } from './toastService.js';

let cachedOfficeStatus = null;

export async function checkDesktopOfficeStatus() {
  // 1. Thử endpoint tương đối (hoạt động khi chạy trên máy chủ nội bộ localhost:3000 hoặc localhost:3100)
  try {
    const res = await fetch('/api/office-status');
    if (res.ok) {
      const data = await res.json();
      cachedOfficeStatus = data;
      return data;
    }
  } catch {}

  // 2. Thử cầu nối máy chủ cục bộ (khi người dùng đang mở trang web Vercel trên máy tính cá nhân)
  const candidateUrls = ['http://localhost:3000/api/office-status', 'http://127.0.0.1:3000/api/office-status', 'http://localhost:3100/api/office-status'];
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        cachedOfficeStatus = data;
        return data;
      }
    } catch {}
  }

  return { hasOffice: false, suites: [] };
}

export function getCachedOfficeStatus() {
  return cachedOfficeStatus;
}

/**
 * Tự động đồng bộ và mở tệp PowerPoint (.pptx) trực tiếp bằng ONLYOFFICE trên máy tính
 * @param {string} projectTitle - Tiêu đề bài giảng
 * @param {Array} slides - Danh sách slide
 * @param {Object} options - { silent: boolean }
 */
export async function openSlideInDesktopOffice(projectTitle, slides, options = {}) {
  const { silent = false } = options;
  try {
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

    // 1. Thử endpoint cùng origin
    let res = null;
    try {
      res = await fetch('/api/open-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {}

    // 2. Thử cầu nối máy chủ nội bộ nếu đang duyệt trên web Vercel
    if (!res || !res.ok) {
      const candidateUrls = ['http://localhost:3000/api/open-office', 'http://127.0.0.1:3000/api/open-office', 'http://localhost:3100/api/open-office'];
      for (const url of candidateUrls) {
        try {
          const bridgeRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (bridgeRes.ok) {
            res = bridgeRes;
            break;
          }
        } catch {}
      }
    }

    if (res && res.ok) {
      const result = await res.json();
      if (result.success) {
        if (!silent) {
          showToast(result.message || `Đã mở bài giảng bằng ${result.appName} trên máy tính!`, 'success', 3000);
        }
        return { success: true, appName: result.appName };
      }
    }
  } catch {}

  // Chế độ Web / Không có server cục bộ (chỉ tải tệp khi người dùng thực hiện thao tác rõ ràng, không tải khi đồng bộ ngầm)
  if (!silent) {
    try {
      const { exportProjectToPPTX } = await import('./pptxExportService.js');
      if (typeof exportProjectToPPTX === 'function') {
        await exportProjectToPPTX(projectTitle, slides);
        showToast('Đã xuất bài giảng PowerPoint (.pptx) chuẩn Office thành công!', 'success', 3000);
      }
    } catch (err) {
      console.warn('Lỗi xuất PowerPoint:', err);
    }
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

    const payloadObj = {
      type,
      fileName: title || `Du_Lieu_Mi_Thuat_${Date.now()}`,
      base64
    };

    let res = null;
    try {
      res = await fetch('/api/open-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj)
      });
    } catch {}

    if (!res || !res.ok) {
      const candidateUrls = ['http://localhost:3000/api/open-office', 'http://127.0.0.1:3000/api/open-office', 'http://localhost:3100/api/open-office'];
      for (const url of candidateUrls) {
        try {
          const bridgeRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadObj)
          });
          if (bridgeRes.ok) {
            res = bridgeRes;
            break;
          }
        } catch {}
      }
    }

    if (res && res.ok) {
      const result = await res.json();
      if (result.success) {
        showToast(result.message || `Đã mở ${label} bằng ${result.appName} trên máy!`, 'success', 3000);
        return { success: true, appName: result.appName };
      }
    }
  } catch {}
  return { success: true };
}

function arrayBufferToBase64(buffer) {
  if (!buffer || buffer.byteLength === 0) return '';
  try {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // 32KB chunks an toàn, cực nhanh và không chặn luồng UI
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  } catch {
    return '';
  }
}
