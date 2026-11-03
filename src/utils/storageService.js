// Quản lý Lưu Trữ Cục Bộ (LocalStorage) & Tệp Dự Án Cọ Nhí Studio
// Dữ liệu chỉ lưu trên máy tính của giáo viên, không gửi lên bất kỳ máy chủ nào.

const STORAGE_KEY = 'co_nhi_studio_project_v1';

export const saveProjectToLocal = (projectData) => {
  try {
    const payload = {
      ...projectData,
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { success: true };
  } catch (err) {
    console.warn('Lỗi lưu vào LocalStorage, thử lưu phiên bản nén nhẹ:', err);
    try {
      // Nếu dung lượng ảnh Blob hoặc base64 vượt quá 5MB hạn mức LocalStorage
      const lightweightSlides = (projectData.slides || []).map(s => ({
        ...s,
        elements: (s.elements || []).map(el => {
          if (el.type === 'image' && el.src?.length > 2000) {
            // Giữ lại kích thước và vị trí đối tượng, lược bỏ chuỗi base64 khổng lồ trong LocalStorage
            return { ...el, src: '' };
          }
          return el;
        })
      }));
      const lightPayload = {
        ...projectData,
        slides: lightweightSlides,
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightPayload));
      return { success: true, warning: 'Đã lưu cấu trúc slide vào bộ nhớ máy (ảnh lớn được giữ trong phiên làm việc).' };
    } catch (e2) {
      console.error('Không thể lưu vào LocalStorage:', e2);
      return { success: false, error: 'Dung lượng trình duyệt đầy. Thầy/Cô có thể dùng tính năng Tệp Bài Giảng > Lưu tệp .conhi để lưu không giới hạn.' };
    }
  }
};

export const loadProjectFromLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc LocalStorage:', err);
    return null;
  }
};

export const exportProjectFile = (projectData, fileName = 'Bai_Giang_Mi_Thuat.conhi') => {
  try {
    const payload = JSON.stringify({
      ...projectData,
      app: 'CoNhiStudio',
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
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
        const data = JSON.parse(e.target.result);
        if (!data.slides || !Array.isArray(data.slides)) {
          reject(new Error('Tệp không đúng cấu trúc dự án Cọ Nhí Studio'));
          return;
        }
        resolve(data);
      } catch (err) {
        reject(new Error('Không thể đọc tệp dự án: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp từ thiết bị'));
    reader.readAsText(file);
  });
};
