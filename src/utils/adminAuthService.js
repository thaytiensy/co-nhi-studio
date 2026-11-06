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
import { auth, db, firebaseConfigured } from './firebaseClient';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SUB_ADMIN: 'sub_admin',
  TEACHER: 'teacher',
};

const ACCESS_COLLECTION = 'userAccess';
const ADMIN_COLLECTION = 'adminRoles';

function requireFirebase() {
  if (!firebaseConfigured || !auth || !db) {
    throw new Error('Ứng dụng chưa được cấu hình Firebase.');
  }
}

function makeSession(user, role) {
  const isOwner = role === ROLES.SUPER_ADMIN;
  const isSubAdmin = role === ROLES.SUB_ADMIN;
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || user.email,
    role,
    canShareGmail: isOwner || isSubAdmin,
    canManageRoles: isOwner,
    canEditApp: isOwner,
  };
}

export async function resolveCurrentSession(user) {
  requireFirebase();
  const email = (user?.email || '').trim().toLowerCase();
  if (!user || !email || user.emailVerified !== true) return null;

  const adminSnapshot = await getDoc(doc(db, ADMIN_COLLECTION, email));
  if (adminSnapshot.exists()) {
    const admin = adminSnapshot.data();
    if (admin.active === true && [ROLES.SUPER_ADMIN, ROLES.SUB_ADMIN].includes(admin.role)) {
      return makeSession(user, admin.role);
    }
    if (admin.active !== true) return null;
  }

  const accessSnapshot = await getDoc(doc(db, ACCESS_COLLECTION, email));
  if (!accessSnapshot.exists()) return null;
  const access = accessSnapshot.data();
  if (access.email !== email || access.role !== ROLES.TEACHER || access.active !== true) return null;
  return makeSession(user, ROLES.TEACHER);
}

export async function loginAccess() {
  requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const session = await resolveCurrentSession(result.user);
    if (auth.currentUser?.uid !== result.user.uid) {
      throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
    }
    if (!session) {
      await signOut(auth);
      throw new Error('Tài khoản Google này chưa được cấp quyền sử dụng Cọ Nhí Studio.');
    }
    return { success: true, session };
  } catch (error) {
    if (error?.message?.includes('chưa được cấp quyền')) throw error;
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.');
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('Tên miền ứng dụng chưa được thêm vào danh sách Firebase Authorized domains.');
    }
    if (error?.code === 'auth/operation-not-allowed') {
      throw new Error('Đăng nhập Google chưa được bật trong Firebase Authentication.');
    }
    throw new Error(error?.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
  }
}

export async function logoutAdmin() {
  if (auth?.currentUser) await signOut(auth);
}

export async function getSharedGmails() {
  requireFirebase();
  const snapshot = await getDocs(collection(db, ACCESS_COLLECTION));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function addSharedGmail(email) {
  requireFirebase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Địa chỉ Gmail không đúng định dạng!' };
  }
  if (!auth.currentUser?.email || auth.currentUser.email.toLowerCase() === cleanEmail) {
    return { success: false, message: 'Không thể cấp quyền cho địa chỉ này.' };
  }

  try {
    const grantRef = doc(db, ACCESS_COLLECTION, cleanEmail);
    const existing = await getDoc(grantRef);
    if (existing.exists()) {
      return { success: false, message: 'Địa chỉ này đã được cấp quyền.' };
    }
    await setDoc(grantRef, {
      email: cleanEmail,
      role: ROLES.TEACHER,
      active: true,
      addedBy: auth.currentUser.email.toLowerCase(),
      addedAt: serverTimestamp(),
    });
    return { success: true, message: `Đã cấp quyền sử dụng cho ${cleanEmail}.` };
  } catch (error) {
    return { success: false, message: error?.message || 'Không thể lưu quyền truy cập.' };
  }
}

export async function removeSharedGmail(email) {
  requireFirebase();
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    await deleteDoc(doc(db, ACCESS_COLLECTION, cleanEmail));
    return { success: true };
  } catch (error) {
    return { success: false, message: error?.message || 'Không thể thu hồi quyền truy cập.' };
  }
}

export async function getAdminRoles() {
  requireFirebase();
  const snapshot = await getDocs(collection(db, ADMIN_COLLECTION));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function updateAdminRoleStatus(email, active) {
  requireFirebase();
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    const roleRef = doc(db, ADMIN_COLLECTION, cleanEmail);
    const roleSnapshot = await getDoc(roleRef);
    if (!roleSnapshot.exists() || roleSnapshot.data().role !== ROLES.SUB_ADMIN) {
      return { success: false, message: 'Chỉ có thể cập nhật trạng thái Admin Phụ đã được cấu hình.' };
    }
    await updateDoc(roleRef, { active: Boolean(active), updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, message: error?.message || 'Không thể cập nhật phân quyền.' };
  }
}
