import assert from 'node:assert/strict';
import { test } from 'node:test';
import chatHandler, { resetChatRateLimits } from '../api/chat.js';
import { signSessionToken } from '../server/sessionToken.js';
import { requestGroqChat } from '../src/utils/groqChatService.js';

const TEST_SESSION_SECRET = 'test-session-secret-for-unit-tests-only-32bytes';

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

function makeAuthHeader(email = 'teacher@example.com', role = 'teacher') {
  const token = signSessionToken({ uid: 'u-test', email, role }, TEST_SESSION_SECRET);
  return `Bearer ${token}`;
}

async function invokeChat(body, { method = 'POST', headers = {}, ip = '10.0.0.1' } = {}) {
  const response = createResponse();
  const finalHeaders = {
    authorization: makeAuthHeader(),
    'x-forwarded-for': ip,
    ...headers,
  };
  await chatHandler({ method, body, headers: finalHeaders }, response);
  return { status: response.statusCode, headers: response.headers, body: JSON.parse(response.body) };
}

async function withEnv(overrides, operation) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetChatRateLimits();
  try {
    await operation();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    resetChatRateLimits();
  }
}

async function withMockFetch(fetchImpl, operation) {
  const previous = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    await operation();
  } finally {
    globalThis.fetch = previous;
  }
}

test('Groq chat rejects unauthenticated or forged Bearer requests with 401', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    let providerCalls = 0;
    await withMockFetch(async () => {
      providerCalls += 1;
      throw new Error('Provider should not be called for unauthorized requests');
    }, async () => {
      const noHeader = await invokeChat(
        { messages: [{ role: 'user', content: 'Xin chào.' }] },
        { headers: { authorization: '' } }
      );
      assert.equal(noHeader.status, 401);

      const forged = await invokeChat(
        { messages: [{ role: 'user', content: 'Xin chào.' }] },
        { headers: { authorization: 'Bearer invalid.token.signature' } }
      );
      assert.equal(forged.status, 401);
      assert.equal(providerCalls, 0);
    });
  });
});

test('Groq chat enforces sliding-window rate limit (20 req/min) with 429', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    await withMockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Gợi ý ngắn.' } }] }),
    }), async () => {
      for (let i = 0; i < 20; i += 1) {
        const res = await invokeChat({ messages: [{ role: 'user', content: `Câu ${i}` }] }, { ip: '198.51.100.20' });
        assert.equal(res.status, 200);
      }
      const blocked = await invokeChat({ messages: [{ role: 'user', content: 'Câu 21' }] }, { ip: '198.51.100.20' });
      assert.equal(blocked.status, 429);
      assert.ok(Number(blocked.headers['retry-after']) >= 1);
      assert.match(blocked.body.error, /20 lượt\/phút/);
    });
  });
});

test('Groq chat keeps Vietnamese ART context and conversation history using a server-side key', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used-outside-this-mock', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    let capturedUrl;
    let capturedOptions;
    await withMockFetch(async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'Có thể cho các em quan sát hình chiếc lá trước.' } }] }),
      };
    }, async () => {
      const result = await invokeChat({
        grade: 4,
        theme: 'Lá cây',
        persona: 'Cô Nhí',
        messages: [
          { role: 'user', content: 'Tôi dạy lớp 4 về lá cây.' },
          { role: 'assistant', content: 'Mình có thể bắt đầu bằng quan sát.' },
          { role: 'user', content: 'Gợi ý thêm một hoạt động nhé.' },
        ],
      });

      assert.equal(result.status, 200);
      assert.match(result.body.text, /chiếc lá/);
      assert.equal(capturedUrl, 'https://api.groq.com/openai/v1/chat/completions');
      assert.equal(capturedOptions.headers.Authorization, 'Bearer test-key-never-used-outside-this-mock');
      const payload = JSON.parse(capturedOptions.body);
      assert.equal(payload.model, 'qwen/qwen3.8-27b');
      assert.equal(payload.messages[0].role, 'system');
      assert.match(payload.messages[0].content, /Trợ giảng ART AI/);
      assert.match(payload.messages[0].content, /lớp 4/);
      assert.deepEqual(payload.messages.slice(1).map(({ role }) => role), ['user', 'assistant', 'user']);
      assert.equal(JSON.stringify(payload).includes('test-key-never-used-outside-this-mock'), false);
    });
  });
});

