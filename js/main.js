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
const cursor = { x: null, y: null, lastMoved: 0 };

function toCanvas(cx, cy) {
  const r = canvas.getBoundingClientRect();
  return [
    (cx - r.left) * (W / r.width),
    (cy - r.top) * (H / r.height),
  ];
}

canvas.addEventListener('mousemove', e => {
  const [cx, cy] = toCanvas(e.clientX, e.clientY);
  cursor.x = cx / W; cursor.y = cy / H; cursor.lastMoved = Date.now();
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
  const [cx, cy] = toCanvas(e.touches[0].clientX, e.touches[0].clientY);
  cursor.x = cx / W; cursor.y = cy / H; cursor.lastMoved = Date.now();
  requestTiltPermission();
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  const [cx, cy] = toCanvas(e.touches[0].clientX, e.touches[0].clientY);
  cursor.x = cx / W; cursor.y = cy / H; cursor.lastMoved = Date.now();
}, { passive: true });

// Przechylenie urządzenia (mobilne)
const tilt = { gamma: 0, active: false };
const TILT_ALPHA = 0.12; // współczynnik wygładzania (0=brak reakcji, 1=brak wygładzania)
window.addEventListener('deviceorientation', e => {
  if (e.gamma !== null) {
    const raw = Math.max(-45, Math.min(45, e.gamma));
    tilt.gamma += TILT_ALPHA * (raw - tilt.gamma); // filtr dolnoprzepustowy (EMA)
    tilt.active = true;
  }
}, { passive: true });

// Stan lisa
const fox = { x: 0.35, y: 0.5, dir: 1, walkFrame: 0, autoDir: 1, autoTarget: 0.5, autoTargetY: 0.5 };

// Ręczne otwarcie drzwi kurnika
let coopDoorManualOpen = false;

function isClickOnCoop(px, py) {
  const groundY = H * 0.65;
  const coopCX = W * 0.70;
  const coopW = 16 * SCALE;
  const coopH = 12 * SCALE;
  const roofH = 8 * SCALE;
  const hx = coopCX - coopW / 2;
  const hy = groundY - coopH;
  return px >= hx && px <= hx + coopW && py >= hy - roofH && py <= groundY;
}

function handleCoopTap(px, py) {
  if (isClickOnCoop(px, py)) {
    const period = getPeriod(new Date().getHours());
    const isNight = period === 'night' || period === 'dusk';
    if (isNight || coopDoorManualOpen) {
      coopDoorManualOpen = !coopDoorManualOpen;
    }
  }
}

canvas.addEventListener('click', e => {
  const [cx, cy] = toCanvas(e.clientX, e.clientY);
  handleCoopTap(cx, cy);
});
canvas.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const [cx, cy] = toCanvas(t.clientX, t.clientY);
  handleCoopTap(cx, cy);
}, { passive: true });

// Kury
const chickens = Array.from({length: 8}, (_, i) => ({
  x:            0.33 + i * 0.11,
  y:            0.25 + i * 0.45,
  dir:          i % 2 === 0 ? 1 : -1,
  dirY:         i % 2 === 0 ? 1 : -1,
  speed:        0.00004 + Math.random() * 0.00003,
  fleeSpeed:    0.00018 + Math.random() * 0.00008,
  fleeing:            false,
  wasFleeingLastFrame:false,
  eggCooldown:        0,
  eaten:              false,
  eatRespawn:         0,
  walkFrame:          Math.random() * Math.PI * 2,
  cluckTimer:         Math.random() * 3000,
  clucking:           false,
  cluckDuration:      400,
}));

// Pióra (efekt po zjedzeniu kury)
const feathers = [];

// Jajka znoszone przez wystraszone kury
const eggs = [];

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
  const tiltBias = tilt.active ? -(tilt.gamma / 45) * 8 : 0;
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
  drawChickenCoop(period, nowMs, coopDoorManualOpen);
  drawFog(period, nowMs);

  // Sprawdź czy lis zjadł kurę (próg odległości 0.07)
  const EAT_DIST = 0.07;
  for (const ch of chickens) {
    if (!ch.eaten && Math.hypot(ch.x - fox.x, ch.y - fox.y) < EAT_DIST) {
      ch.eaten = true;
      ch.eatRespawn = nowMs + 8000 + Math.random() * 4000;
      const fx = ch.x * W;
      const fy = H * (0.62 + ch.y * 0.16);
      for (let i = 0; i < 10; i++) {
        feathers.push({
          x: fx, y: fy,
          vx: (Math.random() - 0.5) * 4,
          vy: -1.5 - Math.random() * 2.5,
          life: 1.0,
          size: SCALE * (0.6 + Math.random() * 0.8),
          color: ['#f5eedc', '#d4c4a0', '#e8dcc8', '#c4b490'][Math.floor(Math.random() * 4)],
        });
      }
    }
    if (ch.eaten && nowMs > ch.eatRespawn) {
      ch.eaten = false;
      ch.x = 0.12 + Math.random() * 0.76;
      ch.y = 0.12 + Math.random() * 0.76;
    }
  }

  // Pióra
  for (let i = feathers.length - 1; i >= 0; i--) {
    const f = feathers[i];
    f.x  += f.vx;
    f.y  += f.vy;
    f.vy += 0.06;
    f.vx *= 0.98;
    f.life -= 0.012;
    if (f.life <= 0) { feathers.splice(i, 1); continue; }
    ctx.globalAlpha = f.life;
    ctx.fillStyle = f.color;
    ctx.fillRect(Math.round(f.x), Math.round(f.y), Math.round(f.size), Math.round(f.size));
    ctx.globalAlpha = 1;
  }

  // Aktualizacja czasu życia jajek
  for (let i = eggs.length - 1; i >= 0; i--) {
    eggs[i].life -= 16;
    if (eggs[i].life <= 0) eggs.splice(i, 1);
  }

  // Kury i lis – rysowanie w kolejności głębokości (dalej = najpierw)
  const coopNight = (period === 'night' || period === 'dusk') && !coopDoorManualOpen;
  const allEntities = [
    ...(coopNight ? [] : chickens.filter(ch => !ch.eaten).map(ch => ({ kind: 'chicken', ref: ch }))),
    ...eggs.map(eg => ({ kind: 'egg', ref: eg })),
    { kind: 'fox' },
  ];
  allEntities.sort((a, b) => {
    const ya = a.kind === 'fox' ? fox.y : a.ref.y;
    const yb = b.kind === 'fox' ? fox.y : b.ref.y;
    return ya - yb;
  });
  for (const e of allEntities) {
    if (e.kind === 'chicken') drawChicken(e.ref, period, nowMs, fox.x, fox.y);
    else if (e.kind === 'egg') drawEgg(e.ref, period);
    else drawDog(period, nowMs);
  }

  drawFireflies(period, nowMs);
  drawRain(nowMs);
  drawSnow(nowMs);
  drawLightning(nowMs);
  updateUI(period, hour, min, sec);

  requestAnimationFrame(draw);
}

// Inicjalizacja
document.getElementById('audio-btn').addEventListener('click', toggleAudio);
updateWeatherInfo();
requestAnimationFrame(draw);
