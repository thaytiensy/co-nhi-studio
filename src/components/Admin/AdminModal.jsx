import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  LogOut,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  addSharedGmail,
  getAdminRoles,
  getSharedGmails,
  removeSharedGmail,
  ROLES,
  updateAdminRoleStatus,
} from '../../utils/adminAuthService';

export default function AdminModal({ isOpen, onClose, onLogout, session }) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [newGmail, setNewGmail] = useState('');
  const [sharedList, setSharedList] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = session?.role === ROLES.SUPER_ADMIN;
  const isSubAdmin = session?.role === ROLES.SUB_ADMIN;

  const loadData = useCallback(() => Promise.all([
    getSharedGmails(),
    isOwner ? getAdminRoles() : Promise.resolve([]),
  ]).then(([grants, roles]) => {
    setErrorMsg('');
    setSharedList(grants.sort((a, b) => (a.email || '').localeCompare(b.email || '')));
    setAdminRoles(roles);
  }).catch((error) => {
    setErrorMsg(error?.message || 'Không thể tải dữ liệu phân quyền.');
  }).finally(() => {
    setIsLoading(false);
  }), [isOwner]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const handleAddGmail = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    const result = await addSharedGmail(newGmail);
    if (!result.success) {
      setIsLoading(false);
      setErrorMsg(result.message);
      return;
    }
    setNewGmail('');
    setSuccessMsg(result.message);
    await loadData();
  };

  const handleRemoveGmail = async (email) => {
    if (!isOwner || !window.confirm(`Thu hồi quyền sử dụng của ${email}?`)) return;
    setErrorMsg('');
    setIsLoading(true);
    const result = await removeSharedGmail(email);
    if (!result.success) {
      setIsLoading(false);
      setErrorMsg(result.message || 'Không thể thu hồi quyền truy cập.');
      return;
    }
    setSuccessMsg(`Đã thu hồi quyền của ${email}.`);
    await loadData();
  };

  const handleToggleAdmin = async (email, active) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    const result = await updateAdminRoleStatus(email, !active);
    if (!result.success) {
      setIsLoading(false);
      setErrorMsg(result.message || 'Không thể cập nhật vai trò quản trị.');
      return;
    }
    setSuccessMsg(!active ? 'Đã kích hoạt Admin Phụ.' : 'Đã tạm khóa Admin Phụ.');
    await loadData();
  };

  const handleCopyShareLink = async () => {
    const shareText = `Cọ Nhí Studio: ${window.location.origin}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setErrorMsg('Trình duyệt không cho phép sao chép liên kết.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={(event) => event.stopPropagation()}>
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h3 className="font-extrabold text-base">Khu Vực Quản Trị</h3>
              <p className="text-xs text-slate-300">{isOwner ? 'Quản lý quyền sử dụng và vai trò quản trị' : 'Cấp quyền sử dụng Cọ Nhí Studio'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg" title="Đóng"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2" role="alert"><AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /><span>{errorMsg}</span></div>}
          {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2" role="status"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>{successMsg}</span></div>}

          {isOwner && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button type="button" onClick={() => setActiveTab('accounts')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'accounts' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'}`}>
                <Users className="w-3.5 h-3.5" />Tài khoản ({sharedList.length})
              </button>
              <button type="button" onClick={() => setActiveTab('roles')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'roles' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />Phân quyền Admin
              </button>
            </div>
          )}

          {(activeTab === 'accounts' || isSubAdmin) && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                Cấp quyền cho Gmail đã xác minh. Người được cấp sẽ đăng nhập bằng chính Google account của họ; ứng dụng không lưu hay gửi mật khẩu.
              </div>
              <form onSubmit={handleAddGmail} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Gmail cần cấp quyền:</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" value={newGmail} onChange={(event) => setNewGmail(event.target.value)} placeholder="giaovien@gmail.com" required className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4" /><span>Cấp Quyền</span>
                  </button>
                </div>
              </form>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600"><span className="font-bold text-slate-800">Liên kết ứng dụng</span><p className="text-[11px] text-slate-500 truncate max-w-xs">{window.location.origin}</p></div>
                <button type="button" onClick={handleCopyShareLink} className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 shrink-0">
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}{copiedLink ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-700"><span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-500" />Gmail đã được cấp quyền ({sharedList.length})</span><button type="button" onClick={() => { setIsLoading(true); void loadData(); }} className="text-amber-700 hover:underline">Làm mới</button></div>
                {isLoading ? <p className="p-5 text-center text-xs text-slate-500">Đang tải…</p> : sharedList.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"><p className="text-xs font-bold text-slate-600">Chưa có Gmail nào trong danh sách</p><p className="text-[11px] text-slate-400 mt-1">Nhập email phía trên để cấp quyền sử dụng.</p></div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {sharedList.map((item) => (
                      <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div><span className="font-bold text-slate-800">{item.email}</span><div className="text-[10px] text-slate-400">Cấp bởi: {item.addedBy || '—'}</div></div>
                        {isOwner && <button type="button" onClick={() => handleRemoveGmail(item.email)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Thu hồi quyền"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isOwner && activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-950">Chỉ chủ quản trị mới xem và thay đổi vai trò. Admin Phụ chỉ được cấp quyền sử dụng cho người khác.</div>
              {isLoading ? <p className="p-5 text-center text-xs text-slate-500">Đang tải…</p> : adminRoles.length === 0 ? <p className="p-5 text-center text-xs text-slate-500">Chưa có cấu hình vai trò. Cần khởi tạo quyền trong Firebase trước khi sử dụng.</p> : adminRoles.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div><div className="text-xs font-bold text-slate-800">{item.email || item.id}</div><div className="text-[11px] text-slate-500">{item.role === ROLES.SUPER_ADMIN ? 'Chủ quản trị' : 'Admin Phụ'} · {item.active ? 'Đang hoạt động' : 'Đang tạm khóa'}</div></div>
                  {item.role === ROLES.SUB_ADMIN && <button type="button" onClick={() => handleToggleAdmin(item.id, item.active === true)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${item.active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{item.active ? 'Tạm khóa' : 'Kích hoạt'}</button>}
                </div>
              ))}
              <p className="text-[11px] text-slate-500 flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" />Đăng nhập và quyền quản trị được xác nhận bằng tài khoản Google, không dùng mật khẩu riêng trong ứng dụng.</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">{session?.email || 'Đã xác thực'}</span>
            <button type="button" onClick={onLogout} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" />Đăng xuất</button>
          </div>
        </div>
      </div>
    </div>
  );
}
