import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { loginAccess } from '../../utils/adminAuthService';
import { firebaseConfigured } from '../../utils/firebaseClient';

export default function LoginGateModal({ isOpen, authError = '', onClearAuthError = () => {} }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    onClearAuthError();
    setIsSubmitting(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('conhi_explicit_logout');
      sessionStorage.removeItem('conhi_explicit_logout');
    }
    try {
      await loginAccess();
    } catch (error) {
      setErrorMsg(error?.message || 'Không thể xác thực tài khoản Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleError = errorMsg || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60 select-none backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 pt-8 pb-7 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center mx-auto mb-3 border-2 border-amber-200">
            <span className="text-3xl" aria-hidden="true">🎨</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Cọ Nhí Studio</h2>
          <p className="text-xs text-amber-100 font-medium mt-1">Soạn giảng và trình chiếu Mĩ thuật Tiểu học</p>
        </div>

        <div className="p-6 md:p-8 space-y-5 bg-white">
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Xác thực quyền truy cập</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Đăng nhập bằng Google đã được cấp quyền cho ứng dụng.
            </p>
          </div>

          {visibleError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{visibleError}</span>
            </div>
          )}

          {!firebaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900" role="status">
              Firebase chưa được cấu hình cho bản dựng này. Cần thêm các biến môi trường VITE_FIREBASE_* trước khi đăng nhập hoạt động.
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || !firebaseConfigured}
            className="w-full py-3 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 font-extrabold text-sm rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span className="font-black text-lg text-blue-600" aria-hidden="true">G</span>
            <span>{isSubmitting ? 'Đang xác thực…' : 'Tiếp tục với Google'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-amber-600" />Xác thực bằng Google</span>
            <span>GDPT 2018 • Bộ GD&ĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
