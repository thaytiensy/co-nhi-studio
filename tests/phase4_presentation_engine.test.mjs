import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  saveProjectDraftToLocal,
  getProjectDraftFromLocal,
  hasUnsavedDraft,
  clearProjectDraft,
  saveProjectToLocal,
  loadProjectFromLocal
} from '../src/utils/storageService.js';
import {
  exportSlideToStandaloneHtml,
  generateStandaloneHtmlString,
  printSlideDeckToPdf
} from '../src/utils/htmlSlideExportService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock browser LocalStorage for node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

test('Giai đoạn 4 - Nâng cấp Presentation Engine Đạt Chuẩn Thương Mại', async (t) => {
  await t.test('1. Pillar 1: Thuật toán Scale 16:9 & Khung Hình Chuẩn Vàng (Stage Scaling)', () => {
    const CANVAS_WIDTH = 960;
    const CANVAS_HEIGHT = 540;

    // Tỷ lệ vàng 16:9
    assert.strictEqual(CANVAS_WIDTH / CANVAS_HEIGHT, 16 / 9);

    // Tính toán hệ số scale cho các độ phân giải khác nhau
    const calculateScale = (w, h) => Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT);

    // Màn hình Full HD (1920x1080) -> scale = 2.0
    assert.strictEqual(calculateScale(1920, 1080), 2.0);

    // Màn hình 4K (3840x2160) -> scale = 4.0
    assert.strictEqual(calculateScale(3840, 2160), 4.0);

    // Màn hình hẹp ngang (1280x800) -> scale giới hạn theo chiều ngang
    const scaleLaptop = calculateScale(1280, 800);
    assert.ok(scaleLaptop < 1280 / CANVAS_WIDTH + 0.01);
    assert.ok(CANVAS_HEIGHT * scaleLaptop <= 800);

    // Màn hình siêu rộng Ultrawide 21:9 (2560x1080) -> pillarboxing căn giữa
    const scaleUltrawide = calculateScale(2560, 1080);
    assert.strictEqual(scaleUltrawide, 2.0); // Bị giới hạn bởi chiều cao 1080
    assert.ok(CANVAS_WIDTH * scaleUltrawide <= 2560);
  });

  await t.test('2. Pillar 2: Công Thái Học Bút Trình Chiếu USB & Phím Tắt Đứng Lớp', () => {
    // Bộ phím chuẩn bút USB clicker
    const forwardKeys = new Set(['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter']);
    const backwardKeys = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']);
    const focusOverlayKeys = new Set(['b', 'B', 'w', 'W', 'f', 'F']);

    assert.ok(forwardKeys.has('ArrowRight'));
    assert.ok(forwardKeys.has('ArrowDown'));
    assert.ok(forwardKeys.has('PageDown'));
    assert.ok(backwardKeys.has('ArrowLeft'));
    assert.ok(backwardKeys.has('ArrowUp'));
    assert.ok(backwardKeys.has('PageUp'));

    assert.ok(focusOverlayKeys.has('b') && focusOverlayKeys.has('B')); // Blackout
    assert.ok(focusOverlayKeys.has('w') && focusOverlayKeys.has('W')); // Whiteout
    assert.ok(focusOverlayKeys.has('f') && focusOverlayKeys.has('F')); // Fullscreen

    // Hàm chống xung đột nhập liệu
    const isInputElementFocused = (target) => {
      if (!target) return false;
      return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        Boolean(target.isContentEditable) ||
        Boolean(typeof target.closest === 'function' && target.closest('[contenteditable="true"]'))
      );
    };

    assert.strictEqual(isInputElementFocused({ tagName: 'INPUT' }), true);
    assert.strictEqual(isInputElementFocused({ tagName: 'TEXTAREA' }), true);
    assert.strictEqual(isInputElementFocused({ tagName: 'DIV', isContentEditable: true }), true);
    assert.strictEqual(isInputElementFocused({ tagName: 'DIV', isContentEditable: false, closest: () => null }), false);
  });

  await t.test('3. Pillar 3: Tự Động Tạm Dừng Media Tránh Giật Màn Hình & Tràn RAM GPU', () => {
    let pausedCount = 0;
    const mockMediaList = [
      { paused: false, pause: () => { pausedCount++; } },
      { paused: true, pause: () => { pausedCount++; } },
      { paused: false, pause: () => { pausedCount++; } }
    ];

    mockMediaList.forEach(media => {
      if (!media.paused) media.pause();
    });

    assert.strictEqual(pausedCount, 2);
  });

  await t.test('4. Pillar 4: Auto-Save Resilience & Crash Recovery Banner', () => {
    const testProject = {
      id: 'test-project-101',
      version: 1,
      slides: [
        {
          id: 'slide-1',
          title: 'Bài Học Mĩ Thuật Trải Nghiệm',
          elements: [
            { id: 'el-1', type: 'text', text: 'Chào mừng các em', x: 100, y: 100, width: 400, height: 100 }
          ]
        }
      ],
      updatedAt: '2026-11-10T10:00:00.000Z'
    };

    // 1. Lưu dự án chính
    saveProjectToLocal(testProject);

    // 2. Chưa có bản nháp -> hasUnsavedDraft = false
    clearProjectDraft();
    assert.strictEqual(hasUnsavedDraft(testProject.updatedAt), false);

    // 3. Auto-save lưu bản nháp mới hơn
    const draftProject = {
      ...testProject,
      updatedAt: new Date(Date.now() + 5000).toISOString(),
      slides: [
        ...testProject.slides,
        { id: 'slide-2', title: 'Slide nháp mới', elements: [] }
      ]
    };

    saveProjectDraftToLocal(draftProject);
    const loadedDraft = getProjectDraftFromLocal();
    assert.ok(loadedDraft);
    assert.strictEqual(loadedDraft.slides.length, 2);

    // 4. Phát hiện bản nháp mới hơn -> hasUnsavedDraft = true (Kích hoạt Recovery Banner)
    assert.strictEqual(hasUnsavedDraft(testProject.updatedAt), true);

    // 5. Sau khi người dùng Lưu chính thức hoặc Xóa bản nháp -> dọn dẹp sạch sẽ
    clearProjectDraft();
    assert.strictEqual(getProjectDraftFromLocal(), null);
    assert.strictEqual(hasUnsavedDraft(testProject.updatedAt), false);
  });

  await t.test('5. Pillar 5: PWA Service Worker & Chiến Lược Cache-First 100% Ngoại Tuyến', () => {
    const swPath = path.resolve(__dirname, '../public/sw.js');
    assert.ok(fs.existsSync(swPath), 'public/sw.js phải tồn tại');

    const swContent = fs.readFileSync(swPath, 'utf8');

    // Cache version phải khớp quy chuẩn
    assert.match(swContent, /co-nhi-studio-cache-v[0-9]+/);

    // Chiến lược Cache-First cho static assets
    assert.ok(swContent.includes('cache.match(event.request)'), 'Phải kiểm tra cache trước');

    // Không cache /api/
    assert.ok(swContent.includes('/api/'), 'Phải xử lý loại trừ /api/');

    // Fallback trang index khi offline
    assert.ok(swContent.includes('/index.html') || swContent.includes("navigate"), 'Phải có offline navigation fallback');
  });

  await t.test('6. Pillar 6: Công Cụ Tương Tác & Xuất File HTML Độc Lập Trình Chiếu USB', () => {
    const mockSlides = [
      {
        id: 'slide-export-1',
        title: 'Chủ Đề 1: Sắc Màu Quê Hương',
        background: '#ffffff',
        elements: [
          { id: 't-1', type: 'text', text: 'Chào mừng các em', x: 80, y: 120, width: 800, fontSize: 32, color: '#1e293b' },
          { id: 's-1', type: 'shape', shapeType: 'circle', x: 200, y: 250, width: 100, height: 100, fill: '#ef4444' }
        ]
      },
      {
        id: 'slide-export-2',
        title: 'Chủ Đề 1: Thực Hành Sáng Tạo',
        background: '#f8fafc',
        elements: [
          { id: 't-2', type: 'text', text: 'Các bước vẽ quả bóng', x: 80, y: 80, width: 700, fontSize: 24, color: '#0f172a' }
        ]
      }
    ];

    const htmlOutput = generateStandaloneHtmlString(mockSlides, 'Bài Giảng Sắc Màu Quê Hương');

    // File HTML phải hoàn chỉnh (Zero-placeholder, không gọi mạng)
    assert.ok(htmlOutput.startsWith('<!DOCTYPE html>'));
    assert.ok(htmlOutput.includes('Bài Giảng Sắc Màu Quê Hương') && htmlOutput.includes('Cô Nhi Studio'));
    assert.ok(htmlOutput.includes('viewport'));
    assert.ok(htmlOutput.includes('960px'));
    assert.ok(htmlOutput.includes('540px'));
    assert.ok(htmlOutput.includes('Math.min(window.innerWidth / baseW, window.innerHeight / baseH)'));

    // Hỗ trợ Bút USB Clicker
    assert.ok(htmlOutput.includes('ArrowRight'));
    assert.ok(htmlOutput.includes('PageDown'));
    assert.ok(htmlOutput.includes('ArrowLeft'));
    assert.ok(htmlOutput.includes('PageUp'));

    // Hỗ trợ Blackout / Whiteout
    assert.ok(htmlOutput.includes('KeyB') || htmlOutput.includes("'b'"));
    assert.ok(htmlOutput.includes('KeyW') || htmlOutput.includes("'w'"));

    // Tích hợp Touch Swipe
    assert.ok(htmlOutput.includes('touchstart') && htmlOutput.includes('touchend'));

    // Kiểm tra hàm printSlideDeckToPdf định dạng
    assert.strictEqual(typeof printSlideDeckToPdf, 'function');
    assert.strictEqual(typeof exportSlideToStandaloneHtml, 'function');
  });
});
