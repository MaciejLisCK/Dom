// ── Gwiazdy spadające ──────────────────────────────────────────────────────────
const shootingStarPool = [];
let nextShootingStarAt = 0;

function spawnShootingStar(nowMs) {
  if (nowMs < nextShootingStarAt) return;
  nextShootingStarAt = nowMs + 5000 + Math.random() * 10000;
  shootingStarPool.push({
    x: 0.05 + Math.random() * 0.60,
    y: 0.02 + Math.random() * 0.18,
    vx: 0.0025 + Math.random() * 0.003,
    vy: 0.001  + Math.random() * 0.0015,
    life: 1.0,
    tailLen: 0.06 + Math.random() * 0.08,
  });
}

function drawShootingStars(period, nowMs) {
  let alpha = 0;
  if (period === 'night') alpha = 1;
  else if (period === 'dusk' || period === 'dawn') alpha = 0.45;
  if (alpha <= 0) return;
  spawnShootingStar(nowMs);
  for (let i = shootingStarPool.length - 1; i >= 0; i--) {
    const s = shootingStarPool[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.016;
    if (s.life <= 0 || s.x > 1.05) { shootingStarPool.splice(i, 1); continue; }
    const x1 = s.x * W, y1 = s.y * H;
    const x0 = (s.x - s.tailLen) * W, y0 = (s.y - s.tailLen * 0.5) * H;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(255,255,240,0)');
    g.addColorStop(1, `rgba(255,255,240,${alpha * s.life})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = SCALE * 0.9;
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.globalAlpha = alpha * s.life;
    ctx.fillStyle = '#fffff0';
    ctx.fillRect(Math.round(x1 - SCALE * 0.5), Math.round(y1 - SCALE * 0.5), SCALE, SCALE);
  }
  ctx.globalAlpha = 1;
}

// ── Tęcza ──────────────────────────────────────────────────────────────────────
function drawRainbow(period, nowMs) {
  if (WEATHER.type !== 'partly_cloudy' && WEATHER.type !== 'rainy') return;
  if (period === 'night' || period === 'dusk') return;
  const pulse = 0.85 + 0.15 * Math.sin(nowMs * 0.0003);
  const baseAlpha = WEATHER.type === 'partly_cloudy' ? 0.20 : 0.11;
  const cx = W * 0.63, cy = H * 0.70;
  const colors = ['#FF4444','#FF8800','#FFEE00','#44CC44','#4488FF','#6644BB','#9944DD'];
  for (let i = 0; i < colors.length; i++) {
    const r = (0.26 + i * 0.024) * H;
    ctx.globalAlpha = baseAlpha * pulse;
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = SCALE * 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ── Niebo ──────────────────────────────────────────────────────────────────────
function drawSky(period) {
  const pal = skyPalettes[period];
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  grad.addColorStop(0, rgb(pal.top));
  grad.addColorStop(1, rgb(pal.bottom));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.65);
}

function drawStars(period, nowMs) {
  let alpha = 0;
  if (period === 'night') alpha = 1;
  else if (period === 'dusk') alpha = 0.6;
  else if (period === 'dawn') alpha = 0.3;
  if (alpha <= 0) return;
  for (const s of stars) {
    const blink = 0.6 + 0.4 * Math.sin(nowMs * 0.001 * s.speed + s.blink);
    ctx.globalAlpha = alpha * blink;
    ctx.fillStyle = '#fff';
    ctx.fillRect(Math.round(s.x * W), Math.round(s.y * H), s.r * SCALE, s.r * SCALE);
  }
  ctx.globalAlpha = 1;
}

function drawMoon(period, nowMs) {
  let alpha = 0;
  if (period === 'night') alpha = 1;
  else if (period === 'dusk') alpha = 0.5;
  else if (period === 'dawn') alpha = 0.4;
  if (alpha <= 0) return;
  const mx = W * 0.75, my = H * 0.12;
  const r = 4 * SCALE;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFFACD';
  ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DDD090';
  ctx.beginPath(); ctx.arc(mx + r * 0.3, my - r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx - r * 0.2, my + r * 0.3,  r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSun(period, nowMs) {
  let alpha = 0, sunY = H * 0.15;
  if (period === 'day')          { alpha = 1;   sunY = H * 0.12; }
  else if (period === 'morning') { alpha = 0.9; sunY = H * 0.18; }
  else if (period === 'evening') { alpha = 0.9; sunY = H * 0.22; }
  else if (period === 'dawn')    { alpha = 0.7; sunY = H * 0.38; }
  else if (period === 'dusk')    { alpha = 0.5; sunY = H * 0.42; }
  if (alpha <= 0) return;
  const sx = W * 0.15, r = 5 * SCALE;
  ctx.globalAlpha = alpha;
  const grd = ctx.createRadialGradient(sx, sunY, r * 0.5, sx, sunY, r * 2.5);
  grd.addColorStop(0, 'rgba(255,240,100,0.5)');
  grd.addColorStop(1, 'rgba(255,200,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(sx, sunY, r * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFE040';
  ctx.beginPath(); ctx.arc(sx, sunY, r, 0, Math.PI * 2); ctx.fill();
  const rayLen = 3 * SCALE;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + nowMs * 0.0005;
    const rx1 = sx + Math.cos(angle) * (r + 2);
    const ry1 = sunY + Math.sin(angle) * (r + 2);
    const rx2 = sx + Math.cos(angle) * (r + 2 + rayLen);
    const ry2 = sunY + Math.sin(angle) * (r + 2 + rayLen);
    ctx.lineWidth = 2 * SCALE;
    ctx.strokeStyle = '#FFD000';
    ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ── Chmury ─────────────────────────────────────────────────────────────────────
function drawCloud(cloud, nowMs, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = cloud.alpha * alpha;
  const cx = ((cloud.x + nowMs * cloud.speed) % 1.3 - 0.15) * W;
  const cy = cloud.y * H;
  const cw = cloud.w * 8 * SCALE;
  const ch = 4 * SCALE;
  ctx.fillStyle = '#fff';
  const blocks = [
    [0,         ch * 0.5,  cw,        ch      ],
    [cw * 0.15, 0,         cw * 0.5,  ch      ],
    [cw * 0.5,  ch * 0.2,  cw * 0.35, ch * 0.8],
  ];
  for (const [bx, by, bw, bh] of blocks) {
    ctx.fillRect(Math.round(cx + bx), Math.round(cy + by), Math.round(bw), Math.round(bh));
  }
  ctx.globalAlpha = 1;
}

// ── Ptaki (sylwetki) ───────────────────────────────────────────────────────────
function drawBirds(period, nowMs) {
  let alpha = 0;
  if (period === 'day') alpha = 1;
  else if (period === 'morning' || period === 'evening') alpha = 0.7;
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  for (const b of birds) {
    const bx = ((b.x + nowMs * b.speed) % 1.2 - 0.1) * W;
    const by = b.y * H;
    const flap = Math.sin(nowMs * 0.001 * b.flapSpeed + b.flap);
    const s = b.size * SCALE;
    ctx.fillStyle = '#222';
    ctx.fillRect(Math.round(bx - s * 2), Math.round(by + flap * s),       s, s);
    ctx.fillRect(Math.round(bx - s),     Math.round(by + flap * s * 0.5), s, s);
    ctx.fillRect(Math.round(bx),         Math.round(by),                   s, s);
    ctx.fillRect(Math.round(bx + s),     Math.round(by + flap * s * 0.5), s, s);
    ctx.fillRect(Math.round(bx + s * 2), Math.round(by + flap * s),       s, s);
  }
  ctx.globalAlpha = 1;
}
