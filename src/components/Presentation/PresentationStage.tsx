"use client";

import React, { useRef } from 'react';
import { useStageScale } from '../../hooks/useStageScale.ts';
import type { Slide } from '../../types/presentation.ts';

export interface PresentationStageProps {
  slide: Slide | null;
  baseWidth?: number;
  baseHeight?: number;
  isBlackout?: boolean;
  isWhiteout?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const PresentationStage: React.FC<PresentationStageProps> = ({
  slide,
  baseWidth = 1920,
  baseHeight = 1080,
  isBlackout = false,
  isWhiteout = false,
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, offsetX, offsetY } = useStageScale(containerRef, baseWidth, baseHeight);

  if (isBlackout) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-black flex items-center justify-center select-none"
        data-testid="blackout-screen"
      >
        <span className="text-neutral-700 text-xs font-mono">Bấm phím bất kỳ để tiếp tục</span>
      </div>
    );
  }

  if (isWhiteout) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-white flex items-center justify-center select-none"
        data-testid="whiteout-screen"
      >
        <span className="text-neutral-300 text-xs font-mono">Bấm phím bất kỳ để tiếp tục</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-neutral-950 overflow-hidden flex items-center justify-center select-none ${className}`}
    >
      {/* 16:9 Scaled Canvas Frame */}
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          position: 'absolute',
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'subpixel-antialiased',
          willChange: 'transform'
        }}
        className="shadow-2xl overflow-hidden rounded-xs"
      >
        {/* Slide Content Layer */}
        <div
          className="w-full h-full relative"
          style={{
            backgroundColor: slide?.background || '#ffffff'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PresentationStage;
