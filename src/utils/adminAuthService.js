import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './firebaseClient.js';
import { AUTH_ROLES, isValidUserSession, validateEmail } from '../contracts/authContract.js';
import {
  getLocalSharedGmails, saveLocalSharedGmails,
  getLocalSubAdmins, saveLocalSubAdmins,
  getCurrentSession, saveCurrentSession,
  getCurrentAuthToken, saveCurrentAuthToken,
} from './localAuthStore.js';

export const ROLES = AUTH_ROLES;
export { getCurrentSession, saveCurrentSession, getCurrentAuthToken, saveCurrentAuthToken };

const ACCESS_COLLECTION = 'userAccess';
const ADMIN_COLLECTION = 'adminRoles';
const ACCESS_ERRORS = {
  'auth/network-request-failed': 'Không kết nối được dịch vụ Google/Firebase. Kiểm tra mạng rồi thử lại.',
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã đóng trước khi hoàn tất.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ bật lên Google. Vui lòng cho phép popup rồi thử lại.',
  'permission-denied': 'Google đã xác thực nhưng Firestore từ chối đọc hoặc cập nhật quyền.',
};

export function getAccessErrorMessage(error) {
  const code = error?.code;
  if (code && ACCESS_ERRORS[code]) return ACCESS_ERRORS[code];
  return error?.message || 'Không thể xác thực quyền truy cập.';
}

function makeSession(email, role, uid, title = '', isAnon = false, authMethod = 'google') {
  const isOwner = role === ROLES.SUPER_ADMIN;
  const isSubAdmin = role === ROLES.SUB_ADMIN;
  return {
    uid: uid || `usr-${Date.now()}`,
    email,
    name: email,
    role,
    adminTitle: title || (isOwner ? 'Admin 1' : isSubAdmin ? 'Admin Phụ' : ''),
    isAnonymous: isAnon,
    authMethod,
    canShareGmail: isOwner || isSubAdmin,
    canManageRoles: isOwner,
    canEditApp: isOwner,
  };
}

export async function resolveCurrentSession(user) {
  const email = (user?.email || '').trim().toLowerCase();
  if (!user || !email) return null;

  if (firebaseConfigured && db) {
    try {
      const adminSnap = await getDoc(doc(db, ADMIN_COLLECTION, email));
      if (adminSnap.exists() && adminSnap.data()?.active) {
        const d = adminSnap.data();
        return makeSession(email, d.role, user.uid, d.title, d.role === ROLES.SUPER_ADMIN, 'google');
      }
      const accessSnap = await getDoc(doc(db, ACCESS_COLLECTION, email));
      if (accessSnap.exists() && accessSnap.data()?.active) {
        return makeSession(email, accessSnap.data().role || ROLES.TEACHER, user.uid, '', false, 'google');
      }
    } catch {}
  }

  return null;
}

export async function exchangeServerAuth(payload, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') {
    return { success: false, message: 'Trình duyệt không hỗ trợ kết nối xác thực máy chủ.' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data?.error || `Xác thực thất bại (mã ${response.status}).`,
      };
    }
    if (!isValidUserSession(data?.session) || typeof data?.token !== 'string' || !data.token.trim()) {
      return { success: false, message: 'Phản hồi xác thực từ máy chủ không hợp lệ.' };
    }
    saveCurrentSession(data.session);
    saveCurrentAuthToken(data.token);
    return { success: true, session: data.session, token: data.token };
  } catch (error) {
    if (error?.name === 'AbortError') {
      return { success: false, message: 'Máy chủ xác thực phản hồi quá lâu. Vui lòng thử lại.' };
    }
    return { success: false, message: 'Không thể kết nối máy chủ xác thực. Vui lòng kiểm tra mạng.' };
  } finally {
    clearTimeout(timer);
  }
}

export async function loginAccess(credentialEmail = '', password = '', fetchImpl = globalThis.fetch) {
  const cleanInput = (credentialEmail || '').trim().toLowerCase();
  if (cleanInput) {
    const val = validateEmail(cleanInput);
    if (!val.valid) {
      return { success: false, message: val.error || 'Địa chỉ Gmail không đúng định dạng!' };
    }
    if (!password || !String(password).trim()) {
      return {
        success: false,
        message: 'Giáo viên và Admin Phụ vui lòng bấm "Đăng Nhập Bằng Google" để xác thực an toàn. Đăng nhập bằng mật khẩu chỉ dành cho Quản trị viên.',
      };
    }
    return exchangeServerAuth({
      mode: 'admin_password',
      email: val.email,
      password: String(password),
    }, fetchImpl);
  }

  if (!firebaseConfigured || !auth) {
    return { success: false, message: 'Hệ thống đăng nhập Google chưa sẵn sàng. Vui lòng thử lại sau hoặc dùng cổng Quản trị viên.' };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account', login_hint: '' });
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const verified = await exchangeServerAuth({ mode: 'google', idToken }, fetchImpl);
    if (!verified.success) {
      await signOut(auth).catch(() => {});
      throw new Error(verified.message || 'Tài khoản Google này chưa có quyền hoạt động trong Cọ Nhí Studio.');
    }
    return verified;
  } catch (error) {
    throw new Error(getAccessErrorMessage(error));
  }
}

