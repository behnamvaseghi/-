// Audio service to manage sound effects and speech

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const speak = (text: string, lang: string = 'fa-IR') => {
  if (!window.speechSynthesis) return;
  
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85; // Slower, more elegant
  utterance.pitch = 1.1; 

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Amira')) && 
    !v.name.includes('Male')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Luxury Glossy Paper Sound
export const playPageTurnSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t = ctx.currentTime;
    const duration = 0.6;

    // 1. Friction Noise (The "Shhh" sound)
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Smoother pinkish noise
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.05 * white)) / 1.05;
      lastOut = data[i];
      data[i] *= 3.0; 
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to remove harshness - thicker paper has less treble
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(200, t + duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.4, t + 0.1); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + duration); // Decay

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start(t);

    // 2. The "Snap" or "Flap" at the end (Paper landing)
    const snapOsc = ctx.createOscillator();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(80, t + 0.3);
    snapOsc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0, t + 0.3);
    snapGain.gain.linearRampToValueAtTime(0.2, t + 0.35);
    snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(t + 0.3);
    snapOsc.stop(t + 0.6);

  } catch (e) {
    // ignore
  }
};

let lastOut = 0;