// ===== Simple synthesized sound effects (original, no external files) =====
const Sound = (() => {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'square', vol = 0.08, when = 0, slideTo = null) {
    if (!enabled) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol = 0.08, when = 0, hp = 1000) {
    if (!enabled) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = hp;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }

  // Pentatonic scale so key "ticks" always sound pleasant.
  const SCALE = [523, 587, 659, 784, 880, 1046, 1175, 1318];

  return {
    setEnabled(v) { enabled = v; },
    unlock() { ac(); },
    key(i = 0) { tone(SCALE[i % SCALE.length], 0.07, 'triangle', 0.07); },
    wrong() { tone(180, 0.15, 'sine', 0.09, 0, 140); },
    swing() { noise(0.12, 0.06, 0, 2500); },
    hit() { tone(300, 0.1, 'square', 0.05, 0, 90); noise(0.08, 0.05, 0.02, 600); },
    gem() { [988, 1319, 1568].forEach((f, i) => tone(f, 0.12, 'triangle', 0.06, i * 0.06)); },
    hurt() { tone(220, 0.25, 'sawtooth', 0.05, 0, 80); },
    heal() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.15, 'sine', 0.07, i * 0.08)); },
    start() { [392, 523, 659].forEach((f, i) => tone(f, 0.12, 'square', 0.05, i * 0.1)); },
    win() {
      const m = [523, 659, 784, 1046, 784, 1046, 1319];
      m.forEach((f, i) => tone(f, i === m.length - 1 ? 0.5 : 0.14, 'square', 0.05, i * 0.12));
    },
    star(i) { tone(880 + i * 220, 0.2, 'triangle', 0.08); },
    bossRoar() { tone(110, 0.6, 'sawtooth', 0.06, 0, 55); noise(0.5, 0.04, 0, 200); },
    click() { tone(660, 0.05, 'triangle', 0.05); },
  };
})();

// ===== Friendly voice for the fairy (uses the browser's built-in speech) =====
const Voice = (() => {
  let enabled = true;
  let voice = null;
  function pick() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /en[-_]/i.test(v.lang) && /female|samantha|zira|google us/i.test(v.name))
         || vs.find(v => /en[-_]/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    pick();
    speechSynthesis.onvoiceschanged = pick;
  }
  return {
    setEnabled(v) { enabled = v; if (!v && 'speechSynthesis' in window) speechSynthesis.cancel(); },
    say(text) {
      if (!enabled || !('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1.3;
      speechSynthesis.speak(u);
    },
  };
})();

// Spoken name for a key.
function keyName(k) {
  return ({ ' ': 'space', ';': 'semicolon', ',': 'comma', '.': 'period', '/': 'slash' })[k] || k.toUpperCase();
}
