import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createWorkbookFromSheets,
  readExcelToSheets,
  writeWorkbookToUint8Array,
} from '../src/utils/excelService.js';
import { getNaturalPedagogyResponse } from '../src/utils/naturalPedagogyChatService.js';

describe('Wave 3 - Tối ưu ExcelJS, Xưng hô Trợ Giảng AI, PWA PNG + OG & Nhãn Trình Chiếu', () => {
  it('1. Đã thay thế hoàn toàn xlsx bằng exceljs và đọc/ghi file .xlsx + .csv tiếng Việt chuẩn xác', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert.equal(pkg.dependencies?.xlsx, undefined, 'package.json không được còn phụ thuộc xlsx cũ');
    assert.ok(pkg.dependencies?.exceljs, 'package.json phải cài đặt exceljs');

    const wb = await createWorkbookFromSheets([
      {
        name: 'Danh_Sach_1A',
        rows: [
          { STT: 1, 'Họ và tên': 'Nguyễn Minh Khôi', 'Mức đánh giá': 'T' },
          { STT: 2, 'Họ và tên': 'Trần Ngọc Hân', 'Mức đánh giá': 'H' },
        ],
        colWidths: [6, 25, 14],
      },
    ]);
    const bytes = await writeWorkbookToUint8Array(wb);
    assert.ok(bytes.byteLength > 1000, 'File .xlsx sinh bởi ExcelJS phải hợp lệ');

    const parsed = await readExcelToSheets(bytes, 'test.xlsx');
    assert.deepEqual(parsed.SheetNames, ['Danh_Sach_1A']);
    assert.equal(parsed.Sheets['Danh_Sach_1A'][1][1], 'Nguyễn Minh Khôi');
    assert.equal(parsed.Sheets['Danh_Sach_1A'][2][2], 'H');

    const csvBytes = new TextEncoder().encode('\uFEFFSTT,Họ và tên,Lớp\n1,"Lê Thị Hoa, Bé",2A\n');
    const parsedCsv = await readExcelToSheets(csvBytes, 'lop2a.csv');
    assert.equal(parsedCsv.Sheets['lop2a'][1][1], 'Lê Thị Hoa, Bé');
  });

  it('2. Đồng bộ xưng hô Thầy/Cô Trợ Giảng AI theo giới tính giọng đọc', () => {
    const maleGreeting = getNaturalPedagogyResponse('Xin chào', 1, '', 'male');
    const femaleGreeting = getNaturalPedagogyResponse('Xin chào', 1, '', 'female');
    assert.ok(maleGreeting.includes('Thầy Trợ Giảng AI'), 'Giọng nam phải xưng Thầy Trợ Giảng AI');
    assert.ok(femaleGreeting.includes('Cô Trợ Giảng AI'), 'Giọng nữ phải xưng Cô Trợ Giảng AI');

    const appSource = fs.readFileSync('src/App.jsx', 'utf8');
    assert.ok(appSource.includes('Đang tải Trợ Giảng AI...'), 'Fallback tải Trợ Giảng AI phải trung tính');

    const stageSource = fs.readFileSync('src/components/Assistant/RobotTeacherStage.jsx', 'utf8');
    assert.ok(stageSource.includes('Thầy Trợ Giảng Mĩ Thuật'), 'RobotTeacherStage giọng nam phải hiển thị Thầy Trợ Giảng Mĩ Thuật');

    const inputSource = fs.readFileSync('src/components/Assistant/ChatInputBar.jsx', 'utf8');
    assert.ok(inputSource.includes('Thầy Trợ Giảng') && inputSource.includes('Cô Trợ Giảng'), 'Placeholder ô chat phải đồng bộ theo giới tính');
  });

  it('3. Bộ icon PNG PWA (192/512/apple-touch) và ảnh Open Graph Zalo/FB tồn tại và khai báo đúng chuẩn', () => {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    for (const file of [
      'public/icon-192.png',
      'public/icon-512.png',
      'public/apple-touch-icon.png',
      'public/og-preview.png',
    ]) {
      assert.ok(fs.existsSync(file), `Phải tồn tại tệp ${file}`);
      const buf = fs.readFileSync(file);
      assert.ok(buf.subarray(0, 8).equals(pngSignature), `${file} phải là tệp PNG hợp lệ`);
    }

    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
    const iconSrcs = (manifest.icons || []).map((i) => i.src);
    assert.ok(iconSrcs.includes('/icon-192.png'), 'manifest.json phải khai báo /icon-192.png');
    assert.ok(iconSrcs.includes('/icon-512.png'), 'manifest.json phải khai báo /icon-512.png');

    const html = fs.readFileSync('index.html', 'utf8');
    assert.ok(html.includes('rel="apple-touch-icon"'), 'index.html phải có apple-touch-icon');
    assert.ok(html.includes('property="og:image" content="https://co-nhi-studio.vercel.app/og-preview.png"'), 'index.html phải có og:image chuẩn cho Zalo/Facebook');
    assert.ok(html.includes('property="og:title"') && html.includes('property="og:description"'), 'index.html phải có og:title và og:description');
    assert.ok(html.includes('name="twitter:card"'), 'index.html phải có thẻ Twitter Card');
  });

  it('4. Nhãn nút trình chiếu trên giao diện rõ ràng, không gây nhầm lẫn với phím F5 tải lại trang', () => {
    const header = fs.readFileSync('src/components/Header.jsx', 'utf8');
    assert.ok(header.includes('>Trình Chiếu<'), 'Nút Header nên dùng nhãn ngắn gọn "Trình Chiếu"');
    assert.ok(!header.includes('>Trình Chiếu (F5)<'), 'Nút Header không hiển thị nhãn gây nhầm (F5)');

    const dashboard = fs.readFileSync('src/components/Dashboard/BentoDashboardView.jsx', 'utf8');
    assert.ok(!dashboard.includes("'Trình Chiếu F5'"), 'Nút Dashboard không hiển thị nhãn "Trình Chiếu F5"');
  });
});
