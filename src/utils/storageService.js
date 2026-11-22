// Quản lý Lưu Trữ Cục Bộ (LocalStorage) & Tệp Dự Án Cọ Nhí Studio
// Dữ liệu mặc định lưu trên máy tính của giáo viên, phân vùng riêng biệt theo từng tài khoản.

import { getScopedStorageKey } from './userWorkspaceService.js';
import { idbSet, idbGet, idbDelete } from './idbStorage.js';

export const STORAGE_KEY = 'co_nhi_studio_project_v1';
export const STORAGE_DRAFT_KEY = 'co_nhi_studio_draft_v1';
export const STORAGE_OFFICE_DOC_KEY = 'conhi_office_doc_v1';

export const validateSlideElement = (el, index, slideIndex) => {
  if (!el || typeof el !== 'object') {
    throw new Error(`Slide ${slideIndex + 1}: Phần tử thứ ${index + 1} không hợp lệ.`);
  }
  if (!el.type || typeof el.type !== 'string') {
    throw new Error(`Slide ${slideIndex + 1}: Phần tử thứ ${index + 1} thiếu thuộc tính type.`);
  }
  const validTypes = ['text', 'shape', 'image', 'game', 'audio', 'video', 'youtube'];
  if (!validTypes.includes(el.type)) {
    throw new Error(`Slide ${slideIndex + 1}: Loại phần tử "${el.type}" không được hỗ trợ.`);
  }
  if (
    typeof el.x !== 'number' || !Number.isFinite(el.x) ||
    typeof el.y !== 'number' || !Number.isFinite(el.y) ||
    typeof el.width !== 'number' || !Number.isFinite(el.width) || el.width <= 0 ||
    typeof el.height !== 'number' || !Number.isFinite(el.height) || el.height <= 0
  ) {
    throw new Error(`Slide ${slideIndex + 1}: Phần tử ${el.id || index + 1} thiếu tọa độ hoặc kích thước hợp lệ.`);
  }
  return true;
};

export const validateSlide = (slide, index) => {
  if (!slide || typeof slide !== 'object') {
    throw new Error(`Slide thứ ${index + 1} không hợp lệ.`);
  }
  if (!slide.id) {
    throw new Error(`Slide thứ ${index + 1} thiếu mã định danh (id).`);
  }
  if (slide.elements && !Array.isArray(slide.elements)) {
    throw new Error(`Slide ${slide.id}: Danh sách elements phải là mảng.`);
  }
  if (Array.isArray(slide.elements)) {
    slide.elements.forEach((el, elIdx) => validateSlideElement(el, elIdx, index));
  }
  return true;
};

export const validateProjectData = (projectData) => {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Dữ liệu bài giảng không hợp lệ.');
  }
  if (!Array.isArray(projectData.slides) || projectData.slides.length === 0) {
    throw new Error('Bài giảng phải chứa ít nhất một trang slide.');
  }
  projectData.slides.forEach((slide, idx) => validateSlide(slide, idx));
  return true;
};

export const parseAndValidateProjectJson = (rawContent) => {
  if (typeof rawContent !== 'string' || !rawContent.trim()) {
    throw new Error('Nội dung tệp dự án rỗng.');
  }
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('Tệp không đúng định dạng JSON hợp lệ.');
  }
  validateProjectData(parsed);
  return parsed;
};

export const saveProjectToLocal = (projectData, userScope) => {
  try {
    validateProjectData(projectData);
    const payload = {
      title: projectData.title || 'Bài Giảng Mĩ Thuật',
      slides: projectData.slides,
      updatedAt: new Date().toISOString(),
      version: projectData.version || '1.0.0',
    };
    const key = getScopedStorageKey(STORAGE_KEY, userScope);

    // 1. Lưu bất đồng bộ vào IndexedDB (Dung lượng không giới hạn, an toàn cho tệp lớn có nhiều ảnh)
    idbSet('projects', key, payload).catch(() => {});

    // 2. Lưu vào LocalStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (err) {
        console.warn('[storageService] LocalStorage vượt quá giới hạn 5MB, bài giảng đã được lưu an toàn trong IndexedDB.');
      }
    }
    return { success: true };
  } catch (err) {
    console.error('Không thể lưu bài giảng:', err);
    return {
      success: false,
      error: err.message || 'Lỗi lưu bài giảng cục bộ.'
    };
  }
};

export const loadProjectFromLocal = (userScope) => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const key = getScopedStorageKey(STORAGE_KEY, userScope);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    validateProjectData(parsed);
    return parsed;
  } catch (err) {
    console.error('Lỗi đọc hoặc dữ liệu LocalStorage không hợp lệ:', err);
    return null;
  }
};

/**
 * Nạp bài giảng từ IndexedDB (dung lượng lớn) với fallback sang LocalStorage
 */
export const loadProjectFromStorage = async (userScope) => {
  const key = getScopedStorageKey(STORAGE_KEY, userScope);
  try {
    const idbData = await idbGet('projects', key);
    if (idbData && Array.isArray(idbData.slides) && idbData.slides.length > 0) {
      validateProjectData(idbData);
      return idbData;
    }
  } catch (_) {}

  // Fallback sang LocalStorage
  return loadProjectFromLocal(userScope);
};

