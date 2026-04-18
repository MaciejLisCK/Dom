// ── Motyle ─────────────────────────────────────────────────────────────────────
const butterflies = Array.from({length: 6}, (_, i) => ({
  x:         0.10 + Math.random() * 0.80,
  y:         0.15 + Math.random() * 0.65,
  vx:        (Math.random() - 0.5) * 0.00022,
  vy:        (Math.random() - 0.5) * 0.00011,
  phase:     Math.random() * Math.PI * 2,
  flapSpeed: 4 + Math.random() * 6,
  wingColor: ['#ff88cc','#ffdd55','#88ccff','#cc88ff','#ff9944','#88ffcc'][i],
  bodyColor: ['#993366','#886600','#224488','#663388','#883300','#007744'][i],
}));

function drawButterfly(bf, nowMs) {
  const depthScale = 0.4 + bf.y * 0.8;
  const S  = SCALE * 0.6 * depthScale;
  const bx = bf.x * W;
  const by = H * (0.62 + bf.y * 0.16);

  bf.x += bf.vx + Math.sin(nowMs * 0.0007 + bf.phase) * 0.00010;
  bf.y += bf.vy + Math.sin(nowMs * 0.0005 + bf.phase * 0.7) * 0.000055;
  if (bf.x > 0.93) bf.vx = -Math.abs(bf.vx);
  if (bf.x < 0.05) bf.vx =  Math.abs(bf.vx);
  if (bf.y > 0.88) bf.vy = -Math.abs(bf.vy);
  if (bf.y < 0.05) bf.vy =  Math.abs(bf.vy);

  const flap = Math.abs(Math.sin(nowMs * 0.001 * bf.flapSpeed + bf.phase));
  const ww   = Math.round(flap * 5 * S);
  if (ww < 1) return;

  ctx.fillStyle = bf.wingColor;
  ctx.fillRect(Math.round(bx - ww - S), Math.round(by - 3 * S), ww,             Math.round(3 * S));
  ctx.fillRect(Math.round(bx + S),      Math.round(by - 3 * S), ww,             Math.round(3 * S));
  ctx.fillRect(Math.round(bx - ww),     Math.round(by - S),     Math.round(ww * 0.7), Math.round(2 * S));
  ctx.fillRect(Math.round(bx + S),      Math.round(by - S),     Math.round(ww * 0.7), Math.round(2 * S));
  ctx.fillStyle = bf.bodyColor;
  ctx.fillRect(Math.round(bx - Math.round(S * 0.5)), Math.round(by - 5 * S), Math.round(S), Math.round(5 * S));
  ctx.fillRect(Math.round(bx - 2 * S), Math.round(by - 7 * S), Math.round(S), Math.round(2 * S));
  ctx.fillRect(Math.round(bx + S),     Math.round(by - 7 * S), Math.round(S), Math.round(2 * S));
  ctx.fillRect(Math.round(bx - 3 * S), Math.round(by - 8 * S), Math.round(S), Math.round(S));
  ctx.fillRect(Math.round(bx + 2 * S), Math.round(by - 8 * S), Math.round(S), Math.round(S));
}

function drawButterflies(period, nowMs) {
  let alpha = 0;
  if      (period === 'day')                             alpha = 1;
  else if (period === 'morning' || period === 'evening') alpha = 0.65;
  else if (period === 'dawn')                            alpha = 0.25;
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  for (const bf of butterflies) drawButterfly(bf, nowMs);
  ctx.globalAlpha = 1;
}
