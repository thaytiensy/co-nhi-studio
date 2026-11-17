// Quản lý hàng đợi âm thanh HTML5 Audio cho SpeechService với độ trễ siêu ngắn 0.3s
export class AudioQueuePlayer {
  constructor() {
    this.currentAudio = null;
    this.playbackId = 0;
    this.fastTimer = null;
  }

  stop() {
    this.playbackId += 1;
    if (this.fastTimer) {
      clearTimeout(this.fastTimer);
      this.fastTimer = null;
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } catch (_) {}
      this.currentAudio = null;
    }
  }

  playChunk({ chunkText, voiceParam, rate, onEnded, onError }) {
    this.stop();
    const pid = this.playbackId;
    const url = `/api/tts?text=${encodeURIComponent(chunkText)}&voice=${voiceParam}`;
    const audio = new Audio(url);
    audio.playbackRate = rate || 1.0;
    this.currentAudio = audio;

    let hasStarted = false;
    const onPlaybackStarted = () => {
      hasStarted = true;
      if (this.fastTimer) {
        clearTimeout(this.fastTimer);
        this.fastTimer = null;
      }
    };

    audio.onplay = onPlaybackStarted;
    audio.onplaying = onPlaybackStarted;
    audio.oncanplay = onPlaybackStarted;

    // Giới hạn thời gian chờ tối đa 3500ms (3.5s) để server Edge/Google TTS kịp tổng hợp giọng tiếng Việt
    const FAST_FALLBACK_TIMEOUT = 3500;
    this.fastTimer = setTimeout(() => {
      if (pid === this.playbackId && !hasStarted) {
        this.stop();
        onError?.(new Error('TTS latency > 3500ms. Chuyển sang giọng dự phòng'));
      }
    }, FAST_FALLBACK_TIMEOUT);

    audio.onended = () => {
      if (pid !== this.playbackId) return;
      if (this.fastTimer) clearTimeout(this.fastTimer);
      this.currentAudio = null;
      onEnded?.();
    };

    audio.onerror = (e) => {
      if (pid !== this.playbackId) return;
      if (this.fastTimer) clearTimeout(this.fastTimer);
      this.currentAudio = null;
      onError?.(e);
    };

    audio.play().catch(audio.onerror);
    return pid;
  }

  pause() {
    if (this.fastTimer) clearTimeout(this.fastTimer);
    if (this.currentAudio) this.currentAudio.pause();
  }

  resume() {
    if (this.currentAudio) return this.currentAudio.play();
    return Promise.reject(new Error('No audio to resume'));
  }

  setRate(rate) {
    if (this.currentAudio) this.currentAudio.playbackRate = rate;
  }
}
