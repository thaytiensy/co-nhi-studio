import React from 'react';
import {
  Presentation,
  Brush,
  Gamepad2,
  Camera,
  ClipboardCheck
} from 'lucide-react';

export default function BottomNavBar({ activeTab, setActiveTab }) {
  const navTabs = [
    { id: 'editor', name: 'Soạn Slide', icon: Presentation },
    { id: 'drawing', name: 'Bảng Vẽ', icon: Brush },
    { id: 'games', name: 'Trò Chơi', icon: Gamepad2 },
    { id: 'camera', name: 'Chấm Tranh', icon: Camera },
    { id: 'evaluation', name: 'Sổ SMAS', icon: ClipboardCheck }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
              isActive
                ? 'text-amber-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[54px]">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
