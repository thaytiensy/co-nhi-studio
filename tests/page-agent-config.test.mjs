import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPageAgentSystemInstructions,
  GEMINI_OPENAI_ENDPOINT,
  GOOGLE_WORKSPACE_AFFILIATE,
  normalizeOpenAiEndpoint,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
} from '../src/lib/page-agent/geminiConfig.js';

describe('Cấu hình Page Agent & Google Gemini Affiliate (Cọ Nhí Studio)', () => {
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

  it('tạo hướng dẫn hệ thống thuần tiếng Việt cho Cọ Nhí Studio', () => {
    const prompt = buildPageAgentSystemInstructions('Cọ Nhí Studio', 'Phần mềm dạy học Mĩ thuật');
    assert.ok(prompt.includes('tiếng Việt'));
    assert.ok(prompt.includes('Cọ Nhí Studio'));
  });

  it('xác thực API key và phản hồi tiếng Việt khi thành công hoặc lỗi 401', async () => {
    const okResult = await verifyGeminiApiKey('test-key', async () => ({ ok: true, status: 200 }));
    assert.equal(okResult.ok, true);

    const errResult = await verifyGeminiApiKey('bad-key', async () => ({ ok: false, status: 401 }));
    assert.equal(errResult.ok, false);
    assert.ok(errResult.message.includes('Khóa API chưa hợp lệ'));
  });
});
