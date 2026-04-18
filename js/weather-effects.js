// ── Deszcz ─────────────────────────────────────────────────────────────────────
const rainDrops = Array.from({length: 200}, () => ({
  x:     Math.random(),
  y:     Math.random(),
  speed: 0.003 + Math.random() * 0.003,
  len:   4 + Math.floor(Math.random() * 6),
  alpha: 0.4 + Math.random() * 0.4,
}));

function drawRain(nowMs) {
  if (WEATHER.type !== 'rainy' && WEATHER.type !== 'stormy') return;
  const intensity = WEATHER.type === 'stormy' ? 1.0 : 0.65;
  ctx.strokeStyle = 'rgba(150,180,220,0.6)';
  ctx.lineWidth = SCALE * 0.5;
  for (const d of rainDrops) {
    d.y += d.speed;
    if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); }
    ctx.globalAlpha = d.alpha * intensity;
    ctx.beginPath();
    ctx.moveTo(d.x * W, d.y * H);
    ctx.lineTo(d.x * W + d.len * SCALE * 0.3, d.y * H + d.len * SCALE);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ── Śnieg ──────────────────────────────────────────────────────────────────────
const snowFlakes = Array.from({length: 120}, () => ({
  x:          Math.random(),
  y:          Math.random(),
  speed:      0.0004 + Math.random() * 0.0008,
  drift:      Math.random() * Math.PI * 2,
  driftSpeed: 0.3 + Math.random() * 0.8,
  size:       1 + Math.floor(Math.random() * 2),
  alpha:      0.6 + Math.random() * 0.4,
}));

function drawSnow(nowMs) {
  if (WEATHER.type !== 'snowy') return;
  for (const f of snowFlakes) {
    f.y += f.speed;
    f.x += Math.sin(nowMs * 0.001 * f.driftSpeed + f.drift) * 0.0003;
    if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(Math.round(f.x * W), Math.round(f.y * H), f.size * SCALE, f.size * SCALE);
  }
  ctx.globalAlpha = 1;
}

// ── Błyskawice ─────────────────────────────────────────────────────────────────
const lightningState = { active: false, bolt: [], startedAt: 0, duration: 0, nextAt: 0 };

function generateBolt(lx) {
  const pts = [{x: lx, y: H * 0.05}];
  let cx = lx, cy = H * 0.05;
  while (cy < H * 0.62) {
    cx += (Math.random() - 0.5) * 28 * SCALE;
    cy += 18 * SCALE;
    pts.push({x: cx, y: Math.min(cy, H * 0.62)});
  }
  return pts;
}

function drawLightning(nowMs) {
  if (WEATHER.type !== 'stormy') return;
  const now = Date.now();
  if (!lightningState.active && now >= lightningState.nextAt) {
    const lx = (0.15 + Math.random() * 0.70) * W;
    lightningState.active    = true;
    lightningState.bolt      = generateBolt(lx);
    lightningState.startedAt = now;
    lightningState.duration  = 180 + Math.random() * 140;
    lightningState.nextAt    = now + 4000 + Math.random() * 7000;
  }
  if (!lightningState.active) return;
  const elapsed = now - lightningState.startedAt;
  if (elapsed > lightningState.duration) { lightningState.active = false; return; }
  const tL = elapsed / lightningState.duration;
  ctx.globalAlpha = Math.max(0, 0.22 - tL * 0.22);
  ctx.fillStyle = '#fffff8';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  if (tL < 0.45) {
    ctx.globalAlpha = 1 - tL / 0.45;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = SCALE * 1.5;
    ctx.beginPath();
    ctx.moveTo(lightningState.bolt[0].x, lightningState.bolt[0].y);
    for (let i = 1; i < lightningState.bolt.length; i++)
      ctx.lineTo(lightningState.bolt[i].x, lightningState.bolt[i].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ── Mgła ───────────────────────────────────────────────────────────────────────
function drawFog(period, nowMs) {
  if (WEATHER.type !== 'foggy') return;
  const groundY = H * 0.65;
  const night = period === 'night' || period === 'dusk';
  const r = night ? 100 : 200, g = night ? 115 : 212, b2 = night ? 130 : 218;
  for (let i = 0; i < 3; i++) {
    const fogH = (0.18 + i * 0.07) * H;
    const gr = ctx.createLinearGradient(0, groundY - fogH, 0, groundY + fogH * 0.25);
    gr.addColorStop(0,   `rgba(${r},${g},${b2},0)`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b2},${0.28 - i * 0.05})`);
    gr.addColorStop(1,   `rgba(${r},${g},${b2},0)`);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = gr;
    ctx.fillRect(0, Math.round(groundY - fogH), W, Math.round(fogH * 1.25));
  }
  const atmo = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  atmo.addColorStop(0, `rgba(${r},${g},${b2},0.18)`);
  atmo.addColorStop(1, `rgba(${r},${g},${b2},0)`);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = atmo;
  ctx.fillRect(0, 0, W, H * 0.72);
  ctx.globalAlpha = 1;
}
