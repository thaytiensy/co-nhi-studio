import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './firebaseClient.js';
import { AUTH_ROLES, validateEmail } from '../contracts/authContract.js';
import {
  getLocalSharedGmails,
  saveLocalSharedGmails,
  getCurrentSession,
  saveCurrentSession,
  MASTER_ADMINS,
} from './localAuthStore.js';

export const ROLES = AUTH_ROLES;
export { getCurrentSession, saveCurrentSession };

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

function makeSession(email, role, uid) {
  const isOwner = role === ROLES.SUPER_ADMIN;
  const isSubAdmin = role === ROLES.SUB_ADMIN;
  return {
    uid: uid || `usr-${Date.now()}`,
    email,
    name: email,
    role,
    canShareGmail: isOwner || isSubAdmin,
    canManageRoles: isOwner,
    canEditApp: isOwner,
  };
}

export async function resolveCurrentSession(user) {
  const email = (user?.email || '').trim().toLowerCase();
  if (!user || !email) return null;
  if (MASTER_ADMINS.includes(email)) return makeSession(email, ROLES.SUPER_ADMIN, user.uid);

  if (firebaseConfigured && db) {
    try {
      const adminSnapshot = await getDoc(doc(db, ADMIN_COLLECTION, email));
      if (adminSnapshot.exists() && adminSnapshot.data()?.active) {
        return makeSession(email, adminSnapshot.data().role, user.uid);
      }
      const accessSnapshot = await getDoc(doc(db, ACCESS_COLLECTION, email));
      if (accessSnapshot.exists() && accessSnapshot.data()?.active) {
        return makeSession(email, accessSnapshot.data().role || ROLES.TEACHER, user.uid);
      }
    } catch {}
  }

  const localList = getLocalSharedGmails();
  const found = localList.find((item) => (item.email || '').toLowerCase() === email);
  if (found && found.active !== false) {
    return makeSession(email, found.role || ROLES.TEACHER, user.uid);
  }
  return null;
}

export async function loginAccess(credentialEmail = '') {
  const cleanInput = (credentialEmail || '').trim().toLowerCase();
  if (cleanInput) {
    const val = validateEmail(cleanInput);
    if (!val.valid) return { success: false, message: val.error || 'Địa chỉ Gmail không đúng định dạng!' };
    const email = val.email;
    const session = await resolveCurrentSession({ email, uid: `local-${Date.now()}` });
    if (!session) {
      return { success: false, message: `Địa chỉ ${email} chưa được cấp quyền sử dụng Cọ Nhí Studio. Quản trị viên cần cấp đúng Gmail này.` };
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
      if (!snapshot.empty) {
        return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
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
  const addedBy = currentSession?.email || 'admin@conhi.vn';

  if (firebaseConfigured && db) {
    try {
      const grantRef = doc(db, ACCESS_COLLECTION, cleanEmail);
      await setDoc(grantRef, { email: cleanEmail, role: ROLES.TEACHER, active: true, addedBy, addedAt: serverTimestamp() });
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
  if (firebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, ADMIN_COLLECTION));
      if (!snapshot.empty) return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    } catch {}
  }
  return MASTER_ADMINS.map((email, idx) => ({ id: `admin-${idx}`, email, role: ROLES.SUPER_ADMIN, active: true }));
}

export async function updateAdminRoleStatus(email, active) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (firebaseConfigured && db) {
    try {
      const roleRef = doc(db, ADMIN_COLLECTION, cleanEmail);
      await updateDoc(roleRef, { active: Boolean(active), updatedAt: serverTimestamp() });
      return { success: true };
    } catch {}
  }
  return { success: true };
}
