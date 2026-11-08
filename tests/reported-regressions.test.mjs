import assert from 'node:assert/strict';
import test from 'node:test';
import { PEDAGOGY_BANK } from '../src/data/pedagogyBank.js';
import { STEP_DRAWING_TOPICS } from '../src/data/stepDrawingBank.js';
import { generateAiArtwork } from '../src/utils/aiArtworkService.js';
import { buildAnswerFeedback } from '../src/utils/gameFeedbackService.js';
import { findRelevantPedagogyTheme } from '../src/utils/offlineAssistantMatchService.js';

test('art game feedback never calls an incorrect answer correct', () => {
  const question = {
    correctAnswer: 0,
    options: ['Màu Cam', 'Màu Tím'],
    explanation: 'Đúng rồi! Đỏ pha với Vàng tạo thành Màu Cam rực rỡ!',
  };

  assert.equal(buildAnswerFeedback(question, 0), question.explanation);
  assert.equal(
    buildAnswerFeedback(question, 1),
    'Chưa đúng. Đáp án đúng là “Màu Cam”. Đỏ pha với Vàng tạo thành Màu Cam rực rỡ!',
  );
  assert.equal(
    buildAnswerFeedback({ ...question, explanation: 'Tuyệt vời! Em quan sát rất tốt.' }, 1),
    'Chưa đúng. Đáp án đúng là “Màu Cam”. Em quan sát rất tốt.',
  );
});

test('offline assistant only switches to a curriculum theme on a specific match', () => {
  const unrelated = findRelevantPedagogyTheme(
    'Làm sao để giúp học sinh lớp 4 tự tin hơn khi trình bày?',
    PEDAGOGY_BANK.themes,
    1,
  );
  assert.equal(unrelated, null);

  const specific = findRelevantPedagogyTheme(
    'Gợi ý cho Chủ đề 2: Sáng tạo từ những chấm màu, lớp 1',
    PEDAGOGY_BANK.themes,
    5,
  );
  assert.equal(specific?.grade, '1');
  assert.equal(specific?.theme?.id, 'g1_cd2');
});

test('DrawingBoard topic bank export is present for the demonstration module', () => {
  assert.ok(Array.isArray(STEP_DRAWING_TOPICS));
  assert.ok(STEP_DRAWING_TOPICS.length > 0);
  assert.ok(STEP_DRAWING_TOPICS.every((topic) => Array.isArray(topic.steps) && topic.steps.length === 4));
});

test('crayon artwork prompt explicitly reinforces wax-crayon texture without altering watercolor prompts', async () => {
  const prompts = [];
  const mockFetch = async (url) => {
    prompts.push(decodeURIComponent(new URL(url).pathname.slice('/prompt/'.length)));
    return {
      ok: true,
      blob: async () => new Blob([Buffer.from('mock-image')], { type: 'image/jpeg' }),
    };
  };

  await generateAiArtwork({ topic: 'bông hoa trong vườn', grade: 2, style: 'crayon', seed: 7 }, mockFetch);
  await generateAiArtwork({ topic: 'bông hoa trong vườn', grade: 2, style: 'watercolor', seed: 8 }, mockFetch);

  assert.match(prompts[0], /unmistakably a child’s wax-crayon drawing/i);
  assert.match(prompts[0], /visible grainy wax strokes/i);
  assert.match(prompts[0], /not a smooth digital painting/i);
  assert.doesNotMatch(prompts[1], /wax-crayon drawing/i);
});
