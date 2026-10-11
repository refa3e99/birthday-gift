// Web Audio API Sound Synthesizer & Background Music Manager
// Provides seamless synthesized audio effects and background melody with zero external dependencies.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmTimeoutId: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.12, this.ctx.currentTime, 0.1);
    }
    if (this.letterAudio) {
      this.letterAudio.volume = muted ? 0 : 0.6;
    }
  }

  public startBGM() {
    this.initCtx();
    if (this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;

    // Create main BGM gain
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Warm, dreamy melody chords (Pentatonic/Major notes)
    // Frequencies for C major / G major warm vibes: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    const arpeggio = [0, 2, 3, 5, 4, 2, 3, 7, 5, 3, 2, 0];
    
    let step = 0;
    const playNextNote = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      if (this.ctx.state === 'running') {
        const noteIndex = arpeggio[step % arpeggio.length];
        const freq = notes[noteIndex];

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Warm sine + soft bell triangle wave mix
        osc.type = step % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 1.9);

        step++;
      }

      this.bgmTimeoutId = window.setTimeout(playNextNote, 600);
    };

    playNextNote();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId !== null) {
      clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  private letterAudio: HTMLAudioElement | null = null;
  private letterMelodyTimeout: number | null = null;
  private isLetterSongPlaying: boolean = false;

  public setCustomLetterAudio(audioSrc: string | File) {
    if (this.letterAudio) {
      this.letterAudio.pause();
      this.letterAudio = null;
    }
    const url = typeof audioSrc === 'string' ? audioSrc : URL.createObjectURL(audioSrc);
    this.letterAudio = new Audio(url);
    this.letterAudio.loop = true;
    this.letterAudio.volume = this.isMuted ? 0 : 0.6;
  }

  public playLetterSong() {
    this.initCtx();

    // If custom audio file has been set, play it
    if (this.letterAudio) {
      this.letterAudio.volume = this.isMuted ? 0 : 0.6;
      this.letterAudio.play().catch((err) => console.log('Audio autoplay prevented:', err));
      return;
    }

    // Otherwise play romantic music box theme
    if (this.isLetterSongPlaying || !this.ctx) return;
    this.isLetterSongPlaying = true;

    // Stop basic BGM if active
    this.stopBGM();

    const letterGain = this.ctx.createGain();
    letterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, this.ctx.currentTime);
    letterGain.connect(this.ctx.destination);

    // Warm Romantic Birthday Melody Notes (Happy Birthday / Love Theme Chords)
    // G4, G4, A4, G4, C5, B4 | G4, G4, A4, G4, D5, C5
    const melody = [
      { f: 392.00, d: 0.3 }, { f: 392.00, d: 0.3 }, { f: 440.00, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 523.25, d: 0.6 }, { f: 493.88, d: 1.0 },
      { f: 392.00, d: 0.3 }, { f: 392.00, d: 0.3 }, { f: 440.00, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 587.33, d: 0.6 }, { f: 523.25, d: 1.0 },
      { f: 392.00, d: 0.3 }, { f: 392.00, d: 0.3 }, { f: 783.99, d: 0.6 }, { f: 659.25, d: 0.6 }, { f: 523.25, d: 0.6 }, { f: 493.88, d: 0.6 }, { f: 440.00, d: 0.8 },
      { f: 698.46, d: 0.3 }, { f: 698.46, d: 0.3 }, { f: 659.25, d: 0.6 }, { f: 523.25, d: 0.6 }, { f: 587.33, d: 0.6 }, { f: 523.25, d: 1.2 }
    ];

    let noteIdx = 0;
    const playMelodyNote = () => {
      if (!this.isLetterSongPlaying || !this.ctx) return;

      if (this.ctx.state === 'running') {
        const current = melody[noteIdx % melody.length];
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine'; // Music box sine tone
        osc.frequency.setValueAtTime(current.f, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + current.d + 0.5);

        osc.connect(noteGain);
        noteGain.connect(letterGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + current.d + 0.6);

        noteIdx++;
        const nextDelay = current.d * 1000 + 100;
        this.letterMelodyTimeout = window.setTimeout(playMelodyNote, nextDelay);
      } else {
        this.letterMelodyTimeout = window.setTimeout(playMelodyNote, 500);
      }
    };

    playMelodyNote();
  }

  public stopLetterSong() {
    this.isLetterSongPlaying = false;
    if (this.letterMelodyTimeout !== null) {
      clearTimeout(this.letterMelodyTimeout);
      this.letterMelodyTimeout = null;
    }
    if (this.letterAudio) {
      this.letterAudio.pause();
    }
  }

  // Effect: Gift Box Open / Button Click (Sparkly Pop)
  public playPop() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Effect: Puzzle Piece Snap (Satisfying Chime)
  public playSnap() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad snap
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.04);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.04);
      osc.stop(this.ctx.currentTime + i * 0.04 + 0.35);
    });
  }

  // Effect: Win Fanfare (Celebratory Sparkles)
  public playWinFanfare() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    arpeggio.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.1);
      osc.stop(this.ctx.currentTime + index * 0.1 + 0.6);
    });
  }

  // Effect: Open Letter Envelope / Reveal
  public playChime() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.5);
    });
  }
}

export const soundManager = new SoundManager();
