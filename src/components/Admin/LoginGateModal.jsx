import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { loginAccess, ADMIN_1_EMAIL } from '../../utils/adminAuthService';
import { firebaseConfigured } from '../../utils/firebaseClient';

export default function LoginGateModal({ isOpen, authError = '', onLoginSuccess = () => {}, onClearAuthError = () => {} }) {
  const [emailInput, setEmailInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('email') || p.get('gmail') || '';
    }
    return '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAdmin1 = emailInput.trim().toLowerCase() === ADMIN_1_EMAIL;

  const handleGmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    onClearAuthError();
    setIsSubmitting(true);
    try {
      const res = await loginAccess(emailInput, passwordInput);
      if (!res.success) {
        setErrorMsg(res.message || 'Đăng nhập không thành công.');
      } else {
        onLoginSuccess(res.session);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xác thực Gmail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePopup = async () => {
    setErrorMsg('');
    onClearAuthError();
    setIsSubmitting(true);
    try {
      const res = await loginAccess();
      if (res?.success) onLoginSuccess(res.session);
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể đăng nhập bằng Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleError = errorMsg || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/70 select-none backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200">
        <div className="px-6 pt-7 pb-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center mx-auto mb-3 border-2 border-amber-200 overflow-hidden">
            <img
              src="/teacher.jpg"
              alt="Thầy Cọ Nhí"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<span class="text-3xl" aria-hidden="true">🎨</span>';
                }
              }}
            />
          </div>
          <h2 className="text-xl font-black tracking-tight">Cọ Nhí Studio</h2>
          <p className="text-xs text-amber-100 font-medium mt-0.5">Soạn giảng & Trình chiếu Mĩ thuật Tiểu học GDPT 2018</p>
        </div>

        <div className="p-6 md:p-8 space-y-4 bg-white">
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Bảo Mật Gmail • Đăng Nhập Vào App</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập Gmail đã được cấp quyền để vào ứng dụng mĩ thuật.
            </p>
          </div>

          {visibleError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{visibleError}</span>
            </div>
          )}

          <form onSubmit={handleGmailSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setErrorMsg(''); }}
                placeholder="Nhập địa chỉ Gmail của Thầy/Cô…"
                required
                className="w-full pl-10 pr-3 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {isAdmin1 && (
              <div className="space-y-1 animate-in fade-in">
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setErrorMsg(''); }}
                    placeholder="Mật khẩu bảo mật Admin 1 (Tiensy2026@)…"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-800 bg-amber-50/60 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <p className="text-[10px] text-amber-800 font-bold pl-1 flex items-center gap-1">
                  <span>🔒</span> Quyền Admin 1 • Chế độ Quản trị Ẩn danh
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !emailInput.trim() || (isAdmin1 && !passwordInput.trim())}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{isSubmitting ? 'Đang xác thực…' : isAdmin1 ? 'Xác Thực Quyền Admin 1' : 'Đăng Nhập Bằng Gmail'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {firebaseConfigured && (
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">hoặc</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <button
                type="button"
                onClick={handleGooglePopup}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="font-black text-sm text-blue-600" aria-hidden="true">G</span>
                <span>Tiếp tục với Google Popup</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              Phân quyền Gmail bảo mật
            </span>
            <span>GDPT 2018 • Bộ GD&ĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
