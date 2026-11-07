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

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SUB_ADMIN: 'sub_admin',
  TEACHER: 'teacher',
};

const ACCESS_COLLECTION = 'userAccess';
const ADMIN_COLLECTION = 'adminRoles';
const ACCESS_ERROR_MESSAGES = {
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ Google. Cho phép cửa sổ bật lên cho trang ứng dụng rồi thử lại.',
  'auth/cancelled-popup-request': 'Một yêu cầu đăng nhập Google khác đang chạy. Đóng cửa sổ đăng nhập đang mở rồi thử lại.',
  'auth/unauthorized-domain': 'Tên miền ứng dụng chưa được thêm vào Firebase Authorized domains.',
  'auth/operation-not-allowed': 'Đăng nhập Google chưa được bật trong Firebase Authentication.',
  'auth/network-request-failed': 'Không kết nối được dịch vụ Google/Firebase. Kiểm tra mạng rồi thử lại.',
  'auth/invalid-api-key': 'Khóa Firebase của ứng dụng không hợp lệ. Quản trị viên cần kiểm tra cấu hình môi trường.',
  'auth/too-many-requests': 'Có quá nhiều lần thử đăng nhập. Vui lòng chờ một lúc rồi thử lại.',
  'permission-denied': 'Google đã xác thực nhưng Firestore từ chối đọc hoặc cập nhật quyền. Quản trị viên cần kiểm tra hồ sơ adminRoles/userAccess và Rules đang triển khai.',
  unavailable: 'Firestore tạm thời không kết nối được. Kiểm tra mạng rồi thử lại.',
};

export function getAccessErrorMessage(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = ACCESS_ERROR_MESSAGES[code];
  if (message) return `${message} (Mã lỗi: ${code})`;
  return error?.message || 'Không thể xác thực hoặc cập nhật quyền truy cập. Vui lòng thử lại.';
}

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
    if (admin.active !== true || ![ROLES.SUPER_ADMIN, ROLES.SUB_ADMIN].includes(admin.role)) return null;
    return makeSession(user, admin.role);
  }

  const accessSnapshot = await getDoc(doc(db, ACCESS_COLLECTION, email));
  if (!accessSnapshot.exists()) return null;
  const access = accessSnapshot.data();
  const grantedEmail = typeof access.email === 'string' ? access.email.trim().toLowerCase() : '';
  if (grantedEmail !== email || access.role !== ROLES.TEACHER || access.active !== true) return null;
  return makeSession(user, ROLES.TEACHER);
}

export async function loginAccess() {
  requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account', login_hint: '' });

  try {
    const result = await signInWithPopup(auth, provider);
    const session = await resolveCurrentSession(result.user);
    if (auth.currentUser?.uid !== result.user.uid) {
      throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
    }
    if (!session) {
      await signOut(auth);
      const email = (result.user.email || '').trim().toLowerCase();
      throw new Error(`Tài khoản Google ${email || 'đang chọn'} chưa có quyền hoạt động trong Cọ Nhí Studio. Quản trị viên cần cấp đúng địa chỉ này.`);
    }
    return { success: true, session };
  } catch (error) {
    if (error?.message?.includes('chưa có quyền hoạt động')) throw error;
    throw new Error(getAccessErrorMessage(error));
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
    return { success: false, message: getAccessErrorMessage(error) };
  }
}

export async function removeSharedGmail(email) {
  requireFirebase();
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    await deleteDoc(doc(db, ACCESS_COLLECTION, cleanEmail));
    return { success: true };
  } catch (error) {
    return { success: false, message: getAccessErrorMessage(error) };
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
    return { success: false, message: getAccessErrorMessage(error) };
  }
}
