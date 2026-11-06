import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { loginAccess } from '../../utils/adminAuthService';

export default function LoginGateModal({ isOpen, onLoginSuccess }) {
  const [credentialInput, setCredentialInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = loginAccess(credentialInput);
      if (res.success) {
        setCredentialInput('');
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message || 'Mật khẩu hoặc Gmail không chính xác!');
      }
    } catch (err) {
      setErrorMsg('Đã có lỗi xảy ra trong quá trình xác thực.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60 select-none backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Top */}
        <div className="px-6 pt-8 pb-7 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center mb-3 border-2 border-amber-200">
              <img 
                src="/teacher.jpg" 
                alt="Thầy Cọ Nhí" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<span class="text-3xl">🎨</span>';
                }}
              />
            </div>

            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 justify-center">
              <span>Cọ Nhí Studio</span>
              <Sparkles className="w-4 h-4 fill-amber-200 text-amber-200" />
            </h2>
            <p className="text-xs text-amber-100 font-medium mt-1 max-w-xs leading-relaxed">
              Phần mềm Soạn giảng & Trình chiếu Mĩ thuật Tiểu học GDPT 2018
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-5 bg-white">
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Xác Thực Quyền Truy Cập</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng nhập mật khẩu quản trị hoặc địa chỉ Gmail được cấp quyền để mở ứng dụng.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Mật khẩu hoặc Gmail được cấp quyền:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentialInput}
                  onChange={(e) => {
                    setCredentialInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Nhập mật khẩu truy cập hoặc Gmail..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-11 font-medium tracking-wide text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Ẩn ký tự' : 'Hiện ký tự'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !credentialInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Mở Khóa Ứng Dụng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Bảo mật 100% Cục Bộ</span>
            </span>
            <span>GDPT 2018 • Bộ GD&ĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
