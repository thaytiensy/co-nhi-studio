import React, { useState } from 'react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Palette, 
  Lightbulb, 
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
  Mail,
  ShieldCheck
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
  userSession
}) {
  const [showFileMenu, setShowFileMenu] = useState(false);

  const tabs = [
    { id: 'editor', name: 'Soạn Slide', icon: Presentation, color: 'text-amber-600' },
    { id: 'ideas', name: 'Xưởng Ý Tưởng', icon: Lightbulb, color: 'text-yellow-600' },
    { id: 'drawing', name: 'Bảng Vẽ Thị Phạm', icon: Brush, color: 'text-emerald-600' },
    { id: 'games', name: 'Trò Chơi Mĩ Thuật', icon: Gamepad2, color: 'text-indigo-600' },
    { id: 'camera', name: 'Cam Chấm Tranh', icon: Camera, color: 'text-rose-600' },
    { id: 'evaluation', name: 'Nhận xét theo TT27 • Xuất sang SMAS', icon: ClipboardCheck, color: 'text-purple-600' },
  ];

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
                100% Cục Bộ Offline
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

          {/* Nút Phân Quyền Quản Trị / Chia Sẻ (Hiển thị trực quan theo vai trò đã đăng nhập) */}
          {userSession?.role === 'sub_admin' ? (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ring-2 ring-emerald-300 animate-in fade-in"
              title="Thầy/Cô đang là Admin Phụ: Bấm để mở danh sách cấp quyền chia sẻ Gmail cho giáo viên khác"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-100" />
              <span>Admin Phụ (Chia Sẻ Gmail)</span>
            </button>
          ) : userSession?.role === 'super_admin' ? (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-200 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ring-2 ring-amber-300 animate-in fade-in"
              title="Thầy/Cô đang là Admin Chính: Toàn quyền quản trị hệ thống"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span>Admin Chính</span>
            </button>
          ) : (
            onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-all cursor-pointer"
                title="Khu vực quản trị hệ thống (Bảo mật)"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )
          )}
          {onOpenVideoGuide && (
            <button
              onClick={onOpenVideoGuide}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-lg flex items-center gap-1.5 transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-95"
              title="Xem video giới thiệu & hướng dẫn sử dụng Cọ Nhí Studio (7 phút)"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Video Hướng Dẫn (7p)</span>
              <span className="md:hidden">Video 7p</span>
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
                                {onOpenAdminModal && (
                  <button
                    onClick={onOpenAdminModal}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 border-b border-slate-100"
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Quản trị viên & Chia sẻ Gmail</span>
                  </button>
                )}
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
                  <span>Mở tệp từ máy (.conhi)</span>
                  <input type="file" accept=".conhi,.json" className="hidden" onChange={handleFileInput} />
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

      {/* Navigation Tabs */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto bg-slate-50/70 border-b border-slate-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-amber-500 text-amber-700 bg-white shadow-xs rounded-t-lg' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-lg'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-500'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