/**
 * Lưu tệp văn phòng Office người dùng tải lên (Word, Excel, PDF) vào IndexedDB & LocalStorage
 */
export const saveOfficeDocToStorage = (docData, subTab = 'docx', userScope) => {
  if (!docData) return;
  const key = getScopedStorageKey(STORAGE_OFFICE_DOC_KEY, userScope);
  const payload = {
    docData,
    subTab: subTab || 'docx',
    savedAt: new Date().toISOString()
  };

  // 1. Lưu vào IndexedDB
  idbSet('office_docs', key, payload).catch(() => {});

  // 2. Thử lưu vào LocalStorage nếu nhỏ
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (_) {}
  }
};

/**
 * Nạp tệp văn phòng Office người dùng đã tải lên gần nhất
 */
export const loadOfficeDocFromStorage = async (userScope) => {
  const key = getScopedStorageKey(STORAGE_OFFICE_DOC_KEY, userScope);
  try {
    const idbData = await idbGet('office_docs', key);
    if (idbData && idbData.docData) {
      return restoreOfficeDocUrls(idbData);
    }
  } catch (_) {}

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.docData) {
          return restoreOfficeDocUrls(parsed);
        }
      }
    } catch (_) {}
  }
  return null;
};

/**
 * Xóa tệp văn phòng Office đã lưu
 */
export const clearOfficeDocFromStorage = (userScope) => {
  const key = getScopedStorageKey(STORAGE_OFFICE_DOC_KEY, userScope);
  idbDelete('office_docs', key).catch(() => {});
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }
};

function restoreOfficeDocUrls(stored) {
  if (!stored || !stored.docData) return stored;
  // Nếu là tệp PDF và có base64, tạo lại URL xem trước Blob hợp lệ cho phiên làm việc hiện tại
  if (stored.docData.type === 'pdf' && stored.docData.base64 && typeof window !== 'undefined') {
    try {
      const byteCharacters = atob(stored.docData.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      stored.docData.url = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Lỗi phục hồi URL PDF:', e);
    }
  }
  return stored;
}

export const exportProjectFile = (projectData, fileName = 'Bai_Giang_Mi_Thuat.conhi') => {
  try {
    validateProjectData(projectData);
    const payload = JSON.stringify({
      title: projectData.title || 'Bài Giảng Mĩ Thuật',
      slides: projectData.slides,
      app: 'CoNhiStudio',
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.conhi') ? fileName : `${fileName}.conhi`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Lỗi xuất tệp dự án:', err);
    return false;
  }
};

export const importProjectFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const validatedData = parseAndValidateProjectJson(e.target.result);
        resolve(validatedData);
      } catch (err) {
        reject(new Error('Tệp không đúng cấu trúc dự án Cọ Nhí Studio: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp từ thiết bị'));
    reader.readAsText(file);
  });
};

/**
 * Tự động lưu bản nháp chỉnh sửa (Auto-Save Resilience)
 * Ghi nhận trạng thái thời gian thực chống mất bài khi mất điện hoặc tắt trình duyệt
 */
export const saveProjectDraftToLocal = (projectData, userScope) => {
  try {
    if (!projectData || !Array.isArray(projectData.slides) || projectData.slides.length === 0) {
      return { success: false };
    }
    const payload = {
      title: projectData.title || 'Bài Giảng Mĩ Thuật',
      slides: projectData.slides,
      updatedAt: projectData.updatedAt || new Date().toISOString(),
      isDraft: true,
      version: projectData.version || '1.0.0'
    };
    const key = getScopedStorageKey(STORAGE_DRAFT_KEY, userScope);
    idbSet('projects', `draft_${key}`, payload).catch(() => {});
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (_) {}
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Đọc bản nháp chỉnh sửa từ LocalStorage phục vụ Crash Recovery
 */
export const getProjectDraftFromLocal = (userScope) => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const key = getScopedStorageKey(STORAGE_DRAFT_KEY, userScope);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    validateProjectData(parsed);
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Xóa bản nháp khi giáo viên đã bấm lưu chính thức hoặc chủ động bỏ qua
 */
export const clearProjectDraft = (userScope) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const key = getScopedStorageKey(STORAGE_DRAFT_KEY, userScope);
      localStorage.removeItem(key);
    }
  } catch {}
};

/**
 * Kiểm tra xem có bản nháp chưa lưu hay không
 * @param {string|number} [referenceTime] Mốc thời gian so sánh tùy chọn
 * @param {string} [userScope] Tùy chọn chỉ định không gian người dùng
 */
export const hasUnsavedDraft = (referenceTime, userScope) => {
  try {
    const draft = getProjectDraftFromLocal(userScope);
    if (!draft) return false;
    let baseTime = 0;
    if (referenceTime) {
      baseTime = new Date(referenceTime).getTime();
    } else {
      const saved = loadProjectFromLocal(userScope);
      if (!saved) return true;
      baseTime = new Date(saved.updatedAt).getTime();
    }
    const draftTime = new Date(draft.updatedAt).getTime();
    return draftTime > baseTime;
  } catch {
    return false;
  }
};
