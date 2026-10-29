/**
 * Web Audio API synthesizer for sci-fi cyberpunk sound feedback.
 * Operates purely client-side without any external asset downloads.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundEffectType = 
  | 'number' 
  | 'operator' 
  | 'function' 
  | 'enter' 
  | 'clear' 
  | 'backspace' 
  | 'error' 
  | 'mode' 
  | 'toggle';

export function playCyberSound(
  type: SoundEffectType,
  enabled: boolean = true,
  volumePercent: number = 50
): void {
  if (!enabled || volumePercent <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseGain = (volumePercent / 100) * 0.15; // Safe master gain
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.connect(ctx.destination);

    switch (type) {
      case 'number': {
        // High-tech snappy cyber click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

        gain.gain.setValueAtTime(baseGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'operator': {
        // Higher resonant ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

        gain.gain.setValueAtTime(baseGain * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'function': {
        // Futuristic double-tone chirp
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc2.frequency.setValueAtTime(1318.51, now); // E6

        gain.gain.setValueAtTime(baseGain * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(master);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
        break;
      }

      case 'enter': {
        // Futuristic lock-in resolution chime
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.025;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(baseGain * 0.8, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

          osc.connect(gain);
          gain.connect(master);

          osc.start(startTime);
          osc.stop(startTime + 0.12);
        });
        break;
      }

      case 'clear':
      case 'backspace': {
        // Quick descending laser blur
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);

        gain.gain.setValueAtTime(baseGain * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'error': {
        // Low distorted rejection buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.setValueAtTime(110, now + 0.07);

        gain.gain.setValueAtTime(baseGain * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'mode':
      case 'toggle': {
        // Holographic switch glide
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.09);

        gain.gain.setValueAtTime(baseGain * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
    }
  } catch {
    // Ignore audio errors gracefully if browser blocked audio
  }
}
