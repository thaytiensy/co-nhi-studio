import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateSlideElement,
  validateSlide,
  validateProjectData,
  parseAndValidateProjectJson,
  saveProjectToLocal,
  loadProjectFromLocal,
  STORAGE_KEY
} from '../src/utils/storageService.js';

import { sanitizePptxFileName } from '../src/utils/pptxExportService.js';
import { parseAiLessonResponse } from '../src/utils/aiLessonGenerator.js';
import { PEDAGOGY_BANK } from '../src/data/pedagogyBank.js';

// Setup Mock LocalStorage for pure Node environment testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

describe('Giai đoạn 1 - Kiểm thử lưu và đọc dự án bài giảng (Storage & Data Persistence)', () => {
  it('1. Lưu và đọc lại bài giảng hợp lệ từ LocalStorage', () => {
    localStorage.clear();
    const sampleProject = {
      title: 'Mĩ Thuật Lớp 2 - Sắc Màu Quê Hương',
      slides: [
        {
          id: 'slide-101',
          title: 'Khởi động',
          background: '#fef3c7',
          elements: [
            { id: 'el-1', type: 'text', x: 50, y: 50, width: 400, height: 60, text: 'Chào mừng các em!' }
          ]
        }
      ]
    };

    const saveResult = saveProjectToLocal(sampleProject);
    assert.equal(saveResult.success, true, 'Lưu project hợp lệ phải trả về success: true');

    const loaded = loadProjectFromLocal();
    assert.ok(loaded, 'Dữ liệu đọc ra từ LocalStorage không được null');
    assert.equal(loaded.title, sampleProject.title);
    assert.equal(loaded.slides.length, 1);
    assert.equal(loaded.slides[0].id, 'slide-101');
    assert.equal(loaded.slides[0].elements[0].text, 'Chào mừng các em!');
  });

  it('2. Từ chối ghi đè dữ liệu tốt bằng dữ liệu rỗng hoặc sai cấu trúc', () => {
    localStorage.clear();
    const goodProject = {
      title: 'Bài Giảng Chuẩn',
      slides: [{ id: 'slide-good', elements: [] }]
    };
    saveProjectToLocal(goodProject);

    // Thử lưu project rỗng hoặc không có slide
    const badEmptyProject = { title: 'Bài Giảng Rỗng', slides: [] };
    const resultEmpty = saveProjectToLocal(badEmptyProject);
    assert.equal(resultEmpty.success, false, 'Không được phép lưu bài giảng không có slide nào');

    // Dữ liệu cũ trong LocalStorage phải được bảo toàn nguyên vẹn
    const currentInStorage = loadProjectFromLocal();
    assert.equal(currentInStorage.title, 'Bài Giảng Chuẩn');
    assert.equal(currentInStorage.slides[0].id, 'slide-good');
  });

  it('3. Xử lý an toàn khi JSON trong LocalStorage bị hỏng', () => {
    localStorage.setItem(STORAGE_KEY, '{ json_bi_loi_khong_parse_duoc ...');
    const loaded = loadProjectFromLocal();
    assert.equal(loaded, null, 'Khi JSON hỏng, hàm load phải trả về null thay vì gây crash ứng dụng');
  });
});

