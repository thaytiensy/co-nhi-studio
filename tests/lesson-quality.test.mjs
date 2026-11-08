import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalPedagogyPlan, parseNaturalIdeaPrompt, critiqueAndEnhanceLessonPlan, generateNaturalIdeaLesson } from '../src/utils/aiNaturalLanguageService.js';
import { parseAiLessonResponse, generateAiArtwork, requestTeachingAi, buildEnglishArtSubject } from '../src/utils/aiLessonGenerator.js';
import { inspectLessonSafety } from '../src/utils/lessonQualityService.js';
import handler from '../api/teaching-ai.js';
const local = prompt => buildLocalPedagogyPlan(parseNaturalIdeaPrompt(prompt));
const copy = value => structuredClone(value);

describe('Hồi quy rà soát giáo án thực chất và chế độ miễn phí', () => {
  it('giáo án rỗng không được điểm cao hoặc báo đủ tiến trình/phân hóa', () => {
    const r = critiqueAndEnhanceLessonPlan({});
    assert.equal(r.score, 0);
    assert.equal(r.checks.process, false);
    assert.equal(r.hasMissions, false);
    assert.ok(!r.safetyStatus.includes('100%'));
  });
  it('quét đồ dùng giáo viên/học sinh dù context đang là sáp màu', () => {
    const p = local('Vẽ con mèo lớp 2 bằng sáp màu');
    p.materialsNeeded.teacher += ', dao rọc giấy';
    p.materialsNeeded.student += ', hóa chất tẩy';
    const r = critiqueAndEnhanceLessonPlan(p, { grade: 2, material: 'Sáp màu' });
    assert.equal(r.safetyCheck.isSafe, false);
    assert.ok(r.safetyCheck.findings.some(f => f.term.includes('dao')));
    assert.ok(r.safetyCheck.findings.some(f => f.term.includes('hóa chất')));
    assert.ok(r.score <= 59);
    assert.ok(r.safetyCheck.substitutions.length >= 2);
  });
  it('quét cả hoạt động, bước thị phạm và nhiệm vụ phân hóa', () => {
    const p = local('Xé dán vườn hoa lớp 1');
    p.teachingProcess[2].activity = 'Học sinh dùng keo 502 để ghép.';
    p.teachingProcess[1].fourSteps[1] = 'Dùng súng bắn keo nóng để nối.';
    p.differentiatedMissions.tier3_advanced = 'Dùng a-xít làm sạch mẫu.';
    const r = inspectLessonSafety(p);
    assert.equal(r.isSafe, false);
    assert.ok(r.findings.length >= 3);
  });
  it('lời cấm dùng vật nguy hiểm không bị hiểu thành khuyến nghị sử dụng', () => {
    assert.equal(inspectLessonSafety({ teachingProcess: [{ activity: 'Không dùng dao rọc giấy. Không sử dụng súng bắn keo.' }] }).isSafe, true);
  });
  it('không báo đủ 3 mức khi thiếu mức nâng cao hoặc nội dung rỗng', () => {
    const p = local('Vẽ con chim lớp 2');
    delete p.differentiatedMissions.tier3_advanced;
    assert.equal(critiqueAndEnhanceLessonPlan(p).checks.differentiation, false);
    p.differentiatedMissions.tier3_advanced = '  ';
    assert.equal(critiqueAndEnhanceLessonPlan(p).hasMissions, false);
  });
  it('không xác nhận 4 bước khi bước rỗng, lặp hoặc chỉ có độ dài mảng', () => {
    const p = local('Vẽ con mèo lớp 1');
    p.teachingProcess[1].fourSteps = ['', '', '', ''];
    assert.equal(critiqueAndEnhanceLessonPlan(p).has4Steps, false);
    p.teachingProcess[1].fourSteps = Array(4).fill('Bước giống nhau');
    assert.equal(critiqueAndEnhanceLessonPlan(p).has4Steps, false);
  });
  it('không công nhận tiến trình khi bốn hoạt động sai thứ tự', () => {
    const p = local('Vẽ ngôi nhà lớp 1');
    [p.teachingProcess[0], p.teachingProcess[3]] = [p.teachingProcess[3], p.teachingProcess[0]];
    assert.equal(critiqueAndEnhanceLessonPlan(p).checks.process, false);
  });
  it('nặn con mèo không bị hướng dẫn tô màu trên giấy', () => {
    const p = local('Tạo bài học nặn con mèo bằng đất nặn lớp 2');
    const steps = p.teachingProcess[1].fourSteps.join(' ');
    assert.match(steps, /lăn|miết/iu);
    assert.doesNotMatch(steps, /tô màu|phác nét|vẽ nét/iu);
    assert.equal(p.critiqueReport.checks.materialAligned, true);
    const wrong = copy(p); wrong.teachingProcess[1].fourSteps = ['Phác nét chì', 'Vẽ nét chính', 'Vẽ thêm nền', 'Tô màu trên giấy vẽ'];
    assert.equal(critiqueAndEnhanceLessonPlan(wrong, { materialKey: 'clay' }).checks.materialAligned, false);
  });
  it('xé dán không dùng kéo có thao tác xé bằng tay và dán, không nặn vuốt', () => {
    const p = local('Xé dán con cá lớp 1 không dùng kéo');
    const steps = p.teachingProcess[1].fourSteps.join(' ');
    assert.match(steps, /Xé giấy bằng tay, không dùng kéo/iu);
    assert.match(steps, /hồ dán nguội/iu);
    assert.doesNotMatch(steps, /nhào dẻo|lăn tròn/iu);
  });
  it('thời lượng bốn hoạt động cộng đúng 35 và 70 phút', () => {
    for (const minutes of [35, 70]) {
      const p = local(`Vẽ con mèo lớp 2 ${minutes} phút`);
      assert.equal(p.teachingProcess.reduce((sum, phase) => sum + phase.durationMinutes, 0), minutes);
      assert.equal(p.critiqueReport.checks.duration, true);
      assert.ok(p.teachingProcess.every(phase => phase.name.includes(`${phase.durationMinutes} phút`)));
    }
  });
  it('parser AI giữ ba nhiệm vụ thay vì làm rơi dữ liệu', () => {
    const p = local('Vẽ con mèo lớp 2');
    const parsed = parseAiLessonResponse(JSON.stringify(p));
    assert.deepEqual(parsed.differentiatedMissions, p.differentiatedMissions);
    assert.equal(parsed.teachingProcess[0].durationMinutes, p.teachingProcess[0].durationMinutes);
  });
  it('parser AI từ chối nguy hiểm trong hoạt động dù danh sách vật liệu an toàn', () => {
    const p = local('Vẽ con mèo lớp 2');
    p.teachingProcess[2].activity = 'Cho học sinh dùng dao lam để cắt.';
    assert.throws(() => parseAiLessonResponse(JSON.stringify(p)), /nguy hiểm/iu);
  });
  it('kết quả ngoại tuyến giữ đủ báo cáo và ba mức nhiệm vụ', async () => {
    let calls = 0;
    const r = await generateNaturalIdeaLesson({ prompt: 'Nặn con cá lớp 2 35 phút', isOnline: false }, { fetchImpl: async () => { calls++; throw Error('Không được gọi'); } });
    assert.equal(calls, 0);
    assert.ok(r.plan.critiqueReport);
    assert.ok(r.plan.differentiatedMissions.tier3_advanced);
  });
  it('ảnh HTTP lỗi, nội dung JSON hoặc lỗi mạng phải thất bại, không trả URL giả thành công', async () => {
    await assert.rejects(generateAiArtwork({ topic: 'Con mèo', style: 'paper', grade: 2 }, async () => ({ ok: false, status: 503 })), /chưa khả dụng/iu);
    await assert.rejects(generateAiArtwork({ topic: 'Con mèo', style: 'paper', grade: 2 }, async () => ({ ok: true, blob: async () => new Blob(['error'], { type: 'application/json' }) })), /ảnh hợp lệ/iu);
    await assert.rejects(generateAiArtwork({ topic: 'Con mèo', style: 'paper', grade: 2 }, async () => { throw Error('Network failure'); }), /Network failure/);
  });
  it('bốn prompt chất liệu khác nhau nhưng giữ nguyên đề tài và seed', async () => {
    const urls = [];
    for (const style of ['crayon', 'watercolor', 'paper', 'clay']) {
      await generateAiArtwork({ topic: 'Con mèo chơi cuộn len', style, grade: 2, seed: 42 }, async url => { urls.push(decodeURIComponent(url)); return { ok: true, blob: async () => new Blob(['pixel'], { type: 'image/png' }) }; });
    }
    assert.equal(new Set(urls).size, 4);
    urls.forEach(url => { assert.match(url, /Con mèo chơi cuộn len/); assert.match(url, /seed=42/); assert.doesNotMatch(url, /puppy dog/); });
    assert.doesNotMatch(buildEnglishArtSubject('Xe ô tô trên phố'), /no cars/);
  });
  it('API ngoài mặc định tắt và tuyệt đối không gọi mạng', async () => {
    const oldEnv = process.env.ENABLE_EXTERNAL_AI, oldFetch = globalThis.fetch;
    delete process.env.ENABLE_EXTERNAL_AI;
    let calls = 0, body = '';
    globalThis.fetch = async () => { calls++; throw Error('Forbidden network'); };
    const res = { statusCode: 0, setHeader() {}, end(value) { body = value; } };
    try { await handler({ method: 'POST', body: { mode: 'lesson', grade: '2', prompt: 'Vẽ con mèo' }, headers: {} }, res); assert.equal(res.statusCode, 503); assert.equal(calls, 0); assert.match(body, /cục bộ/); }
    finally { globalThis.fetch = oldFetch; if(oldEnv === undefined) delete process.env.ENABLE_EXTERNAL_AI; else process.env.ENABLE_EXTERNAL_AI = oldEnv; }
  });
  it('API đã bật vẫn từ chối thiếu token trước khi gọi mạng', async () => {
    const keys = ['ENABLE_EXTERNAL_AI', 'GEMINI_API_KEY', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];
    const env = Object.fromEntries(keys.map(k => [k, process.env[k]])), oldFetch = globalThis.fetch;
    Object.assign(process.env, { ENABLE_EXTERNAL_AI: 'true', GEMINI_API_KEY: 'test-key', VITE_FIREBASE_API_KEY: 'test-key', VITE_FIREBASE_PROJECT_ID: 'test-project' });
    let calls = 0; globalThis.fetch = async () => { calls++; throw Error('Forbidden network'); };
    const res = { statusCode: 0, setHeader() {}, end() {} };
    try { await handler({ method: 'POST', body: { mode: 'lesson', grade: '2', prompt: 'Vẽ con mèo' }, headers: {} }, res); assert.equal(res.statusCode, 401); assert.equal(calls, 0); }
    finally { globalThis.fetch = oldFetch; for (const k of keys) if(env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  });
  it('mặc định client cũng không tự gọi API tính phí', async () => {
    await assert.rejects(requestTeachingAi({ mode: 'text', grade: 2, prompt: 'Gợi ý' }), /miễn phí cục bộ/iu);
  });
});

describe('Hồi quy giữ đúng đề tài tự do', () => {
  it('nặn con mèo không bị đổi thành chủ đề SGK chỉ vì có chữ đất nặn', () => {
    const p = parseNaturalIdeaPrompt('Tạo bài học nặn con mèo bằng đất nặn cho lớp 2 thời lượng 70 phút');
    assert.equal(p.topic, 'Con mèo');
    assert.equal(p.materialKey, 'clay');
    assert.equal(p.periods, 2);
    assert.equal(p.curriculumRef, null);
    const plan = buildLocalPedagogyPlan(p);
    assert.doesNotMatch(plan.materialsNeeded.student, /giấy vẽ|bút chì/iu);
    assert.doesNotMatch(plan.rubricCriteria.join(' '), /nét vẽ|bài vẽ/iu);
  });
  it('nhận diện nặn trực tiếp và sáp màu đã nêu, không tự báo giả định sai', () => {
    assert.equal(parseNaturalIdeaPrompt('Nặn con cá lớp 2').materialKey, 'clay');
    const p = parseNaturalIdeaPrompt('Vẽ con mèo lớp 2 bằng sáp màu 35 phút');
    assert.ok(!p.assumptions.some(a => a.includes('chất liệu')));
  });
});

describe('Hồi quy giới hạn ảnh và xác thực máy chủ', () => {
  it('từ chối ảnh trên 10MB và không thử dịch vụ khác khi nhận HTTP 402', async () => {
    await assert.rejects(generateAiArtwork({ topic: 'Con mèo', grade: 2, style: 'clay' }, async () => ({ ok: true, blob: async () => ({ size: 11 * 1024 * 1024, type: 'image/png' }) })), /10MB/);
    let calls = 0;
    await assert.rejects(generateAiArtwork({ topic: 'Con mèo', grade: 2, style: 'clay' }, async () => { calls++; return { ok: false, status: 402 }; }), /HTTP 402/);
    assert.equal(calls, 1);
  });
  it('token sai bị từ chối, không tiếp tục gọi Gemini', async () => {
    const keys = ['ENABLE_EXTERNAL_AI', 'GEMINI_API_KEY', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];
    const env = Object.fromEntries(keys.map(k => [k, process.env[k]])), oldFetch = globalThis.fetch, urls = [];
    Object.assign(process.env, { ENABLE_EXTERNAL_AI: 'true', GEMINI_API_KEY: 'test-key', VITE_FIREBASE_API_KEY: 'test-key', VITE_FIREBASE_PROJECT_ID: 'test-project' });
    globalThis.fetch = async url => { urls.push(url); return { ok: false, status: 400, json: async () => ({ error: { message: 'INVALID_ID_TOKEN' } }) }; };
    const res = { statusCode: 0, setHeader() {}, end() {} };
    try { await handler({ method: 'POST', body: { mode: 'lesson', grade: '2', prompt: 'Vẽ con mèo' }, headers: { authorization: 'Bearer invalid-test-token' } }, res); assert.equal(res.statusCode, 403); assert.ok(!urls.some(url => String(url).includes('generativelanguage.googleapis.com'))); }
    finally { globalThis.fetch = oldFetch; for (const k of keys) if(env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  });
});
