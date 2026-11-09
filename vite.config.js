import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import https from 'https'
import chatHandler from './api/chat.js'

const ttsCache = new Map();
let ttsQueue = Promise.resolve();

async function synthesizeEdgeTtsWithRetry(cleanText, voiceName) {
  const task = ttsQueue.then(async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(cleanText);
        const chunks = [];

        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            if (chunks.length > 0) resolve();
            else reject(new Error('Timeout Edge TTS'));
          }, 8000);

          audioStream.on('data', chunk => chunks.push(chunk));
          audioStream.on('end', () => {
            clearTimeout(timer);
            resolve();
          });
          audioStream.on('error', error => {
            clearTimeout(timer);
            if (chunks.length > 0) resolve();
            else reject(error);
          });
        });

        const audioBuffer = Buffer.concat(chunks);
        if (audioBuffer.length > 0) return audioBuffer;
        throw new Error('Edge TTS trả về âm thanh rỗng');
      } catch (error) {
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }
    throw new Error('Không thể tổng hợp âm thanh qua Edge TTS');
  });

  // Luôn phục hồi hàng đợi cho request kế tiếp, kể cả khi task hiện tại bị lỗi.
  ttsQueue = task.catch(() => undefined);
  return task;
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

const ttsPlugin = () => ({
  name: 'co-nhi-tts-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/tts')) {
        return next();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      try {
        const parsedUrl = new URL(req.url, 'http://localhost:3100');
        const text = parsedUrl.searchParams.get('text') || '';
        const voiceParam = parsedUrl.searchParams.get('voice') || 'male';

        if (!text.trim()) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Thiếu nội dung văn bản' }));
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
          res.statusCode = 200;
          res.end(cached);
          return;
        }

        // Ưu tiên 1: Microsoft Edge Neural TTS (Nam: NamMinh, Nữ: HoaiMy) với cơ chế Hàng đợi & Thử lại tự động
        try {
          const audioBuf = await synthesizeEdgeTtsWithRetry(cleanText, voiceName);
          if (audioBuf && audioBuf.length > 0) {
            ttsCache.set(cacheKey, audioBuf);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', audioBuf.length);
            res.setHeader('X-TTS-Voice', voiceName);
            res.statusCode = 200;
            res.end(audioBuf);
            return;
          }
        } catch (edgeErr) {
          console.warn(`[Vite TTS] MsEdgeTTS (${voiceName}) failed:`, edgeErr.message);
        }

        // Ưu tiên 2: Google Vietnamese TTS Fallback (Dự phòng 100% tiếng Việt chuẩn, không bao giờ lỗi)
        try {
          const googleBuf = await synthesizeGoogleTts(cleanText);
          if (googleBuf && googleBuf.length > 0) {
            ttsCache.set(cacheKey, googleBuf);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', googleBuf.length);
            res.setHeader('X-TTS-Voice', isFemale ? 'Google-Vietnamese-Female' : 'Google-Vietnamese');
            res.statusCode = 200;
            res.end(googleBuf);
            return;
          }
        } catch (gErr) {
          console.warn('[Vite TTS] Google TTS fallback failed:', gErr.message);
        }

        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Không thể tổng hợp giọng đọc' }));
      } catch (err) {
        console.error('[Vite TTS Server Error]:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

const groqChatPlugin = () => ({
  name: 'co-nhi-groq-chat-middleware',
  config(_, { mode }) {
    const localEnv = loadEnv(mode, process.cwd(), 'GROQ_');
    if (!process.env.GROQ_API_KEY && localEnv.GROQ_API_KEY) process.env.GROQ_API_KEY = localEnv.GROQ_API_KEY;
  },
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || new URL(req.url, 'http://localhost').pathname !== '/api/chat') return next();
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      try {
        await chatHandler(req, res);
      } catch {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Lỗi máy chủ chat. Chưa có câu trả lời được tạo.' }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ttsPlugin(), groqChatPlugin()],
  server: {
    port: 3100,
    host: '127.0.0.1'
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  }
})
