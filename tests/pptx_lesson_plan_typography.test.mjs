import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildStandardSlidesForPlan } from '../src/utils/planSlideGenerator.ts';

const rootDir = process.cwd();

test('Kiểm định Quy chuẩn Typography Giáo Án PowerPoint (GA PP): Phông Times New Roman & Cỡ Chữ Nhỏ Nhất 14', async (t) => {
  await t.test('1. PlanPPTXImportModal sử dụng Times New Roman và cỡ chữ nhỏ nhất 14', () => {
    const filePath = path.join(rootDir, 'src/components/Dashboard/PlanPPTXImportModal.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Phông chữ Times New Roman
    assert.match(content, /Times New Roman/i, 'PlanPPTXImportModal phải thiết lập phông chữ Times New Roman');
    assert.match(content, /font-times-new-roman/i, 'PlanPPTXImportModal phải có class font-times-new-roman');

    // Không còn cỡ chữ siêu nhỏ (text-[9px], text-[10px], text-[11px], text-xs) trong nội dung
    assert.doesNotMatch(content, /text-\[9px\]/, 'Không được có text-[9px]');
    assert.doesNotMatch(content, /text-\[10px\]/, 'Không được có text-[10px]');
    assert.doesNotMatch(content, /text-\[11px\]/, 'Không được có text-[11px]');
    assert.doesNotMatch(content, /text-xs/, 'Không được có text-xs (12px)');
  });

  await t.test('2. PPTXPreviewModal và các subcomponent sử dụng Times New Roman và cỡ chữ nhỏ nhất 14', () => {
    const modalPath = path.join(rootDir, 'src/components/SlideEditor/PPTXPreviewModal.jsx');
    const canvasPath = path.join(rootDir, 'src/components/SlideEditor/pptxPreview/PPTXPreviewSlideCanvas.jsx');
    const sidebarPath = path.join(rootDir, 'src/components/SlideEditor/pptxPreview/PPTXPreviewSidebar.jsx');
    const reportPath = path.join(rootDir, 'src/components/SlideEditor/pptxPreview/PPTXPreviewReport.jsx');

    for (const p of [modalPath, canvasPath, sidebarPath, reportPath]) {
      const code = fs.readFileSync(p, 'utf-8');
      assert.match(code, /Times New Roman/i, `${path.basename(p)} phải chứa font Times New Roman`);
      assert.doesNotMatch(code, /text-\[9px\]|text-\[10px\]|text-\[11px\]/, `${path.basename(p)} không được có cỡ chữ nhỏ hơn 14px`);
    }

    // Kiểm tra canvas preview áp dụng Math.max(14, ...) cho chữ slide
    const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
    assert.match(canvasCode, /Math\.max\(14/, 'PPTXPreviewSlideCanvas phải bảo đảm chữ slide tối thiểu 14px');
  });

  await t.test('3. SlideCanvas và Toolbar đặt cỡ chữ nhỏ nhất là 14 và Times New Roman', () => {
    const canvasPath = path.join(rootDir, 'src/components/SlideEditor/SlideCanvas.jsx');
    const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
    assert.match(canvasCode, /Math\.max\(14,\s*el\.fontSize/, 'SlideCanvas phải giới hạn kích thước tối thiểu là 14px');
    assert.match(canvasCode, /Times New Roman/, 'SlideCanvas phải ưu tiên Times New Roman cho văn bản slide');

    const toolbarPath = path.join(rootDir, 'src/components/SlideEditor/Toolbar.jsx');
    const toolbarCode = fs.readFileSync(toolbarPath, 'utf-8');
    assert.match(toolbarCode, /Math\.max\(14,/, 'Toolbar nút giảm cỡ chữ không được giảm dưới 14');
    assert.match(toolbarCode, /value="Times New Roman"/, 'Toolbar phải có tùy chọn Times New Roman');
  });

  await t.test('4. SpeakerNotes và SlideEditorView đảm bảo soạn giáo án Times New Roman và tối thiểu 14px', () => {
    const notesPath = path.join(rootDir, 'src/components/SlideEditor/SpeakerNotes.jsx');
    const notesCode = fs.readFileSync(notesPath, 'utf-8');
    assert.match(notesCode, /fontFamily:\s*"'Times New Roman'/i, 'SpeakerNotes textarea phải áp dụng Times New Roman');
    assert.match(notesCode, /text-\[14px\]/, 'SpeakerNotes phải có cỡ chữ tối thiểu 14px');

    const viewPath = path.join(rootDir, 'src/components/SlideEditor/SlideEditorView.jsx');
    const viewCode = fs.readFileSync(viewPath, 'utf-8');
    assert.match(viewCode, /fontFamily:\s*'Times New Roman'/, 'Hàm thêm chữ mới handleAddText phải mặc định Times New Roman');
    assert.match(viewCode, /Math\.max\(14,\s*fontSize\)/, 'Hàm thêm chữ mới handleAddText phải có cỡ chữ tối thiểu 14');
  });

  await t.test('5. Bộ sinh slide bài dạy planSlideGenerator.ts sinh chữ với Times New Roman và cỡ chữ >= 14', () => {
    const mockPlan = {
      title: 'Em Vẽ Ngôi Trường Em',
      grade: 3,
      week: 5,
      period: 5,
      objectives: 'Học sinh vẽ ngôi trường thân yêu',
      materials: 'Màu sáp, giấy vẽ'
    };
    const slides = buildStandardSlidesForPlan(mockPlan);
    assert.equal(slides.length, 4, 'Phải sinh đủ 4 slide chuẩn');

    for (const slide of slides) {
      for (const el of slide.elements) {
        if (el.type === 'text') {
          assert.equal(el.fontFamily, 'Times New Roman', 'Phông chữ slide phải là Times New Roman');
          assert.ok(el.fontSize >= 14, `Cỡ chữ phải >= 14, thực tế là ${el.fontSize}`);
        }
      }
    }
  });

  await t.test('6. pptxImportService trích xuất chữ với giới hạn tối thiểu 14px và Times New Roman', () => {
    const svcPath = path.join(rootDir, 'src/utils/pptxImportService.js');
    const code = fs.readFileSync(svcPath, 'utf-8');
    assert.match(code, /Math\.max\(14,\s*Math\.min\(maxFontSize,\s*42\)\)/, 'pptxImportService phải bảo đảm cỡ chữ nhỏ nhất 14px');
    assert.match(code, /fontFamily\s*\|\|\s*'Times New Roman'/, 'pptxImportService phải mặc định Times New Roman nếu file không chỉ định');
  });
});
