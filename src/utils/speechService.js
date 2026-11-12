import { getScopedStorageKey } from './userWorkspaceService.js';
import { cleanSmartVietnameseSpeechText, splitTextIntoChunks } from './speechTextCleaner.js';
import { findBestVietnameseVoice, playWithWebSpeech } from './webSpeechFallbackEngine.js';
import { AudioQueuePlayer } from './audioQueuePlayer.js';

export { cleanSmartVietnameseSpeechText, splitTextIntoChunks };

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(getScopedStorageKey('conhi_voice_gender')) : null;
    this.gender = (saved === 'female' || saved === 'male') ? saved : 'male';
    this.rate = 1.0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.listeners = new Set();
    this.lastError = null;
    this.currentTextBeingSpoken = '';
    this.player = new AudioQueuePlayer();

    if (this.synth && typeof window !== 'undefined') {
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
      window.addEventListener('conhi-voice-gender-changed', (e) => {
        const next = e?.detail?.gender;
        if (next && (next === 'male' || next === 'female') && next !== this.gender) {
          this.setGender(next, false);
        }
      });
    }
  }

  setGender(gender, autoResume = true) {
    if (gender !== 'male' && gender !== 'female') return;
    if (this.gender === gender) return;

    const wasSpeaking = this.isSpeaking;
    const textToResume = this.currentTextBeingSpoken || '';
    this.stop();
    this.gender = gender;
    this.lastError = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getScopedStorageKey('conhi_voice_gender'), gender);
        window.dispatchEvent(new CustomEvent('conhi-voice-gender-changed', { detail: { gender } }));
      } catch (_) {}
    }

    this.initVoices();
    this.notify();

    if (wasSpeaking && autoResume && textToResume) {
      setTimeout(() => this.speak(textToResume), 50);
    }
  }

  initVoices() {
    this.vietnameseVoice = findBestVietnameseVoice(this.synth, this.gender);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  getState() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      rate: this.rate,
      gender: this.gender,
      hasViVoice: Boolean(this.vietnameseVoice),
      voiceName: this.gender === 'female' ? 'Cô giáo (Nữ - Hoài My)' : 'Thầy giáo (Nam - Nam Minh)',
      lastError: this.lastError
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  setRate(newRate) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    this.player.setRate(this.rate);
    this.notify();
  }

  speak(text) {
    if (!text || !text.trim()) return { success: false, error: 'Chưa có nội dung để đọc.' };
    const cleanText = cleanSmartVietnameseSpeechText(text);
    if (!cleanText) return { success: false, error: 'Chưa có nội dung hợp lệ.' };

    this.stop();
    this.currentTextBeingSpoken = text;
    this.audioQueue = splitTextIntoChunks(cleanText);
    this.currentChunkIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    this.playNextChunk();
    return { success: true };
  }

  playNextChunk() {
    if (!this.isSpeaking || this.currentChunkIndex >= this.audioQueue.length) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
      return;
    }

    const chunkText = this.audioQueue[this.currentChunkIndex];
    const voiceParam = this.gender === 'female' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural';

    this.player.playChunk({
      chunkText,
      voiceParam,
      rate: this.rate,
      onEnded: () => {
        this.currentChunkIndex += 1;
        this.playNextChunk();
      },
      onError: () => {
        const remaining = this.audioQueue.slice(this.currentChunkIndex).join(' ');
        this.speakWithWebSpeechFallback(remaining);
      }
    });
  }

  speakWithWebSpeechFallback(text) {
    const res = playWithWebSpeech({
      synth: this.synth,
      voice: this.vietnameseVoice,
      text,
      gender: this.gender,
      rate: this.rate,
      onStart: () => { this.isSpeaking = true; this.isPaused = false; this.notify(); },
      onEnd: () => { this.isSpeaking = false; this.isPaused = false; this.notify(); },
      onError: () => { this.failPlayback('Không thể phát âm thanh.'); }
    });
    if (!res.success) this.failPlayback(res.error);
    return res;
  }

  failPlayback(message) {
    this.stop();
    this.lastError = message;
    this.notify();
    return { success: false, error: message };
  }

  pause() {
    if (this.isSpeaking && !this.isPaused) {
      this.player.pause();
      if (this.synth) this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  resume() {
    if (this.isSpeaking && this.isPaused) {
      this.player.resume().then(() => {
        this.isPaused = false;
        this.notify();
      }).catch(() => {
        if (this.synth) {
          try { this.synth.resume(); this.isPaused = false; this.notify(); } catch (_) {
            this.playNextChunk();
          }
        } else {
          this.playNextChunk();
        }
      });
    }
  }

  stop() {
    this.player.stop();
    if (this.synth) this.synth.cancel();
    this.audioQueue = [];
    this.currentChunkIndex = 0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.lastError = null;
    this.notify();
  }
}

export const speechService = new SpeechService();
