/**
 * Cọ Nhí Studio - Dịch Vụ Phân Vùng Không Gian Riêng Biệt Cho Từng Người Dùng (User Workspace Isolation)
 * Đảm bảo:
 * 1. Mỗi người dùng có một không gian làm việc độc lập (Multi-Tenant Per-User Sandbox).
 * 2. Người A không thể nhìn thấy bài giảng slide, giáo án, sổ điểm SMAS hay cài đặt của Người B.
 * 3. Dữ liệu LocalStorage và Firestore Cloud được gắn khóa định danh cá nhân (_usr_email).
 */

let inMemoryActiveScope = '';

/**
 * Chuẩn hóa email / mã người dùng thành khóa an toàn không chứa ký tự đặc biệt
 * @param {string} emailOrUid Email hoặc mã người dùng
 * @returns {string} Khóa định danh chuẩn hóa
 */
export function sanitizeUserScope(emailOrUid) {
  if (!emailOrUid || typeof emailOrUid !== 'string') return '';
  return emailOrUid
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Thiết lập không gian người dùng hiện tại đang làm việc
 * @param {string} emailOrUid
 */
export function setActiveUserScope(emailOrUid) {
  const scope = sanitizeUserScope(emailOrUid);
  inMemoryActiveScope = scope;
  if (typeof sessionStorage !== 'undefined') {
    try {
      if (scope) {
        sessionStorage.setItem('conhi_user_workspace_scope', scope);
      } else {
        sessionStorage.removeItem('conhi_user_workspace_scope');
      }
    } catch {}
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('conhi-workspace-changed', { detail: { scope } }));
    } catch {}
  }
}

/**
 * Lấy mã không gian người dùng hiện tại
 * @returns {string}
 */
export function getActiveUserScope() {
  if (inMemoryActiveScope) return inMemoryActiveScope;
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('conhi_user_workspace_scope');
      if (stored) {
        inMemoryActiveScope = stored;
        return stored;
      }
    } catch {}
  }
  return '';
}

/**
 * Xóa không gian khi người dùng đăng xuất
 */
export function clearActiveUserScope() {
  inMemoryActiveScope = '';
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('conhi_user_workspace_scope');
    } catch {}
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('conhi-workspace-changed', { detail: { scope: '' } }));
    } catch {}
  }
}

/**
 * Tạo khóa LocalStorage phân vùng riêng biệt theo từng người dùng
 * @param {string} baseKey Khóa gốc (ví dụ: co_nhi_studio_project_v1)
 * @param {string} [customEmailOrScope] Tùy chọn chỉ định người dùng, nếu không truyền sẽ lấy người đang đăng nhập
 * @returns {string}
 */
export function getScopedStorageKey(baseKey, customEmailOrScope) {
  const scope = customEmailOrScope ? sanitizeUserScope(customEmailOrScope) : getActiveUserScope();
  if (!scope) {
    return baseKey; // Mặc định khi chưa đăng nhập hoặc trong môi trường test độc lập
  }
  return `${baseKey}_usr_${scope}`;
}
