// ── Pomocnik pixel ─────────────────────────────────────────────────────────────
function px(x, y, color, size = 1) {
  ctx.fillStyle = typeof color === 'string' ? color : rgb(color);
  ctx.fillRect(Math.round(x), Math.round(y), size * SCALE, size * SCALE);
}

// ── Grunt ──────────────────────────────────────────────────────────────────────
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

// ── Ścieżka ────────────────────────────────────────────────────────────────────
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

// ── Płot ───────────────────────────────────────────────────────────────────────
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

// ── Drzewa ─────────────────────────────────────────────────────────────────────
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

// ── Krzewy ─────────────────────────────────────────────────────────────────────
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

// ── Robaczki świętojańskie ─────────────────────────────────────────────────────
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
