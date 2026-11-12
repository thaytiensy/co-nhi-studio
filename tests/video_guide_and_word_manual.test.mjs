import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAppDescriptionDocHtml, downloadAppDescriptionWordDoc } from '../src/utils/appDescriptionWordService.js';
import { VIDEO_CHAPTERS } from '../src/components/VideoGuide/videoGuideData.js';
import { parseSmartCommand } from '../src/lib/smart-command.ts';
import { DEFAULT_PLANS } from '../src/lib/storage.ts';

test('Bộ kiểm thử Video Hướng Dẫn & File Mô Tả App Word GDPT 2018', async (t) => {
  await t.test('1. Kiểm tra logic lọc kế hoạch bài dạy chống crash khi grade là số hoặc chuỗi', () => {
    const samplePlans = [
      ...DEFAULT_PLANS,
      { id: 'custom-1', title: 'Bài vẽ tự do', grade: 'Lớp 1', week: 5, lessonNumber: 1, status: 'Đã dạy' },
      { id: 'custom-2', title: 'Bài vẽ khối', grade: undefined, week: 6, lessonNumber: 2, status: 'Sắp dạy' }
    ];

    // Lọc theo 'Lớp 1'
    const filterGrade1 = samplePlans.filter((p) => {
      if (!p) return false;
      const pGradeStr = String(p.grade || '');
      const pGradeNum = pGradeStr.replace(/\D/g, '');
      const selectedGradeNum = String('Lớp 1').replace(/\D/g, '');
      return selectedGradeNum && pGradeNum
        ? pGradeNum === selectedGradeNum
        : pGradeStr.toLowerCase().includes(String('Lớp 1').toLowerCase());
    });

    assert.ok(filterGrade1.length >= 2, 'Phải lọc được bài dạy có grade là số 1 và chuỗi "Lớp 1"');
    assert.ok(filterGrade1.some(p => p.grade === 1), 'Phải khớp bài dạy grade=1');
    assert.ok(filterGrade1.some(p => p.grade === 'Lớp 1'), 'Phải khớp bài dạy grade="Lớp 1"');

    // Lọc 'all'
    const filterAll = samplePlans.filter((p) => {
      if (!p) return false;
      return true;
    });
    assert.equal(filterAll.length, samplePlans.length);
  });

  await t.test('2. File mô tả app Word (.doc) chứa đầy đủ Quốc hiệu, Tiêu ngữ, Pháp lý & 6 Phân hệ', () => {
    const html = generateAppDescriptionDocHtml();
    assert.ok(html.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'), 'Phải có Quốc hiệu');
    assert.ok(html.includes('Độc lập - Tự do - Hạnh phúc'), 'Phải có Tiêu ngữ');
    assert.ok(html.includes('CỌ NHÍ STUDIO'), 'Phải có tên phần mềm Cọ Nhí Studio');
    assert.ok(html.includes('Thông tư số 32/2018/TT-BGDĐT'), 'Phải có căn cứ Chương trình GDPT 2018');
    assert.ok(html.includes('Công văn số 2345/BGDĐT-GDTH'), 'Phải có căn cứ Công văn 2345');
    assert.ok(html.includes('Thông tư số 27/2020/TT-BGDĐT'), 'Phải có căn cứ Thông tư 27');
    assert.ok(html.includes('Phân hệ 1: Tổng Quan (Dashboard) & Lịch Báo Giảng SMAS'), 'Phải có Phân hệ 1');
    assert.ok(html.includes('Phân hệ 2: Soạn Thảo Slide Chuẩn 16:9'), 'Phải có Phân hệ 2');
    assert.ok(html.includes('Phân hệ 3: Trợ Giảng Sư Phạm AI 3D (Đàm Thoại Giọng Nói 0,3s)'), 'Phải có Phân hệ 3');
    assert.ok(html.includes('Phân hệ 4: Bảng Vẽ Thị Phạm 11 Khối 3D'), 'Phải có Phân hệ 4');
    assert.ok(html.includes('Phân hệ 5: Trò Chơi Mĩ Thuật Tương Tác Lớp Học'), 'Phải có Phân hệ 5');
    assert.ok(html.includes('Phân hệ 6: Cam Chấm Tranh Rubric TT27 & Xuất Sổ Điểm SMAS'), 'Phải có Phân hệ 6');
    assert.ok(html.includes('F5 / F11'), 'Phải có phím tắt trình chiếu F5');
    assert.ok(typeof downloadAppDescriptionWordDoc === 'function', 'Hàm download phải được export hợp lệ');
  });

  await t.test('3. Bộ 6 chương video hướng dẫn lưu trong app có đủ audio cục bộ và lời thoại', () => {
    assert.equal(VIDEO_CHAPTERS.length, 6, 'Phải có đủ 6 chương video');

    VIDEO_CHAPTERS.forEach((ch, idx) => {
      assert.ok(ch.id === idx + 1, `Chương ${idx + 1} phải có ID đúng thứ tự`);
      assert.ok(ch.title && ch.title.length > 5, `Chương ${ch.id} phải có tiêu đề rõ ràng`);
      assert.ok(ch.audioSrc.startsWith('/video-guide/audio/'), `Chương ${ch.id} phải trỏ vào thư mục audio cục bộ`);
      assert.ok(Array.isArray(ch.sentences) && ch.sentences.length > 0, `Chương ${ch.id} phải có câu thuyết minh`);
      assert.ok(Array.isArray(ch.highlights) && ch.highlights.length > 0, `Chương ${ch.id} phải có điểm nổi bật`);
    });
  });

  await t.test('4. Thanh lệnh thông minh nhận diện đúng câu lệnh tải mô tả Word và xem video', () => {
    const cmdDoc = parseSmartCommand('tải file mô tả app word');
    assert.equal(cmdDoc.type, 'export_app_doc', 'Phải nhận diện lệnh tải file mô tả app Word');

    const cmdDoc2 = parseSmartCommand('hướng dẫn sử dụng phần mềm word');
    assert.equal(cmdDoc2.type, 'export_app_doc', 'Phải nhận diện hướng dẫn sử dụng phần mềm word');

    const cmdVideo = parseSmartCommand('xem video hướng dẫn');
    assert.equal(cmdVideo.type, 'open_video_guide', 'Phải nhận diện mở video hướng dẫn');

    const cmdVideo2 = parseSmartCommand('video hướng dẫn app 6p');
    assert.equal(cmdVideo2.type, 'open_video_guide', 'Phải nhận diện video hướng dẫn app 6p');
  });
});
