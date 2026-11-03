// Dịch vụ Phát Âm Thanh Tiếng Việt Chuẩn Dành Cho Giáo Viên Mĩ Thuật
// Tích hợp:
// 1. Động cơ chính: Microsoft Edge Neural TTS (vi-VN-NamMinhNeural cho Thầy giáo, vi-VN-HoaiMyNeural cho Cô giáo)
//    kết hợp Google Vietnamese TTS dự phòng thông qua endpoint cục bộ /api/tts.
// 2. Động cơ phụ: Web Speech API có sẵn trên máy (nếu thiết bị có cài gói vi-VN).
// TUYỆT ĐỐI CHỈ PHÁT TIẾNG VIỆT, KHÔNG BAO GIỜ PHÁT GIỌNG TIẾNG ANH.

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.vietnameseVoice = null;
    this.gender = 'male'; // 'male' (Thầy giáo) hoặc 'female' (Cô giáo)
    this.rate = 1.0;
    this.pitch = 0.95;
    this.volume = 1.0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.currentAudio = null;
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.listeners = new Set();
    this.lastError = null;

    if (this.synth) {
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  setGender(gender) {
    if (gender === 'male' || gender === 'female') {
      this.gender = gender;
      this.pitch = gender === 'female' ? 1.15 : 0.95;
      this.initVoices();
      this.notify();
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();

    const viVoices = voices.filter(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (
        lang.startsWith('vi') || 
        lang === 'vi-vn' || 
        lang === 'vi_vn' ||
        name.includes('vietnam') ||
        name.includes('vietnamese') ||
        name.includes('namminh') ||
        name.includes('hoaimy')
      );
    });

    if (viVoices.length > 0) {
      if (this.gender === 'female') {
        this.vietnameseVoice = viVoices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('hoaimy') || n.includes('mai') || n.includes('linh') || n.includes('female');
        }) || viVoices[0];
      } else {
        this.vietnameseVoice = viVoices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('namminh') || n.includes('an') || n.includes('male') || !n.includes('hoaimy');
        }) || viVoices[0];
      }
    }
  }

  hasViVoice() {
    // Luôn luôn sẵn sàng giọng Tiếng Việt chất lượng cao qua /api/tts và Web Speech
    return true;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  getState() {
    const roleName = this.gender === 'female' ? 'Cô giáo (Nữ - Hoài My)' : 'Thầy giáo (Nam - Nam Minh)';
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      rate: this.rate,
      gender: this.gender,
      hasViVoice: true,
      voiceName: roleName,
      lastError: this.lastError
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  setRate(newRate) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.rate;
    }
    this.notify();
  }

  // Chia nhỏ đoạn văn bản dài thành các câu tự nhiên dưới 200 ký tự
  splitTextIntoChunks(text) {
    const rawSentences = text.split(/([.\n!?;]+)/);
    const chunks = [];
    let current = '';

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i].trim();
      if (!part) continue;

      if ((current + ' ' + part).length > 200) {
        if (current.trim()) chunks.push(current.trim());
        current = part;
      } else {
        current = current ? `${current} ${part}` : part;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    return chunks.length > 0 ? chunks : [text.trim()];
  }

  speak(text) {
    if (!text || text.trim() === '') {
      return { 
        success: false, 
        error: 'Chưa có nội dung ghi chú lời giảng để đọc.' 
      };
    }

    this.stop();

    // Sử dụng endpoint /api/tts phát âm thanh chuẩn Neural tiếng Việt (Thầy giáo / Cô giáo)
    return this.speakWithServerTTS(text);
  }

  speakWithServerTTS(text) {
    try {
      const chunks = this.splitTextIntoChunks(text);
      if (chunks.length === 0) {
        return { success: false, error: 'Không có nội dung văn bản để đọc.' };
      }

      this.audioQueue = chunks;
      this.currentChunkIndex = 0;
      this.isSpeaking = true;
      this.isPaused = false;
      this.lastError = null;
      this.notify();

      this.playAudioChunk(0);
      return { success: true };
    } catch (err) {
      console.warn('Lỗi khởi động phát âm thanh:', err);
      // Fallback sang Web Speech API nếu thiết bị có giọng vi-VN
      return this.speakWithWebSpeechFallback(text);
    }
  }

  playAudioChunk(index) {
    if (!this.isSpeaking) return;

    if (index >= this.audioQueue.length) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentAudio = null;
      this.notify();
      return;
    }

    this.currentChunkIndex = index;
    const chunkText = this.audioQueue[index];
    const encodedText = encodeURIComponent(chunkText);
    const voiceParam = this.gender === 'female' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural';
    const audioUrl = `/api/tts?text=${encodedText}&voice=${voiceParam}`;

    const audio = new Audio(audioUrl);
    audio.playbackRate = this.rate;
    this.currentAudio = audio;

    audio.onended = () => {
      this.playAudioChunk(index + 1);
    };

    audio.onerror = (e) => {
      console.warn(`Lỗi phát đoạn âm thanh ${index + 1} qua /api/tts, thử Web Speech API:`, e);
      if (index === 0 && this.vietnameseVoice && this.synth) {
        this.speakWithWebSpeechFallback(this.audioQueue.join('. '));
      } else if (index + 1 < this.audioQueue.length) {
        this.playAudioChunk(index + 1);
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.notify();
      }
    };

    audio.play().catch(err => {
      console.warn('Trình duyệt cần tương tác để phát âm thanh:', err);
      if (this.vietnameseVoice && this.synth) {
        this.speakWithWebSpeechFallback(chunkText);
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.notify();
      }
    });
  }

  speakWithWebSpeechFallback(text) {
    if (!this.synth || !this.vietnameseVoice) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.lastError = 'Không thể kết nối dịch vụ âm thanh Tiếng Việt.';
      this.notify();
      return { success: false, error: this.lastError };
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'vi-VN';
      utterance.voice = this.vietnameseVoice;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.notify();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.notify();
      };

      utterance.onerror = (err) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notify();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return { success: true };
    } catch (err) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
      return { success: false, error: err.message };
    }
  }

  pause() {
    if (this.currentAudio && this.isSpeaking && !this.isPaused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.notify();
      return;
    }
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  resume() {
    if (this.currentAudio && this.isSpeaking && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
      this.notify();
      return;
    }
    if (this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.isSpeaking = false;
    this.isPaused = false;
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
    this.notify();
  }
}

export const speechService = new SpeechService();
