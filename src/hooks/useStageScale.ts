"use client";

import { useState, useEffect, useCallback, RefObject } from 'react';

export interface StageDimensions {
  baseWidth: number;
  baseHeight: number;
  containerWidth: number;
  containerHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function useStageScale(
  containerRef: RefObject<HTMLElement | null>,
  baseWidth: number = 1920,
  baseHeight: number = 1080
): StageDimensions {
  const [dimensions, setDimensions] = useState<StageDimensions>({
    baseWidth,
    baseHeight,
    containerWidth: baseWidth,
    containerHeight: baseHeight,
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });

  const updateScale = useCallback(() => {
    if (!containerRef.current && typeof window === 'undefined') return;

    const el = containerRef.current;
    const containerWidth = el ? el.clientWidth : window.innerWidth;
    const containerHeight = el ? el.clientHeight : window.innerHeight;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Tỷ lệ vàng 16:9 cố định - Letterboxing & Pillarboxing tuyệt đối
    const scale = Math.min(containerWidth / baseWidth, containerHeight / baseHeight);
    const scaledWidth = baseWidth * scale;
    const scaledHeight = baseHeight * scale;

    const offsetX = Math.max(0, (containerWidth - scaledWidth) / 2);
    const offsetY = Math.max(0, (containerHeight - scaledHeight) / 2);

    setDimensions({
      baseWidth,
      baseHeight,
      containerWidth,
      containerHeight,
      scale: Math.max(0.1, scale),
      offsetX,
      offsetY
    });
  }, [containerRef, baseWidth, baseHeight]);

  useEffect(() => {
    updateScale();

    const element = containerRef.current;
    if (typeof ResizeObserver !== 'undefined' && element) {
      const observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale, containerRef]);

  return dimensions;
}
