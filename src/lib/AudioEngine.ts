// Simple high-fidelity Web Audio Synthesizer
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getFrequency(noteName: string, octave: number): number {
  const normalizedName = noteName.trim().toUpperCase();
  const noteIndex = NOTE_NAMES.indexOf(normalizedName);
  if (noteIndex === -1) return 440;
  const midi = 12 * (octave + 1) + noteIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class Synthesizer {
  private ctx: AudioContext | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private schedulerTimer: number | null = null;
  private isPlayingSequence = false;

  constructor() {
    // Lazy initialisation on first interaction
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single note immediately
  playNote(noteName: string, octave: number, duration: number = 0.25, type: OscillatorType = 'triangle') {
    try {
      this.init();
      if (!this.ctx) return;

      const frequency = getFrequency(noteName, octave);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      // Simple ADSR envelope
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Stop all active audio
  stopAll() {
    if (this.schedulerTimer) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.isPlayingSequence = false;
    this.activeOscillators.forEach(({ osc }) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  // Play a complete melody array
  playSequence(
    notes: { noteName: string; octave: number; beat: number; duration: number }[],
    bpm: number,
    onStepChange: (beat: number) => void,
    onComplete: () => void,
    synthType: OscillatorType = 'triangle'
  ) {
    this.stopAll();
    this.init();
    if (!this.ctx) return;

    this.isPlayingSequence = true;
    const beatDuration = 60 / bpm; // duration of one beat in seconds
    const startTime = this.ctx.currentTime;
    
    // Sort notes by beat
    const maxBeat = Math.max(...notes.map(n => n.beat + n.duration), 16);
    let currentBeat = 0;

    // We can use a simple scheduler interval to trigger notes
    const checkInterval = 100; // ms
    let schedulerIndex = 0;

    // Trigger note helpers
    const scheduleNote = (noteName: string, octave: number, timeOffset: number, durationSecs: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = synthType;
      osc.frequency.setValueAtTime(getFrequency(noteName, octave), startTime + timeOffset);

      gain.gain.setValueAtTime(0, startTime + timeOffset);
      gain.gain.linearRampToValueAtTime(0.12, startTime + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + timeOffset + durationSecs);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime + timeOffset);
      osc.stop(startTime + timeOffset + durationSecs);

      this.activeOscillators.push({ osc, gain });
    };

    // Schedule all notes in advance for precise AudioContext timing
    notes.forEach(note => {
      const timeOffset = note.beat * beatDuration;
      const durationSecs = note.duration * beatDuration;
      scheduleNote(note.noteName, note.octave, timeOffset, durationSecs);
    });

    // Run interval for visual playhead updates
    const timerStart = Date.now();
    this.schedulerTimer = window.setInterval(() => {
      const elapsedSecs = (Date.now() - timerStart) / 1000;
      const elapsedBeats = elapsedSecs / beatDuration;
      
      if (elapsedBeats >= maxBeat) {
        this.stopAll();
        onComplete();
      } else {
        onStepChange(elapsedBeats);
      }
    }, 30);
  }
}

export const audioSynth = new Synthesizer();
