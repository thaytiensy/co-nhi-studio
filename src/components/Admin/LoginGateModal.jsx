import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ChevronDown, ChevronUp, Lock, Mail, ShieldCheck } from 'lucide-react';
import { loginAccess } from '../../utils/adminAuthService';
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
  const [showAdminForm, setShowAdminForm] = useState(() => !firebaseConfigured);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    onClearAuthError();
    setIsSubmitting(true);
    try {
      const res = await loginAccess(emailInput, passwordInput);
      if (!res.success) {
        setErrorMsg(res.message || 'Đăng nhập không thành công.');
      } else {
        setPasswordInput('');
        onLoginSuccess(res.session);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xác thực tài khoản quản trị.');
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
      if (res?.success) {
        onLoginSuccess(res.session);
      } else if (res?.message) {
        setErrorMsg(res.message);
      }
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
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center mx-auto mb-3 border-2 border-amber-200 overflow-hidden text-4xl select-none">
            🎨
          </div>
          <h2 className="text-xl font-black tracking-tight">Cọ Nhí Studio</h2>
          <p className="text-xs text-amber-100 font-medium mt-0.5">Soạn giảng &amp; Trình chiếu Mĩ thuật Tiểu học GDPT 2018</p>
        </div>

        <div className="p-6 md:p-8 space-y-4 bg-white">
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Xác Thực Tài Khoản • Đăng Nhập An Toàn</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Giáo viên và Quản trị phụ đăng nhập bằng tài khoản Google đã được cấp quyền.
            </p>
          </div>

          {visibleError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{visibleError}</span>
            </div>
          )}

          {firebaseConfigured && (
            <button
              type="button"
              onClick={handleGooglePopup}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-white text-blue-600 font-black text-xs flex items-center justify-center shadow-2xs" aria-hidden="true">G</span>
              <span>{isSubmitting ? 'Đang xác thực với Google…' : 'Đăng Nhập Bằng Google'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => { setShowAdminForm((prev) => !prev); setErrorMsg(''); }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Đăng nhập Quản trị viên (Email &amp; Mật khẩu)</span>
              </span>
              {showAdminForm ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {showAdminForm && (
            <form onSubmit={handleAdminSubmit} className="space-y-3 pt-1 animate-in fade-in">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setErrorMsg(''); }}
                  placeholder="Email quản trị viên…"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setErrorMsg(''); }}
                  placeholder="Nhập mật khẩu quản trị viên…"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-800 bg-amber-50/50 border border-amber-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !emailInput.trim() || !passwordInput.trim()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Đang xác thực…' : 'Xác Thực Quyền Quản Trị'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              Xác thực máy chủ bảo mật
            </span>
            <span>GDPT 2018 • Bộ GD&amp;ĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
