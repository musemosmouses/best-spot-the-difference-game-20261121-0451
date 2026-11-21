// Synthesised sound effects for Twin Tides (WebAudio, no audio files).
// Every effect is a short oscillator envelope — no audio files, nothing to
// load over the network, and nothing that can fail offline.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = null) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A find pops: a quick rising blip.
  pop() {
    this.tone(520, 0.12, 'sine', 0.25, 0, 880);
    this.tone(1040, 0.08, 'sine', 0.12, 0.05);
  }

  // A miss buzzes low.
  miss() {
    this.tone(140, 0.18, 'sawtooth', 0.12, 0, 90);
  }

  // A hint chimes softly.
  hint() {
    this.tone(660, 0.1, 'sine', 0.15);
    this.tone(880, 0.14, 'sine', 0.15, 0.09);
  }

  // Winning a level plays a rising arpeggio.
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.22, i * 0.11));
  }

  // Losing the clock plays a falling pair.
  lose() {
    this.tone(392, 0.25, 'triangle', 0.18, 0, 311);
    this.tone(311, 0.35, 'triangle', 0.18, 0.2, 233);
  }

  // A soft tick when the clock runs under ten seconds.
  tick() {
    this.tone(980, 0.05, 'square', 0.06);
  }
}
