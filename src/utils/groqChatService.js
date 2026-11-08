const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_CHARS = 1800;
const MAX_USER_MESSAGE_CHARS = 4000;

async function readGroqEventStream(response, onDelta) {
  let output = '';
  const consumeEvent = (eventText) => {
    const data = eventText.split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!data) return false;
    if (data === '[DONE]') return true;
    const event = JSON.parse(data);
    if (typeof event.error === 'string') throw new Error(event.error);
    if (typeof event.delta === 'string' && event.delta) {
      output += event.delta;
      onDelta?.(event.delta);
    }
    return false;
  };

  const reader = response.body?.getReader?.();
  if (!reader) {
    const raw = await response.text();
    for (const eventText of raw.split(/\r?\n\r?\n/)) consumeEvent(eventText);
  } else {
    const decoder = new TextDecoder();
    let pending = '';
    try {
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
    } finally {
      reader.releaseLock?.();
    }
  }

  if (!output.trim()) throw new Error('Groq không trả về câu trả lời văn bản.');
  return output.trim();
}

export async function requestGroqChat({ grade, theme = '', persona = '', messages }, fetchImpl = globalThis.fetch, onDelta) {
  if (typeof fetchImpl !== 'function') throw new Error('Trình duyệt hiện không hỗ trợ kết nối chat.');
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('Hãy nhập tin nhắn trước.');

  const selectedMessages = messages.slice(-(MAX_HISTORY_MESSAGES + 1));
  const safeMessages = selectedMessages.map((message, index) => {
    const role = message?.role;
    const content = String(message?.content || '').trim();
    const isCurrentUserMessage = index === selectedMessages.length - 1 && role === 'user';
    if (isCurrentUserMessage && content.length > MAX_USER_MESSAGE_CHARS) {
      throw new Error('Tin nhắn quá dài; giới hạn 4.000 ký tự mỗi lượt.');
    }
    return {
      role,
      content: isCurrentUserMessage ? content : content.slice(-MAX_HISTORY_CHARS),
    };
  }).filter((message) => ['user', 'assistant'].includes(message.role) && message.content);
  if (!safeMessages.length) throw new Error('Hãy nhập tin nhắn trước.');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);
  try {
    const response = await fetchImpl('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, theme, persona, messages: safeMessages, stream: true }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || `Groq phản hồi lỗi ${response.status}.`);
    }
    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType.includes('text/event-stream')) return await readGroqEventStream(response, onDelta);

    const result = await response.json().catch(() => ({}));
    if (typeof result.text !== 'string' || !result.text.trim()) throw new Error('Groq không trả về câu trả lời văn bản.');
    onDelta?.(result.text.trim());
    return result.text.trim();
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Chat Groq Free phản hồi quá lâu. Hãy thử lại sau.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
