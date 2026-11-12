// Động cơ dự phòng Web Speech API dành cho môi trường ngoại tuyến hoặc khi máy chủ bận
export function isGenuineVietnameseVoice(voice) {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();
  return lang.startsWith('vi') || name.includes('vietnamese') || name.includes('tiếng việt') || name.includes('tieng viet');
}

export function voiceMatchesGender(voice, gender) {
  if (!voice) return false;
  const name = String(voice.name || '').toLowerCase();
  const explicitFemale = /hoaimy|female|woman|\bnữ\b|linh|chi|my|mai|lan/.test(name);
  const explicitMale = /namminh|\bmale\b|\bman\b|\bnam\b|\ban\b/.test(name);
  return gender === 'female' ? (explicitFemale || !explicitMale) : (explicitMale || !explicitFemale);
}

export function findBestVietnameseVoice(synth, gender) {
  if (!synth) return null;
  const viVoices = synth.getVoices().filter(v => isGenuineVietnameseVoice(v));
  return viVoices.find(v => voiceMatchesGender(v, gender)) || viVoices[0] || null;
}

export function playWithWebSpeech({ synth, voice, text, gender, rate, volume, onStart, onEnd, onError }) {
  if (!synth) return { success: false, error: 'Không hỗ trợ Web Speech.' };
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'vi-VN';
    if (voice) utterance.voice = voice;
    utterance.pitch = gender === 'female' ? 1.05 : 0.82;
    utterance.rate = Math.max(0.9, Math.min(1.35, rate || 1.05));
    utterance.volume = volume ?? 1.0;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => onError?.(e);

    synth.speak(utterance);
    return { success: true, utterance };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
