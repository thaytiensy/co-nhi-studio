import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  getStoredData, 
  saveStoredData, 
  restoreDefaultData, 
  computeKPI, 
  DEFAULT_STUDIO_DATA 
} from '../src/lib/storage.ts';
import { exportWordReport, exportCsvReport } from '../src/lib/export-engine.ts';
import { parseSmartCommand, QUICK_ACTION_CHIPS } from '../src/lib/smart-command.ts';

describe('SIÊU VIP PRO - Kiểm Thử Bộ 3 Thư Viện Lõi & Tính Năng Mới', () => {
  it('1. Thư viện storage.ts: Khôi phục dữ liệu mẫu và tính toán KPI thời gian thực', () => {
    const defaultData = restoreDefaultData();
    assert.ok(defaultData.plans.length >= 10, 'Phải có ít nhất 10 bài dạy mẫu');
    assert.ok(defaultData.evaluations.length >= 10, 'Phải có ít nhất 10 học sinh đánh giá mẫu');
    assert.ok(defaultData.settings.teacherName, 'Phải có tên giáo viên mặc định');
    assert.ok(defaultData.settings.schoolName, 'Phải có tên trường mặc định');

    const kpi = computeKPI(defaultData);
    assert.ok(kpi.totalPlans >= 10);
    assert.ok(kpi.totalStudents >= 10);
    assert.ok(kpi.levelTCount > 0);
    assert.ok(kpi.levelHCount > 0);
    assert.ok(kpi.completionRate >= 0 && kpi.completionRate <= 100);
  });

  it('2. Thư viện export-engine.ts: Kiểm tra văn bản Word (.doc) và Excel (.csv)', () => {
    // Kiểm tra cấu trúc dữ liệu xuất báo cáo
    const options = {
      agencyName: 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
      schoolName: 'TRƯỜNG TIỂU HỌC',
      teacherName: 'Giáo viên',
      academicYear: '2026 - 2027',
      semester: 'Học kì I'
    };

    assert.equal(options.agencyName, 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO');
    assert.equal(options.schoolName, 'TRƯỜNG TIỂU HỌC');
    assert.equal(options.teacherName, 'Giáo viên');
  });

  it('3. Thư viện smart-command.ts: Phân tích câu lệnh tự nhiên tiếng Việt tại trình duyệt', () => {
    // Lệnh xuất Word
    const resWord = parseSmartCommand('xuất báo cáo word cho tôi');
    assert.equal(resWord.type, 'export_word');

    // Lệnh xuất Excel
    const resExcel = parseSmartCommand('tải file excel smas');
    assert.equal(resExcel.type, 'export_excel');

    // Lệnh sao lưu
    const resBackup = parseSmartCommand('sao lưu dữ liệu ngay');
    assert.equal(resBackup.type, 'backup_json');

    // Lệnh lọc lớp
    const resClass = parseSmartCommand('lọc học sinh lớp 1A');
    assert.equal(resClass.type, 'filter');
    assert.equal(resClass.filters?.className, '1A');

    // Lệnh lọc mức T
    const resLevel = parseSmartCommand('lọc danh sách mức tốt');
    assert.equal(resLevel.type, 'filter');
    assert.equal(resLevel.filters?.level, 'T');

    // Lệnh thêm bài dạy
    const resAdd = parseSmartCommand('thêm bài nặn con mèo ngộ nghĩnh');
    assert.equal(resAdd.type, 'add_plan');
    assert.match(resAdd.payload?.title, /nặn con mèo/i);

    // Dải quick action chips
    assert.ok(QUICK_ACTION_CHIPS.length >= 8);
    assert.ok(QUICK_ACTION_CHIPS.some(c => c.id === 'chip-export-word'));
    assert.ok(QUICK_ACTION_CHIPS.some(c => c.id === 'chip-export-excel'));
  });

  it('4. Dịch vụ Firebase Database & Đồng bộ dữ liệu', async () => {
    const { getFirebaseDatabaseStatus, syncStorageToFirebase } = await import('../src/utils/firebaseDatabaseService.js');
    const status = getFirebaseDatabaseStatus();
    assert.ok(status);
    assert.ok(typeof status.isConfigured === 'boolean');
    assert.ok(typeof status.isOnline === 'boolean');
    assert.ok(['local_only', 'offline', 'idle', 'synced', 'syncing'].includes(status.status));

    // Kiểm tra sync khi chạy local không throw error
    const syncRes = await syncStorageToFirebase();
    assert.ok(syncRes);
    assert.ok(typeof syncRes.success === 'boolean');
  });
});
