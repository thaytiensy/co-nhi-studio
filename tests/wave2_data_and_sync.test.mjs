import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import {
  DEFAULT_PLANS,
  DEFAULT_STUDIO_DATA,
  computeKPI,
  resolveStudentLevel,
  mapSmasStudentsToEvaluations,
} from '../src/lib/storage.ts';
import { buildCloudSyncPayload } from '../src/utils/firebaseDatabaseService.js';

test('Wave 2 - Kế hoạch bài dạy cả 5 khối đều bắt đầu từ Tuần 1 và đủ chủ đề SGK Kết nối tri thức', () => {
  const expectedCounts = { 1: 9, 2: 8, 3: 10, 4: 8, 5: 8 };
  for (const [gradeStr, expectedLen] of Object.entries(expectedCounts)) {
    const grade = Number(gradeStr);
    const plans = DEFAULT_PLANS.filter((p) => Number(p.grade) === grade);
    assert.equal(plans.length, expectedLen, `Khối ${grade} phải có đủ ${expectedLen} chủ đề`);
    plans.forEach((plan, idx) => {
      assert.equal(plan.week, idx + 1, `Khối ${grade} bài ${idx + 1} phải có tuần ${idx + 1}`);
      assert.equal(plan.period, idx + 1, `Khối ${grade} bài ${idx + 1} phải có tiết ${idx + 1}`);
      assert.ok(plan.title.startsWith(`Chủ đề ${idx + 1}:`), `Khối ${grade} phải đúng thứ tự Chủ đề ${idx + 1}`);
    });
  }
  assert.equal(DEFAULT_PLANS.length, 43);
});

test('Wave 2 - KPI Tổng Quan đọc trực tiếp từ danh sách Sổ Điểm SMAS thật (không hiển thị số ảo 16 HS)', () => {
  const emptyKpi = computeKPI(DEFAULT_STUDIO_DATA, []);
  assert.equal(emptyKpi.totalStudents, 0);
  assert.equal(emptyKpi.levelTCount, 0);
  assert.equal(emptyKpi.levelHCount, 0);
  assert.equal(emptyKpi.levelCCount, 0);

  const realSmasStudents = [
    { id: 'HS001', name: 'Nguyễn An', className: 'Lớp 1A', level: 'T', comment: 'Rất tốt' },
    { id: 'HS002', name: 'Trần Bình', className: 'Lớp 1A', level: 'H', comment: 'Hoàn thành' },
    { id: 'HS003', name: 'Lê Chi', className: 'Lớp 2A', ckLevel: 'C', comment: 'Cần cố gắng' },
    { id: 'HS004', name: 'Phạm Dũng', className: 'Lớp 3A', weeklyLevels: { 1: 'H', 4: 'T' } },
  ];
  assert.equal(resolveStudentLevel(realSmasStudents[2]), 'C');
  assert.equal(resolveStudentLevel(realSmasStudents[3]), 'T');

  const realKpi = computeKPI(DEFAULT_STUDIO_DATA, realSmasStudents);
  assert.equal(realKpi.totalStudents, 4);
  assert.equal(realKpi.levelTCount, 2);
  assert.equal(realKpi.levelHCount, 1);
  assert.equal(realKpi.levelCCount, 1);

  const mapped = mapSmasStudentsToEvaluations(realSmasStudents);
  assert.equal(mapped.length, 4);
  assert.equal(mapped[0].className, '1A');
  assert.equal(mapped[3].week, 4);
  assert.equal(mapped[3].level, 'T');
});

test('Wave 2 - Cloud Sync đóng gói đầy đủ Slide bài giảng, Sổ điểm SMAS thật và tự bảo vệ ngưỡng 1 MiB', () => {
  const hugeDataUri = 'data:image/png;base64,' + 'A'.repeat(1_000_000);
  const payload = buildCloudSyncPayload({
    dataToSync: DEFAULT_STUDIO_DATA,
    projectData: {
      title: 'Bài giảng Tuần 1',
      slides: [
        {
          id: 's1',
          title: 'Slide 1',
          elements: [{ id: 'e1', type: 'image', src: hugeDataUri, x: 0, y: 0, width: 100, height: 100 }],
        },
      ],
    },
    smasData: {
      hasUploadedOrSelected: true,
      className: 'Lớp 1A',
      classOptions: ['1A', '2A'],
      selectedClassFilter: 'all',
      semester: 'Học kì I',
      students: [
        {
          id: 'HS001',
          name: 'Nguyễn An',
          className: '1A',
          level: 'T',
          camHistory: [{ id: 'c1', artworkThumb: 'data:image/jpeg;base64,' + 'B'.repeat(100_000) }],
        },
      ],
    },
    teachingClasses: ['1A', '2A'],
    scope: 'teacher_demo_example_com',
  });

  assert.equal(payload.version, 'vip_pro_v2');
  assert.equal(payload.project.title, 'Bài giảng Tuần 1');
  assert.equal(payload.project.slides.length, 1);
  assert.equal(payload.smas.students.length, 1);
  assert.deepEqual(payload.teachingClasses, ['1A', '2A']);
  assert.equal(payload.evaluations.length, 1);
  assert.equal(payload.evaluations[0].name, 'Nguyễn An');

  const finalBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  assert.ok(finalBytes < 850 * 1024, `Payload Cloud phải nhỏ hơn 850KB (thực tế: ${finalBytes})`);
  assert.equal(payload.project.slides[0].elements[0]._cloudMediaTrimmed, true);
});

test('Wave 2 - api/teaching-ai.js dùng GEMINI_IMAGE_MODEL, có timeout Pollinations và hỗ trợ HMAC session token', () => {
  const src = fs.readFileSync(new URL('../api/teaching-ai.js', import.meta.url), 'utf8');
  assert.match(src, /verifySessionToken/);
  assert.match(src, /pollController\.signal/);
  assert.match(src, /models\/\$\{GEMINI_IMAGE_MODEL\}:generateContent/);
  assert.match(src, /responseModalities:\s*\['IMAGE',\s*'TEXT'\]/);
  assert.match(src, /image_quota_exhausted/);
});
