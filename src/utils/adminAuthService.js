// Dịch Vụ Quản Trị & Phân Quyền Bảo Mật Cọ Nhí Studio
// Tuyệt đối không hiển thị mật khẩu hay thông tin quản trị ra giao diện công khai

const STORAGE_KEYS = {
  SUPER_ADMIN_PWD: 'co_nhi_super_admin_pwd_v1',
  SUB_ADMIN_PWD: 'co_nhi_sub_admin_pwd_v1',
  SUB_ADMIN_PERMISSIONS: 'co_nhi_sub_admin_perms_v1',
  SHARED_GMAILS: 'co_nhi_shared_gmail_list_v1',
  ADMIN_SESSION: 'co_nhi_admin_session_v1',
};

// Mật khẩu khởi tạo mặc định theo chỉ đạo của Quản trị viên
const DEFAULT_SUPER_ADMIN_PWD = '12345678';
const DEFAULT_SUB_ADMIN_PWD = '862496';

export const ROLES = {
  SUPER_ADMIN: 'super_admin', // Admin 1: Đổi được mật khẩu, quản lý toàn diện
  SUB_ADMIN: 'sub_admin',     // Admin 2: Chỉ có quyền chia sẻ cho người khác dùng qua Gmail
  TEACHER: 'shared_teacher',  // Giáo viên được cấp quyền dùng app
};

// Lấy mật khẩu Admin Chính hiện tại (nếu chưa đổi thì dùng mặc định)
export function getSuperAdminPassword() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_PWD) || DEFAULT_SUPER_ADMIN_PWD;
  } catch {
    return DEFAULT_SUPER_ADMIN_PWD;
  }
}

// Lấy mật khẩu Admin Phụ hiện tại (Admin Chính có thể thay đổi trong tab Phân Quyền)
export function getSubAdminPassword() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SUB_ADMIN_PWD) || DEFAULT_SUB_ADMIN_PWD;
  } catch {
    return DEFAULT_SUB_ADMIN_PWD;
  }
}

// Lấy cấu hình phân quyền hiện tại của Admin Phụ
export function getSubAdminPermissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUB_ADMIN_PERMISSIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    isActive: true,       // Admin Phụ có được kích hoạt không
    canShareGmail: true,  // Admin Phụ có quyền chia sẻ Gmail không
  };
}

// Cập nhật cấu hình phân quyền Admin Phụ (Chỉ Super Admin)
export function updateSubAdminPermissions(newPerms) {
  try {
    const current = getSubAdminPermissions();
    const updated = { ...current, ...newPerms };
    localStorage.setItem(STORAGE_KEYS.SUB_ADMIN_PERMISSIONS, JSON.stringify(updated));
    return { success: true, permissions: updated, message: 'Đã cập nhật phân quyền thành công!' };
  } catch {
    return { success: false, message: 'Lỗi lưu trữ phân quyền!' };
  }
}

// Đổi mật khẩu cho Admin Phụ (Admin Chính thực hiện trong tab Phân Quyền)
export function changeSubAdminPassword(newPassword) {
  const clean = (newPassword || '').trim();
  if (!clean || clean.length < 4) {
    return { success: false, message: 'Mật khẩu Admin Phụ phải có ít nhất 4 ký tự!' };
  }
  try {
    localStorage.setItem(STORAGE_KEYS.SUB_ADMIN_PWD, clean);
    return { success: true, message: 'Đã đổi mật khẩu Admin Phụ thành công!' };
  } catch {
    return { success: false, message: 'Lỗi lưu trữ mật khẩu Admin Phụ!' };
  }
}

// Kiểm tra phiên đăng nhập hiện tại
export function getCurrentAdminSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Đăng nhập hệ thống quản trị
export function loginAdmin(password) {
  const trimmed = (password || '').trim();
  if (!trimmed) {
    return { success: false, message: 'Vui lòng nhập mật khẩu quản trị!' };
  }

  const currentSuperPwd = getSuperAdminPassword();
  const currentSubPwd = getSubAdminPassword();
  const subPerms = getSubAdminPermissions();

  // 1. Kiểm tra quyền Admin Chính
  if (trimmed === currentSuperPwd) {
    const session = {
      role: ROLES.SUPER_ADMIN,
      name: 'Admin Chính (Quản Trị Viên Tối Cao)',
      canChangePassword: true,
      canShareGmail: true,
      canManageRoles: true,
      canEditApp: true,
      loggedInAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
    } catch {}
    return { success: true, session };
  }

  // 2. Kiểm tra quyền Admin Phụ (Được quản lý động)
  if (trimmed === currentSubPwd) {
    if (!subPerms.isActive) {
      return { success: false, message: 'Tài khoản Admin Phụ hiện đang bị Admin Chính tạm khóa!' };
    }
    const session = {
      role: ROLES.SUB_ADMIN,
      name: 'Admin Phụ (Quản Trị Chia Sẻ)',
      canChangePassword: false, // Không có quyền đổi mật khẩu hệ thống
      canShareGmail: Boolean(subPerms.canShareGmail), // Theo phân quyền Admin Chính thiết lập
      canManageRoles: false,
      canEditApp: false,        // Không có quyền sửa app
      loggedInAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
    } catch {}
    return { success: true, session };
  }

  return { success: false, message: 'Mật khẩu quản trị không chính xác!' };
}

