import React, { useState, useEffect } from 'react';
import { PanelRight, ChevronUp } from 'lucide-react';
import PresentationVerticalToolbar from './PresentationVerticalToolbar';
import PresentationHorizontalToolbar from './PresentationHorizontalToolbar';

const STORAGE_KEY_ORIENTATION = 'conhi_presentation_toolbar_orientation';
const STORAGE_KEY_DOCKSIDE = 'conhi_presentation_toolbar_dockside';

export default function PresentationToolbar(props) {
  // Mặc định 'vertical' (dọc theo cạnh slide) để không bao giờ che chữ bài giảng
  const [orientation, setOrientation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_ORIENTATION) || 'vertical';
    }
    return 'vertical';
  });

  const [dockSide, setDockSide] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_DOCKSIDE) || 'right';
    }
    return 'right';
  });

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ORIENTATION, orientation);
    }
  }, [orientation]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DOCKSIDE, dockSide);
    }
  }, [dockSide]);

  const toggleOrientation = () => {
    setOrientation(prev => (prev === 'vertical' ? 'horizontal' : 'vertical'));
  };

  const toggleDockSide = () => {
    setDockSide(prev => (prev === 'right' ? 'left' : 'right'));
  };

  const handleCollapse = () => setCollapsed(true);
  const handleExpand = () => setCollapsed(false);

  // Nếu người dùng ẩn bằng controlsVisible thì ẩn
  if (!props.controlsVisible) {
    return null;
  }

  // Khi đang ở trạng thái thu gọn (Collapsed)
  if (collapsed) {
    if (orientation === 'vertical') {
      return (
        <button
          onClick={handleExpand}
          className={`fixed ${dockSide === 'left' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 z-40 bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-slate-700/80 rounded-full p-2.5 shadow-2xl flex flex-col items-center gap-1 transition-all cursor-pointer group`}
          title="Mở thanh công cụ trình chiếu (dọc slide)"
        >
          <span className="text-[10px] font-black text-slate-300">
            {props.currentIndex + 1}/{props.totalSlides}
          </span>
          <PanelRight className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </button>
      );
    }

    return (
      <button
        onClick={handleExpand}
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-slate-700/80 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2 transition-all cursor-pointer text-xs font-bold"
        title="Mở thanh điều khiển trình chiếu"
      >
        <span>Trình chiếu {props.currentIndex + 1}/{props.totalSlides}</span>
        <ChevronUp className="w-4 h-4 text-amber-400" />
      </button>
    );
  }

  if (orientation === 'vertical') {
    return (
      <PresentationVerticalToolbar
        {...props}
        dockSide={dockSide}
        onToggleDockSide={toggleDockSide}
        onToggleOrientation={toggleOrientation}
        onCollapse={handleCollapse}
      />
    );
  }

  return (
    <PresentationHorizontalToolbar
      {...props}
      onToggleOrientation={toggleOrientation}
      onCollapse={handleCollapse}
    />
  );
}
