/**
 * Data Contract for Authentication & Gmail Access Management
 * Strict validation - No 'any' types - Enforces data integrity
 */

export const AUTH_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  SUB_ADMIN: 'sub_admin',
  TEACHER: 'teacher',
});

export const ADMIN_1_EMAIL = 'dotiensy.8785@gmail.com';
export const ADMIN_1_PASSWORD = 'Tiensy2026@';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and canonicalizes a Gmail address.
 * @param {string} email
 * @returns {{ valid: boolean, email: string, error: string | null }}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, email: '', error: 'Địa chỉ email phải là chuỗi văn bản.' };
  }
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) {
    return { valid: false, email: '', error: 'Vui lòng nhập địa chỉ Gmail.' };
  }
  if (!EMAIL_REGEX.test(cleaned)) {
    return { valid: false, email: '', error: 'Địa chỉ Gmail không đúng định dạng (ví dụ: giaovien@gmail.com).' };
  }
  return { valid: true, email: cleaned, error: null };
}

/**
 * Validates an access grant record shape.
 * @param {unknown} record
 * @returns {boolean}
 */
export function isValidAccessGrant(record) {
  if (!record || typeof record !== 'object') return false;
  const item = /** @type {Record<string, unknown>} */ (record);
  return typeof item.email === 'string'
    && EMAIL_REGEX.test(item.email)
    && typeof item.active === 'boolean';
}

/**
 * Validates a user session shape.
 * @param {unknown} session
 * @returns {boolean}
 */
export function isValidUserSession(session) {
  if (!session || typeof session !== 'object') return false;
  const item = /** @type {Record<string, unknown>} */ (session);
  return typeof item.uid === 'string'
    && typeof item.email === 'string'
    && typeof item.role === 'string'
    && Object.values(AUTH_ROLES).includes(item.role);
}
