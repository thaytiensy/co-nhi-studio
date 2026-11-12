// Quản lý hàng đợi âm thanh HTML5 Audio cho SpeechService
export class AudioQueuePlayer {
  constructor() {
    this.currentAudio = null;
    this.playbackId = 0;
  }

  stop() {
    this.playbackId += 1;
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

    audio.onended = () => {
      if (pid !== this.playbackId) return;
      this.currentAudio = null;
      onEnded?.();
    };

    audio.onerror = (e) => {
      if (pid !== this.playbackId) return;
      this.currentAudio = null;
      onError?.(e);
    };

    audio.play().catch(audio.onerror);
    return pid;
  }

  pause() {
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