export async function logoutAdmin() {
  saveCurrentSession(null);
  saveCurrentAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.setItem('conhi_explicit_logout', 'true');
    sessionStorage.setItem('conhi_explicit_logout', 'true');
  }
  if (auth?.currentUser) await signOut(auth).catch(() => {});
}

export async function getSharedGmails() {
  if (firebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, ACCESS_COLLECTION));
      if (!snapshot.empty) {
        return snapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .filter((item) => item.email !== 'giaovien@gmail.com');
      }
    } catch {}
  }
  return getLocalSharedGmails();
}

export async function addSharedGmail(email) {
  const val = validateEmail(email);
  if (!val.valid) return { success: false, message: val.error || 'Gmail không đúng định dạng!' };
  const cleanEmail = val.email;
  const currentSession = getCurrentSession();
  const addedBy = currentSession?.email || 'Quản trị hệ thống';

  if (firebaseConfigured && db) {
    try {
      await setDoc(doc(db, ACCESS_COLLECTION, cleanEmail), {
        email: cleanEmail,
        role: ROLES.TEACHER,
        active: true,
        addedBy,
        addedAt: serverTimestamp(),
      });
    } catch {}
  }

  const currentList = getLocalSharedGmails();
  if (currentList.some((item) => item.email === cleanEmail)) {
    return { success: false, message: 'Địa chỉ Gmail này đã được cấp quyền trước đó.' };
  }
  const updated = [...currentList, { id: `local-${Date.now()}`, email: cleanEmail, role: ROLES.TEACHER, active: true, addedBy }];
  saveLocalSharedGmails(updated);
  return { success: true, message: `Đã cấp quyền sử dụng cho ${cleanEmail}.` };
}

export async function removeSharedGmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (firebaseConfigured && db) {
    try { await deleteDoc(doc(db, ACCESS_COLLECTION, cleanEmail)); } catch {}
  }
  const currentList = getLocalSharedGmails();
  const updated = currentList.filter((item) => (item.email || '').toLowerCase() !== cleanEmail);
  saveLocalSharedGmails(updated);
  return { success: true };
}

export async function getAdminRoles() {
  const currentSession = getCurrentSession();
  let remoteRoles = [];
  if (firebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, ADMIN_COLLECTION));
      if (!snapshot.empty) {
        remoteRoles = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
      }
    } catch {}
  }
  const localSubAdmins = getLocalSubAdmins();
  const mergedMap = new Map();
  if (currentSession?.role === ROLES.SUPER_ADMIN && currentSession.email) {
    mergedMap.set(currentSession.email.toLowerCase(), {
      id: 'admin-1',
      email: currentSession.email.toLowerCase(),
      role: ROLES.SUPER_ADMIN,
      title: 'Admin 1 (Chủ quản trị • Ẩn danh)',
      active: true,
    });
  }
  for (const item of [...localSubAdmins, ...remoteRoles]) {
    const key = (item.email || '').trim().toLowerCase();
    if (!key) continue;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, item);
    }
  }
  return Array.from(mergedMap.values());
}

export async function updateAdminRoleStatus(idOrEmail, active) {
  const cleanKey = String(idOrEmail || '').trim().toLowerCase();
  if (firebaseConfigured && db && cleanKey.includes('@')) {
    try {
      await setDoc(doc(db, ADMIN_COLLECTION, cleanKey), { active: Boolean(active) }, { merge: true });
    } catch {}
  }
  const updated = getLocalSubAdmins().map(item =>
    (item.id === idOrEmail || (item.email || '').toLowerCase() === cleanKey)
      ? { ...item, active: Boolean(active) }
      : item
  );
  saveLocalSubAdmins(updated);
  return { success: true };
}

export async function addSubAdmin(email, title = 'Admin 2') {
  const val = validateEmail(email);
  if (!val.valid) return { success: false, message: val.error || 'Gmail không đúng định dạng!' };
  const cleanEmail = val.email;
  const currentSession = getCurrentSession();
  const addedBy = currentSession?.email || 'Quản trị hệ thống';
  const subAdmins = getLocalSubAdmins();
  if (currentSession?.email?.toLowerCase() === cleanEmail || subAdmins.some(s => (s.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Tài khoản này đã có quyền quản trị.' };
  }
  if (firebaseConfigured && db) {
    try {
      await setDoc(doc(db, ADMIN_COLLECTION, cleanEmail), {
        email: cleanEmail,
        role: ROLES.SUB_ADMIN,
        title: title || 'Admin 2',
        active: true,
        addedBy,
        addedAt: serverTimestamp(),
      });
    } catch {}
  }
  const updated = [...subAdmins, { id: `sub-${Date.now()}`, email: cleanEmail, role: ROLES.SUB_ADMIN, title: title || 'Admin 2', active: true, addedBy }];
  saveLocalSubAdmins(updated);
  return { success: true, message: `Đã cấp quyền ${title || 'Admin'} cho ${cleanEmail}.` };
}

export async function removeSubAdmin(idOrEmail) {
  const cleanKey = String(idOrEmail || '').trim().toLowerCase();
  if (firebaseConfigured && db && cleanKey.includes('@')) {
    try { await deleteDoc(doc(db, ADMIN_COLLECTION, cleanKey)); } catch {}
  }
  saveLocalSubAdmins(getLocalSubAdmins().filter(s => s.id !== idOrEmail && (s.email || '').toLowerCase() !== cleanKey));
  return { success: true, message: 'Đã thu hồi quyền quản trị.' };
}
