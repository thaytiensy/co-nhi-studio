import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import https from 'https';

const ttsCache = new Map();
let ttsQueue = Promise.resolve();

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
      try {
        const tts = new MsEdgeTTS();
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
        await new Promise(r => setTimeout(r, 350));
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const text = req.query.text || '';
    const voiceParam = req.query.voice || 'male';

    if (!text.trim()) {
      res.status(400).json({ error: 'Thiếu nội dung văn bản' });
      return;
    }

    const cleanText = text
      .replace(/[#*_`~-]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 1000)
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

    // 2. Google TTS Fallback
    // LƯU Ý SƯ PHẠM: Google Translate TTS là giọng NỮ chuẩn tiếng Việt.
    // Chỉ phục vụ khi người dùng chọn Cô giáo (isFemale = true).
    // Nếu chọn Thầy giáo (Nam), trả về 404 để frontend kích hoạt giọng Nam qua Web Speech API với pitch 0.52 trầm ấm.
    if (isFemale) {
      try {
        const googleBuf = await synthesizeGoogleTts(cleanText);
        if (googleBuf && googleBuf.length > 0) {
          ttsCache.set(cacheKey, googleBuf);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', googleBuf.length);
          res.setHeader('X-TTS-Voice', 'Google-Vietnamese-Female');
          res.status(200).send(googleBuf);
          return;
        }
      } catch (gErr) {
        console.warn('[Vercel TTS] Google TTS fallback failed:', gErr.message);
      }
    }

    res.status(500).json({ error: 'Không thể tổng hợp giọng đọc' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
