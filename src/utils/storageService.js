// Quản lý Lưu Trữ Cục Bộ (LocalStorage) & Tệp Dự Án Cọ Nhí Studio
// Dữ liệu mặc định lưu trên máy tính của giáo viên, không gửi lên bất kỳ máy chủ nào.

export const STORAGE_KEY = 'co_nhi_studio_project_v1';

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

export const saveProjectToLocal = (projectData) => {
  try {
    validateProjectData(projectData);
    const payload = {
      title: projectData.title || 'Bài Giảng Mĩ Thuật',
      slides: projectData.slides,
      updatedAt: new Date().toISOString(),
      version: projectData.version || '1.0.0',
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    return { success: true };
  } catch (err) {
    console.error('Không thể lưu vào LocalStorage; giữ nguyên phiên bản đã lưu trước đó:', err);
    const isQuota = err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014;
    return {
      success: false,
      error: isQuota
        ? 'Bộ nhớ trình duyệt đã đầy. Bài giảng hiện tại vẫn được giữ trên RAM; hãy vào Tệp Bài Giảng > Lưu tệp .conhi để lưu về máy tính.'
        : (err.message || 'Lỗi lưu bài giảng cục bộ.')
    };
  }
};

export const loadProjectFromLocal = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    validateProjectData(parsed);
    return parsed;
  } catch (err) {
    console.error('Lỗi đọc hoặc dữ liệu LocalStorage không hợp lệ:', err);
    return null;
  }
};

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
