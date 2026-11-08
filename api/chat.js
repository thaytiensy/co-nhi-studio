const MODEL = 'qwen/qwen3.8-27b';
const MAX_BODY_BYTES = 128 * 1024;
const MAX_MESSAGES = 11;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 24_000;
const REQUEST_TIMEOUT_MS = 30000;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

function tooLargeError() {
  return Object.assign(new Error('too_large'), { statusCode: 413 });
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const serialized = JSON.stringify(req.body);
    if (Buffer.byteLength(serialized || '', 'utf8') > MAX_BODY_BYTES) throw tooLargeError();
    return req.body;
  }
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) throw tooLargeError();
    try {
      return JSON.parse(req.body);
    } catch {
      throw Object.assign(new Error('invalid_json'), { statusCode: 400 });
    }
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw tooLargeError();
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('invalid_json'), { statusCode: 400 });
  }
}

function systemInstruction({ grade, theme, persona }) {
  const gradeLine = grade ? `Lớp đang hỗ trợ: ${grade}.` : 'Nếu chưa nêu lớp, hỏi gọn khi khác biệt lứa tuổi ảnh hưởng câu trả lời.';
  const themeLine = theme ? `Chủ đề đang chọn trong ứng dụng: ${theme}.` : '';
  const personaLine = persona ? `Giọng trò chuyện mong muốn: ${persona}.` : '';
  return [
    'Bạn là Trợ giảng ART AI của Cọ Nhí Studio, chuyên trò chuyện bằng tiếng Việt tự nhiên về dạy và học Mĩ thuật tiểu học tại Việt Nam.',
    'Hãy hiểu yêu cầu nói tự nhiên, cả cách nói ngắn gọn; giữ ngữ cảnh các lượt trước và trả lời trực tiếp, ấm áp, cụ thể, dễ áp dụng trong lớp. Nếu phù hợp, đưa ra các bước, câu hỏi gợi mở hoặc lời dẫn ngắn; không áp đặt mọi học sinh phải làm giống nhau.',
    gradeLine, themeLine, personaLine,
    'Đây là chat văn bản: không gọi dịch vụ tạo ảnh, không nói rằng đã tạo ảnh/tệp. Nếu người dùng muốn hình ảnh, chỉ tư vấn ý tưởng hoặc prompt và nói rõ thao tác tạo ảnh nằm ở tính năng riêng.',
    'Ưu tiên vật liệu phổ biến, an toàn cho học sinh tiểu học; không hướng dẫn trẻ dùng dao rọc giấy, lưỡi dao, keo nến/súng bắn keo, lửa, vật nóng, hóa chất, dung môi hoặc xăng. Nếu cần cắt, chỉ dùng kéo đầu tròn dưới giám sát giáo viên; có thể đề xuất xé giấy bằng tay.',
    'Không bịa số trang, trích dẫn, quy định hoặc nội dung sách. Nêu rõ khi đây chỉ là gợi ý dự thảo để giáo viên xem lại. Không yêu cầu hay suy đoán thông tin cá nhân của học sinh.',
  ].filter(Boolean).join('\n');
}

function formatUpstreamError(status, upstreamError) {
  const code = typeof upstreamError?.code === 'string' ? upstreamError.code.toLowerCase() : '';
  const message = typeof upstreamError?.message === 'string' ? upstreamError.message.toLowerCase() : '';
  if (status === 429) {
    return { status: 429, error: 'Groq Free đã chạm hạn mức hoặc giới hạn tốc độ. Hãy đợi hạn mức làm mới rồi thử lại; ứng dụng không tự bật billing hay chuyển sang gói trả phí.' };
  }
  if (status === 401) {
    return { status: 502, error: 'Groq chưa chấp nhận khóa máy chủ. Kiểm tra GROQ_API_KEY trong cấu hình máy chủ; không nhập khóa trong trình duyệt.' };
  }
  if (status === 403) {
    return { status: 502, error: 'Khóa Groq hiện không có quyền gọi model này. Hãy kiểm tra quyền truy cập Free; ứng dụng không tự đổi model hoặc bật billing.' };
  }
  if (status === 404 || code.includes('model') || message.includes('model')) {
    return { status: 503, error: `Model ${MODEL} hiện không khả dụng cho khóa này. Không tự chuyển sang model hoặc gói khác.` };
  }
  if (status === 400 || status === 422) {
    return { status: 422, error: 'Groq không xử lý được yêu cầu này. Nội dung chưa được tạo; hãy thử viết ngắn hoặc rõ hơn.' };
  }
  if (status >= 500) {
    return { status: 503, error: 'Groq hiện tạm thời không khả dụng. Hãy thử lại sau.' };
  }
  return { status: 502, error: 'Groq không xử lý được yêu cầu. Nội dung chưa được tạo; hãy thử lại sau.' };
}

function writeStreamEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

