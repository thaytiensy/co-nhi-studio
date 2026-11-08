import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, LogOut, ShieldCheck, Users, X } from 'lucide-react';
import {
  addSharedGmail,
  addSubAdmin,
  getAccessErrorMessage,
  getAdminRoles,
  getSharedGmails,
  removeSharedGmail,
  removeSubAdmin,
  ROLES,
  updateAdminRoleStatus,
} from '../../utils/adminAuthService';
import AdminAccountsTab from './AdminAccountsTab';
import AdminRolesTab from './AdminRolesTab';

export default function AdminModal({ isOpen, onClose, onLogout, session }) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [sharedList, setSharedList] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    setErrorMsg(getAccessErrorMessage(error));
  }).finally(() => {
    setIsLoading(false);
  }), [isOwner]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const handleAddGmail = async (canonicalEmail) => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    const result = await addSharedGmail(canonicalEmail);
    if (!result.success) { setIsLoading(false); setErrorMsg(result.message); return false; }
    setSuccessMsg(result.message);
    await loadData();
    return true;
  };

  const handleRemoveGmail = async (email) => {
    if (!isOwner || !window.confirm(`Thu hồi quyền sử dụng của ${email}?`)) return;
    setErrorMsg(''); setIsLoading(true);
    const result = await removeSharedGmail(email);
    if (!result.success) { setIsLoading(false); setErrorMsg(result.message || 'Không thể thu hồi quyền.'); return; }
    setSuccessMsg(`Đã thu hồi quyền của ${email}.`);
    await loadData();
  };

  const handleToggleAdmin = async (idOrEmail, active) => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    await updateAdminRoleStatus(idOrEmail, !active);
    setSuccessMsg(!active ? 'Đã kích hoạt Admin.' : 'Đã tạm khóa Admin.');
    await loadData();
  };

  const handleAddSub = async (email, title) => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    const res = await addSubAdmin(email, title);
    if (!res.success) { setIsLoading(false); setErrorMsg(res.message); return false; }
    setSuccessMsg(res.message);
    await loadData();
    return true;
  };

  const handleRemoveSub = async (idOrEmail) => {
    if (!window.confirm('Thu hồi quyền Admin này?')) return;
    setErrorMsg(''); setIsLoading(true);
    const res = await removeSubAdmin(idOrEmail);
    setSuccessMsg(res.message);
    await loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Khu Vực Quản Trị</h3>
              <p className="text-xs text-slate-300">
                {isOwner ? 'Admin 1 (Chủ quản trị tối cao • Ẩn danh)' : (session?.adminTitle || 'Admin Phụ')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer" title="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2" role="status">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isOwner && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'accounts' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Giáo Viên ({sharedList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'roles' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cấp Quyền Admin 2, 3</span>
              </button>
            </div>
          )}

          {(activeTab === 'accounts' || isSubAdmin) && (
            <AdminAccountsTab
              sharedList={sharedList}
              isOwner={isOwner}
              isLoading={isLoading}
              onAddGmail={handleAddGmail}
              onRemoveGmail={handleRemoveGmail}
              onRefresh={() => { setIsLoading(true); void loadData(); }}
            />
          )}

          {isOwner && activeTab === 'roles' && (
            <AdminRolesTab
              adminRoles={adminRoles}
              isLoading={isLoading}
              onToggleAdmin={handleToggleAdmin}
              onAddSubAdmin={handleAddSub}
              onRemoveSubAdmin={handleRemoveSub}
            />
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isOwner ? 'Admin 1 (Ẩn danh)' : `${session?.adminTitle || 'Admin'}: ${session?.email || ''}`}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
