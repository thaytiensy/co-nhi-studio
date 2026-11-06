import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Check, 
  X, 
  Sparkles, 
  Laptop, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, installPrompt, isInstalled }) {
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installError, setInstallError] = useState('');
  const [installHelp, setInstallHelp] = useState('');
  const isWindowsDesktop = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent || '');

  useEffect(() => {
    if (isInstalled) setInstallSuccess(true);
  }, [isInstalled]);

  if (!isOpen) return null;

  // Xử lý cài đặt PWA bản địa (Chrome, Edge, Android)
  const handleNativeInstall = async () => {
    setInstallHelp('');
    if (installPrompt) {
      setInstallError('');
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => onClose(), 2000);
        }
      } catch {
        setInstallError('Trình duyệt chưa thể cài ứng dụng. Thầy/Cô có thể thử lại hoặc dùng hướng dẫn cài thủ công bên dưới.');
      }
    } else {
      if (isInstalled) {
        setInstallSuccess(true);
        return;
      }
      const userAgent = navigator.userAgent || '';
      const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isAppleMobile) {
        setInstallHelp('Trên iPhone/iPad, mở trang bằng Safari, chạm nút Chia sẻ rồi chọn “Thêm vào Màn hình chính”.');
      } else if (/Android/i.test(userAgent)) {
        setInstallHelp('Trên Android, mở menu Chrome/Edge (⋮), chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.');
      } else if (/Windows/i.test(userAgent)) {
        handleDownloadDesktopShortcut();
      } else {
        setInstallHelp('Trong Chrome/Edge, mở menu trình duyệt và chọn “Cài đặt ứng dụng” hoặc “Tạo lối tắt”.');
      }
    }
  };

  // Tạo và tải file Lối tắt Desktop (.url) cho Windows
  const handleDownloadDesktopShortcut = () => {
    const appUrl = window.location.origin || 'https://co-nhi-studio.vercel.app';
    const fileContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconIndex=0\r\nHotKey=0\r\nIDList=\r\n`;
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Co_Nhi_Studio_Mi_Thuat.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 text-white rounded-xl shadow-md backdrop-blur-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>Tải & Cài Đặt Cọ Nhí Studio</span>
                <span className="text-[10px] bg-white text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Bản Máy Tính & Điện Thoại
                </span>
              </h3>
              <p className="text-xs text-amber-100">
                Mở nhanh như một ứng dụng trên máy tính hoặc điện thoại
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung bên trong Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {installSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-md">
                ✓
              </div>
              <h4 className="text-lg font-black text-slate-800">Cài Đặt Thành Công!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Cọ Nhí Studio đã được thêm vào thiết bị. Thầy/Cô có thể mở ứng dụng từ màn hình chính hoặc danh sách ứng dụng.
              </p>
            </div>
          ) : (
            <>
              {/* Thông báo tải lối tắt */}
              {downloadNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã tải file lối tắt về máy! Thầy/Cô hãy kéo file ra màn hình Desktop để mở nhanh.</span>
                </div>
              )}
              {installError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs" role="alert">
                  {installError}
                </div>
              )}
              {installHelp && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs" role="status">
                  {installHelp}
                </div>
              )}

              {/* Thẻ Lợi ích nổi bật */}
              <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Ưu điểm khi cài đặt ứng dụng:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Mở độc lập toàn màn hình</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Bài giảng lưu cục bộ; đăng nhập bắt buộc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Không có thanh địa chỉ vướng víu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Tự động cập nhật tính năng mới</span>
                  </div>
                </div>
              </div>

              {/* 2 Lựa chọn Cài Đặt */}
              <div className="space-y-2.5 pt-1">
                {/* Lựa chọn 1: Cài đặt trực tiếp (PWA) */}
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md shadow-amber-200 flex items-center justify-between text-left transition-all transform active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shrink-0">
                      💻
                    </div>
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-1.5">
                        <span>{installPrompt ? 'Cài Đặt App Trực Tiếp (Khuyên Dùng)' : isWindowsDesktop ? 'Tải Lối Tắt Desktop' : 'Hướng Dẫn Cài Đặt Theo Thiết Bị'}</span>
                        <span className="text-[9px] bg-white text-amber-900 px-2 py-0.5 rounded-full font-black">
                          {installPrompt ? '1 Chạm' : isWindowsDesktop ? '.url' : 'Hướng dẫn'}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-100">
                        {installPrompt
                          ? 'Bấm để thêm ứng dụng vào thiết bị này'
                          : isWindowsDesktop ? 'Tải lối tắt để mở nhanh từ Desktop' : 'Xem hướng dẫn cài phù hợp với thiết bị'}
                      </p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Tệp Internet Shortcut chỉ dùng trên Windows */}
                {isWindowsDesktop && (
                <button
                  type="button"
                  onClick={handleDownloadDesktopShortcut}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-300 text-slate-800 rounded-xl flex items-center justify-between text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
                      🚀
                    </div>
                    <div>
                      <div className="font-extrabold text-xs md:text-sm text-slate-800">
                        Tải Phím Tắt Mở App Trên Desktop (.url)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Dành cho mọi loại máy tính Windows: Tải về và nhấp đúp là mở ngay
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </button>
                )}
              </div>

              {/* Hướng dẫn thao tác thủ công trên các trình duyệt */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Hướng dẫn cài đặt theo thiết bị:
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p>
                    • <strong>Windows, macOS, Linux:</strong> Trong Chrome/Edge, mở menu trình duyệt hoặc chọn biểu tượng cài đặt ở thanh địa chỉ nếu có.
                  </p>
                  <p>
                    • <strong>Android:</strong> Trong menu Chrome/Edge, chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
                  </p>
                  <p>
                    • <strong>iPhone/iPad:</strong> Mở trang bằng Safari, chạm <em>Chia sẻ</em>, rồi chọn <strong>"Thêm vào Màn hình chính"</strong>.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Cọ Nhí Studio • Phiên bản 1.0 Chuẩn GDPT 2018
          </span>
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
  );
}
