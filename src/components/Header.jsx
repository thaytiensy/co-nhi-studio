import React, { useState } from 'react';
import { 
  Play,
  Share2, 
  Save, 
  Download, 
  Upload, 
  Palette, 
  Brush, 
  Gamepad2, 
  Camera, 
  ClipboardCheck, 
  Presentation,
  Check,
  FileCode2,
  Sparkles,
  FilePlus,
  RotateCcw,
  Film,
  Lock,
  Unlock,
  Mail,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { exportProjectFile } from '../utils/storageService';

export default function Header({ 
  projectTitle, 
  setProjectTitle, 
  activeTab, 
  setActiveTab, 
  onSave, 
  isSaved,
  onStartPresentation,
  projectData,
  onImportProject,
  onExportPPTX,
  onUploadPPTX,
  onNewProject,
  onOpenVideoGuide,
  onOpenAdminModal,
  onOpenInstallModal,
  userSession,
  onLogout
}) {
  const [showFileMenu, setShowFileMenu] = useState(false);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImportProject(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 select-none shadow-sm">
      {/* Top bar: Logo, Project Name, Status, Presentation CTA */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-200 text-white font-black text-xl">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">Cọ Nhí Studio</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Mĩ Thuật Tiểu Học
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dữ liệu lưu cục bộ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Phần mềm soạn giảng & trình chiếu mĩ thuật chuyên biệt cho Thầy/Cô</p>
          </div>
        </div>

        {/* Project Title Input */}
        <div className="flex-1 max-w-md hidden md:block">
          <input 
            type="text" 
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Nhập tên bài giảng..."
            className="w-full px-3 py-1.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            title="Bấm để đổi tên bài giảng"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Video Hướng Dẫn (7 Phút) Button */}
          {/* Nút Tải & Cài Đặt App Như Bình Thường (PWA & Desktop Shortcut) */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-3.5 py-1.5 text-xs font-black text-emerald-950 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 hover:from-emerald-400 hover:to-teal-400 border border-emerald-400 rounded-xl flex items-center gap-1.5 transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-95 cursor-pointer ring-2 ring-emerald-300/40"
              title="Tải & Cài đặt Cọ Nhí Studio như ứng dụng bình thường trên máy tính hoặc điện thoại"
            >
              <Download className="w-4 h-4 text-emerald-900" />
              <span>Tải & Cài Đặt App</span>
            </button>
          )}

          {/* Hiển thị không gian làm việc riêng biệt của từng tài khoản */}
          {userSession?.role === 'super_admin' ? (
            /* Super Admin 1 */
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs font-black shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-rose-600 font-extrabold uppercase tracking-wider">Không gian Super Admin</span>
                <span className="truncate max-w-[190px]" title={userSession.email}>
                  {userSession.email}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Đăng xuất không gian quản trị"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : userSession?.role === 'sub_admin' ? (
            /* Admin 2, Admin 3 (do Admin 1 cấp) */
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-xl text-xs font-black shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider">Không gian Admin</span>
                <span className="truncate max-w-[190px]" title={userSession.email}>
                  {userSession.email}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Đăng xuất quyền Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : userSession?.email ? (
            /* Giáo viên đăng nhập: Không gian riêng biệt độc lập */
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-xs font-semibold shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {userSession.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider">Không gian riêng</span>
                <span className="truncate max-w-[190px] font-bold" title={userSession.email}>
                  {userSession.email}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Đăng xuất không gian cá nhân"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : null}
          {onOpenVideoGuide && (
            <button
              onClick={onOpenVideoGuide}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-lg flex items-center gap-1.5 transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-95"
              title="Xem video giới thiệu & hướng dẫn sử dụng Cọ Nhí Studio (6 phút)"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Video Hướng Dẫn (6p)</span>
              <span className="md:hidden">Video 6p</span>
            </button>
          )}

          {/* Tải giáo án PowerPoint lên Button */}
          <button
            onClick={onUploadPPTX}
            className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
            title="Tải giáo án PowerPoint (.pptx) từ máy tính để xem trước và tiếp tục chỉnh sửa"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Tải giáo án PowerPoint lên</span>
            <span className="sm:hidden">Tải PPTX</span>
          </button>

          {/* File Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
              title="Quản lý tệp dự án"
            >
              <FileCode2 className="w-4 h-4 text-slate-500" />
              <span>Tệp Bài Giảng</span>
            </button>

            {showFileMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowFileMenu(false)}
              >
                {onNewProject && (
                  <button
                    onClick={onNewProject}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-b border-slate-100"
                  >
                    <FilePlus className="w-4 h-4 text-rose-600" />
                    <span>Tạo bài mới (Xóa trắng)</span>
                  </button>
                )}
                <button
                  onClick={() => exportProjectFile(projectData, `${projectTitle.replace(/\s+/g, '_')}.conhi`)}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Lưu tệp về máy (.conhi)</span>
                </button>
                <label className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Mở tệp từ máy (.conhi, .pptx)</span>
                  <input type="file" accept=".conhi,.json,.pptx" className="hidden" onChange={handleFileInput} />
                </label>
                <button
                  onClick={onUploadPPTX}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
                >
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <span>Tải giáo án PowerPoint (.pptx)</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={onExportPPTX}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                >
                  <Presentation className="w-4 h-4 text-emerald-600" />
                  <span>Xuất PowerPoint (.pptx)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Save */}
          <button
            onClick={onSave}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              isSaved 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
            }`}
            title="Lưu bài giảng vào trình duyệt (Ctrl+S)"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Đã lưu' : 'Lưu lại'}</span>
          </button>

          {/* Start Presentation (F5) */}
          <button
            onClick={onStartPresentation}
            className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all transform active:scale-95"
            title="Bắt đầu trình chiếu toàn màn hình (Phím F5)"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Trình Chiếu (F5)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
