/**
 * Script Kiểm Tra Trực Quan & Khung Hình Đa Thiết Bị (Visual Responsive Check)
 * Kiểm định tỷ lệ vàng 16:9 trên Desktop, Mobile, Tablet và TV/Máy chiếu
 */

export interface ViewportSpec {
  name: string;
  width: number;
  height: number;
  expectedOrientation: 'landscape' | 'portrait';
}

export interface ScaleVerificationResult {
  viewport: string;
  width: number;
  height: number;
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  isLetterboxed: boolean;
  isPillarboxed: boolean;
  aspectRatio: number;
  passed: boolean;
}

export const TARGET_VIEWPORTS: ViewportSpec[] = [
  { name: 'Desktop Full HD (Máy chiếu/TV)', width: 1920, height: 1080, expectedOrientation: 'landscape' },
  { name: 'Laptop Chuẩn', width: 1440, height: 900, expectedOrientation: 'landscape' },
  { name: 'Màn hình tương tác / Bảng thông minh (4:3)', width: 1024, height: 768, expectedOrientation: 'landscape' },
  { name: 'Tablet iPad Dọc', width: 768, height: 1024, expectedOrientation: 'portrait' },
  { name: 'Điện thoại thông minh (iPhone)', width: 375, height: 667, expectedOrientation: 'portrait' },
];

export function calculateStageScale(
  viewportWidth: number,
  viewportHeight: number,
  baseWidth: number = 1920,
  baseHeight: number = 1080
): ScaleVerificationResult {
  const scale = Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
  const renderedWidth = Math.round(baseWidth * scale);
  const renderedHeight = Math.round(baseHeight * scale);
  const aspectRatio = Number((renderedWidth / renderedHeight).toFixed(4));
  const expectedRatio = Number((baseWidth / baseHeight).toFixed(4)); // 1.7778

  const isLetterboxed = renderedHeight < viewportHeight;
  const isPillarboxed = renderedWidth < viewportWidth;
  const passed = Math.abs(aspectRatio - expectedRatio) < 0.01 && scale > 0;

  return {
    viewport: `${viewportWidth}x${viewportHeight}`,
    width: viewportWidth,
    height: viewportHeight,
    scale,
    renderedWidth,
    renderedHeight,
    isLetterboxed,
    isPillarboxed,
    aspectRatio,
    passed,
  };
}

export function runAllViewportChecks(): ScaleVerificationResult[] {
  console.log('=== BẮT ĐẦU KIỂM TRA KHUNG HÌNH TRÌNH CHIẾU 16:9 ===\n');
  const results = TARGET_VIEWPORTS.map((vp) => {
    const res = calculateStageScale(vp.width, vp.height);
    const status = res.passed ? '✓ ĐẠT' : '✗ LỖI';
    console.log(
      `[${status}] ${vp.name} (${vp.width}x${vp.height}): Scale=${res.scale.toFixed(3)}, Render=${res.renderedWidth}x${res.renderedHeight}, Tỷ lệ=${res.aspectRatio}`
    );
    return res;
  });

  const allPassed = results.every((r) => r.passed);
  console.log(`\nKết quả: ${allPassed ? 'TẤT CẢ KHUNG HÌNH ĐẠT TIÊU CHUẨN 16:9' : 'CÓ KHUNG HÌNH KHÔNG ĐẠT'}`);
  return results;
}

// Chạy trực tiếp nếu thực thi qua node/tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('visual-check')) {
  runAllViewportChecks();
}
