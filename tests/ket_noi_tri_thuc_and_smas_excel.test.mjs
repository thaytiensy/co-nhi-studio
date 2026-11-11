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
});
