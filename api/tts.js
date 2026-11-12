import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import https from 'https';

const ttsCache = new Map();
let ttsQueue = Promise.resolve();

// Rate limiting: theo dõi tần suất yêu cầu chống lạm dụng (tối đa 30 request/phút/IP)
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MINUTE = 30;
const MAX_TEXT_LENGTH = 500;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;
  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => t > windowStart);
  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

function fetchGoogleTtsChunk(text) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Google TTS status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function synthesizeGoogleTts(cleanText) {
  const words = cleanText.split(/\s+/);
  const segments = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= 150) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) segments.push(current);
      current = word;
    }
  }
  if (current) segments.push(current);

  const buffers = [];
  for (const seg of segments) {
    const buf = await fetchGoogleTtsChunk(seg);
    if (buf && buf.length > 0) buffers.push(buf);
  }
  return Buffer.concat(buffers);
}

async function synthesizeEdgeTtsWithRetry(cleanText, voiceName) {
  const task = ttsQueue.then(async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      let tts = null;
      try {
        tts = new MsEdgeTTS();
        await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(cleanText, { rate: '+0%', pitch: '+0Hz', volume: '+0%' });
        const chunks = [];

        await new Promise((resChunk, rejChunk) => {
          const timer = setTimeout(() => {
            if (chunks.length > 0) resChunk();
            else rejChunk(new Error('Timeout Edge TTS'));
          }, 8000);

          audioStream.on('data', c => chunks.push(c));
          audioStream.on('end', () => {
            clearTimeout(timer);
            resChunk();
          });
          audioStream.on('error', (err) => {
            clearTimeout(timer);
            if (chunks.length > 0) resChunk();
            else rejChunk(err);
          });
        });

        const audioBuf = Buffer.concat(chunks);
        if (audioBuf.length > 0) return audioBuf;
        throw new Error('Edge TTS trả về âm thanh rỗng');
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise(r => setTimeout(r, 200));
      } finally {
        if (tts) {
          try { tts.close(); } catch (_) {}
          tts = null;
        }
      }
    }
    throw new Error('Không thể tổng hợp âm thanh qua Edge TTS');
  });

  ttsQueue = task.catch(() => undefined);
  return task;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ chấp nhận GET.' });

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu đọc. Vui lòng thử lại sau.' });
  }

  try {
    const text = req.query.text || '';
    const voiceParam = req.query.voice || 'male';

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Thiếu nội dung văn bản cần đọc.' });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      res.status(400).json({ error: `Văn bản quá dài (${text.length} ký tự). Vui lòng giới hạn dưới ${MAX_TEXT_LENGTH} ký tự mỗi lượt đọc.` });
      return;
    }

    const cleanText = text
      .replace(/\s*&\s*/g, ' và ')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
      .replace(/[#*_`~<>{}[\]\\-]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const isFemale = voiceParam === 'female' || voiceParam === 'vi-VN-HoaiMyNeural' || String(voiceParam).toLowerCase().includes('nu');
    const voiceName = isFemale ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural';
    const cacheKey = `${voiceName}_${cleanText}`;

    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', cached.length);
      res.setHeader('X-TTS-Voice', voiceName);
      res.status(200).send(cached);
      return;
    }

    // 1. Edge Neural TTS
    try {
      const audioBuf = await synthesizeEdgeTtsWithRetry(cleanText, voiceName);
      if (audioBuf && audioBuf.length > 0) {
        ttsCache.set(cacheKey, audioBuf);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuf.length);
        res.setHeader('X-TTS-Voice', voiceName);
        res.status(200).send(audioBuf);
        return;
      }
    } catch (edgeErr) {
      console.warn(`[Vercel TTS] MsEdgeTTS (${voiceName}) failed:`, edgeErr.message);
    }

    // 2. Google TTS Fallback (Hỗ trợ 100% dự phòng cho cả Giọng Thầy và Giọng Cô để không bao giờ bị lỗi ở slide 2+)
    try {
      const googleBuf = await synthesizeGoogleTts(cleanText);
      if (googleBuf && googleBuf.length > 0) {
        ttsCache.set(cacheKey, googleBuf);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', googleBuf.length);
        res.setHeader('X-TTS-Voice', isFemale ? 'Google-Vietnamese-Female' : 'Google-Vietnamese-Male-Fallback');
        res.status(200).send(googleBuf);
        return;
      }
    } catch (gErr) {
      console.warn('[Vercel TTS] Google TTS fallback failed:', gErr.message);
    }

    // Trả thông báo lỗi an toàn, không văng stack trace hay chi tiết nội bộ ra client
    res.status(502).json({ error: 'Dịch vụ giọng đọc trực tuyến tạm thời gián đoạn. Ứng dụng sẽ chuyển sang giọng đọc máy cục bộ.' });
  } catch (err) {
    console.error('[Vercel TTS Internal Error]:', err);
    res.status(500).json({ error: 'Đã có lỗi xảy ra trong quá trình tổng hợp giọng đọc.' });
  }
}
