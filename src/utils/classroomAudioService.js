/**
 * Dịch vụ âm thanh lớp học sư phạm Mĩ thuật (Classroom Audio Service)
 * Hoạt động 100% cục bộ bằng Web Audio API synthesizer.
 * Không cần tệp mp3 ngoài, không tốn băng thông, chạy mượt cả khi không có Internet.
 */

class ClassroomAudioService {
  constructor() {
    this.audioCtx = null;
    this.musicInterval = null;
    this.isPlayingMusic = false;
  }

  // Khởi tạo AudioContext an toàn theo chuẩn trình duyệt (user gesture)
  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Tiếng chuông nhẹ nhàng báo hiệu chuyển hoạt động sư phạm (523Hz -> 659Hz)
  playPhaseChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Tone 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.2);
      gain2.gain.setValueAtTime(0.18, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.9);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Bật nhạc nền không lời êm dịu (Pentatonic Lofi) trong 17 phút học sinh luyện tập sáng tạo
  startClassroomMusic() {
    if (this.isPlayingMusic) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isPlayingMusic = true;
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
    let noteIdx = 0;

    const playGentleNote = () => {
      if (!this.isPlayingMusic) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const note = notes[noteIdx % notes.length];
        noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        
        // Âm lượng siêu nhỏ (0.04) làm nền tĩnh lặng, thư giãn cho học sinh vẽ
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.3);
      } catch (_) {}
    };

    playGentleNote();
    this.musicInterval = setInterval(playGentleNote, 1600);
  }

  // Tắt nhạc nền
  stopClassroomMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopClassroomMusic();
      return false;
    } else {
      this.startClassroomMusic();
      return true;
    }
  }
}

export const classroomAudio = new ClassroomAudioService();
