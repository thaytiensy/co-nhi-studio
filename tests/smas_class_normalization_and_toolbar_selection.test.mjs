import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeClassLabel, parseSmasWorkbook, shuffleClassComments } from '../src/utils/smasExcelService.js';

const rootDir = process.cwd();

test('Kiểm định sửa lỗi chọn phần tử Slide (Định dạng chữ) & Chuẩn hóa lớp tải danh sách SMAS', async (t) => {
  await t.test('1. normalizeClassLabel chuẩn hóa chính xác tên lớp', () => {
    assert.equal(normalizeClassLabel('Lớp 1A'), '1A');
    assert.equal(normalizeClassLabel('lớp  2B '), '2B');
    assert.equal(normalizeClassLabel('3C'), '3C');
    assert.equal(normalizeClassLabel(' LỚP 4D '), '4D');
    assert.equal(normalizeClassLabel('5A'), '5A');
    assert.equal(normalizeClassLabel(''), '');
    assert.equal(normalizeClassLabel(null), '');
    assert.equal(normalizeClassLabel(undefined), '');
  });

  await t.test('2. Hợp nhất và khử trùng danh sách lớp giữa teachingClasses và students', () => {
    const teachingClasses = ['1A', '1B', '1C', '2A'];
    const students = [
      { id: '1', name: 'Nguyễn Văn A', className: '1A' },
      { id: '2', name: 'Trần Thị B', className: 'Lớp 1A' },
      { id: '3', name: 'Lê Văn C', className: '1B' },
      { id: '4', name: 'Phạm Thị D', className: '3A' }
    ];

    const rawList = [
      ...students.map(s => s.className),
      ...teachingClasses
    ];
    const uniqueNormalized = Array.from(new Set(rawList.map(c => normalizeClassLabel(c)).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Không được có cả 'Lớp 1A' và '1A' cùng xuất hiện
    assert.deepEqual(uniqueNormalized, ['1A', '1B', '1C', '2A', '3A']);

    // Đếm số lượng học sinh lớp 1A phải bao gồm cả '1A' và 'Lớp 1A'
    const count1A = students.filter(s => normalizeClassLabel(s.className) === '1A').length;
    assert.equal(count1A, 2, 'Lớp 1A phải có đúng 2 học sinh');
  });

  await t.test('3. SlideCanvas bảo vệ sự kiện click không để lan truyền làm mất chọn phần tử khi thả chuột', () => {
    const canvasPath = path.join(rootDir, 'src/components/SlideEditor/SlideCanvas.jsx');
    const content = fs.readFileSync(canvasPath, 'utf-8');

    // Element div phải có onClick với stopPropagation và onSelectElement
    assert.match(content, /onClick=\{\(e\)\s*=>\s*\{\s*e\.stopPropagation\(\);\s*onSelectElement\(el\.id\);?\s*\}\}/, 
      'SlideCanvas element div phải có onClick với e.stopPropagation() để không bị deselect khi thả chuột');

    // containerRef onClick chỉ deselect khi bấm đúng nền xám ngoài canvas
    assert.match(content, /if\s*\(e\.target\s*===\s*containerRef\.current\)\s*\{\s*onDeselect\(\);/,
      'containerRef onClick phải kiểm tra e.target === containerRef.current');

    // canvasRef onClick chỉ deselect khi bấm đúng nền trắng canvas
    assert.match(content, /if\s*\(e\.target\s*===\s*canvasRef\.current\)\s*\{\s*onDeselect\(\);/,
      'canvasRef onClick phải kiểm tra e.target === canvasRef.current');
  });

  await t.test('4. Toolbar bảo vệ các nút định dạng chữ không gây deselect', () => {
    const toolbarPath = path.join(rootDir, 'src/components/SlideEditor/Toolbar.jsx');
    const content = fs.readFileSync(toolbarPath, 'utf-8');

    assert.match(content, /onMouseDown=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/,
      'Toolbar phải có onMouseDown stopPropagation');
    assert.match(content, /onClick=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/,
      'Toolbar phải có onClick stopPropagation');
  });

  await t.test('5. StudentEvaluationSMAS không chứa biến chưa định nghĩa SMAS_STORAGE_KEY và lưu đồng bộ', () => {
    const smasPath = path.join(rootDir, 'src/components/Evaluation/StudentEvaluationSMAS.jsx');
    const content = fs.readFileSync(smasPath, 'utf-8');

    // Không được gọi localStorage.removeItem(SMAS_STORAGE_KEY) với biến undeclared
    assert.doesNotMatch(content, /localStorage\.removeItem\(SMAS_STORAGE_KEY\)/,
      'Không được dùng biến chưa khai báo SMAS_STORAGE_KEY');

    // Phải dùng getSmasStorageKey()
    assert.match(content, /localStorage\.removeItem\(getSmasStorageKey\(\)\)/,
      'handleResetData phải dùng getSmasStorageKey() để xóa sạch LocalStorage');

    // Phải import writeSmasData để lưu đồng bộ khi nạp Excel hoặc reset
    assert.match(content, /writeSmasData/, 'StudentEvaluationSMAS phải gọi writeSmasData để lưu đồng bộ');
  });

  await t.test('6. shuffleClassComments hoạt động chuẩn xác với lớp có và không có tiền tố', () => {
    const mockStudents = [
      { id: '1', name: 'A', className: '1A', level: 'H', comment: 'cũ' },
      { id: '2', name: 'B', className: '2A', level: 'T', comment: 'cũ' }
    ];

    const shuffledWithPrefix = shuffleClassComments(mockStudents, 'Lớp 1A');
    assert.notEqual(shuffledWithPrefix[0].comment, 'cũ', 'Học sinh lớp 1A phải được cập nhật nhận xét');
    assert.equal(shuffledWithPrefix[1].comment, 'cũ', 'Học sinh lớp 2A phải giữ nguyên nhận xét');
  });
});
