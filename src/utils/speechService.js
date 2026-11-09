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
    const savedGender = typeof window !== 'undefined' ? localStorage.getItem('conhi_voice_gender') : null;
    this.gender = (savedGender === 'female' || savedGender === 'male') ? savedGender : 'male';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.currentAudio = null;
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.listeners = new Set();
    this.lastError = null;
    this.playbackId = 0;

    if (this.synth) {
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  setGender(gender) {
    if (gender === 'male' || gender === 'female') {
      if (this.gender !== gender) this.stop();
      this.gender = gender;
      this.pitch = 1.0;
      this.lastError = null;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('conhi_voice_gender', gender);
        } catch (_) {}
      }
      this.initVoices();
      this.notify();
    }
  }

  initVoices() {
    if (!this.synth) {
      this.vietnameseVoice = null;
      return;
    }
    const voices = this.synth.getVoices();

    const viVoices = voices.filter(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (
        lang.startsWith('vi') || 
        lang === 'vi-vn' || 
        lang === 'vi_vn' ||
        lang.includes('vi') ||
        name.includes('vietnam') ||
        name.includes('vietnamese') ||
        name.includes('tiếng việt') ||
        name.includes('namminh') ||
        name.includes('hoaimy') ||
        name.includes('an')
      );
    });

    this.vietnameseVoice = viVoices.find(voice => this.voiceMatchesGender(voice)) || viVoices[0] || null;
  }

  voiceMatchesGender(voice) {
    if (!voice) return false;
    const name = String(voice.name || '').toLowerCase();
    const explicitFemale = /hoaimy|female|woman|\bnữ\b|linh|chi|my/.test(name);
    const explicitMale = /namminh|(^|[^a-z])male([^a-z]|$)|(^|[^a-z])man([^a-z]|$)|nam|an/.test(name);
    if (this.gender === 'female') {
      return explicitFemale || (!explicitMale);
    }
    return explicitMale || (!explicitFemale);
  }

  hasViVoice() {
    return Boolean(this.vietnameseVoice);
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
      hasViVoice: this.hasViVoice(),
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

  // Giữ câu trọn vẹn khi có thể; giới hạn mỗi yêu cầu để voice fallback không ghép nhiều MP3 rời.
  splitTextIntoChunks(text) {
    const rawSentences = String(text).match(/[^.!?;\n]+[.!?;]*|\n+/g) || [];
    const chunks = [];
    let current = '';

    for (const rawSentence of rawSentences) {
      const part = rawSentence.replace(/\s+/g, ' ').trim();
      if (!part) continue;

      if (part.length > 140) {
        if (current) chunks.push(current);
        current = '';
        for (const word of part.split(/\s+/)) {
          if (current && `${current} ${word}`.length > 140) {
            chunks.push(current);
            current = word;
          } else {
            current = current ? `${current} ${word}` : word;
          }
        }
      } else if (current && `${current} ${part}`.length > 140) {
        chunks.push(current);
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
    this.lastError = null;

    // ƯU TIÊN WEB SPEECH API NATIVE ĐỂ ĐẠT ĐỘ TRỄ CỰC THẤP (< 30ms, khớp tức thì với slide)
    if (this.synth) {
      if (!this.vietnameseVoice) this.initVoices();
      if (this.vietnameseVoice) {
        return this.speakWithWebSpeechFallback(text);
      }
    }

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

      this.playAudioChunk(0, this.playbackId);
      return { success: true };
    } catch (err) {
      console.warn('Lỗi khởi động phát âm thanh:', err);
      return this.speakWithWebSpeechFallback(text);
    }
  }

  playAudioChunk(index, playbackId) {
    if (!this.isSpeaking || playbackId !== this.playbackId) return;

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
      if (playbackId !== this.playbackId || this.currentAudio !== audio) return;
      this.currentAudio = null;
      this.playAudioChunk(index + 1, playbackId);
    };

    const handlePlaybackError = (error) => {
      if (playbackId !== this.playbackId || this.currentAudio !== audio) return;
      console.warn(`Không phát được đoạn âm thanh ${index + 1} qua /api/tts:`, error);
      const remainingText = this.audioQueue.slice(index).join(' ');
      if (this.voiceMatchesGender(this.vietnameseVoice) && this.synth) {
        this.speakWithWebSpeechFallback(remainingText);
        return;
      }
      this.failPlayback(this.gender === 'female'
        ? 'Không phát được giọng nữ tiếng Việt. Hãy kiểm tra kết nối rồi thử lại.'
        : 'Không phát được giọng nam tiếng Việt. Thiết bị chưa có giọng nam vi-VN phù hợp để dự phòng; hãy kiểm tra kết nối rồi thử lại.');
    };
    audio.onerror = handlePlaybackError;

    audio.play().catch(err => {
      handlePlaybackError(err);
    });
  }

  speakWithWebSpeechFallback(text) {
    if (!this.synth) {
      return this.speakWithServerTTS(text);
    }

    const voice = this.vietnameseVoice || (this.synth.getVoices().find(v => (v.lang || '').toLowerCase().startsWith('vi')));
    if (!voice) {
      return this.speakWithServerTTS(text);
    }

    try {
      const fallbackPlaybackId = ++this.playbackId;
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      this.audioQueue = [];
      this.currentChunkIndex = 0;

      // Hủy mọi âm thanh tồn đọng để phát âm tức thì (< 20ms)
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'vi-VN';
      utterance.voice = voice;

      const vName = String(voice.name || '').toLowerCase();
      const isVoiceFemale = /hoaimy|female|woman|\bnữ\b|linh|chi|my/.test(vName);
      const isVoiceMale = /namminh|male|man|\bnam\b|an/.test(vName);

      if (this.gender === 'female') {
        utterance.pitch = isVoiceFemale ? 1.0 : 1.15;
      } else {
        utterance.pitch = isVoiceMale ? 1.0 : 0.88;
      }

      utterance.rate = Math.max(0.9, Math.min(1.35, this.rate || 1.05));
      utterance.volume = this.volume;
      this.lastError = null;
      const isCurrentUtterance = () => fallbackPlaybackId === this.playbackId && this.currentUtterance === utterance;

      utterance.onstart = () => {
        if (!isCurrentUtterance()) return;
        this.isSpeaking = true;
        this.isPaused = false;
        this.notify();
      };

      utterance.onend = () => {
        if (!isCurrentUtterance()) return;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.notify();
      };

      utterance.onerror = () => {
        if (!isCurrentUtterance()) return;
        this.speakWithServerTTS(text);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return { success: true };
    } catch (err) {
      return this.speakWithServerTTS(text);
    }
  }

  failPlayback(message) {
    this.playbackId += 1;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentAudio = null;
    this.currentUtterance = null;
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.lastError = message;
    this.notify();
    return { success: false, error: message };
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
      const audio = this.currentAudio;
      const playbackId = this.playbackId;
      audio.play().then(() => {
        if (playbackId !== this.playbackId || this.currentAudio !== audio) return;
        this.isPaused = false;
        this.notify();
      }).catch(() => {
        if (playbackId !== this.playbackId || this.currentAudio !== audio) return;
        const remainingText = this.audioQueue.slice(this.currentChunkIndex).join(' ');
        if (this.voiceMatchesGender(this.vietnameseVoice) && this.synth) {
          this.speakWithWebSpeechFallback(remainingText);
        } else {
          this.failPlayback(this.gender === 'female'
            ? 'Không thể tiếp tục phát giọng nữ tiếng Việt. Hãy kiểm tra kết nối rồi thử lại.'
            : 'Không thể tiếp tục phát giọng nam tiếng Việt. Hãy kiểm tra kết nối rồi thử lại.');
        }
      });
      return;
    }
    if (this.synth && this.isSpeaking && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
        this.notify();
      } catch (_) {
        this.failPlayback('Không thể tiếp tục giọng đọc trên thiết bị. Hãy bấm đọc lại.');
      }
    }
  }

  stop() {
    this.playbackId += 1;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.lastError = null;
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
    this.notify();
  }
}

export const speechService = new SpeechService();
