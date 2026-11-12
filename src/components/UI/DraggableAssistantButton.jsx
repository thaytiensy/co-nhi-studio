import React, { useState, useEffect, useRef, useCallback } from 'react';
import TeacherAssistantPillButton from './TeacherAssistantPillButton';

const STORAGE_X = 'conhi_assistant_pos_x';
const STORAGE_Y = 'conhi_assistant_pos_y';
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 56;

export default function DraggableAssistantButton({ onClick }) {
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, moved: false });
  const buttonRef = useRef(null);

  // Khởi tạo tọa độ: Lấy từ LocalStorage hoặc mặc định góc dưới bên phải
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
        y: clampY(window.innerHeight - BUTTON_HEIGHT - 24)
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

  // Xử lý kéo thả bằng Chuột
  const handleMouseDown = (e) => {
    // Chỉ kích hoạt chuột trái
    if (e.button !== 0) return;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
      moved: false
    };
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragStartRef.current.moved = true;
      }
      const clampX = Math.max(16, Math.min(window.innerWidth - BUTTON_WIDTH - 16, dragStartRef.current.initialPosX + dx));
      const clampY = Math.max(16, Math.min(window.innerHeight - BUTTON_HEIGHT - 16, dragStartRef.current.initialPosY + dy));
      setPos({ x: clampX, y: clampY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setPos((current) => {
        try {
          localStorage.setItem(STORAGE_X, String(Math.round(current.x)));
          localStorage.setItem(STORAGE_Y, String(Math.round(current.y)));
        } catch (_) {}
        return current;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Xử lý kéo thả bằng Cảm ứng (Touch)
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
      moved: false
    };
    setIsDragging(true);

    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dx = t.clientX - dragStartRef.current.startX;
      const dy = t.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragStartRef.current.moved = true;
      }
      const clampX = Math.max(16, Math.min(window.innerWidth - BUTTON_WIDTH - 16, dragStartRef.current.initialPosX + dx));
      const clampY = Math.max(16, Math.min(window.innerHeight - BUTTON_HEIGHT - 16, dragStartRef.current.initialPosY + dy));
      setPos({ x: clampX, y: clampY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      setPos((current) => {
        try {
          localStorage.setItem(STORAGE_X, String(Math.round(current.x)));
          localStorage.setItem(STORAGE_Y, String(Math.round(current.y)));
        } catch (_) {}
        return current;
      });
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleClick = (e) => {
    // Nếu vừa kéo thả di chuyển thì không mở modal
    if (dragStartRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  if (pos.x === -1) return null;

  return (
    <div
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 50,
        touchAction: 'none'
      }}
      className={`transition-shadow select-none ${
        isDragging ? 'cursor-grabbing opacity-90 scale-105' : 'cursor-grab'
      }`}
      title="Giữ chuột hoặc ngón tay để kéo thả di chuyển vị trí nút này trên màn hình"
    >
      <TeacherAssistantPillButton
        onClick={handleClick}
        className={isDragging ? 'pointer-events-none' : ''}
      />
    </div>
  );
}
