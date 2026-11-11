import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as XLSX from 'xlsx';
import { exportSmasExcel, parseLevel } from '../src/utils/smasExcelService.js';
import { exportExcelReport, exportCsvReport } from '../src/lib/export-engine.ts';
import { PEDAGOGY_BANK } from '../src/data/pedagogyBank.js';

describe('Giai đoạn 7 - Chuẩn SGK Kết Nối Tri Thức Với Cuộc Sống & Quy Chuẩn File Excel SMAS', () => {
  it('1. Đảm bảo Bộ sách Kết Nối Tri Thức Với Cuộc Sống đầy đủ từ Lớp 1 đến Lớp 5', () => {
    assert.equal(PEDAGOGY_BANK.grades.length, 5, 'Phải có đủ 5 khối lớp 1-5');
    for (let g = 1; g <= 5; g++) {
      const themes = PEDAGOGY_BANK.themes[g];
      assert.ok(Array.isArray(themes) && themes.length >= 2, `Khối lớp ${g} phải có ít nhất 2 chủ đề SGK`);
      themes.forEach(t => {
        assert.ok(t.title, 'Chủ đề phải có tiêu đề');
        assert.ok(t.objectives?.knowledge, 'Phải có mục tiêu kiến thức');
        assert.ok(t.fourSteps?.length === 4, 'Phải có đủ 4 bước thị phạm');
      });
    }
  });

  it('2. Lời giảng giáo viên tự động theo SGK Kết Nối Tri Thức bám sát chủ đề và phương pháp', () => {
    const speakerNotesSource = fs.readFileSync('src/components/SlideEditor/SpeakerNotes.jsx', 'utf8');
    assert.ok(speakerNotesSource.includes('SGK Kết Nối Tri Thức'), 'SpeakerNotes phải đề cập SGK Kết Nối Tri Thức');
    assert.ok(speakerNotesSource.includes('buildSlideTeacherSpeech'), 'Phải chứa hàm buildSlideTeacherSpeech');
    assert.ok(speakerNotesSource.includes('đại dương|biển|cá|san hô'), 'Phải hỗ trợ chủ đề đại dương kì thú');
    assert.ok(speakerNotesSource.includes('gia đình|bữa cơm|mẹ|bố'), 'Phải hỗ trợ chủ đề gia đình');
  });

  it('3. Quy chuẩn xuất file Excel SMAS (.xlsx): Cột chuẩn STT, Mã học sinh, Họ và tên, Lớp, Mức đánh giá, Nội dung nhận xét', () => {
    const sampleStudents = [
      { id: 'HS001', name: 'Nguyễn Văn An', className: '1A', level: 'T', comment: 'Phối màu sáng tạo, đường nét tự tin.' },
      { id: 'HS002', name: 'Trần Thị Bình', className: '1A', level: 'H', comment: 'Hoàn thành bài vẽ đúng tiến độ.' }
    ];

    const fileName = exportSmasExcel({
      students: sampleStudents,
      className: '1A',
      semester: 'Học kì I',
      exportMode: 'standard'
    });

    assert.ok(fileName.endsWith('.xlsx'), 'Tệp xuất ra phải là định dạng chuẩn .xlsx');
    assert.ok(fs.existsSync(fileName), 'Tệp Excel SMAS phải được tạo trên đĩa');

    const workbook = XLSX.read(fs.readFileSync(fileName));
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    assert.equal(rows.length, 2);
    const firstRow = rows[0];
    assert.equal(firstRow['STT'], 1);
    assert.equal(firstRow['Mã học sinh'], 'HS001');
    assert.equal(firstRow['Họ và tên'], 'Nguyễn Văn An');
    assert.equal(firstRow['Lớp'], '1A');
    assert.equal(firstRow['Mức đánh giá'], 'T');
    assert.equal(firstRow['Nội dung nhận xét'], 'Phối màu sáng tạo, đường nét tự tin.');

    // Dọn dẹp tệp kiểm thử
    fs.unlinkSync(fileName);
  });

  it('4. Quy chuẩn xuất file Excel SMAS Giữa kì (GK) và Cuối kì (CK)', () => {
    const sampleStudents = [
      { 
        id: 'HS001', 
        name: 'Nguyễn Văn An', 
        className: '1A', 
        level: 'T',
        gkLevel: 'T', 
        gkComment: 'Giữa kì tiến bộ vượt bậc.',
        ckLevel: 'T',
        ckComment: 'Cuối kì hoàn thành xuất sắc.'
      }
    ];

    const gkFileName = exportSmasExcel({
      students: sampleStudents,
      className: '1A',
      semester: 'Giữa kì I',
      exportMode: 'gk'
    });
    assert.ok(gkFileName.endsWith('.xlsx'));
    const gkWb = XLSX.read(fs.readFileSync(gkFileName));
    const gkRow = XLSX.utils.sheet_to_json(gkWb.Sheets[gkWb.SheetNames[0]])[0];
    assert.equal(gkRow['Mức đánh giá giữa kì'], 'T');
    assert.equal(gkRow['Nội dung nhận xét giữa kì'], 'Giữa kì tiến bộ vượt bậc.');
    fs.unlinkSync(gkFileName);

    const ckFileName = exportSmasExcel({
      students: sampleStudents,
      className: '1A',
      semester: 'Cuối kì I',
      exportMode: 'ck'
    });
    assert.ok(ckFileName.endsWith('.xlsx'));
    const ckWb = XLSX.read(fs.readFileSync(ckFileName));
    const ckRow = XLSX.utils.sheet_to_json(ckWb.Sheets[ckWb.SheetNames[0]])[0];
    assert.equal(ckRow['Mức đánh giá cuối kì'], 'T');
    assert.equal(ckRow['Nội dung nhận xét cuối kì'], 'Cuối kì hoàn thành xuất sắc.');
    fs.unlinkSync(ckFileName);
  });

  it('5. Thư viện export-engine.ts xuất bảng báo cáo định dạng .xlsx chuẩn', () => {
    const filename = exportExcelReport();
    assert.ok(filename.endsWith('.xlsx'));
    const csvFilename = exportCsvReport();
    assert.ok(csvFilename.endsWith('.xlsx'));
  });

  it('6. Kiểm tra cấu trúc chống lỗi màn hình trắng (TDZ Protection) trong StudentEvaluationSMAS và OfflinePedagogyAssistant', () => {
    const smasContent = fs.readFileSync('src/components/Evaluation/StudentEvaluationSMAS.jsx', 'utf8');
    const assistantContent = fs.readFileSync('src/components/Assistant/OfflinePedagogyAssistant.jsx', 'utf8');

    // Trong StudentEvaluationSMAS: teachingClasses phải được khai báo TRƯỚC allClasses
    const teachingClassesIdx = smasContent.indexOf('const [teachingClasses, setTeachingClasses]');
    const allClassesIdx = smasContent.indexOf('const allClasses =');
    assert.ok(teachingClassesIdx !== -1, 'Phải tìm thấy khai báo teachingClasses');
    assert.ok(allClassesIdx !== -1, 'Phải tìm thấy khai báo allClasses');
    assert.ok(teachingClassesIdx < allClassesIdx, 'teachingClasses PHẢI được khởi tạo TRƯỚC allClasses để chống lỗi trắng trang TDZ');

    // Trong OfflinePedagogyAssistant: messages và isLoading phải được khai báo TRƯỚC useEffect có dependency chứa nó
    const messagesIdx = assistantContent.indexOf('const [messages, setMessages]');
    const isLoadingIdx = assistantContent.indexOf('const [isLoading, setIsLoading]');
    const scrollEffectIdx = assistantContent.indexOf('[messages, isLoading]');
    assert.ok(messagesIdx !== -1 && isLoadingIdx !== -1, 'Phải tìm thấy khai báo messages và isLoading');
    assert.ok(scrollEffectIdx !== -1, 'Phải tìm thấy scrollEffect');
    assert.ok(messagesIdx < scrollEffectIdx, 'messages PHẢI được khởi tạo TRƯỚC useEffect để chống lỗi trắng trang TDZ');
    assert.ok(isLoadingIdx < scrollEffectIdx, 'isLoading PHẢI được khởi tạo TRƯỚC useEffect để chống lỗi trắng trang TDZ');
  });

  it('7. Hàm buildStandardSlidesForPlan sinh đủ 4 slide chuẩn sư phạm Công văn 2345/BGDĐT cho chủ đề', async () => {
    const { buildStandardSlidesForPlan } = await import('../src/utils/planSlideGenerator.ts');
    const samplePlan = {
      id: 'plan-test-1',
      title: 'Chủ đề 1: Mĩ thuật trong nhà trường (Chấm, Nét, Màu cơ bản)',
      grade: 1,
      week: 1,
      period: 1,
      objectives: 'Nhận biết 3 màu cơ bản: Đỏ, Vàng, Lam.',
      materials: 'Sáp màu, giấy vẽ A4'
    };

    const slides = buildStandardSlidesForPlan(samplePlan);
    assert.equal(slides.length, 4, 'Phải sinh đủ 4 trang slide');
    assert.ok(slides[0].title.includes('Mĩ thuật trong nhà trường'), 'Slide 1 phải có tiêu đề bài học');
    assert.ok(slides[1].title.includes('Quan Sát & Khám Phá'), 'Slide 2 là hoạt động Khám phá');
    assert.ok(slides[2].title.includes('Luyện Tập & Thực Hành'), 'Slide 3 là hoạt động Thực hành');
    assert.ok(slides[3].title.includes('Trưng Bày & Đánh Giá'), 'Slide 4 là hoạt động Trưng bày TT27');
    assert.ok(slides[3].elements.some(el => el.text.includes('Thông tư 27')), 'Slide 4 phải đề cập Thông tư 27');
  });

  it('8. BentoDashboardView chứa nút Nhập Giáo Án PP cho từng chủ đề để chuyển sang tab Soạn Slide', () => {
    const dashboardSource = fs.readFileSync('src/components/Dashboard/BentoDashboardView.jsx', 'utf8');
    assert.ok(dashboardSource.includes('Nhập Giáo Án PP'), 'Dashboard phải chứa nút Nhập Giáo Án PP');
    assert.ok(dashboardSource.includes('PlanPPTXImportModal'), 'Dashboard phải tích hợp PlanPPTXImportModal');
    assert.ok(dashboardSource.includes('selectedPlanForImport'), 'Dashboard phải quản lý trạng thái selectedPlanForImport');
  });

  it('9. Sổ theo dõi thường xuyên 35 tuần xuất Excel đúng 35 cột tuần không có cột nhận xét', async () => {
    const { exportSmasExcel } = await import('../src/utils/smasExcelService.js');
    const mockStudents = [
      {
        id: 'HS001',
        name: 'Nguyễn Văn An',
        className: '1A',
        level: 'T',
        weeklyLevels: { 1: 'T', 2: 'T', 3: 'H', 35: 'T' },
        comment: 'Nhận xét này không được xuất ở sổ thường xuyên'
      }
    ];

    const fileName = exportSmasExcel({
      students: mockStudents,
      className: '1A',
      exportMode: 'weekly'
    });

    try {
      assert.ok(fileName.endsWith('.xlsx'), 'Phải tạo file định dạng chuẩn .xlsx');
      assert.ok(fileName.includes('So_Theo_Doi_Thuong_Xuyen'), 'Tên file phải là So_Theo_Doi_Thuong_Xuyen');
      assert.ok(fs.existsSync(fileName), 'Tệp Excel SMAS thường xuyên phải tồn tại trên đĩa');

      const workbook = XLSX.read(fs.readFileSync(fileName));
      const sheet = workbook.Sheets['Theo_Doi_Thuong_Xuyen'];
      assert.ok(sheet, 'Trang tính phải tên là Theo_Doi_Thuong_Xuyen');

      const jsonRows = XLSX.utils.sheet_to_json(sheet);
      assert.equal(jsonRows.length, 1);
      const row = jsonRows[0];

      assert.equal(row['STT'], 1);
      assert.equal(row['Mã học sinh'], 'HS001');
      assert.equal(row['Họ và tên'], 'Nguyễn Văn An');
      assert.equal(row['Lớp'], '1A');
      assert.equal(row['Tuần 1'], 'T');
      assert.equal(row['Tuần 2'], 'T');
      assert.equal(row['Tuần 3'], 'H');
      assert.equal(row['Tuần 35'], 'T');

      // Đảm bảo TUYỆT ĐỐI KHÔNG có cột nhận xét ở sổ thường xuyên
      const keys = Object.keys(row);
      const hasCommentCol = keys.some(k => /nhận xét|comment/i.test(k));
      assert.strictEqual(hasCommentCol, false, 'Sổ thường xuyên tuyệt đối không được có cột nhận xét');
    } finally {
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
    }
  });

  it('10. Tổng hợp định kỳ từ 35 tuần thường xuyên và cấu trúc UI không tạo tab riêng biệt', async () => {
    const { synthesizePeriodicEvaluation } = await import('../src/utils/smasEvaluationBridge.js');
    const student = {
      id: 'HS002',
      name: 'Trần Thị Bình',
      className: '1A',
      weeklyLevels: { 1: 'T', 2: 'T', 3: 'T', 4: 'T', 5: 'H' },
      camHistory: []
    };

    const resGK = synthesizePeriodicEvaluation(student, 'GK');
    assert.equal(resGK.level, 'T', 'Nhiều tuần T thì giữa kì phải đạt T');
    assert.ok(resGK.comment.length > 10, 'Phải sinh lời nhận xét TT27 hợp lệ');

    // Kiểm tra UI StudentEvaluationSMAS.jsx:
    const smasSource = fs.readFileSync('src/components/Evaluation/StudentEvaluationSMAS.jsx', 'utf8');
    // Không còn 2 tab riêng biệt to đùng
    assert.strictEqual(smasSource.includes('SỔ 1: THEO DÕI THƯỜNG XUYÊN'), false, 'Phải xóa 2 tab riêng biệt to đùng');
    // Có 35 cột tuần
    assert.ok(smasSource.includes('length: 35'), 'Phải tạo đủ 35 cột tuần');
    assert.ok(smasSource.includes('handleToggleWeeklyLevel'), 'Phải có hàm đổi nhanh mức T/H/C/—');
  });

  it('11. Chat box Trợ Giảng AI thông minh phản hồi tự nhiên như người với người', async () => {
    const { getNaturalPedagogyResponse } = await import('../src/utils/naturalPedagogyChatService.js');

    // Chào hỏi tự nhiên
    const greetRes = getNaturalPedagogyResponse('Chào cô trợ giảng nhé!');
    assert.ok(greetRes.includes('Cô Trợ Giảng AI'), 'Phải chào hỏi lễ phép, ấm áp');
    assert.ok(greetRes.includes('Cọ Nhí'), 'Phải nhận diện thương hiệu Cọ Nhí');

    // Tư vấn tâm lý học sinh sợ sai
    const psychRes = getNaturalPedagogyResponse('Học sinh sợ vẽ sai, rụt rè thì giáo viên nên làm gì?');
    assert.ok(psychRes.includes('Nét vẽ biến hóa') || psychRes.includes('Khen ngợi'), 'Phải đưa ra lời khuyên tâm lý sư phạm chân thành');

    // Trò chơi khởi động
    const gameRes = getNaturalPedagogyResponse('Gợi ý trò chơi khởi động 5 phút');
    assert.ok(gameRes.includes('Trò chơi') || gameRes.includes('khởi động'), 'Phải gợi ý trò chơi hấp dẫn');

    // Kiểm tra cấu trúc module Chat Box xịn
    const assistantContent = fs.readFileSync('src/components/Assistant/OfflinePedagogyAssistant.jsx', 'utf8');
    assert.ok(assistantContent.includes('ChatHeader'), 'Phải sử dụng component ChatHeader');
    assert.ok(assistantContent.includes('ChatMessageItem'), 'Phải sử dụng component ChatMessageItem');
    assert.ok(assistantContent.includes('ChatInputBar'), 'Phải sử dụng component ChatInputBar');
  });
});
