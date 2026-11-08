import { AUTH_ROLES } from '../contracts/authContract.js';

export const STORAGE_KEY_SHARED = 'conhi_shared_gmails_v1';
export const STORAGE_KEY_SESSION = 'conhi_active_session_v1';

export const MASTER_ADMINS = ['dotiensy.8785@gmail.com', 'thaytiensy@gmail.com', 'ngathuyphu2@gmail.com', 'admin@conhi.vn'];

export const INITIAL_SEEDED_GMAILS = [
  { id: 'seed-1', email: 'hoangthanhtam1980@gmail.com', role: AUTH_ROLES.TEACHER, addedBy: 'ngathuyphu2@gmail.com', active: true },
  { id: 'seed-2', email: 'giaovien@gmail.com', role: AUTH_ROLES.TEACHER, addedBy: 'dotiensy.8785@gmail.com', active: true },
];

export function getLocalSharedGmails() {
  if (typeof window === 'undefined') return INITIAL_SEEDED_GMAILS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHARED);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(INITIAL_SEEDED_GMAILS));
      return INITIAL_SEEDED_GMAILS;
    }
    return JSON.parse(raw);
  } catch { return INITIAL_SEEDED_GMAILS; }
}

export function saveLocalSharedGmails(list) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(list)); } catch {}
}

export function getCurrentSession() {
  if (typeof window === 'undefined') return null;
  const isExplicit = localStorage.getItem('conhi_explicit_logout') === 'true'
    || sessionStorage.getItem('conhi_explicit_logout') === 'true';
  if (isExplicit) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SESSION) || localStorage.getItem(STORAGE_KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveCurrentSession(session) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('conhi_explicit_logout');
    sessionStorage.removeItem('conhi_explicit_logout');
    if (session) {
      const serialized = JSON.stringify(session);
      sessionStorage.setItem(STORAGE_KEY_SESSION, serialized);
      localStorage.setItem(STORAGE_KEY_SESSION, serialized);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  } catch {}
}
