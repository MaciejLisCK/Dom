// Canvas setup
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let W, H, SCALE;
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  SCALE = Math.max(2, Math.floor(Math.min(W, H) / 200));
}
resize();
window.addEventListener('resize', resize);

// Czas
function getTimeFraction() {
  const now = new Date();
  return (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
}
function getPeriod(h) {
  if (h >= 5  && h < 8)  return 'dawn';
  if (h >= 8  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  if (h >= 20 && h < 22) return 'dusk';
  return 'night';
}

// Kolory
function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function rgb(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }

// Dane sceny
const stars = Array.from({length: 120}, () => ({
  x: Math.random(), y: Math.random() * 0.6,
  r: Math.random() < 0.3 ? 2 : 1,
  blink: Math.random() * Math.PI * 2,
  speed: 0.5 + Math.random() * 1.5,
}));

const clouds = Array.from({length: 5}, (_, i) => ({
  x: i * 0.22 + Math.random() * 0.1,
  y: 0.08 + Math.random() * 0.15,
  w: 4 + Math.floor(Math.random() * 4),
  speed: 0.00003 + Math.random() * 0.00002,
  alpha: 0.7 + Math.random() * 0.3,
}));

const birds = Array.from({length: 6}, () => ({
  x: Math.random(), y: 0.1 + Math.random() * 0.25,
  speed: 0.0001 + Math.random() * 0.0002,
  flap: Math.random() * Math.PI * 2,
  flapSpeed: 3 + Math.random() * 4,
  size: 1 + Math.floor(Math.random() * 2),
}));

const fireflies = Array.from({length: 18}, () => ({
  x: 0.05 + Math.random() * 0.9,
  y: 0.5  + Math.random() * 0.4,
  phase: Math.random() * Math.PI * 2,
  speed: 0.2 + Math.random() * 0.3,
  dx: (Math.random() - 0.5) * 0.0002,
  dy: (Math.random() - 0.5) * 0.0001,
}));

let windOffset = 0;
let t = 0;

// Śledzenie kursora / dotyku
const cursor = { x: null, lastMoved: 0 };
canvas.addEventListener('mousemove', e => {
  cursor.x = e.clientX / W; cursor.lastMoved = Date.now();
});

let tiltPermissionRequested = false;
function requestTiltPermission() {
  if (tiltPermissionRequested) return;
  tiltPermissionRequested = true;
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().catch(() => {});
  }
}

canvas.addEventListener('touchstart', e => {
  cursor.x = e.touches[0].clientX / W; cursor.lastMoved = Date.now();
  requestTiltPermission();
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  cursor.x = e.touches[0].clientX / W; cursor.lastMoved = Date.now();
}, { passive: true });

// Przechylenie urządzenia (mobilne)
const tilt = { gamma: 0, active: false };
window.addEventListener('deviceorientation', e => {
  if (e.gamma !== null) {
    tilt.gamma = Math.max(-45, Math.min(45, e.gamma));
    tilt.active = true;
  }
}, { passive: true });

// Stan lisa
const fox = { x: 0.35, dir: 1, walkFrame: 0, autoDir: 1, autoTarget: 0.5 };

// Kury
const chickens = Array.from({length: 2}, (_, i) => ({
  x:            0.33 + i * 0.11,
  dir:          i % 2 === 0 ? 1 : -1,
  speed:        0.00004 + Math.random() * 0.00003,
  fleeSpeed:    0.00018 + Math.random() * 0.00008,
  fleeing:      false,
  walkFrame:    Math.random() * Math.PI * 2,
  cluckTimer:   Math.random() * 3000,
  clucking:     false,
  cluckDuration:400,
}));

// Główna pętla rysowania
function draw(nowMs) {
  const now  = new Date();
  const hour = now.getHours(), min = now.getMinutes(), sec = now.getSeconds();
  const period = getPeriod(hour);

  windOffset = nowMs * 0.0005;
  t          = nowMs * 0.001;

  ctx.clearRect(0, 0, W, H);

  // Niebo
  drawSky(period);
  drawStars(period, nowMs);
  drawMoon(period, nowMs);
  drawSun(period, nowMs);

  // Zachmurzenie (overlay pogodowy)
  drawOvercast(period);

  // Chmury – przy zachmurzeniu gęstsze
  const baseAlpha  = period === 'day' ? 1 : period === 'morning' || period === 'evening' ? 0.6 : period === 'dawn' ? 0.4 : 0.15;
  const cloudAlpha = WEATHER.type === 'cloudy' ? Math.min(1, baseAlpha + 0.25) : (baseAlpha > 0.15 ? baseAlpha : 0);
  for (const c of clouds) drawCloud(c, nowMs, cloudAlpha);
  drawWeatherClouds(nowMs);

  drawBirds(period, nowMs);
  drawGround(period);
  drawPath(period);
  drawFence(period);

  // Drzewa
  const groundY = H * 0.65;
  const tiltBias = tilt.active ? (tilt.gamma / 45) * 8 : 0;
  drawTree(W * 0.12, groundY, 45, period, 1.2, tiltBias);
  drawTree(W * 0.18, groundY, 38, period, 0.8, tiltBias);
  drawTree(W * 0.82, groundY, 42, period, 1.0, tiltBias);
  drawTree(W * 0.88, groundY, 35, period, 1.5, tiltBias);
  drawTree(W * 0.72, groundY, 40, period, 0.9, tiltBias);
  drawTree(W * 0.28, groundY, 36, period, 1.3, tiltBias);

  // Krzewy
  drawBush(W * 0.38, groundY, 5,   period);
  drawBush(W * 0.62, groundY, 4,   period);
  drawBush(W * 0.35, groundY, 3,   period);
  drawBush(W * 0.65, groundY, 3.5, period);

  drawHouse(period);

  // Kury (przed lisem żeby lis był na wierzchu)
  for (const ch of chickens) drawChicken(ch, period, nowMs, fox.x);
  drawDog(period, nowMs);

  drawFireflies(period, nowMs);
  updateUI(period, hour, min, sec);

  requestAnimationFrame(draw);
}

// Inicjalizacja
document.getElementById('audio-btn').addEventListener('click', toggleAudio);
updateWeatherInfo();
requestAnimationFrame(draw);
