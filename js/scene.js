// ── Gwiazdy spadające ─────────────────────────────────────────────────────────
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

// ── Tęcza ─────────────────────────────────────────────────────────────────────
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

// ── Pory roku ─────────────────────────────────────────────────────────────────
function getSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

const autumnLeaves = Array.from({length: 40}, () => ({
  x: Math.random(),
  y: -Math.random(),
  vx: (Math.random() - 0.5) * 0.00014,
  vy: 0.00025 + Math.random() * 0.00035,
  size: 1 + Math.floor(Math.random() * 2),
  color: ['#c84010','#e07820','#c03010','#e8a030','#f0c040','#a03018','#d05008'][Math.floor(Math.random() * 7)],
  swing: Math.random() * Math.PI * 2,
  swingSpeed: 0.4 + Math.random() * 1.2,
}));

const springFlowers = [
  [0.20, 0], [0.34, 0], [0.44, 0], [0.56, 0],
  [0.66, 0], [0.76, 0], [0.82, 0], [0.25, 0], [0.72, 0],
].map(([fx, _], i) => ({
  fx,
  colors: ['#ff88bb','#ffccee','#ff66aa','#ffffff','#ffaacc','#dd88ff','#ffddaa'][i % 7],
}));

function drawSeasonalEffects(period, nowMs) {
  const season = getSeason();
  const groundY = H * 0.65;
  if (season === 'autumn') {
    for (const l of autumnLeaves) {
      l.x += l.vx + Math.sin(nowMs * 0.001 * l.swingSpeed + l.swing) * 0.00018;
      l.y += l.vy;
      if (l.y > 1.02) { l.y = -0.02 - Math.random() * 0.05; l.x = Math.random(); }
      ctx.globalAlpha = 0.80;
      ctx.fillStyle = l.color;
      ctx.fillRect(Math.round(l.x * W), Math.round(l.y * H), l.size * SCALE, l.size * SCALE);
    }
    ctx.globalAlpha = 1;
  } else if (season === 'spring') {
    for (let i = 0; i < springFlowers.length; i++) {
      const { fx, colors: fc } = springFlowers[i];
      const bx = fx * W;
      const by = groundY + SCALE * 2;
      const blink = 0.65 + 0.35 * Math.sin(nowMs * 0.0008 + i * 1.1);
      ctx.globalAlpha = blink;
      ctx.fillStyle = fc;
      ctx.fillRect(Math.round(bx - SCALE), Math.round(by - 2 * SCALE), 2 * SCALE, 2 * SCALE);
      ctx.fillRect(Math.round(bx - 2 * SCALE), Math.round(by - SCALE), SCALE, SCALE);
      ctx.fillRect(Math.round(bx + SCALE), Math.round(by - SCALE), SCALE, SCALE);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(Math.round(bx), Math.round(by - SCALE), SCALE, SCALE);
    }
    ctx.globalAlpha = 1;
  }
}

// Pomocnik pixel
function px(x, y, color, size = 1) {
  ctx.fillStyle = typeof color === 'string' ? color : rgb(color);
  ctx.fillRect(Math.round(x), Math.round(y), size * SCALE, size * SCALE);
}

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
  if (period === 'day')     { alpha = 1;   sunY = H * 0.12; }
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
  ctx.fillStyle = '#FFD000';
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

function drawCloud(cloud, nowMs, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = cloud.alpha * alpha;
  const cx = ((cloud.x + nowMs * cloud.speed) % 1.3 - 0.15) * W;
  const cy = cloud.y * H;
  const cw = cloud.w * 8 * SCALE;
  const ch = 4 * SCALE;
  ctx.fillStyle = '#fff';
  const blocks = [
    [0,        ch * 0.5, cw,        ch      ],
    [cw * 0.15, 0,       cw * 0.5,  ch      ],
    [cw * 0.5,  ch * 0.2,cw * 0.35, ch * 0.8],
  ];
  for (const [bx, by, bw, bh] of blocks) {
    ctx.fillRect(Math.round(cx + bx), Math.round(cy + by), Math.round(bw), Math.round(bh));
  }
  ctx.globalAlpha = 1;
}

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

