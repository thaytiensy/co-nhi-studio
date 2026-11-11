/**
 * Cọ Nhí Studio - Dịch vụ Kết nối Cơ Sở Dữ Liệu Firebase Cloud Firestore
 * Chuẩn SIÊU VIP PRO - Tự động đồng bộ và bảo toàn dữ liệu hai chiều
 * 
 * Nguyên tắc:
 * 1. Nếu Firebase được cấu hình (có biến môi trường): Đồng bộ dữ liệu lên Firestore.
 * 2. Nếu chưa cấu hình hoặc mất mạng: Tự động dự phòng về LocalStorage (Auto-save debounce 300ms).
 * 3. Hoàn toàn không bắt buộc người dùng nhập API Key để ứng dụng hoạt động trơn tru.
 */

import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfigured } from './firebaseClient.js';
import { getStoredData, saveStoredData } from '../lib/storage.ts';

const FIRESTORE_COLLECTION = 'conhi_studio_data';
const FIRESTORE_DOCUMENT = 'latest_backup';

let lastSyncTimestamp = null;
let lastSyncStatus = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error' | 'local_only'
let syncListeners = new Set();

function notifyStatusChange() {
  const status = getFirebaseDatabaseStatus();
  syncListeners.forEach(listener => {
    try {
      listener(status);
    } catch (e) {
      console.warn('[FirebaseSync] Listener error:', e);
    }
  });
}

/**
 * Lấy trạng thái kết nối Cơ sở dữ liệu Firebase hiện tại
 */
export function getFirebaseDatabaseStatus() {
  const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
  const isConfigured = Boolean(firebaseConfigured && db);

  return {
    isConfigured,
    isOnline,
    status: !isConfigured ? 'local_only' : !isOnline ? 'offline' : lastSyncStatus,
    lastSyncTimestamp,
    mode: isConfigured ? 'Firebase Cloud Firestore' : 'LocalStorage Offline An Toàn',
    message: !isConfigured
      ? 'Đang hoạt động ở chế độ LocalStorage cục bộ (Bảo mật tối đa, không cần cấu hình mạng).'
      : !isOnline
      ? 'Mất kết nối mạng Internet. Đang lưu tạm vào bộ nhớ cục bộ.'
      : lastSyncStatus === 'synced'
      ? `Đã đồng bộ lên Firebase Cloud lúc ${lastSyncTimestamp || 'vừa xong'}.`
      : 'Sẵn sàng đồng bộ dữ liệu đám mây.'
  };
}

/**
 * Đăng ký lắng nghe thay đổi trạng thái đồng bộ
 */
export function subscribeToFirebaseStatus(listener) {
  syncListeners.add(listener);
  listener(getFirebaseDatabaseStatus());
  return () => syncListeners.delete(listener);
}

/**
 * Đẩy dữ liệu hiện tại lên Firebase Cloud Firestore
 * @param {object} customData Dữ liệu tùy chọn, nếu không truyền sẽ lấy từ getStoredData()
 */
export async function syncStorageToFirebase(customData) {
  const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
  
  if (!firebaseConfigured || !db) {
    lastSyncStatus = 'local_only';
    notifyStatusChange();
    return {
      success: true,
      mode: 'local',
      message: 'Đã lưu an toàn vào LocalStorage trình duyệt (Không cần cấu hình Firebase).'
    };
  }

  if (!isOnline) {
    lastSyncStatus = 'offline';
    notifyStatusChange();
    return {
      success: false,
      mode: 'offline',
      message: 'Không có kết nối mạng Internet để đẩy lên đám mây.'
    };
  }

  try {
    lastSyncStatus = 'syncing';
    notifyStatusChange();

    const dataToSync = customData || getStoredData();
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);

    // Chuẩn bị payload tương thích Firestore (loại bỏ undefined)
    const sanitizedPayload = JSON.parse(JSON.stringify({
      plans: dataToSync.plans || [],
      evaluations: dataToSync.evaluations || [],
      settings: dataToSync.settings || {},
      syncedAt: new Date().toISOString(),
      version: 'vip_pro_v1'
    }));

    await setDoc(docRef, {
      ...sanitizedPayload,
      serverTimestamp: serverTimestamp()
    }, { merge: true });

    lastSyncTimestamp = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    lastSyncStatus = 'synced';
    notifyStatusChange();

    return {
      success: true,
      mode: 'firebase',
      timestamp: lastSyncTimestamp,
      message: `Đồng bộ thành công lên Firebase Firestore (${lastSyncTimestamp}).`
    };
  } catch (error) {
    console.error('[FirebaseSync] Lỗi đẩy dữ liệu lên Firestore:', error);
    lastSyncStatus = 'error';
    notifyStatusChange();
    return {
      success: false,
      mode: 'error',
      error: error.message || 'Lỗi kết nối Firebase Firestore'
    };
  }
}

/**
 * Tải dữ liệu mới nhất từ Firebase Cloud Firestore về máy
 */
export async function fetchStorageFromFirebase() {
  const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;

  if (!firebaseConfigured || !db) {
    return {
      success: false,
      mode: 'local_only',
      message: 'Chưa cấu hình Firebase Cloud. Ứng dụng đang dùng dữ liệu cục bộ.'
    };
  }

  if (!isOnline) {
    return {
      success: false,
      mode: 'offline',
      message: 'Không có kết nối mạng Internet để tải từ đám mây.'
    };
  }

  try {
    lastSyncStatus = 'syncing';
    notifyStatusChange();

    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      const current = getStoredData();

      const mergedData = {
        plans: Array.isArray(cloudData.plans) && cloudData.plans.length > 0 ? cloudData.plans : current.plans,
        evaluations: Array.isArray(cloudData.evaluations) && cloudData.evaluations.length > 0 ? cloudData.evaluations : current.evaluations,
        settings: {
          ...current.settings,
          ...(cloudData.settings || {})
        },
        slides: current.slides
      };

      saveStoredData(mergedData);

      lastSyncTimestamp = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      lastSyncStatus = 'synced';
      notifyStatusChange();

      return {
        success: true,
        data: mergedData,
        message: 'Đã cập nhật dữ liệu mới nhất từ Firebase Cloud vào ứng dụng!'
      };
    } else {
      lastSyncStatus = 'idle';
      notifyStatusChange();
      return {
        success: false,
        message: 'Chưa có bản sao lưu nào trên Firestore. Hãy nhấn "Đồng bộ lên Cloud" trước.'
      };
    }
  } catch (error) {
    console.error('[FirebaseSync] Lỗi tải dữ liệu từ Firestore:', error);
    lastSyncStatus = 'error';
    notifyStatusChange();
    return {
      success: false,
      error: error.message || 'Lỗi tải từ Firebase Firestore'
    };
  }
}

/**
 * Đăng ký lắng nghe thay đổi thời gian thực từ Firestore (Realtime Listener)
 * @param {function} onDataReceived Callback khi có dữ liệu mới từ đám mây
 */
export function listenToFirebaseCloudUpdates(onDataReceived) {
  if (!firebaseConfigured || !db) return () => {};

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (typeof onDataReceived === 'function') {
          onDataReceived(cloudData);
        }
      }
    }, (err) => {
      console.warn('[FirebaseSync] Lỗi lắng nghe thời gian thực:', err);
    });

    return unsubscribe;
  } catch (e) {
    console.warn('[FirebaseSync] Không thể khởi tạo Realtime Listener:', e);
    return () => {};
  }
}