async function streamGroqResponse(response, res) {
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-cache, no-transform');
  res.setHeader?.('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let fullText = '';
  let finishReason = '';
  const sendDelta = (delta) => {
    fullText += delta;
    writeStreamEvent(res, { delta });
  };
  const consumeEvent = (eventText) => {
    const data = eventText.split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!data) return false;
    if (data === '[DONE]') return true;
    try {
      const chunk = JSON.parse(data);
      const choice = chunk?.choices?.[0];
      const delta = choice?.delta?.content;
      if (typeof delta === 'string' && delta) sendDelta(delta);
      if (typeof choice?.finish_reason === 'string') finishReason = choice.finish_reason;
    } catch { /* Ignore malformed provider chunks; never expose raw data. */ }
    return false;
  };

  try {
    const reader = response.body?.getReader?.();
    if (reader) {
      const decoder = new TextDecoder();
      let pending = '';
      let streamDone = false;
      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        const events = pending.split(/\r?\n\r?\n/);
        pending = events.pop() || '';
        for (const eventText of events) {
          if (consumeEvent(eventText)) {
            streamDone = true;
            break;
          }
        }
      }
      pending += decoder.decode();
      if (pending.trim()) consumeEvent(pending);
      reader.releaseLock?.();
    } else {
      const result = await response.json();
      const text = result?.choices?.[0]?.message?.content;
      if (typeof text === 'string' && text.trim()) sendDelta(text);
      else finishReason = result?.choices?.[0]?.finish_reason || '';
    }
  } catch {
    writeStreamEvent(res, { error: 'Luồng phản hồi Groq bị ngắt. Hãy thử lại sau.' });
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  if (!fullText) {
    const error = finishReason === 'content_filter'
      ? 'Groq không thể trả lời yêu cầu này theo bộ lọc an toàn. Hãy thử cách diễn đạt khác.'
      : 'Groq không trả về nội dung văn bản. Chưa có câu trả lời được tạo.';
    writeStreamEvent(res, { error });
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Chỉ hỗ trợ POST.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return sendJson(res, 503, { error: 'Chat Groq Free chưa được bật: máy chủ chưa có GROQ_API_KEY. Không cần đưa khóa vào trình duyệt hoặc bật thanh toán.' });
  }

  let input;
  try {
    input = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.statusCode === 413 ? 'Yêu cầu quá dài; hãy rút gọn tin nhắn.' : 'Dữ liệu chat không hợp lệ.' });
  }

  const rawMessages = Array.isArray(input?.messages) ? input.messages.slice(-MAX_MESSAGES) : [];
  const streamRequested = input?.stream === true;
  if (!rawMessages.length) return sendJson(res, 400, { error: 'Hãy gửi ít nhất một tin nhắn.' });

  let totalChars = 0;
  const messages = [];
  for (const message of rawMessages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return sendJson(res, 400, { error: 'Định dạng lịch sử trò chuyện không hợp lệ.' });
    }
    const text = message.content.trim();
    if (!text || text.length > MAX_MESSAGE_CHARS) {
      return sendJson(res, 400, { error: 'Tin nhắn rỗng hoặc quá dài; giới hạn 4.000 ký tự mỗi lượt.' });
    }
    totalChars += text.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return sendJson(res, 413, { error: 'Lịch sử chat quá dài; hãy bắt đầu cuộc trò chuyện mới hoặc rút gọn tin nhắn.' });
    }
    messages.push({ role: message.role, content: text });
  }
  if (!messages.some((message) => message.role === 'user')) {
    return sendJson(res, 400, { error: 'Lịch sử chat cần có tin nhắn của người dùng.' });
  }

  const gradeNumber = Number(input.grade);
  const context = {
    grade: Number.isInteger(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 5 ? `lớp ${gradeNumber}` : '',
    theme: typeof input.theme === 'string' ? input.theme.trim().slice(0, 160) : '',
    persona: typeof input.persona === 'string' ? input.persona.trim().slice(0, 80) : '',
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemInstruction(context) }, ...messages],
        temperature: 0.7,
        top_p: 0.8,
        max_completion_tokens: 1200,
        reasoning_effort: 'none',
        stream: streamRequested,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let upstreamError = {};
      try {
        upstreamError = (await response.json())?.error || {};
      } catch { /* do not expose raw upstream response */ }
      if (response.status === 429) {
        const retryAfter = response.headers?.get?.('retry-after');
        if (typeof retryAfter === 'string' && /^\d+$/.test(retryAfter)) res.setHeader?.('Retry-After', retryAfter);
      }
      const mapped = formatUpstreamError(response.status, upstreamError);
      return sendJson(res, mapped.status, { error: mapped.error });
    }

    if (streamRequested) {
      await streamGroqResponse(response, res);
      return;
    }

    const result = await response.json();
    const text = typeof result?.choices?.[0]?.message?.content === 'string'
      ? result.choices[0].message.content.trim()
      : '';
    if (!text) {
      const reason = result?.choices?.[0]?.finish_reason;
      if (reason === 'content_filter') {
        return sendJson(res, 422, { error: 'Groq không thể trả lời yêu cầu này theo bộ lọc an toàn. Hãy thử cách diễn đạt khác.' });
      }
      return sendJson(res, 502, { error: 'Groq không trả về nội dung văn bản. Chưa có câu trả lời được tạo.' });
    }
    return sendJson(res, 200, { text });
  } catch (error) {
    if (error?.name === 'AbortError') return sendJson(res, 504, { error: 'Groq phản hồi quá lâu. Chưa có câu trả lời; hãy thử lại sau.' });
    return sendJson(res, 503, { error: 'Không kết nối được dịch vụ chat Groq. Kiểm tra mạng và thử lại.' });
  } finally {
    clearTimeout(timer);
  }
}
