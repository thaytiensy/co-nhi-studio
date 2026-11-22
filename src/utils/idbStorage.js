/**
 * idbStorage.js - Bộ lưu trữ cục bộ dung lượng lớn IndexedDB cho Cọ Nhí Studio
 * Giải quyết triệt để giới hạn 5MB của LocalStorage:
 * - Lưu trữ vĩnh viễn các bài giảng PowerPoint nặng (nhiều ảnh base64)
 * - Lưu trữ tệp Office người dùng tải lên (Word, Excel, PDF)
 * - Tự động đồng bộ và khôi phục khi tải lại trang (F5) hoặc mở lại trình duyệt
 * - An toàn 100% trong môi trường Node.js / SSR (tự động fallback)
 */

const DB_NAME = 'conhi_studio_db';
const DB_VERSION = 3;
const STORES = ['projects', 'office_docs', 'smas'];

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        });
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (err) => {
        console.warn('[idbStorage] Không thể mở IndexedDB, dùng LocalStorage dự phòng:', err);
        resolve(null);
      };
    } catch (err) {
      console.warn('[idbStorage] Lỗi khởi tạo IndexedDB:', err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Lưu dữ liệu vào IndexedDB
 * @param {'projects' | 'office_docs' | 'smas'} storeName
 * @param {string} key
 * @param {any} value
 */
export async function idbSet(storeName, key, value) {
  if (!key) return false;
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  } catch (_) {
    return false;
  }
}

/**
 * Đọc dữ liệu từ IndexedDB
 * @param {'projects' | 'office_docs' | 'smas'} storeName
 * @param {string} key
 */
export async function idbGet(storeName, key) {
  if (!key) return null;
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  } catch (_) {
    return null;
  }
}

/**
 * Xóa dữ liệu khỏi IndexedDB
 * @param {'projects' | 'office_docs' | 'smas'} storeName
 * @param {string} key
 */
export async function idbDelete(storeName, key) {
  if (!key) return false;
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  } catch (_) {
    return false;
  }
}
