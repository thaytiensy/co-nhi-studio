import React, { useState } from 'react';
import { Check, Copy, Mail, Plus, Trash2, Users } from 'lucide-react';
import { validateEmail } from '../../contracts/authContract.js';

export default function AdminAccountsTab({
  sharedList = [],
  isOwner = false,
  isLoading = false,
  onAddGmail = async () => {},
  onRemoveGmail = async () => {},
  onRefresh = () => {},
}) {
  const [newGmail, setNewGmail] = useState('');
  const [copiedLink, setCopiedLink] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    const validation = validateEmail(newGmail);
    if (!validation.valid) {
      setLocalError(validation.error || 'Email không hợp lệ.');
      return;
    }
    const success = await onAddGmail(validation.email);
    if (success) {
      setNewGmail('');
    }
  };

  const handleCopyLink = async (targetEmail = '') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://co-nhi-studio.vercel.app';
    const query = targetEmail ? `?email=${encodeURIComponent(targetEmail)}` : '';
    const shareText = `${origin}/${query}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(targetEmail || 'main');
      window.setTimeout(() => setCopiedLink(''), 2500);
    } catch {
      setLocalError('Trình duyệt không cho phép sao chép liên kết.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
        Cấp quyền cho Gmail đã xác minh. Người được cấp sẽ đăng nhập bằng chính Google account của họ; ứng dụng không lưu hay gửi mật khẩu.
      </div>

      {localError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs" role="alert">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="admin-grant-email" className="text-xs font-bold text-slate-700 block">
          Gmail cần cấp quyền:
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-grant-email"
              type="email"
              value={newGmail}
              onChange={(e) => { setNewGmail(e.target.value); setLocalError(''); }}
              placeholder="giaovien@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isLoading ? 'Đang cấp…' : 'Cấp Quyền'}</span>
          </button>
        </div>
      </form>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-800">Liên kết ứng dụng</span>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">
            {typeof window !== 'undefined' ? window.location.origin : 'https://co-nhi-studio.vercel.app'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleCopyLink('')}
          className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          {copiedLink === 'main' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink === 'main' ? 'Đã sao chép' : 'Sao chép'}</span>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Gmail đã được cấp quyền ({sharedList.length})</span>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="text-amber-700 hover:underline cursor-pointer"
          >
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <p className="p-5 text-center text-xs text-slate-500">Đang tải danh sách…</p>
        ) : sharedList.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs font-bold text-slate-600">Chưa có Gmail nào trong danh sách</p>
            <p className="text-[11px] text-slate-400 mt-1">Nhập email phía trên để cấp quyền sử dụng.</p>
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {sharedList.map((item) => (
              <div
                key={item.id || item.email}
                className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{item.email}</span>
                  <div className="text-[10px] text-slate-400">
                    Cấp bởi: {item.addedBy || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(item.email)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title={`Sao chép link đăng nhập cho ${item.email}`}
                  >
                    {copiedLink === item.email ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onRemoveGmail(item.email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Thu hồi quyền của ${item.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