describe('Giai đoạn 1 - Kiểm thử tệp dự án .conhi và cấu trúc Slide/Element', () => {
  it('4. Phân tích và chấp nhận tệp .conhi đúng chuẩn', () => {
    const validJsonString = JSON.stringify({
      title: 'Bài Học Nặn Đất Sét Lớp 1',
      version: '1.0.0',
      slides: [
        {
          id: 'slide-nan-1',
          background: '#ffffff',
          elements: [
            { id: 'shape-1', type: 'shape', x: 100, y: 100, width: 200, height: 150, shapeType: 'rect' }
          ]
        }
      ]
    });

    const parsed = parseAndValidateProjectJson(validJsonString);
    assert.equal(parsed.title, 'Bài Học Nặn Đất Sét Lớp 1');
    assert.equal(parsed.slides.length, 1);
    assert.equal(parsed.slides[0].elements[0].type, 'shape');
  });

  it('5. Từ chối tệp .conhi sai cấu trúc hoặc thiếu trường cốt lõi', () => {
    assert.throws(() => parseAndValidateProjectJson(''), /Nội dung tệp dự án rỗng/);
    assert.throws(() => parseAndValidateProjectJson('not valid json'), /không đúng định dạng JSON/);
    assert.throws(() => parseAndValidateProjectJson(JSON.stringify({ title: 'Không có slide' })), /chứa ít nhất một trang slide/);
    assert.throws(() => parseAndValidateProjectJson(JSON.stringify({ slides: 'chuỗi không phải mảng' })), /chứa ít nhất một trang slide/);
  });

  it('6. Kiểm tra tính toàn vẹn của Slide và Elements', () => {
    // Slide thiếu id
    assert.throws(() => validateSlide({ elements: [] }, 0), /thiếu mã định danh/);

    // Element thiếu type
    assert.throws(() => validateSlideElement({ x: 0, y: 0, width: 100, height: 100 }, 0, 0), /thiếu thuộc tính type/);

    // Element có type không được hỗ trợ
    assert.throws(() => validateSlideElement({ type: 'unsupported_iframe', x: 0, y: 0, width: 100, height: 100 }, 0, 0), /không được hỗ trợ/);

    // Element thiếu tọa độ
    assert.throws(() => validateSlideElement({ type: 'text', x: 'wrong', y: 0, width: 100, height: 100 }, 0, 0), /thiếu tọa độ hoặc kích thước/);

    // Element hợp lệ
    const validEl = { id: 'el-ok', type: 'text', x: 10, y: 20, width: 300, height: 40 };
    assert.equal(validateSlideElement(validEl, 0, 0), true);
  });
});

describe('Giai đoạn 1 - Kiểm thử Parser AI kế hoạch bài dạy & Kiểm soát an toàn (AI Safety)', () => {
  it('7. Parse thành công dữ liệu AI trả về đầy đủ 4 hoạt động và rubric', () => {
    const validAiRaw = JSON.stringify({
      objectives: {
        knowledge: 'Học sinh nhận biết được màu sắc cơ bản.',
        skills: 'Biết pha màu và vẽ được bức tranh đơn giản.',
        qualities: 'Yêu thích sáng tạo mĩ thuật và giữ gìn dụng cụ vẽ.'
      },
      materialsNeeded: {
        teacher: 'Giấy vẽ A4, hộp sáp màu mẫu, tranh thị phạm.',
        student: 'Giấy A4, hộp sáp màu hoặc chì màu.'
      },
      teachingProcess: [
        { name: 'Khởi động', activity: 'Xem video bài hát về màu sắc.', teacherNote: 'Tạo không khí vui tươi.' },
        { name: 'Quan sát và nhận biết', activity: 'Quan sát các gam màu nóng lạnh trong đời sống.' },
        { name: 'Thực hành sáng tạo', activity: 'Vẽ bức tranh ngôi nhà với gam màu yêu thích.' },
        { name: 'Trưng bày và chia sẻ', activity: 'Giới thiệu bức tranh trước lớp.' }
      ],
      rubricCriteria: [
        'Nhận biết đúng màu sắc',
        'Vẽ nét rõ ràng, phối màu hài hòa',
        'Có ý tưởng riêng, hoàn thành sản phẩm'
      ]
    });

    const parsed = parseAiLessonResponse(validAiRaw);
    assert.ok(parsed.objectives);
    assert.equal(parsed.objectives.knowledge, 'Học sinh nhận biết được màu sắc cơ bản.');
    assert.equal(parsed.teachingProcess.length, 4);
    assert.equal(parsed.rubricCriteria.length, 3);
  });

  it('8. Từ chối dữ liệu AI thiếu trường quan trọng', () => {
    // Thiếu objectives
    const missingObjectives = JSON.stringify({
      teachingProcess: [{}, {}, {}, {}],
      rubricCriteria: ['1', '2', '3']
    });
    assert.throws(() => parseAiLessonResponse(missingObjectives));

    // Tiến trình dưới 4 bước
    const shortProcess = JSON.stringify({
      objectives: { knowledge: 'a', skills: 'b', qualities: 'c' },
      materialsNeeded: { teacher: 'a', student: 'b' },
      teachingProcess: [{ name: '1', activity: 'act1' }, { name: '2', activity: 'act2' }],
      rubricCriteria: ['1', '2', '3']
    });
    assert.throws(() => parseAiLessonResponse(shortProcess), /chưa tạo đủ bốn hoạt động/);

    // Thiếu rubric
    const shortRubric = JSON.stringify({
      objectives: { knowledge: 'a', skills: 'b', qualities: 'c' },
      materialsNeeded: { teacher: 'a', student: 'b' },
      teachingProcess: [
        { name: '1', activity: 'a' }, { name: '2', activity: 'b' },
        { name: '3', activity: 'c' }, { name: '4', activity: 'd' }
      ],
      rubricCriteria: ['chỉ có 1 tiêu chí']
    });
    assert.throws(() => parseAiLessonResponse(shortRubric), /chưa tạo đủ tiêu chí nhận xét/);
  });

  it('9. Phát hiện và từ chối vật liệu nguy hiểm không phù hợp tiểu học', () => {
    const dangerousAiRaw = JSON.stringify({
      objectives: { knowledge: 'Học cắt dán', skills: 'Cắt dán', qualities: 'Chăm chỉ' },
      materialsNeeded: {
        teacher: 'Kéo an toàn',
        student: 'Dùng dao rọc giấy sắc bén và súng bắn keo nến'
      },
      teachingProcess: [
        { name: '1', activity: 'a' }, { name: '2', activity: 'b' },
        { name: '3', activity: 'c' }, { name: '4', activity: 'd' }
      ],
      rubricCriteria: ['1', '2', '3']
    });

    assert.throws(() => parseAiLessonResponse(dangerousAiRaw), /đồ dùng chưa phù hợp học sinh tiểu học/);
  });
});

