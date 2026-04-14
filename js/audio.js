// Web Audio API – muzyka ambient + odgłosy natury
// Dźwięk włączony domyślnie – inicjalizacja przy pierwszej interakcji (wymóg przeglądarki)

let audioCtx   = null;
let masterGain = null;
let audioOn    = true;
let birdTimer  = null;
let musicTimer = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
  startWind();
  masterGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 1.0);
  scheduleBird();
  scheduleNote();
}

// Automatyczny start przy pierwszej interakcji użytkownika
['click', 'touchstart', 'keydown'].forEach(evt => {
  document.addEventListener(evt, () => { if (audioOn) initAudio(); }, { once: true });
});

function toggleAudio() {
  audioOn = !audioOn;
  const btn = document.getElementById('audio-btn');
  if (audioOn) {
    btn.textContent = '♪ Dźwięk: ON';
    if (!audioCtx) {
      audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(audioCtx.destination);
      startWind();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 1.0);
    scheduleBird();
    scheduleNote();
  } else {
    btn.textContent = '♪ Dźwięk: OFF';
    if (audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
    }
    clearTimeout(birdTimer);
    clearTimeout(musicTimer);
  }
}

// Wiatr – szum biały filtrowany, zapętlony
function startWind() {
  const sr  = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(1, sr * 3, sr);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop   = true;

  const lpf = audioCtx.createBiquadFilter();
  lpf.type = 'lowpass'; lpf.frequency.value = 650;

  const bpf = audioCtx.createBiquadFilter();
  bpf.type = 'bandpass'; bpf.frequency.value = 260; bpf.Q.value = 0.8;

  const wg = audioCtx.createGain();
  wg.gain.value = 0.07;

  src.connect(lpf); lpf.connect(bpf); bpf.connect(wg); wg.connect(masterGain);
  src.start();

  // Animacja siły wiatru
  (function breathe() {
    if (!audioCtx) return;
    wg.gain.linearRampToValueAtTime(
      0.04 + Math.random() * 0.09,
      audioCtx.currentTime + 1.5 + Math.random() * 2.5
    );
    setTimeout(breathe, (1.8 + Math.random() * 2.5) * 1000);
  })();
}

// Śpiew ptaków – losowe trelele
function scheduleBird() {
  birdTimer = setTimeout(() => {
    if (audioOn && audioCtx) { playBird(); scheduleBird(); }
  }, 1800 + Math.random() * 7000);
}

function playBird() {
  const t0 = audioCtx.currentTime;
  const n  = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const t2  = t0 + i * (0.07 + Math.random() * 0.13);
    const bf  = 880 + Math.random() * 1400;
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bf, t2);
    osc.frequency.exponentialRampToValueAtTime(bf * (1.15 + Math.random() * 0.4), t2 + 0.06);
    osc.frequency.exponentialRampToValueAtTime(bf * 0.88, t2 + 0.16);
    env.gain.setValueAtTime(0,    t2);
    env.gain.linearRampToValueAtTime(0.19, t2 + 0.015);
    env.gain.linearRampToValueAtTime(0,    t2 + 0.19);
    osc.connect(env); env.connect(masterGain);
    osc.start(t2); osc.stop(t2 + 0.22);
  }
}

// Muzyka ambient – pentatonika C-dur (pianino syntetyczne)
const PIANO = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
let noteAt   = 0;

function scheduleNote() {
  if (!audioOn || !audioCtx) return;
  if (noteAt < audioCtx.currentTime) noteAt = audioCtx.currentTime + 0.05;

  const freq = PIANO[Math.floor(Math.random() * PIANO.length)];
  const dur  = 2.2 + Math.random() * 2.8;
  const t0   = noteAt;

  // Fundamentalna + 2. harmoniczna = ciepłe brzmienie pianino
  [freq, freq * 2].forEach((f, hi) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    const lpf = audioCtx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 1300;
    osc.type = 'sine';
    osc.frequency.value = f;
    osc.detune.value = (Math.random() - 0.5) * 7;
    const pk = hi === 0 ? 0.10 : 0.032;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(pk, t0 + 0.22);
    env.gain.setValueAtTime(pk * 0.8, t0 + dur - 1.0);
    env.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(env); env.connect(lpf); lpf.connect(masterGain);
    osc.start(t0); osc.stop(t0 + dur + 0.1);
  });

  noteAt += 1.0 + Math.random() * 2.5;
  musicTimer = setTimeout(scheduleNote,
    Math.max(50, (noteAt - audioCtx.currentTime - 0.12) * 1000));
}