// Đổi mật khẩu cho Admin Chính (Chỉ dành cho Super Admin)
export function changeSuperAdminPassword(oldPassword, newPassword) {
  const currentSuperPwd = getSuperAdminPassword();
  if ((oldPassword || '').trim() !== currentSuperPwd) {
    return { success: false, message: 'Mật khẩu cũ không đúng!' };
  }

  const cleanNew = (newPassword || '').trim();
  if (!cleanNew || cleanNew.length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_PWD, cleanNew);
    // Cập nhật lại phiên đăng nhập
    const session = {
      role: ROLES.SUPER_ADMIN,
      name: 'Admin Chính (Quản Trị Viên Tối Cao)',
      canChangePassword: true,
      canShareGmail: true,
      canEditApp: true,
      loggedInAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
    return { success: true, message: 'Đổi mật khẩu Admin Chính thành công!' };
  } catch (err) {
    return { success: false, message: 'Không thể lưu mật khẩu vào bộ nhớ máy!' };
  }
}

// Đăng xuất khỏi phiên quản trị
export function logoutAdmin() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  } catch {}
}

// Lấy danh sách Gmail được chia sẻ quyền sử dụng
export function getSharedGmails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHARED_GMAILS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Thêm Gmail mới vào danh sách chia sẻ
export function addSharedGmail(email, addedByRole = ROLES.SUB_ADMIN, assignedRole = ROLES.TEACHER) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Địa chỉ Gmail không đúng định dạng!' };
  }

  const currentList = getSharedGmails();
  if (currentList.some(item => item.email === cleanEmail)) {
    return { success: false, message: 'Gmail này đã có trong danh sách được cấp quyền!' };
  }

  const newItem = {
    id: 'share-' + Date.now(),
    email: cleanEmail,
    role: assignedRole || ROLES.TEACHER,
    addedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    addedBy: addedByRole === ROLES.SUPER_ADMIN ? 'Admin Chính' : 'Admin Phụ'
  };

  const updated = [newItem, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEYS.SHARED_GMAILS, JSON.stringify(updated));
    return { success: true, list: updated, message: `Đã cấp quyền chia sẻ cho ${cleanEmail} thành công!` };
  } catch {
    return { success: false, message: 'Lỗi lưu trữ danh sách Gmail!' };
  }
}

// Cập nhật vai trò phân quyền cho một địa chỉ Gmail (Chỉ Super Admin)
export function updateSharedGmailRole(email, newRole) {
  const currentList = getSharedGmails();
  const updated = currentList.map(item => {
    if (item.email === email) {
      return { ...item, role: newRole };
    }
    return item;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.SHARED_GMAILS, JSON.stringify(updated));
    return { success: true, list: updated, message: `Đã phân quyền cho ${email} thành công!` };
  } catch {
    return { success: false, message: 'Lỗi lưu trữ phân quyền Gmail!' };
  }
}

// Xóa Gmail khỏi danh sách chia sẻ
export function removeSharedGmail(emailToRemove) {
  const currentList = getSharedGmails();
  const updated = currentList.filter(item => item.email !== emailToRemove);
  try {
    localStorage.setItem(STORAGE_KEYS.SHARED_GMAILS, JSON.stringify(updated));
    return { success: true, list: updated };
  } catch {
    return { success: false };
  }
}

// Kiểm tra xác thực tổng quát (Mật khẩu Super Admin, Mật khẩu Sub Admin hoặc Gmail được cấp quyền)
export function loginAccess(credential) {
  const trimmed = (credential || '').trim();
  if (!trimmed) {
    return { success: false, message: 'Vui lòng nhập mật khẩu hoặc Gmail được cấp quyền!' };
  }

  // 1. Kiểm tra mật khẩu Admin Chính hoặc Admin Phụ
  const adminRes = loginAdmin(trimmed);
  if (adminRes.success) {
    return adminRes;
  }

  // 2. Kiểm tra nếu là Gmail trong danh sách chia sẻ
  const lower = trimmed.toLowerCase();
  const sharedList = getSharedGmails();
  const found = sharedList.find(item => (item.email || '').toLowerCase() === lower);
  if (found) {
    const isSubAdmin = found.role === ROLES.SUB_ADMIN;
    const session = {
      role: isSubAdmin ? ROLES.SUB_ADMIN : ROLES.TEACHER,
      name: isSubAdmin ? `Admin Phụ (${found.email})` : `Giáo Viên (${found.email})`,
      canChangePassword: false,
      canShareGmail: isSubAdmin,
      canManageRoles: false,
      canEditApp: false,
      email: found.email,
      loggedInAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
    } catch {}
    return { success: true, session };
  }

  return { success: false, message: 'Mật khẩu hoặc Gmail chưa được cấp quyền truy cập!' };
}

// Kiểm tra xem ứng dụng đã có phiên đăng nhập hợp lệ chưa
export function isUserAuthenticated() {
  const session = getCurrentAdminSession();
  return Boolean(session && session.role);
}
