import { AudioSettings, TimeOfDayPreset } from '../../types/game';
import { computeAudioGain } from '../core/rules';

// Warm anime school-life chord progressions (in Hz) for procedural BGM
const BGM_CHORDS: Record<TimeOfDayPreset, number[][]> = {
  // Bright Fmaj7 -> G6 -> Em7 -> Am7 progression
  morning: [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66, 329.63], // G6
    [164.81, 196.0, 246.94, 293.66], // Em7
    [220.0, 261.63, 329.63, 392.0], // Am7
  ],
  // Nostalgic anime sunset progression
  golden_hour: [
    [174.61, 220.0, 261.63, 349.23], // Fadd9
    [164.81, 246.94, 293.66, 392.0], // Em7
    [146.83, 220.0, 261.63, 329.63], // Dm7
    [196.0, 246.94, 293.66, 392.0], // G
  ],
  // Calm twilight study lo-fi progression
  twilight: [
    [146.83, 220.0, 261.63, 329.63], // Dm7
    [164.81, 196.0, 246.94, 329.63], // Em7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [164.81, 207.65, 246.94, 329.63], // E7sus
  ],
};

// Pentatonic melody notes (C5, D5, E5, G5, A5, C6)
const BGM_MELODY_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

class ProceduralAudioManager {
  private ctx: AudioContext | null = null;
  private bgmTimer: number | null = null;
  private bgmActive = false;
  private bgmStep = 0;
  private bgmMood: TimeOfDayPreset = 'golden_hour';
  private userGestureUnlocked = false;

  private settings: AudioSettings = {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    muted: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.userGestureUnlocked = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('click', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || !this.userGestureUnlocked) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(settings: AudioSettings): void {
    this.settings = { ...settings };
    if (this.settings.muted || this.getMusicGain() <= 0.001) {
      if (this.bgmTimer !== null) {
        window.clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    } else if (this.bgmActive && this.bgmTimer === null) {
      this.startBgm(this.bgmMood);
    }
  }

  public setBgmMood(mood: TimeOfDayPreset): void {
    this.bgmMood = mood;
  }

  public getSfxGain(): number {
    return computeAudioGain(
      this.settings.masterVolume,
      this.settings.sfxVolume,
      this.settings.muted
    );
  }

  public getMusicGain(): number {
    return computeAudioGain(
      this.settings.masterVolume,
      this.settings.musicVolume,
      this.settings.muted
    );
  }

  /**
   * Starts a continuous, gentle anime school-life procedural BGM loop
   * (warm electric piano chords + celesta bell notes).
   */
  public startBgm(mood?: TimeOfDayPreset): void {
    if (typeof window === 'undefined') return;
    if (mood) this.bgmMood = mood;
    this.bgmActive = true;

    if (this.bgmTimer !== null) return;

    // Schedule first bar immediately if audio context is ready
    this.playBgmBar();
    this.bgmTimer = window.setInterval(() => {
      this.playBgmBar();
    }, 1850);
  }

  public stopBgm(): void {
    this.bgmActive = false;
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public isBgmPlaying(): boolean {
    return this.bgmActive && !this.settings.muted && this.getMusicGain() > 0.001;
  }

  private playBgmBar(): void {
    if (!this.bgmActive) return;
    const musicGain = this.getMusicGain();
    if (musicGain <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = BGM_CHORDS[this.bgmMood] || BGM_CHORDS.golden_hour;
    const chord = chords[this.bgmStep % chords.length];

    // 1. Warm Electric Piano / Pad Chord
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);

      const peakGain = (idx === 0 ? 0.026 : 0.018) * musicGain;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.78);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.82);
    });

    // 2. Delicate Celesta / Music-Box Melody Note on Sub-Beats
    const noteA = BGM_MELODY_NOTES[(this.bgmStep * 2 + 1) % BGM_MELODY_NOTES.length];
    const noteB = BGM_MELODY_NOTES[(this.bgmStep * 3 + 2) % BGM_MELODY_NOTES.length];

    [
      { freq: noteA, offset: 0.25 },
      { freq: noteB, offset: 1.05 },
    ].forEach(({ freq, offset }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startAt = now + offset;
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.linearRampToValueAtTime(0.022 * musicGain, startAt + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.72);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.75);
    });

    this.bgmStep += 1;
  }

  public playHover(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);

    gain.gain.setValueAtTime(0.08 * gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playClick(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09); // E5

    gain.gain.setValueAtTime(0.16 * gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playConfirmChime(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Classic Westminster-inspired Japanese school chime chord (F4 - A4 - C5 - F5)
    const notes = [349.23, 440.0, 523.25, 698.46];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.14 * gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  public playDialogueBlip(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 783.99]; // D5 -> G5 anime chat pop
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11 * gainVal, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  public playDoorTransition(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Sliding classroom door / hallway chime
    const now = ctx.currentTime;
    const notes = [440.0, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12 * gainVal, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playCancel(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(311.13, now + 0.08);

    gain.gain.setValueAtTime(0.12 * gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playFootstep(stepParity = 0, indoor = false): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = indoor ? 'sine' : 'triangle';
    const baseFreq = indoor
      ? stepParity % 2 === 0
        ? 185
        : 205
      : stepParity % 2 === 0
        ? 135
        : 152;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(indoor ? 78 : 58, now + 0.045);

    gain.gain.setValueAtTime(0.065 * gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playJump(): void {
    const gainVal = this.getSfxGain();
    if (gainVal <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.12);

    gain.gain.setValueAtTime(0.11 * gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.135);
  }
}

export const audioManager = new ProceduralAudioManager();
