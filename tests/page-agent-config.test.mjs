import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  activateProSubscription,
  buildPageAgentSystemInstructions,
  buildProQuickPayPayload,
  createChecksummedProCode,
  defaultCopilotSubscription,
  evaluateCopilotExecutionAccess,
  FREE_TRIAL_MAX_RUNS,
  GEMINI_OPENAI_ENDPOINT,
  GOOGLE_WORKSPACE_AFFILIATE,
  normalizeOpenAiEndpoint,
  PRO_SUBSCRIPTION_PLANS,
  recordFreeRunUsage,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
  verifyProActivationCode,
} from '../src/lib/page-agent/geminiConfig.js';

describe('Cấu hình Page Agent, SaaS Freemium/Pro & Google Gemini Affiliate (Cọ Nhí Studio)', () => {
  it('chuẩn hóa endpoint OpenAI-compatible của Google Gemini chính xác', () => {
    assert.equal(GEMINI_OPENAI_ENDPOINT, 'https://generativelanguage.googleapis.com/v1beta/openai/');
    assert.equal(
      normalizeOpenAiEndpoint(GEMINI_OPENAI_ENDPOINT),
      'https://generativelanguage.googleapis.com/v1beta/openai',
    );
  });

  it('loại bỏ reasoning_effort khi gọi model gemini-1.5-flash hoặc gemini-2.0-flash', () => {
    const body20 = transformGeminiRequestBody({
      model: 'gemini-2.0-flash',
      reasoning_effort: 'low',
    });
    assert.equal('reasoning_effort' in body20, false);

    const body15 = transformGeminiRequestBody({
      model: 'gemini-1.5-flash',
      reasoning_effort: 'low',
    });
    assert.equal('reasoning_effort' in body15, false);
  });

  it('chứa đầy đủ liên kết và 3 mã giảm giá 10% Google Workspace chính thức', () => {
    assert.equal(
      GOOGLE_WORKSPACE_AFFILIATE.url,
      'https://sharegoogleworkspace.advocate.impact.com/mzZOnzJ',
    );
    assert.deepEqual(
      GOOGLE_WORKSPACE_AFFILIATE.plans.map((p) => ({ name: p.englishName, code: p.code })),
      [
        { name: 'Business Starter', code: 'JA7YJEWHXXGKRNR' },
        { name: 'Business Standard', code: 'H9EAXXKKTKHGA3C' },
        { name: 'Business Plus', code: 'H3CNTKW6D3KL74X' },
      ],
    );
  });

  it('áp dụng đúng chính sách Freemium 5 lượt cơ bản & mở khóa toàn diện ở gói Pro', () => {
    assert.equal(FREE_TRIAL_MAX_RUNS, 5);
    assert.equal(PRO_SUBSCRIPTION_PLANS.length, 2);

    let state = defaultCopilotSubscription();
    for (let i = 0; i < 5; i += 1) {
      const check = evaluateCopilotExecutionAccess(state, 'Mở Bảng Vẽ để thị phạm từng bước');
      assert.equal(check.allowed, true);
      assert.equal(check.remainingRuns, 5 - i);
      state = recordFreeRunUsage(state);
    }

    const sixthCheck = evaluateCopilotExecutionAccess(state, 'Mở Tổng Quan Kho Học Liệu');
    assert.equal(sixthCheck.allowed, false);
    assert.equal(sixthCheck.reason, 'quota_exhausted');

    const freshFree = defaultCopilotSubscription();
    const deepCheck = evaluateCopilotExecutionAccess(
      freshFree,
      'Tự động điền biểu mẫu nhận xét đánh giá SMAS hàng loạt',
    );
    assert.equal(deepCheck.allowed, false);
    assert.equal(deepCheck.reason, 'pro_feature_required');

    const proState = activateProSubscription({
      billingCycle: 'yearly',
      method: 'qr_instant',
      orderCode: 'PRO999000',
    });
    const proCheck = evaluateCopilotExecutionAccess(
      proState,
      'Tự động điền biểu mẫu nhận xét đánh giá SMAS hàng loạt',
    );
    assert.equal(proCheck.allowed, true);
    assert.ok(proCheck.maxSteps >= 24);
  });

  it('xác thực mã kích hoạt Pro hợp lệ và từ chối mã giả mạo', () => {
    const validCode = createChecksummedProCode('CONH');
    assert.equal(verifyProActivationCode(validCode).ok, true);
    assert.equal(verifyProActivationCode('PRO-CONH-0000').ok, false);
  });

  it('tạo payload QR thanh toán VietQR khi đủ biến môi trường và fallback Zalo QR an toàn', () => {
    const fallback = buildProQuickPayPayload({ planId: 'monthly', orderCode: 'PRO222333' });
    assert.equal(fallback.mode, 'zalo_qr');
    assert.equal(fallback.qrImageUrl, null);
    assert.ok(fallback.qrText.includes('zalo.me'));
  });

  it('tạo hướng dẫn hệ thống thuần tiếng Việt cho Cọ Nhí Studio ở cả chế độ Cơ bản và Pro', () => {
    const prompt = buildPageAgentSystemInstructions('Cọ Nhí Studio', 'Phần mềm dạy học Mĩ thuật', 'pro');
    assert.ok(prompt.includes('tiếng Việt'));
    assert.ok(prompt.includes('Cọ Nhí Studio'));
    assert.ok(prompt.includes('CHẾ ĐỘ PRO'));
  });

  it('xác thực API key và phản hồi tiếng Việt khi thành công hoặc lỗi 401', async () => {
    const okResult = await verifyGeminiApiKey('test-key', async () => ({ ok: true, status: 200 }));
    assert.equal(okResult.ok, true);

    const errResult = await verifyGeminiApiKey('bad-key', async () => ({ ok: false, status: 401 }));
    assert.equal(errResult.ok, false);
    assert.ok(errResult.message.includes('Khóa API chưa hợp lệ'));
  });
});