test('Groq chat streams deltas to the client without changing the Free model or exposing the key', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used-outside-this-mock', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    let capturedOptions;
    const encoder = new TextEncoder();
    const upstreamChunks = [
      'data: {"choices":[{"delta":{"content":"Cùng quan sát"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" màu nóng và lạnh."},"finish_reason":"stop"}]}\n\n',
      'data: [DONE]\n\n',
    ];
    await withMockFetch(async (_url, options) => {
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        body: new ReadableStream({
          start(controller) {
            upstreamChunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
            controller.close();
          },
        }),
      };
    }, async () => {
      const response = createResponse();
      response.body = '';
      response.write = function write(chunk) { this.body += chunk; };
      response.end = function end(chunk = '') { this.body += chunk; };
      await chatHandler({
        method: 'POST',
        headers: { authorization: makeAuthHeader(), 'x-forwarded-for': '10.0.0.2' },
        body: { grade: 1, messages: [{ role: 'user', content: 'Gợi ý hoạt động về màu sắc.' }], stream: true },
      }, response);

      assert.equal(response.statusCode, 200);
      assert.equal(response.headers['content-type'], 'text/event-stream; charset=utf-8');
      assert.match(response.body, /"delta":"Cùng quan sát"/);
      assert.match(response.body, /"delta":" màu nóng và lạnh\."/);
      assert.match(response.body, /data: \[DONE\]/);
      const payload = JSON.parse(capturedOptions.body);
      assert.equal(payload.model, 'qwen/qwen3.8-27b');
      assert.equal(payload.stream, true);
      assert.equal(JSON.stringify(payload).includes('test-key-never-used-outside-this-mock'), false);
    });
  });
});

test('Groq chat client forwards Bearer token and streamed Vietnamese deltas to the UI', async () => {
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"delta":"Hãy cho các em"}\n\n',
    'data: {"delta":" quan sát trước."}\n\n',
    'data: [DONE]\n\n',
  ];
  let requestPayload;
  let capturedHeaders;
  const receivedDeltas = [];
  const result = await requestGroqChat({
    grade: 2,
    messages: [{ role: 'user', content: 'Gợi ý cách dạy vẽ.' }],
    authToken: 'signed-session-token-demo',
  }, async (_url, options) => {
    requestPayload = JSON.parse(options.body);
    capturedHeaders = options.headers;
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream; charset=utf-8' },
      body: new ReadableStream({
        start(controller) {
          chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
          controller.close();
        },
      }),
    };
  }, (delta) => receivedDeltas.push(delta));

  assert.equal(capturedHeaders.Authorization, 'Bearer signed-session-token-demo');
  assert.equal(requestPayload.stream, true);
  assert.deepEqual(receivedDeltas, ['Hãy cho các em', ' quan sát trước.']);
  assert.equal(result, 'Hãy cho các em quan sát trước.');
});

test('Groq chat explains Free quota limits without enabling billing', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used-outside-this-mock', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    await withMockFetch(async () => ({
      ok: false,
      status: 429,
      headers: { get: (name) => name === 'retry-after' ? '30' : null },
      json: async () => ({ error: { type: 'rate_limit_exceeded', message: 'mocked provider message' } }),
    }), async () => {
      const result = await invokeChat({ messages: [{ role: 'user', content: 'Xin gợi ý hoạt động.' }] });
      assert.equal(result.status, 429);
      assert.match(result.body.error, /Groq Free/);
      assert.match(result.body.error, /không tự bật billing/);
      assert.equal(result.headers['retry-after'], '30');
    });
  });
});

test('Groq chat returns a clear setup message when the server has no key', async () => {
  await withEnv({ GROQ_API_KEY: undefined, CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    await withMockFetch(async () => {
      throw new Error('A real provider request must not run in this test.');
    }, async () => {
      const result = await invokeChat({ messages: [{ role: 'user', content: 'Xin chào.' }] });
      assert.equal(result.status, 503);
      assert.match(result.body.error, /GROQ_API_KEY/);
      assert.match(result.body.error, /không cần đưa khóa vào trình duyệt/i);
    });
  });
});

test('Groq chat rejects oversized messages before calling the provider', async () => {
  await withEnv({ GROQ_API_KEY: 'test-key-never-used-outside-this-mock', CONHI_SESSION_SECRET: TEST_SESSION_SECRET }, async () => {
    let requestCount = 0;
    await withMockFetch(async () => {
      requestCount += 1;
      throw new Error('A provider request must not run for oversized input.');
    }, async () => {
      const result = await invokeChat({ messages: [{ role: 'user', content: 'x'.repeat(4001) }] });
      assert.equal(result.status, 400);
      assert.match(result.body.error, /4.000 ký tự/);
      assert.equal(requestCount, 0);
    });
  });
});
