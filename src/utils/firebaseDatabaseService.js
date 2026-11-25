/**
 * Cọ Nhí Studio - Dịch vụ Kết nối Cơ Sở Dữ Liệu Firebase Cloud Firestore
 * Chuẩn SIÊU VIP PRO - Tự động đồng bộ hai chiều đầy đủ: Kế hoạch bài dạy, Slide bài giảng, Sổ điểm SMAS thật & Cài đặt
 */

import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfigured } from './firebaseClient.js';
import { getStoredData, saveStoredData, mapSmasStudentsToEvaluations } from '../lib/storage.ts';
import { getActiveUserScope, sanitizeUserScope } from './userWorkspaceService.js';
import { loadProjectFromLocal, loadProjectFromStorage, saveProjectToLocal } from './storageService.js';
import { readSmasData, readSmasDataAsync, writeSmasData, getTeachingClassesKey } from './smasEvaluationBridge.js';

const FIRESTORE_COLLECTION = 'conhi_studio_data';
const FIRESTORE_DOCUMENT = 'latest_backup';
const MAX_CLOUD_PAYLOAD_BYTES = 850 * 1024; // An toàn dưới ngưỡng 1 MiB của Firestore

let lastSyncTimestamp = null;
let lastSyncStatus = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error' | 'local_only'
const syncListeners = new Set();

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

function resolveDocId(userEmail) {
  const scope = userEmail ? sanitizeUserScope(userEmail) : getActiveUserScope();
  return { scope, docId: scope ? `user_${scope}` : FIRESTORE_DOCUMENT };
}

function readTeachingClassesLocal() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getTeachingClassesKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTeachingClassesLocal(classes) {
  if (typeof window === 'undefined' || !Array.isArray(classes) || !classes.length) return;
  try {
    localStorage.setItem(getTeachingClassesKey(), JSON.stringify(classes));
  } catch {}
}

/**
 * Chuẩn hóa payload dự án slide & sổ điểm SMAS để luôn an toàn dưới giới hạn 1 MiB của Firestore.
 */
