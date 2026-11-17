import React, { useState, useEffect, useRef } from 'react';
import TeacherAssistantPillButton from './TeacherAssistantPillButton';

const STORAGE_X = 'conhi_assistant_pos_x';
const STORAGE_Y = 'conhi_assistant_pos_y';
const BUTTON_WIDTH = 220;
const BUTTON_HEIGHT = 56;

export default function DraggableAssistantButton({ onClick, onDismiss }) {
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, moved: false, pointerId: null });
  const buttonRef = useRef(null);

  // Khởi tạo tọa độ: Lấy từ LocalStorage hoặc mặc định góc dưới bên phải (cách đáy 96px để không che thanh công cụ)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clampX = (x) => Math.max(16, Math.min(window.innerWidth - BUTTON_WIDTH - 16, x));
    const clampY = (y) => Math.max(16, Math.min(window.innerHeight - BUTTON_HEIGHT - 16, y));

    const savedX = localStorage.getItem(STORAGE_X);
    const savedY = localStorage.getItem(STORAGE_Y);

    if (savedX !== null && savedY !== null) {
      setPos({ x: clampX(Number(savedX)), y: clampY(Number(savedY)) });
    } else {
      setPos({
        x: clampX(window.innerWidth - BUTTON_WIDTH - 24),
        y: clampY(window.innerHeight - BUTTON_HEIGHT - 96)
      });
    }

    const handleResize = () => {
      setPos((prev) => {
        if (prev.x === -1) return prev;
        return { x: clampX(prev.x), y: clampY(prev.y) };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Xử lý kéo thả bằng Pointer Events chuẩn W3C (hỗ trợ chuột, cảm ứng, bút mượt mà)
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target && e.target.closest && e.target.closest('[data-dismiss="true"]')) return;

    const el = buttonRef.current;
    if (el) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
      moved: false,
      pointerId: e.pointerId
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.moved = true;
    }
    const clampX = Math.max(16, Math.min(window.innerWidth - BUTTON_WIDTH - 16, dragStartRef.current.initialPosX + dx));
    const clampY = Math.max(16, Math.min(window.innerHeight - BUTTON_HEIGHT - 16, dragStartRef.current.initialPosY + dy));
    setPos({ x: clampX, y: clampY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const el = buttonRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    setPos((current) => {
      try {
        localStorage.setItem(STORAGE_X, String(Math.round(current.x)));
        localStorage.setItem(STORAGE_Y, String(Math.round(current.y)));
      } catch (_) {}
      return current;
    });

    // Nếu không kéo di chuyển (chỉ bấm nhẹ) -> Mở trợ giảng AI
    if (!dragStartRef.current.moved) {
      onClick?.();
    }
  };

  const handlePointerCancel = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const el = buttonRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  if (pos.x === -1) return null;

  return (
    <div
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 50,
        touchAction: 'none'
      }}
      className={`transition-shadow select-none ${
        isDragging ? 'cursor-grabbing opacity-90 scale-105 shadow-2xl' : 'cursor-grab'
      }`}
      title="Giữ chuột hoặc ngón tay để kéo thả di chuyển vị trí nút này trên màn hình"
    >
      <TeacherAssistantPillButton
        onClick={() => {}}
        onDismiss={onDismiss}
      />
    </div>
  );
}
