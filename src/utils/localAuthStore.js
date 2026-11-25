export const STORAGE_KEY_SHARED = 'conhi_shared_gmails_v1';
export const STORAGE_KEY_SUB_ADMINS = 'conhi_sub_admins_v1';
export const STORAGE_KEY_SESSION = 'conhi_active_session_v1';
export const STORAGE_KEY_AUTH_TOKEN = 'conhi_auth_token_v1';

// Migration: xóa session cũ khỏi localStorage (tránh auto-login từ các phiên trước)
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
  } catch {}
}

export const INITIAL_SUB_ADMINS = [];
export const INITIAL_SEEDED_GMAILS = [];

export function getLocalSubAdmins() {
  if (typeof window === 'undefined') return INITIAL_SUB_ADMINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUB_ADMINS);
    if (!raw) return INITIAL_SUB_ADMINS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUB_ADMINS;
  } catch {
    return INITIAL_SUB_ADMINS;
  }
}

export function saveLocalSubAdmins(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUB_ADMINS, JSON.stringify(list));
  } catch {}
}

export function getLocalSharedGmails() {
  if (typeof window === 'undefined') return INITIAL_SEEDED_GMAILS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHARED);
    if (!raw) return INITIAL_SEEDED_GMAILS;
    const parsed = JSON.parse(raw);
    const cleaned = (Array.isArray(parsed) ? parsed : []).filter(item => item.email !== 'giaovien@gmail.com');
    if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return INITIAL_SEEDED_GMAILS;
  }
}

export function saveLocalSharedGmails(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(list));
  } catch {}
}

export function getCurrentSession() {
  // Chỉ đọc sessionStorage (tab-only) — không đọc localStorage để tránh auto-login
  if (typeof window === 'undefined') return null;
  const isExplicit = sessionStorage.getItem('conhi_explicit_logout') === 'true';
  if (isExplicit) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentSession(session) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('conhi_explicit_logout');
    sessionStorage.removeItem('conhi_explicit_logout');
    if (session) {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  } catch {}
}

export function getCurrentAuthToken() {
  if (typeof window === 'undefined') return '';
  if (sessionStorage.getItem('conhi_explicit_logout') === 'true') return '';
  try {
    return sessionStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || '';
  } catch {
    return '';
  }
}

export function saveCurrentAuthToken(token) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof token === 'string' && token.trim()) {
      sessionStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token.trim());
    } else {
      sessionStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    }
  } catch {}
}
