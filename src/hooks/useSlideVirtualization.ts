"use client";

import { useMemo, useCallback, useEffect, type RefObject } from 'react';

export interface UseSlideVirtualizationProps {
  currentIndex: number;
  totalSlides: number;
  windowSize?: number; // số slide liền kề cần giữ trong DOM (mặc định: 1 nghĩa là N-1, N, N+1)
  containerRef?: RefObject<HTMLElement | null>;
}

export interface UseSlideVirtualizationReturn {
  visibleIndices: number[];
  isSlideVisible: (index: number) => boolean;
  pauseActiveMedia: () => void;
}

/**
 * Hook quản lý Virtualization cho cây DOM trình chiếu và vòng đời âm thanh/video
 * Chỉ duy trì slide hiện tại (N) và 2 slide liền kề (N-1, N+1) để giải phóng RAM GPU
 */
export function useSlideVirtualization({
  currentIndex,
  totalSlides,
  windowSize = 1,
  containerRef,
}: UseSlideVirtualizationProps): UseSlideVirtualizationReturn {
  // Tính toán dải slide được phép render trong DOM
  const visibleIndices = useMemo(() => {
    if (totalSlides <= 0) return [];
    const min = Math.max(0, currentIndex - windowSize);
    const max = Math.min(totalSlides - 1, currentIndex + windowSize);

    const indices: number[] = [];
    for (let i = min; i <= max; i++) {
      indices.push(i);
    }
    return indices;
  }, [currentIndex, totalSlides, windowSize]);

  const isSlideVisible = useCallback(
    (index: number): boolean => {
      return visibleIndices.includes(index);
    },
    [visibleIndices]
  );

  // Tự động tạm dừng toàn bộ Video/Audio khi chuyển slide để tránh âm thanh phát ngầm
  const pauseActiveMedia = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = containerRef?.current || document;
    const mediaElements = root.querySelectorAll<HTMLMediaElement>('video, audio');

    mediaElements.forEach((media) => {
      try {
        if (!media.paused) {
          media.pause();
        }
      } catch {
        // Bỏ qua lỗi trình duyệt nếu media không được phép can thiệp
      }
    });
  }, [containerRef]);

  // Kích hoạt tạm dừng media mỗi khi chỉ số slide hiện tại thay đổi
  useEffect(() => {
    pauseActiveMedia();
  }, [currentIndex, pauseActiveMedia]);

  return {
    visibleIndices,
    isSlideVisible,
    pauseActiveMedia,
  };
}