describe('Giai đoạn 1 - Kiểm thử Làm Sạch Tên Tệp PPTX & Ngân Hàng GDPT 2018', () => {
  it('10. Chuẩn hóa tên tệp xuất PPTX an toàn trên hệ thống tệp tin', () => {
    assert.equal(sanitizePptxFileName('Bai_Giang_1'), 'Bai_Giang_1');
    assert.equal(sanitizePptxFileName('Bài Giảng: Mĩ Thuật 2? * &'), 'Bài_Giảng_Mĩ_Thuật_2');
    assert.equal(sanitizePptxFileName('../../etc/passwd'), 'etc_passwd');
    assert.equal(sanitizePptxFileName('   '), 'Bai_Giang_Mi_Thuat');
    assert.equal(sanitizePptxFileName(null), 'Bai_Giang_Mi_Thuat');
  });

  it('11. Ngân hàng tri thức GDPT 2018 cục bộ có đầy đủ dữ liệu từ Lớp 1 đến Lớp 5', () => {
    assert.ok(PEDAGOGY_BANK, 'Ngân hàng sư phạm phải tồn tại');
    assert.ok(Array.isArray(PEDAGOGY_BANK.grades), 'Phải có danh sách các khối lớp');
    assert.equal(PEDAGOGY_BANK.grades.length, 5, 'Phải có đủ 5 khối lớp từ 1 đến 5');

    for (let grade = 1; grade <= 5; grade++) {
      const themes = PEDAGOGY_BANK.themes[grade];
      assert.ok(Array.isArray(themes), `Khối lớp ${grade} phải có danh sách chủ đề`);
      assert.ok(themes.length > 0, `Khối lớp ${grade} phải có ít nhất một chủ đề chuẩn`);
      const firstTheme = themes[0];
      assert.ok(firstTheme.title, `Chủ đề của lớp ${grade} phải có tiêu đề`);
      assert.ok(firstTheme.objectives, `Chủ đề của lớp ${grade} phải có mục tiêu`);
      assert.ok(Array.isArray(firstTheme.fourSteps), `Chủ đề của lớp ${grade} phải có tiến trình 4 bước`);
      assert.equal(firstTheme.fourSteps.length, 4, `Tiến trình mĩ thuật của lớp ${grade} phải chuẩn 4 bước GDPT 2018`);
    }
  });
});
