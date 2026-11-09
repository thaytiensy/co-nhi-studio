import React, { useState } from 'react';
import {
  Presentation,
  Brush,
  Gamepad2,
  Camera,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Wifi,
  WifiOff,
  LogOut,
  ShieldCheck,
  Unlock,
  Sparkles
} from 'lucide-react';

export default function SmartSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenInstallModal,
  isAppInstalled,
  onOpenAdminModal,
  userSession,
  onLogout
}) {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    {
      id: 'editor',
      name: 'Soạn Slide',
      icon: Presentation,
      color: 'text-amber-600',
      activeBg: 'bg-amber-50 text-amber-900 border-amber-300 font-black'
    },
    {
      id: 'drawing',
      name: 'Bảng Vẽ Thị Phạm',
      icon: Brush,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black'
    },
    {
      id: 'games',
      name: 'Trò Chơi Mĩ Thuật',
      icon: Gamepad2,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-50 text-indigo-900 border-indigo-300 font-black'
    },
    {
      id: 'camera',
      name: 'Cam Chấm Tranh',
      icon: Camera,
      color: 'text-rose-600',
      activeBg: 'bg-rose-50 text-rose-900 border-rose-300 font-black'
    },
    {
      id: 'evaluation',
      name: 'Sổ Điểm SMAS',
      icon: ClipboardCheck,
      color: 'text-purple-600',
      activeBg: 'bg-purple-50 text-purple-900 border-purple-300 font-black',
      badge: 'TT27'
    }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 shadow-2xs select-none transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Sidebar Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-xs text-white font-black text-sm shrink-0">
              🎨
            </div>
            <div className="truncate">
              <span className="font-black text-xs text-slate-800 tracking-tight block truncate">Cọ Nhí Studio</span>
              <span className="text-[10px] font-bold text-amber-700 block truncate">TH Lê Quý Đôn</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? item.activeBg + ' shadow-2xs'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={item.name}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : 'text-slate-500'}`} />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status & Actions */}
      <div className="p-2 border-t border-slate-100 flex flex-col gap-1.5">
        {/* Trạng thái mạng */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
            isOnline
              ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200'
              : 'bg-rose-50/70 text-rose-800 border-rose-200'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isOnline ? 'Đang có kết nối Internet' : 'Đang ở chế độ Ngoại Tuyến (Offline PWA)'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          {!isCollapsed && <span>{isOnline ? 'Trực Tuyến' : 'Ngoại Tuyến'}</span>}
        </div>

        {/* Nút Cài đặt App PWA */}
        {onOpenInstallModal && !isAppInstalled && (
          <button
            onClick={onOpenInstallModal}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Cài đặt Cọ Nhí Studio lên máy tính"
          >
            <Download className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            {!isCollapsed && <span>Cài Đặt App</span>}
          </button>
        )}


        {/* Nút Đăng xuất */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Đăng xuất tài khoản"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Đăng Xuất</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
