import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  Users, 
  Mail, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  LogOut, 
  AlertCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import { 
  loginAdmin, 
  logoutAdmin, 
  getCurrentAdminSession, 
  changeSuperAdminPassword, 
  getSharedGmails, 
  addSharedGmail, 
  removeSharedGmail,
  ROLES 
} from '../../utils/adminAuthService';

export default function AdminModal({ isOpen, onClose, onLogout }) {
  const [session, setSession] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active Tab for Super Admin: 'share' | 'password' | 'info'
  const [activeTab, setActiveTab] = useState('share');

  // Change Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Gmail Sharing States
  const [newGmail, setNewGmail] = useState('');
  const [sharedList, setSharedList] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load session on open
  useEffect(() => {
    if (isOpen) {
      const current = getCurrentAdminSession();
      setSession(current);
      setSharedList(getSharedGmails());
      setErrorMsg('');
      setSuccessMsg('');
      setPasswordInput('');
      if (current?.role === ROLES.SUB_ADMIN) {
        setActiveTab('share');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xử lý đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = loginAdmin(passwordInput);
    if (res.success) {
      setSession(res.session);
      setPasswordInput('');
      setSharedList(getSharedGmails());
      if (res.session.role === ROLES.SUB_ADMIN) {
        setActiveTab('share');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  // Xử lý đổi mật khẩu cho Super Admin
  const handleChangePassword = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới và xác nhận mật khẩu không khớp nhau!');
      return;
    }

    const res = changeSuperAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const updated = getCurrentAdminSession();
      setSession(updated);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Thêm Gmail chia sẻ
  const handleAddGmail = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = addSharedGmail(newGmail, session?.role);
    if (res.success) {
      setSharedList(res.list);
      setNewGmail('');
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Xóa Gmail khỏi danh sách
  const handleRemoveGmail = (email) => {
    if (window.confirm(`Thầy/Cô có chắc muốn thu hồi quyền truy cập của ${email}?`)) {
      const res = removeSharedGmail(email);
      if (res.success) {
        setSharedList(res.list);
      }
    }
  };

  // Sao chép link chia sẻ
  const handleCopyShareLink = () => {
    const shareUrl = window.location.origin;
    const shareText = `Kính gửi Thầy/Cô, bạn đã được cấp quyền sử dụng phần mềm Cọ Nhí Studio - Soạn giảng & Trình chiếu Mĩ thuật Tiểu học GDPT 2018 tại: ${shareUrl}`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Đăng xuất
  const handleLogout = () => {
    logoutAdmin();
    setSession(null);
    setPasswordInput('');
    setErrorMsg('');
    setSuccessMsg('');
    if (onLogout) onLogout();
  };

  const isSuperAdmin = session?.role === ROLES.SUPER_ADMIN;
  const isSubAdmin = session?.role === ROLES.SUB_ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>Khu Vực Quản Trị Hệ Thống</span>
                {session && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isSuperAdmin ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
                  }`}>
                    {isSuperAdmin ? 'Admin Chính' : 'Admin Phụ (Chia sẻ)'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300">
                {session 
                  ? (isSuperAdmin ? 'Toàn quyền quản trị & phân phối quyền ứng dụng' : 'Quyền cấp phép & chia sẻ sử dụng qua Gmail')
                  : 'Xác thực bảo mật dành riêng cho Ban quản trị'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung bên trong Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Thông báo lỗi / thành công */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. MÀN HÌNH CHƯA ĐĂNG NHẬP: FORM NHẬP MẬT KHẨU */}
          {!session ? (
            <form onSubmit={handleLogin} className="space-y-4 py-2">
              <div className="text-center max-w-sm mx-auto mb-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-2 border border-amber-200 shadow-2xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Nhập Mật Khẩu Quản Trị</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập mã khóa bảo mật của Admin Chính hoặc Admin Phụ để mở khóa quyền quản lý.
                </p>
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <label className="text-xs font-bold text-slate-700 block">
                  Mật khẩu bảo mật:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="max-w-sm mx-auto pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Xác Thực Đăng Nhập</span>
                </button>
              </div>
            </form>
          ) : (
            /* 2. MÀN HÌNH ĐÃ ĐĂNG NHẬP */
            <div className="space-y-4">
              {/* Thanh điều hướng Tab cho Super Admin */}
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('share'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'share'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chia Sẻ Qua Gmail ({sharedList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'password'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Đổi Mật Khẩu Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('info'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`py-1.5 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'info'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phân Quyền</span>
                  </button>
                </div>
              )}

              {/* Thông báo phân quyền nếu là Admin Phụ */}
              {isSubAdmin && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 leading-relaxed flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-emerald-900 block font-black text-sm">
                      Chào mừng Admin Phụ (Admin 2) - Quản Trị Chia Sẻ!
                    </strong>
                    <p className="text-emerald-800 text-xs leading-relaxed">
                      Bạn đã đăng nhập thành công bằng mật khẩu Admin Phụ. Bạn có toàn quyền <strong>cấp phép và chia sẻ ứng dụng</strong> cho các giáo viên khác bằng cách nhập địa chỉ Gmail bên dưới và nhấn <em>"Cấp Quyền"</em>.
                    </p>
                    <p className="text-emerald-700 text-[11px] italic">
                      * Theo phân quyền bảo mật: Tài khoản Admin Phụ không hiển thị tính năng đổi mật khẩu hệ thống và không can thiệp vào mã nguồn app.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: CHIA SẺ GMAIL (Cả Admin 1 và Admin 2 đều dùng được) */}
              {(activeTab === 'share' || isSubAdmin) && (
                <div className="space-y-4">
                  {/* Form thêm Gmail */}
                  <form onSubmit={handleAddGmail} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Thêm địa chỉ Gmail để cấp quyền sử dụng:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={newGmail}
                          onChange={(e) => setNewGmail(e.target.value)}
                          placeholder="giaovien.mithuat@gmail.com"
                          className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Cấp Quyền</span>
                      </button>
                    </div>
                  </form>

                  {/* Thanh công cụ sao chép liên kết */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Liên kết truy cập ứng dụng:</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{window.location.origin}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Đã sao chép' : 'Sao chép lời mời'}</span>
                    </button>
                  </div>

                  {/* Danh sách các Gmail đã được chia sẻ */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>Danh sách Gmail đã cấp quyền ({sharedList.length}):</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Tự động đồng bộ trên thiết bị</span>
                    </div>

                    {sharedList.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-600">Chưa có Gmail nào trong danh sách</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Nhập địa chỉ Gmail ở trên và bấm "Cấp Quyền" để chia sẻ cho giáo viên khác.</p>
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                        {sharedList.map((item) => (
                          <div 
                            key={item.id}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-amber-300 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                ✉️
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{item.email}</span>
                                <div className="text-[10px] text-slate-400">
                                  Cấp bởi: {item.addedBy} • Lúc: {item.addedAt}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveGmail(item.email)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Thu hồi quyền sử dụng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU ADMIN CHÍNH (Chỉ Super Admin) */}
              {isSuperAdmin && activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-sm mx-auto py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu Admin Chính hiện tại:
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPwd ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPwd(!showOldPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showOldPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu Admin Chính mới:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự..."
                        required
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Xác nhận lại mật khẩu mới:
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Cập Nhật Mật Khẩu Admin Chính</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: THÔNG TIN PHÂN QUYỀN (Super Admin) */}
              {isSuperAdmin && activeTab === 'info' && (
                <div className="space-y-3 py-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <h5 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Sơ đồ phân quyền Ban quản trị:</span>
                    </h5>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                        <strong className="text-amber-900 block font-bold">1. Admin Chính (Super Admin):</strong>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          Có toàn quyền quản trị, có thể đổi mật khẩu cá nhân, chia sẻ và thu hồi quyền Gmail, và cấu hình nâng cao.
                        </p>
                      </div>
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <strong className="text-emerald-900 block font-bold">2. Admin Phụ (Sub Admin):</strong>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          Chỉ có quyền thêm/xóa danh sách Gmail chia sẻ cho đồng nghiệp sử dụng. Không có quyền sửa app hoặc đổi mật khẩu.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {session ? `Phiên đăng nhập: ${session.name}` : 'Bảo mật Cọ Nhí Studio 100% Cục bộ'}
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-all"
                title="Đăng xuất khỏi bảng quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
