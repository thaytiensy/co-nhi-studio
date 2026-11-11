import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeUserScope,
  setActiveUserScope,
  getActiveUserScope,
  clearActiveUserScope,
  getScopedStorageKey
} from '../src/utils/userWorkspaceService.js';

import {
  saveProjectToLocal,
  loadProjectFromLocal,
  saveProjectDraftToLocal,
  getProjectDraftFromLocal,
  clearProjectDraft,
  hasUnsavedDraft,
  STORAGE_KEY,
  STORAGE_DRAFT_KEY
} from '../src/utils/storageService.js';

import {
  getStoredData,
  saveStoredData
} from '../src/lib/storage.ts';

// Mock localStorage and sessionStorage for node test environment
const mockStorage = new Map();
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (k) => mockStorage.get(k) || null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k),
    clear: () => mockStorage.clear()
  };
}
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = {
    getItem: (k) => mockStorage.get(`session_${k}`) || null,
    setItem: (k, v) => mockStorage.set(`session_${k}`, String(v)),
    removeItem: (k) => mockStorage.delete(`session_${k}`),
    clear: () => mockStorage.clear()
  };
}

test('Giai đoạn 5 - Kiểm thử Phân Vùng Không Gian Riêng Biệt Theo Người Dùng (Multi-User Isolation)', async (t) => {
  await t.test('1. Chuẩn hóa định danh không gian (sanitizeUserScope)', () => {
    assert.strictEqual(sanitizeUserScope(''), '');
    assert.strictEqual(sanitizeUserScope(null), '');
    assert.strictEqual(sanitizeUserScope('GiaoVien.TieuHoc@gmail.com'), 'giaovien_tieuhoc_gmail_com');
    assert.strictEqual(sanitizeUserScope('  ThayTienSy+Art@gmail.com  '), 'thaytiensy_art_gmail_com');
    assert.strictEqual(sanitizeUserScope('ngathuyphu2@gmail.com'), 'ngathuyphu2_gmail_com');
  });

  await t.test('2. Quản lý trạng thái Active User Scope', () => {
    clearActiveUserScope();
    assert.strictEqual(getActiveUserScope(), '');

    setActiveUserScope('giaovien1@gmail.com');
    assert.strictEqual(getActiveUserScope(), 'giaovien1_gmail_com');

    setActiveUserScope('giaovien2@gmail.com');
    assert.strictEqual(getActiveUserScope(), 'giaovien2_gmail_com');

    clearActiveUserScope();
    assert.strictEqual(getActiveUserScope(), '');
  });

  await t.test('3. Tạo khóa LocalStorage phân vùng (getScopedStorageKey)', () => {
    clearActiveUserScope();
    // Khi chưa đăng nhập -> trả về khóa cơ sở mặc định
    assert.strictEqual(getScopedStorageKey('test_key'), 'test_key');

    // Khi người dùng A đăng nhập
    setActiveUserScope('giaovienA@gmail.com');
    assert.strictEqual(getScopedStorageKey('co_nhi_studio_project_v1'), 'co_nhi_studio_project_v1_usr_giaoviena_gmail_com');

    // Chỉ định rõ người dùng B
    assert.strictEqual(getScopedStorageKey('co_nhi_studio_project_v1', 'giaovienB@gmail.com'), 'co_nhi_studio_project_v1_usr_giaovienb_gmail_com');
    clearActiveUserScope();
  });

  await t.test('4. Cách ly 100% bài giảng slide giữa Người A và Người B (Slide Project Isolation)', () => {
    const userA = 'teacherA@gmail.com';
    const userB = 'teacherB@gmail.com';

    const projectUserA = {
      title: 'Bài Giảng Của Thầy A - Vẽ Tranh Phong Cảnh',
      slides: [
        {
          id: 'slide-a-1',
          title: 'Trang 1 Thầy A',
          elements: [
            { id: 'el-a-1', type: 'text', text: 'Chào mừng đến lớp của Thầy A', x: 50, y: 50, width: 400, height: 100 }
          ]
        }
      ]
    };

    const projectUserB = {
      title: 'Bài Giảng Của Cô B - Nặn Con Vật Em Yêu',
      slides: [
        {
          id: 'slide-b-1',
          title: 'Trang 1 Cô B',
          elements: [
            { id: 'el-b-1', type: 'text', text: 'Chào mừng đến lớp của Cô B', x: 50, y: 50, width: 400, height: 100 }
          ]
        }
      ]
    };

    // 1. Thầy A đăng nhập và lưu bài giảng của mình
    setActiveUserScope(userA);
    saveProjectToLocal(projectUserA);

    // Kiểm tra Thầy A đọc đúng bài của mình
    const loadedA = loadProjectFromLocal();
    assert.ok(loadedA);
    assert.strictEqual(loadedA.title, 'Bài Giảng Của Thầy A - Vẽ Tranh Phong Cảnh');

    // 2. Thầy A đăng xuất, Cô B đăng nhập
    setActiveUserScope(userB);

    // Cô B mở app -> Tuyệt đối KHÔNG thấy bài giảng của Thầy A
    const loadedBInitial = loadProjectFromLocal();
    assert.strictEqual(loadedBInitial, null, 'Cô B không được phép nhìn thấy bài giảng của Thầy A!');

    // Cô B lưu bài giảng của mình
    saveProjectToLocal(projectUserB);
    const loadedBAfterSave = loadProjectFromLocal();
    assert.ok(loadedBAfterSave);
    assert.strictEqual(loadedBAfterSave.title, 'Bài Giảng Của Cô B - Nặn Con Vật Em Yêu');

    // 3. Cô B đăng xuất, Thầy A đăng nhập lại -> Vẫn thấy nguyên vẹn bài của Thầy A, không bị Cô B ghi đè
    setActiveUserScope(userA);
    const reloadedA = loadProjectFromLocal();
    assert.ok(reloadedA);
    assert.strictEqual(reloadedA.title, 'Bài Giảng Của Thầy A - Vẽ Tranh Phong Cảnh');
    assert.strictEqual(reloadedA.slides[0].elements[0].text, 'Chào mừng đến lớp của Thầy A');

    clearActiveUserScope();
  });

  await t.test('5. Cách ly bản nháp Crash Recovery theo từng tài khoản', () => {
    const userA = 'userDraftA@gmail.com';
    const userB = 'userDraftB@gmail.com';

    setActiveUserScope(userA);
    saveProjectDraftToLocal({
      title: 'Nháp của A',
      slides: [{ id: 's1', title: 'S1', elements: [{ id: 'e1', type: 'text', text: 'Draft A', x: 10, y: 10, width: 100, height: 100 }] }]
    });

    assert.ok(getProjectDraftFromLocal());
    assert.strictEqual(getProjectDraftFromLocal().title, 'Nháp của A');

    // Chuyển sang User B -> Không thấy nháp của User A
    setActiveUserScope(userB);
    assert.strictEqual(getProjectDraftFromLocal(), null, 'User B không được thấy bản nháp của User A!');

    clearActiveUserScope();
  });

  await t.test('6. Cách ly Kế hoạch bài dạy & Cài đặt Studio (Bento Dashboard State)', () => {
    const userA = 'pedagogyTeacherA@gmail.com';
    const userB = 'pedagogyTeacherB@gmail.com';

    // User A cài đặt tên trường và giáo viên của mình
    setActiveUserScope(userA);
    const dataA = getStoredData();
    dataA.settings.teacherName = 'Thầy Nguyễn Văn A';
    dataA.settings.schoolName = 'Trường TH Lê Lợi';
    dataA.plans = [{
      id: 'plan-custom-a',
      week: 1,
      period: 1,
      title: 'Giáo án riêng của Thầy A',
      grade: 1,
      className: '1A',
      objectives: 'Mục tiêu riêng A',
      materials: 'Đồ dùng riêng A',
      status: 'Đã dạy',
      notes: 'Ghi chú A'
    }];
    saveStoredData(dataA);

    // Chuyển sang User B
    setActiveUserScope(userB);
    const dataB = getStoredData();
    // User B không thấy giáo án hay tên trường của User A
    assert.notStrictEqual(dataB.settings.teacherName, 'Thầy Nguyễn Văn A');
    assert.notStrictEqual(dataB.settings.schoolName, 'Trường TH Lê Lợi');
    assert.strictEqual(dataB.plans.some(p => p.id === 'plan-custom-a'), false);

    clearActiveUserScope();
  });
});
