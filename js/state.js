// ── Dane sceny ─────────────────────────────────────────────────────────────────
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

// ── Śledzenie kursora / dotyku ─────────────────────────────────────────────────
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

// ── Przechylenie urządzenia (mobilne) ─────────────────────────────────────────
const tilt = { gamma: 0, active: false };
const TILT_ALPHA = 0.12; // filtr dolnoprzepustowy (EMA)
window.addEventListener('deviceorientation', e => {
  if (e.gamma !== null) {
    const raw = Math.max(-45, Math.min(45, e.gamma));
    tilt.gamma += TILT_ALPHA * (raw - tilt.gamma);
    tilt.active = true;
  }
}, { passive: true });

// ── Stan lisa ──────────────────────────────────────────────────────────────────
const fox = { x: 0.35, y: 0.5, dir: 1, walkFrame: 0, autoDir: 1, autoTarget: 0.5, autoTargetY: 0.5 };

// ── Drzwi kurnika ──────────────────────────────────────────────────────────────
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

// ── Kury ───────────────────────────────────────────────────────────────────────
const chickens = Array.from({length: 8}, (_, i) => ({
  x:                   0.33 + i * 0.11,
  y:                   0.25 + i * 0.45,
  dir:                 i % 2 === 0 ? 1 : -1,
  dirY:                i % 2 === 0 ? 1 : -1,
  speed:               0.00004 + Math.random() * 0.00003,
  fleeSpeed:           0.00018 + Math.random() * 0.00008,
  fleeing:             false,
  wasFleeingLastFrame: false,
  eggCooldown:         0,
  eaten:               false,
  eatRespawn:          0,
  walkFrame:           Math.random() * Math.PI * 2,
  cluckTimer:          Math.random() * 3000,
  clucking:            false,
  cluckDuration:       400,
}));

// ── Efekty ─────────────────────────────────────────────────────────────────────
const feathers = [];
const eggs = [];
