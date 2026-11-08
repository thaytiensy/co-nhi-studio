import React from 'react';
import { KeyRound } from 'lucide-react';
import { AUTH_ROLES } from '../../contracts/authContract.js';

export default function AdminRolesTab({
  adminRoles = [],
  isLoading = false,
  onToggleAdmin = async () => {},
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-950">
        Chỉ chủ quản trị mới xem và thay đổi vai trò. Admin Phụ chỉ được cấp quyền sử dụng cho người khác qua Gmail.
      </div>

      {isLoading ? (
        <p className="p-5 text-center text-xs text-slate-500">Đang tải vai trò…</p>
      ) : adminRoles.length === 0 ? (
        <div className="p-5 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          Chưa có cấu hình vai trò. Cần khởi tạo quyền trong Firebase trước khi sử dụng.
        </div>
      ) : (
        <div className="space-y-2">
          {adminRoles.map((item) => (
            <div
              key={item.id || item.email}
              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-slate-800">{item.email || item.id}</div>
                <div className="text-[11px] text-slate-500">
                  {item.role === AUTH_ROLES.SUPER_ADMIN ? 'Chủ quản trị' : 'Admin Phụ'} · {item.active ? 'Đang hoạt động' : 'Đang tạm khóa'}
                </div>
              </div>
              {item.role === AUTH_ROLES.SUB_ADMIN && (
                <button
                  type="button"
                  onClick={() => onToggleAdmin(item.id, item.active === true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {item.active ? 'Tạm khóa' : 'Kích hoạt'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
        <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Đăng nhập và quyền quản trị được xác nhận bằng tài khoản Google, không dùng mật khẩu riêng trong ứng dụng.</span>
      </p>
    </div>
  );
}
