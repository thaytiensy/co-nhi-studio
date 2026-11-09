import React, { useState } from 'react';
import { KeyRound, Plus, ShieldCheck, UserCheck, Trash2 } from 'lucide-react';
import { AUTH_ROLES, validateEmail } from '../../contracts/authContract.js';

export default function AdminRolesTab({
  adminRoles = [],
  isLoading = false,
  onToggleAdmin = async () => {},
  onAddSubAdmin = async () => {},
  onRemoveSubAdmin = async () => {},
}) {
  const [subEmail, setSubEmail] = useState('');
  const [subTitle, setSubTitle] = useState('Admin');
  const [localError, setLocalError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setLocalError('');
    const val = validateEmail(subEmail);
    if (!val.valid) {
      setLocalError(val.error || 'Gmail không đúng định dạng!');
      return;
    }
    const success = await onAddSubAdmin(val.email, subTitle);
    if (success) {
      setSubEmail('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-950 leading-relaxed">
        <strong>Quản trị viên (Admin):</strong> Danh sách tài khoản Admin có toàn quyền quản trị, bảo mật và chia sẻ bài giảng.
      </div>

      {localError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs" role="alert">
          {localError}
        </div>
      )}

      {onAddSubAdmin && (
        <form onSubmit={handleAdd} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Cấp quyền Admin mới:</span>
          <div className="flex gap-2">
            <input
              type="email"
              value={subEmail}
              onChange={(e) => { setSubEmail(e.target.value); setLocalError(''); }}
              placeholder="nhapadmin@gmail.com"
              required
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-indigo-700 flex items-center shrink-0">
              Admin
            </span>
            <button
              type="submit"
              disabled={isLoading || !subEmail.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cấp Quyền</span>
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="p-5 text-center text-xs text-slate-500">Đang tải danh sách vai trò…</p>
      ) : adminRoles.length === 0 ? (
        <div className="p-5 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          Chưa có cấu hình vai trò.
        </div>
      ) : (
        <div className="space-y-2">
          {adminRoles.map((item) => {
            const isMaster = item.role === AUTH_ROLES.SUPER_ADMIN;
            return (
              <div
                key={item.id || item.email}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {isMaster ? <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>{item.email || item.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Admin
                    {' • '}
                    <span className={item.active ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                      {item.active ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                </div>

                {!isMaster && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleAdmin(item.id || item.email, item.active === true)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        item.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {item.active ? 'Khóa' : 'Kích hoạt'}
                    </button>
                    {onRemoveSubAdmin && (
                      <button
                        type="button"
                        onClick={() => onRemoveSubAdmin(item.id || item.email)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Xóa quyền Admin này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
        <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Quản trị viên xác thực bằng mật khẩu bảo mật riêng hoặc qua Gmail được cấp quyền.</span>
      </p>
    </div>
  );
}
