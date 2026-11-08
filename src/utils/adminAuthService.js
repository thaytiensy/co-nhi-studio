import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './firebaseClient.js';
import { AUTH_ROLES, validateEmail, ADMIN_1_EMAIL, ADMIN_1_PASSWORD } from '../contracts/authContract.js';
import {
  getLocalSharedGmails, saveLocalSharedGmails,
  getLocalSubAdmins, saveLocalSubAdmins,
  getCurrentSession, saveCurrentSession,
} from './localAuthStore.js';

export const ROLES = AUTH_ROLES;
export { getCurrentSession, saveCurrentSession, ADMIN_1_EMAIL, ADMIN_1_PASSWORD };

const ACCESS_COLLECTION = 'userAccess';
const ADMIN_COLLECTION = 'adminRoles';
const ACCESS_ERRORS = {
  'auth/network-request-failed': 'Không kết nối được dịch vụ Google/Firebase. Kiểm tra mạng rồi thử lại.',
  'permission-denied': 'Google đã xác thực nhưng Firestore từ chối đọc hoặc cập nhật quyền.',
};

export function getAccessErrorMessage(error) {
  const code = error?.code;
  if (code && ACCESS_ERRORS[code]) return ACCESS_ERRORS[code];
  return error?.message || 'Không thể xác thực quyền truy cập.';
}

function makeSession(email, role, uid, title = '', isAnon = false) {
  const isOwner = role === ROLES.SUPER_ADMIN;
  const isSubAdmin = role === ROLES.SUB_ADMIN;
  return {
    uid: uid || `usr-${Date.now()}`,
    email,
    name: email,
    role,
    adminTitle: title || (isOwner ? 'Admin 1' : isSubAdmin ? 'Admin Phụ' : ''),
    isAnonymous: isAnon,
    canShareGmail: isOwner || isSubAdmin,
    canManageRoles: isOwner,
    canEditApp: isOwner,
  };
}

export async function resolveCurrentSession(user) {
  const email = (user?.email || '').trim().toLowerCase();
  if (!user || !email) return null;
  if (email === ADMIN_1_EMAIL) return makeSession(email, ROLES.SUPER_ADMIN, user.uid, 'Admin 1', true);

  const subAdmins = getLocalSubAdmins();
  const sub = subAdmins.find(item => (item.email || '').toLowerCase() === email && item.active !== false);
  if (sub) return makeSession(email, ROLES.SUB_ADMIN, user.uid, sub.title || 'Admin Phụ', false);

  if (firebaseConfigured && db) {
    try {
      const adminSnap = await getDoc(doc(db, ADMIN_COLLECTION, email));
      if (adminSnap.exists() && adminSnap.data()?.active) {
        const d = adminSnap.data();
        return makeSession(email, d.role, user.uid, d.title, d.role === ROLES.SUPER_ADMIN);
      }
      const accessSnap = await getDoc(doc(db, ACCESS_COLLECTION, email));
      if (accessSnap.exists() && accessSnap.data()?.active) {
        return makeSession(email, accessSnap.data().role || ROLES.TEACHER, user.uid, '', false);
      }
    } catch {}
  }

  const localList = getLocalSharedGmails();
  const found = localList.find((item) => (item.email || '').toLowerCase() === email);
  if (found && found.active !== false) {
    return makeSession(email, found.role || ROLES.TEACHER, user.uid, '', false);
  }
  return null;
}

export async function loginAccess(credentialEmail = '', password = '') {
  const cleanInput = (credentialEmail || '').trim().toLowerCase();
  if (cleanInput) {
    const val = validateEmail(cleanInput);
    if (!val.valid) return { success: false, message: val.error || 'Địa chỉ Gmail không đúng định dạng!' };
    const email = val.email;
    if (email === ADMIN_1_EMAIL) {
      if (!password || password.trim() !== ADMIN_1_PASSWORD) {
        return { success: false, message: 'Mật khẩu bảo mật Admin 1 không chính xác!' };
      }
    }
    const session = await resolveCurrentSession({ email, uid: `local-${Date.now()}` });
    if (!session) {
      return { success: false, message: `Địa chỉ ${email} chưa được Admin 1 cấp quyền. Vui lòng liên hệ Admin 1 (${ADMIN_1_EMAIL}).` };
    }
    saveCurrentSession(session);
    return { success: true, session };
  }

  if (!firebaseConfigured || !auth) {
    return { success: false, message: 'Vui lòng nhập địa chỉ Gmail được cấp quyền vào ô bên dưới.' };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account', login_hint: '' });
  try {
    const result = await signInWithPopup(auth, provider);
    const session = await resolveCurrentSession(result.user);
    if (!session) {
      await signOut(auth);
      const email = (result.user.email || '').trim().toLowerCase();
      throw new Error(`Tài khoản Google ${email || 'đang chọn'} chưa có quyền hoạt động trong Cọ Nhí Studio.`);
    }
    saveCurrentSession(session);
    return { success: true, session };
  } catch (error) {
    throw new Error(getAccessErrorMessage(error));
  }
}

export async function logoutAdmin() {
  saveCurrentSession(null);
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
      if (!snapshot.empty) return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    } catch {}
  }
  return getLocalSharedGmails();
}

export async function addSharedGmail(email) {
  const val = validateEmail(email);
  if (!val.valid) return { success: false, message: val.error || 'Gmail không đúng định dạng!' };
  const cleanEmail = val.email;
  const currentSession = getCurrentSession();
  const addedBy = currentSession?.email || ADMIN_1_EMAIL;

  if (firebaseConfigured && db) {
    try {
      await setDoc(doc(db, ACCESS_COLLECTION, cleanEmail), { email: cleanEmail, role: ROLES.TEACHER, active: true, addedBy, addedAt: serverTimestamp() });
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
  const subAdmins = getLocalSubAdmins();
  const admin1Record = { id: 'admin-1', email: ADMIN_1_EMAIL, role: ROLES.SUPER_ADMIN, title: 'Admin 1 (Chủ quản trị • Ẩn danh)', active: true };
  return [admin1Record, ...subAdmins];
}

export async function updateAdminRoleStatus(idOrEmail, active) {
  const updated = getLocalSubAdmins().map(item => (item.id === idOrEmail || item.email === idOrEmail) ? { ...item, active: Boolean(active) } : item);
  saveLocalSubAdmins(updated);
  return { success: true };
}

export async function addSubAdmin(email, title = 'Admin 2') {
  const val = validateEmail(email);
  if (!val.valid) return { success: false, message: val.error || 'Gmail không đúng định dạng!' };
  const cleanEmail = val.email;
  const subAdmins = getLocalSubAdmins();
  if (cleanEmail === ADMIN_1_EMAIL || subAdmins.some(s => (s.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Tài khoản này đã có quyền quản trị.' };
  }
  const updated = [...subAdmins, { id: `sub-${Date.now()}`, email: cleanEmail, role: ROLES.SUB_ADMIN, title: title || 'Admin 2', active: true, addedBy: ADMIN_1_EMAIL }];
  saveLocalSubAdmins(updated);
  return { success: true, message: `Đã cấp quyền ${title || 'Admin'} cho ${cleanEmail}.` };
}

export async function removeSubAdmin(idOrEmail) {
  saveLocalSubAdmins(getLocalSubAdmins().filter(s => s.id !== idOrEmail && s.email !== idOrEmail));
  return { success: true, message: 'Đã thu hồi quyền quản trị.' };
}