export function buildCloudSyncPayload({ dataToSync, projectData, smasData, teachingClasses, scope }) {
  const safeProject = projectData && Array.isArray(projectData.slides)
    ? {
        title: projectData.title || dataToSync?.project?.title || 'Bài Giảng Mĩ Thuật',
        updatedAt: projectData.updatedAt || new Date().toISOString(),
        slides: projectData.slides,
      }
    : (dataToSync?.project || { title: 'Bài Giảng Mĩ Thuật', slides: [], updatedAt: new Date().toISOString() });

  const safeSmas = smasData && Array.isArray(smasData.students)
    ? {
        hasUploadedOrSelected: Boolean(smasData.hasUploadedOrSelected),
        className: smasData.className || '1A',
        classOptions: Array.isArray(smasData.classOptions) ? smasData.classOptions : ['1A'],
        selectedClassFilter: smasData.selectedClassFilter || 'all',
        semester: smasData.semester || 'Học kì I',
        students: smasData.students,
      }
    : null;

  const evaluations = safeSmas && safeSmas.students.length > 0
    ? mapSmasStudentsToEvaluations(safeSmas.students)
    : (dataToSync?.evaluations || []);

  const payload = JSON.parse(JSON.stringify({
    plans: dataToSync?.plans || [],
    evaluations,
    settings: dataToSync?.settings || {},
    project: safeProject,
    smas: safeSmas,
    teachingClasses: Array.isArray(teachingClasses) ? teachingClasses : [],
    syncedAt: new Date().toISOString(),
    userScope: scope || 'default',
    version: 'vip_pro_v2',
  }));

  // Kiểm tra kích thước payload; nếu vượt ngưỡng Firestore, tự động lược bỏ ảnh base64 quá nặng nhưng giữ nguyên dữ liệu học thuật
  let byteLength = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (byteLength > MAX_CLOUD_PAYLOAD_BYTES && payload.smas?.students) {
    payload.smas.students = payload.smas.students.map((st) => ({
      ...st,
      camHistory: Array.isArray(st.camHistory)
        ? st.camHistory.map((h) => ({ ...h, artworkThumb: '' }))
        : st.camHistory,
    }));
    byteLength = new TextEncoder().encode(JSON.stringify(payload)).length;
  }
  if (byteLength > MAX_CLOUD_PAYLOAD_BYTES && Array.isArray(payload.project?.slides)) {
    payload.project.slides = payload.project.slides.map((slide) => ({
      ...slide,
      elements: Array.isArray(slide.elements)
        ? slide.elements.map((el) =>
            typeof el?.src === 'string' && el.src.startsWith('data:') && el.src.length > 32000
              ? { ...el, src: '', _cloudMediaTrimmed: true }
              : el
          )
        : [],
    }));
  }

  return payload;
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
 * Đẩy toàn bộ dữ liệu hiện tại (Kế hoạch, Slide bài giảng, Sổ điểm SMAS thật, Cài đặt) lên Firebase Cloud Firestore
 */
export async function syncStorageToFirebase(customData, userEmail) {
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

    const { scope, docId } = resolveDocId(userEmail);
    const docRef = doc(db, FIRESTORE_COLLECTION, docId);

    const dataToSync = customData || getStoredData(scope);
    const localProject = customData?.project?.slides?.length
      ? customData.project
      : (await loadProjectFromStorage(scope).catch(() => null)) || loadProjectFromLocal(scope) || dataToSync?.project;
    const localSmas = customData?.smas
      ? customData.smas
      : (await readSmasDataAsync().catch(() => null)) || readSmasData();
    const teachingClasses = readTeachingClassesLocal();

    const sanitizedPayload = buildCloudSyncPayload({
      dataToSync,
      projectData: localProject,
      smasData: localSmas,
      teachingClasses,
      scope,
    });

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

    const slidesCount = sanitizedPayload.project?.slides?.length || 0;
    const smasCount = sanitizedPayload.smas?.students?.length || 0;

    return {
      success: true,
      mode: 'firebase',
      timestamp: lastSyncTimestamp,
      syncedCounts: {
        plans: sanitizedPayload.plans.length,
        slides: slidesCount,
        smasStudents: smasCount,
      },
      message: `Đã đồng bộ lên Cloud (${sanitizedPayload.plans.length} bài dạy, ${slidesCount} slide, ${smasCount} HS SMAS) lúc ${lastSyncTimestamp}.`
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
 * Tải toàn bộ dữ liệu mới nhất (Kế hoạch, Slide, Sổ điểm SMAS, Cài đặt) từ Firebase Cloud Firestore về máy
 */
export async function fetchStorageFromFirebase(userEmail) {
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

    const { scope, docId } = resolveDocId(userEmail);
    const docRef = doc(db, FIRESTORE_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      const current = getStoredData(scope);

      const mergedProject = cloudData.project && Array.isArray(cloudData.project.slides) && cloudData.project.slides.length > 0
        ? cloudData.project
        : current.project;

      const mergedData = {
        ...current,
        plans: Array.isArray(cloudData.plans) && cloudData.plans.length > 0 ? cloudData.plans : current.plans,
        evaluations: Array.isArray(cloudData.evaluations) && cloudData.evaluations.length > 0 ? cloudData.evaluations : current.evaluations,
        settings: {
          ...current.settings,
          ...(cloudData.settings || {})
        },
        project: mergedProject,
      };

      saveStoredData(mergedData, scope);

      // Đồng bộ lại Slide bài giảng vào kho dự án & thông báo cho App cập nhật giao diện
      if (mergedProject && Array.isArray(mergedProject.slides) && mergedProject.slides.length > 0) {
        saveProjectToLocal(mergedProject, scope);
        if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('conhi-project-synced', { detail: mergedProject }));
        }
      }

      // Đồng bộ lại Sổ điểm SMAS thật
      if (cloudData.smas && Array.isArray(cloudData.smas.students)) {
        writeSmasData(cloudData.smas);
      }

      // Đồng bộ lại danh sách lớp giảng dạy
      if (Array.isArray(cloudData.teachingClasses) && cloudData.teachingClasses.length > 0) {
        writeTeachingClassesLocal(cloudData.teachingClasses);
      }

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

      const slidesCount = mergedProject?.slides?.length || 0;
      const smasCount = Array.isArray(cloudData.smas?.students) ? cloudData.smas.students.length : 0;

      return {
        success: true,
        data: mergedData,
        smas: cloudData.smas || null,
        project: mergedProject,
        message: `Đã tải dữ liệu từ Cloud (${mergedData.plans.length} bài dạy, ${slidesCount} slide, ${smasCount} HS SMAS)!`
      };
    } else {
      lastSyncStatus = 'idle';
      notifyStatusChange();
      return {
        success: false,
        message: 'Chưa có bản sao lưu nào trên Firestore. Hãy nhấn "Đồng Bộ" trước.'
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
 * Đăng ký lắng nghe thay đổi thời gian thực từ Firestore theo đúng không gian người dùng
 */
export function listenToFirebaseCloudUpdates(onDataReceived, userEmail) {
  if (!firebaseConfigured || !db) return () => {};

  try {
    const { docId } = resolveDocId(userEmail);
    const docRef = doc(db, FIRESTORE_COLLECTION, docId);
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