function drawGround(period) {
  const gc = groundColors[period];
  const groundY = H * 0.65;
  ctx.fillStyle = rgb(gc);
  ctx.fillRect(0, groundY, W, H - groundY);
  const darker = [Math.max(0, gc[0] - 15), Math.max(0, gc[1] - 25), Math.max(0, gc[2] - 10)];
  ctx.fillStyle = rgb(darker);
  ctx.fillRect(0, groundY + (H - groundY) * 0.5, W, (H - groundY) * 0.5);
  ctx.fillStyle = period === 'night' ? '#1a3a1a' : '#4aaa30';
  for (let x = 0; x < W; x += SCALE) {
    const h2 = (Math.sin(x * 0.05 + windOffset * 0.5) * 0.5 + 0.5) * 2 * SCALE;
    ctx.fillRect(x, Math.round(groundY - h2), SCALE, Math.round(h2 + SCALE));
  }
}

function drawHouse(period) {
  const S = SCALE;
  const groundY = H * 0.65;
  const cx = W * 0.5;
  const isNight = period === 'night' || period === 'dusk';
  const wallC  = isNight ? '#5a4030' : '#c87840';
  const wallD  = isNight ? '#4a3020' : '#a06030';
  const roofC  = isNight ? '#2a1a1a' : '#6a2020';
  const roofD  = isNight ? '#1a0a0a' : '#4a1010';
  const winC   = isNight ? '#ffee80' : '#80c8ff';
  const doorC  = isNight ? '#3a2010' : '#7a4020';
  const chimC  = isNight ? '#333333' : '#666666';

  const hw = 40 * S, hh = 30 * S;
  const hx = cx - hw / 2, hy = groundY - hh;
  const roofH = 20 * S;

  // Roof
  ctx.fillStyle = roofC;
  ctx.beginPath(); ctx.moveTo(cx, hy - roofH); ctx.lineTo(hx + hw, hy); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = roofD;
  ctx.beginPath(); ctx.moveTo(cx, hy - roofH); ctx.lineTo(cx, hy); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fill();
  // Chimney
  const chimX = cx + 8 * S, chimW = 5 * S, chimH = 12 * S, chimY = hy - roofH * 0.55;
  ctx.fillStyle = chimC;
  ctx.fillRect(Math.round(chimX), Math.round(chimY - chimH + roofH * 0.3), chimW, chimH);
  ctx.fillStyle = '#444';
  ctx.fillRect(Math.round(chimX - S), Math.round(chimY - chimH + roofH * 0.3 - S), chimW + 2 * S, 2 * S);
  if (isNight || period === 'dawn' || period === 'morning') {
    const t2 = Date.now() * 0.001;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      const sr  = (2 + i) * S;
      const sy2 = chimY - chimH + roofH * 0.3 - i * 5 * S + Math.sin(t2 + i) * S;
      const sx2 = chimX + chimW / 2 + Math.sin(t2 * 0.7 + i * 1.3) * 4 * S;
      ctx.fillStyle = `rgba(${isNight ? '200,200,200' : '180,180,180'},${0.7 - i * 0.12})`;
      ctx.beginPath(); ctx.arc(sx2, sy2, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Walls
  ctx.fillStyle = wallC;
  ctx.fillRect(Math.round(hx), Math.round(hy), hw, hh);
  ctx.fillStyle = wallD;
  ctx.fillRect(Math.round(hx + hw * 0.6), Math.round(hy), hw * 0.4, hh);
  ctx.fillStyle = isNight ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)';
  for (let row = 0; row < 15; row++) {
    const offset = (row % 2) * 5 * S;
    for (let col = 0; col < 5; col++) {
      ctx.fillRect(Math.round(hx + col * 8 * S + offset), Math.round(hy + row * 2 * S + S), 7 * S, S * 0.5);
    }
  }

  // Windows
  function drawWindow(wx, wy, lit) {
    const ww = 10 * S, wh = 10 * S;
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(Math.round(wx - S), Math.round(wy - S), ww + 2 * S, wh + 2 * S);
    if (lit) {
      ctx.fillStyle = winC;
      ctx.fillRect(Math.round(wx), Math.round(wy), ww, wh);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(Math.round(wx + ww / 2 - S * 0.5), Math.round(wy), S, wh);
      ctx.fillRect(Math.round(wx), Math.round(wy + wh / 2 - S * 0.5), ww, S);
      if (isNight) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffee80';
        ctx.fillRect(Math.round(wx - 4 * S), Math.round(wy - 4 * S), ww + 8 * S, wh + 8 * S);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = '#1a3050';
      ctx.fillRect(Math.round(wx), Math.round(wy), ww, wh);
    }
  }
  drawWindow(hx + 5 * S,       hy + 8 * S, isNight || period === 'dusk');
  drawWindow(hx + hw - 15 * S, hy + 8 * S, isNight);

  // Door
  const dw = 10 * S, dh = 16 * S;
  const dx = cx - dw / 2, dy = groundY - dh;
  ctx.fillStyle = '#2a1008';
  ctx.fillRect(Math.round(dx - S), Math.round(dy - S), dw + 2 * S, dh + 2 * S);
  ctx.fillStyle = doorC;
  ctx.fillRect(Math.round(dx), Math.round(dy), dw, dh);
  ctx.fillStyle = isNight ? '#5a3018' : '#8a5028';
  ctx.fillRect(Math.round(dx), Math.round(dy), dw, dh * 0.3);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(Math.round(dx + dw * 0.75), Math.round(dy + dh * 0.5), S, S);
  ctx.fillStyle = isNight ? '#3a3030' : '#8a7060';
  ctx.fillRect(Math.round(dx - 2 * S), Math.round(groundY - 2 * S), dw + 4 * S, 2 * S);
}

function drawTree(tx, baseY, h, period, wobble, tiltBias = 0) {
  const S = SCALE;
  const isNight = period === 'night' || period === 'dusk';
  const season  = getSeason();
  const trunkC  = isNight ? '#3a2010' : '#6a3a10';
  let leafC, leafD, leafH;
  if (isNight) {
    leafC = '#0a2a0a'; leafD = '#071507'; leafH = '#0f3a0f';
  } else if (season === 'autumn') {
    leafC = '#c84010'; leafD = '#8a2a08'; leafH = '#e0701a';
  } else if (season === 'winter') {
    leafC = '#2a3a2a'; leafD = '#1a2a1a'; leafH = '#3a4a3a';
  } else if (season === 'spring') {
    leafC = '#30b830'; leafD = '#208020'; leafH = '#48d448';
  } else {
    leafC = '#228822'; leafD = '#185018'; leafH = '#2aaa2a';
  }
  const tw = 3 * S, th = h * S;
  ctx.fillStyle = trunkC;
  ctx.fillRect(Math.round(tx - tw / 2), Math.round(baseY - th * 0.45), tw, Math.round(th * 0.45));
  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const lh = th * (0.45 - l * 0.08);
    const lw = tw * (4 - l * 0.5) + (layers - l) * 3 * S;
    const layerTilt = tiltBias * ((l + 1) / layers) * S;
    const ly = baseY - th * 0.45 - l * th * 0.22 + Math.sin(Date.now() * 0.001 * 0.5 + wobble) * wobble * S;
    const tipX = tx + Math.sin(Date.now() * 0.001 * 0.7 + wobble) * wobble * S * 0.5 + layerTilt;
    ctx.fillStyle = l === 1 ? leafD : leafC;
    ctx.beginPath();
    ctx.moveTo(Math.round(tipX), Math.round(ly - lh));
    ctx.lineTo(Math.round(tx + lw / 2), Math.round(ly));
    ctx.lineTo(Math.round(tx - lw / 2), Math.round(ly));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = leafH;
    ctx.beginPath();
    ctx.moveTo(Math.round(tipX), Math.round(ly - lh));
    ctx.lineTo(Math.round(tx), Math.round(ly));
    ctx.lineTo(Math.round(tx - lw * 0.2), Math.round(ly));
    ctx.closePath(); ctx.fill();
    if (season === 'winter' && !isNight) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = '#ddeeff';
      ctx.beginPath();
      ctx.moveTo(Math.round(tipX), Math.round(ly - lh));
      ctx.lineTo(Math.round(tx + lw * 0.28), Math.round(ly - lh * 0.55));
      ctx.lineTo(Math.round(tx - lw * 0.22), Math.round(ly - lh * 0.55));
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function drawBush(bx, by, size, period) {
  const S = SCALE;
  const isNight = period === 'night' || period === 'dusk';
  const c1 = isNight ? '#0a2a0a' : '#228830';
  const c2 = isNight ? '#071507' : '#185020';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? c2 : c1;
    ctx.beginPath();
    ctx.arc(bx + (i - 1) * size * S * 0.7, by, size * S * (0.7 + i * 0.1), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChickenCoop(period, nowMs, doorOverride = false) {
  const S = SCALE;
  const groundY = H * 0.65;
  const coopCX = W * 0.70;
  const isNight = (period === 'night' || period === 'dusk') && !doorOverride;

  const coopW = 16 * S, coopH = 12 * S, roofH = 8 * S;
  const hx = coopCX - coopW / 2;
  const hy = groundY - coopH;

  const wallC = isNight ? '#3a2810' : '#7a4828';
  const wallD = isNight ? '#2a1a08' : '#573018';
  const roofC = isNight ? '#1e1208' : '#4a2808';
  const roofD = isNight ? '#120a04' : '#2e1804';

  // Roof
  ctx.fillStyle = roofC;
  ctx.beginPath();
  ctx.moveTo(coopCX, hy - roofH);
  ctx.lineTo(hx + coopW, hy);
  ctx.lineTo(hx, hy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = roofD;
  ctx.beginPath();
  ctx.moveTo(coopCX, hy - roofH);
  ctx.lineTo(coopCX, hy);
  ctx.lineTo(hx, hy);
  ctx.closePath();
  ctx.fill();

  // Walls
  ctx.fillStyle = wallC;
  ctx.fillRect(Math.round(hx), Math.round(hy), coopW, coopH);
  ctx.fillStyle = wallD;
  ctx.fillRect(Math.round(hx + coopW * 0.55), Math.round(hy), Math.round(coopW * 0.45), coopH);

  // Deski (poziome linie)
  ctx.fillStyle = isNight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.18)';
  for (let row = 0; row < 5; row++) {
    ctx.fillRect(Math.round(hx), Math.round(hy + row * 2 * S + S), coopW, Math.max(1, Math.round(S * 0.5)));
  }

  // Wywietrznik (górna szczelina)
  ctx.fillStyle = '#080608';
  ctx.fillRect(Math.round(coopCX - S), Math.round(hy + S), 2 * S, S);

  // Okienko (lewa strona)
  const winW = 5 * S, winH = 4 * S;
  const winX = hx + 2 * S, winY = hy + 3 * S;
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(Math.round(winX - S), Math.round(winY - S), winW + 2 * S, winH + 2 * S);

  if (isNight) {
    // Ciepłe bursztynowe światło
    ctx.fillStyle = '#e88020';
    ctx.fillRect(Math.round(winX), Math.round(winY), winW, winH);
    // Poświata wokół okienka
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffaa40';
    ctx.fillRect(Math.round(winX - 3 * S), Math.round(winY - 3 * S), winW + 6 * S, winH + 6 * S);
    ctx.globalAlpha = 1;
    // Sylwetki kur w okienku
    ctx.fillStyle = 'rgba(30,12,4,0.9)';
    // Kura 1 (lewa)
    ctx.fillRect(Math.round(winX + S),         Math.round(winY + 2 * S), 2 * S, S);       // tułów
    ctx.fillRect(Math.round(winX + 1.5 * S),   Math.round(winY + S),     S,     S);        // głowa
    ctx.fillRect(Math.round(winX + 1.5 * S),   Math.round(winY + 0.5*S), S*0.5, S*0.5);  // grzebień
    // Kura 2 (prawa)
    ctx.fillRect(Math.round(winX + 3 * S),     Math.round(winY + 2 * S), 1.5*S, S);       // tułów
    ctx.fillRect(Math.round(winX + 3.5 * S),   Math.round(winY + S),     S,     S);        // głowa
    ctx.fillRect(Math.round(winX + 3.5 * S),   Math.round(winY + 0.5*S), S*0.5, S*0.5);  // grzebień
    // Ogon kury 1
    ctx.fillRect(Math.round(winX + 0.5 * S),   Math.round(winY + S),     S*0.5, S);
  } else {
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(Math.round(winX), Math.round(winY), winW, winH);
  }

  // Drzwi (prawa strona)
  const doorW = 4 * S, doorH = 6 * S;
  const doorX = coopCX + 2 * S;
  const doorY = groundY - doorH;
  ctx.fillStyle = '#0a0505';
  ctx.fillRect(Math.round(doorX - S), Math.round(doorY - S), doorW + 2 * S, doorH + S);

  if (isNight) {
    // Zamknięte drzwi
    ctx.fillStyle = wallC;
    ctx.fillRect(Math.round(doorX), Math.round(doorY), doorW, doorH);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(Math.round(doorX + doorW / 2), Math.round(doorY), Math.max(1, Math.round(S * 0.5)), doorH);
  } else {
    // Otwarte drzwi – ciemne wnętrze
    ctx.fillStyle = '#080506';
    ctx.fillRect(Math.round(doorX), Math.round(doorY), doorW, doorH);
    // Drabinka (wyjście dla kur)
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(Math.round(doorX - S), Math.round(groundY - S), doorW + S, S);
    ctx.fillStyle = '#5a3010';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(Math.round(doorX + i * S * 0.8), Math.round(groundY - 2 * S + i * S * 0.5),
        doorW - i * S * 0.5, Math.max(1, Math.round(S * 0.4)));
    }
  }
}

function drawFireflies(period, nowMs) {
  let alpha = 0;
  if (period === 'night') alpha = 1;
  else if (period === 'dusk') alpha = 0.5;
  if (alpha <= 0) return;
  for (const f of fireflies) {
    f.x = ((f.x + f.dx + 1) % 1);
    f.y = Math.max(0.5, Math.min(0.92, f.y + f.dy + Math.sin(nowMs * 0.001 * f.speed + f.phase) * 0.0005));
    const glow = 0.4 + 0.6 * Math.sin(nowMs * 0.003 * f.speed + f.phase);
    ctx.globalAlpha = alpha * glow;
    ctx.fillStyle = '#aaff44';
    const fx = f.x * W, fy = f.y * H;
    ctx.fillRect(Math.round(fx), Math.round(fy), SCALE, SCALE);
    ctx.globalAlpha = alpha * glow * 0.3;
    ctx.fillStyle = '#88ff22';
    ctx.fillRect(Math.round(fx - SCALE), Math.round(fy - SCALE), SCALE * 3, SCALE * 3);
  }
  ctx.globalAlpha = 1;
}

function drawPath(period) {
  const S = SCALE;
  const groundY = H * 0.65;
  const cx = W * 0.5;
  const isNight = period === 'night' || period === 'dusk';
  const pathW = 12 * S;
  for (let i = 0; i < 8; i++) {
    const pw = pathW + i * 2 * S;
    ctx.fillStyle = isNight ? (i % 2 ? '#3a2818' : '#4a3828') : (i % 2 ? '#b89868' : '#c8a878');
    ctx.fillRect(Math.round(cx - pw / 2), Math.round(groundY + i * 5 * S), pw, 5 * S);
  }
}

function drawFence(period) {
  const S = SCALE;
  const groundY = H * 0.65;
  const isNight = period === 'night' || period === 'dusk';
  const fc = isNight ? '#4a3820' : '#d4a060';
  const posts = 30;
  const startX = W * 0.05, endX = W * 0.95;
  const step = (endX - startX) / posts;
  ctx.fillStyle = fc;
  ctx.fillRect(Math.round(startX), Math.round(groundY - 7 * S), Math.round(endX - startX), S);
  ctx.fillRect(Math.round(startX), Math.round(groundY - 4 * S), Math.round(endX - startX), S);
  for (let i = 0; i <= posts; i++) {
    const px2 = startX + i * step;
    ctx.fillRect(Math.round(px2), Math.round(groundY - 10 * S), S * 2, 12 * S);
    ctx.fillRect(Math.round(px2 + S * 0.5), Math.round(groundY - 12 * S), S, 2 * S);
  }
}
