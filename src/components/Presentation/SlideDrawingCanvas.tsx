"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DrawingToolMode, DrawingPoint, DrawingStroke } from '../../types/presentation.ts';

export interface SlideDrawingCanvasProps {
  slideId: string;
  activeTool: DrawingToolMode;
  scale?: number;
  penColor?: string;
  penWidth?: number;
  width?: number;
  height?: number;
  onClearTrigger?: number;
}

export const SlideDrawingCanvas: React.FC<SlideDrawingCanvasProps> = ({
  slideId,
  activeTool,
  scale = 1,
  penColor = '#dc2626',
  penWidth = 4,
  width = 1920,
  height = 1080,
  onClearTrigger = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokesBySlide, setStrokesBySlide] = useState<Record<string, DrawingStroke[]>>({});
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[] | null>(null);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Xóa nét vẽ trang hiện tại khi có trigger
  useEffect(() => {
    if (onClearTrigger > 0) {
      setStrokesBySlide(prev => ({ ...prev, [slideId]: [] }));
    }
  }, [onClearTrigger, slideId]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    const strokes = strokesBySlide[slideId] || [];

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = stroke.opacity;

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Vẽ nét đang vẽ dở
    if (currentStroke && currentStroke.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = activeTool === 'highlighter' ? 24 : penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = activeTool === 'highlighter' ? 0.4 : 1.0;

      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }, [strokesBySlide, slideId, currentStroke, activeTool, penColor, penWidth, width, height]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select' || activeTool === 'laser') return;
    const pt = getCanvasCoords(e);
    setCurrentStroke([pt]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    if (activeTool === 'laser') {
      setLaserPos(pt);
      return;
    }
    if (!currentStroke) return;
    setCurrentStroke(prev => (prev ? [...prev, pt] : [pt]));
  };

  const handleMouseUp = () => {
    if (!currentStroke || currentStroke.length < 2) {
      setCurrentStroke(null);
      return;
    }

    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}`,
      slideId,
      tool: activeTool,
      color: penColor,
      width: activeTool === 'highlighter' ? 24 : penWidth,
      opacity: activeTool === 'highlighter' ? 0.4 : 1.0,
      points: currentStroke,
      createdAt: Date.now()
    };

    setStrokesBySlide(prev => ({
      ...prev,
      [slideId]: [...(prev[slideId] || []), newStroke]
    }));
    setCurrentStroke(null);
  };

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setLaserPos(null);
        }}
        className={`w-full h-full ${
          activeTool === 'laser'
            ? 'cursor-none'
            : activeTool === 'pen' || activeTool === 'highlighter'
            ? 'cursor-crosshair'
            : 'pointer-events-none'
        }`}
      />

      {/* Laser Pointer Vệt Sáng Đỏ Đuổi Theo Chuột */}
      {activeTool === 'laser' && laserPos && (
        <div
          style={{
            left: `${laserPos.x * scale}px`,
            top: `${laserPos.y * scale}px`,
            transform: 'translate(-50%, -50%)'
          }}
          className="pointer-events-none absolute w-5 h-5 rounded-full bg-red-500/80 shadow-[0_0_15px_#ef4444] animate-ping"
        />
      )}
    </div>
  );
};

export default SlideDrawingCanvas;
