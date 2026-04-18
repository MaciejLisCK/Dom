// ── Studnia ─────────────────────────────────────────────────────────────────────
function drawWell(period, nowMs) {
  const S = SCALE;
  const groundY = H * 0.65;
  const wx = W * 0.33;
  const isNight = period === 'night' || period === 'dusk';

  const woodC  = isNight ? '#3a2010' : '#7a4820';
  const woodD  = isNight ? '#281408' : '#5a3210';
  const roofC  = isNight ? '#201408' : '#4a2810';
  const waterC = isNight ? '#0a1828' : '#2860a0';
  const stoneC = isNight ? '#303030' : '#9a9a8a';
  const stoneD = isNight ? '#202020' : '#7a7a6a';
  const ropeC  = isNight ? '#504030' : '#c8a060';

  const wellW = 10 * S;
  const wellH = 5 * S;
  const bx = wx - wellW / 2;
  const by = groundY - wellH;

  // Stone ring base
  ctx.fillStyle = stoneD;
  ctx.fillRect(Math.round(bx - S),      Math.round(by + S), wellW + 2 * S, wellH);
  ctx.fillStyle = stoneC;
  ctx.fillRect(Math.round(bx),          Math.round(by), wellW, wellH);
  // Stone texture details
  ctx.fillStyle = stoneD;
  ctx.fillRect(Math.round(bx + 2 * S),  Math.round(by + S),     S, S);
  ctx.fillRect(Math.round(bx + 5 * S),  Math.round(by + 2 * S), S, S);
  ctx.fillRect(Math.round(bx + 8 * S),  Math.round(by + S),     S, S);

  // Water inside
  ctx.fillStyle = waterC;
  ctx.fillRect(Math.round(bx + S), Math.round(by + S), wellW - 2 * S, wellH - 2 * S);
  // Water shimmer
  ctx.globalAlpha = 0.4 + 0.3 * Math.sin(nowMs * 0.002);
  ctx.fillStyle = isNight ? '#204060' : '#88ccff';
  ctx.fillRect(Math.round(bx + 2 * S), Math.round(by + S),     3 * S, S);
  ctx.fillRect(Math.round(bx + 6 * S), Math.round(by + 2 * S), 2 * S, S);
  ctx.globalAlpha = 1;

  // Left post
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(bx - S), Math.round(groundY - 14 * S), 2 * S, 9 * S);
  ctx.fillStyle = woodD;
  ctx.fillRect(Math.round(bx - S), Math.round(groundY - 14 * S), S, 9 * S);

  // Right post
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(bx + wellW - S), Math.round(groundY - 14 * S), 2 * S, 9 * S);
  ctx.fillStyle = woodD;
  ctx.fillRect(Math.round(bx + wellW),     Math.round(groundY - 14 * S), S, 9 * S);

  // Horizontal crossbeam
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(bx - S), Math.round(groundY - 15 * S), wellW + 2 * S, 2 * S);

  // Roller / winch cylinder
  ctx.fillStyle = woodD;
  ctx.fillRect(Math.round(wx - 2 * S), Math.round(groundY - 17 * S), 4 * S, 4 * S);
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(wx - S),     Math.round(groundY - 17 * S), 2 * S, 4 * S);
  // Handle crank
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(bx + wellW + S), Math.round(groundY - 16 * S), 2 * S, S);
  ctx.fillRect(Math.round(bx + wellW + 2 * S), Math.round(groundY - 17 * S), S, 3 * S);

  // Roof (triangular pitched roof)
  ctx.fillStyle = roofC;
  ctx.beginPath();
  ctx.moveTo(wx, groundY - 21 * S);
  ctx.lineTo(bx + wellW + 3 * S, groundY - 14 * S);
  ctx.lineTo(bx - 3 * S,         groundY - 14 * S);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = woodD;
  ctx.beginPath();
  ctx.moveTo(wx, groundY - 21 * S);
  ctx.lineTo(wx, groundY - 14 * S);
  ctx.lineTo(bx - 3 * S, groundY - 14 * S);
  ctx.closePath();
  ctx.fill();

  // Rope hanging down with gentle sway
  const sway = Math.sin(nowMs * 0.0008) * S * 0.5;
  ctx.fillStyle = ropeC;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(
      Math.round(wx - Math.round(S * 0.5) + sway * (i / 4)),
      Math.round(groundY - 15 * S + i * 2 * S),
      S, S
    );
  }

  // Bucket
  const bucketY = groundY - 6 * S + Math.sin(nowMs * 0.0008) * S;
  ctx.fillStyle = woodC;
  ctx.fillRect(Math.round(wx + sway - 2 * S), Math.round(bucketY), 4 * S, 3 * S);
  ctx.fillStyle = woodD;
  ctx.fillRect(Math.round(wx + sway - 2 * S), Math.round(bucketY), 4 * S, S);
  // Bucket handle
  ctx.fillStyle = ropeC;
  ctx.fillRect(Math.round(wx + sway - S),     Math.round(bucketY - S), S, S);
  ctx.fillRect(Math.round(wx + sway + S),     Math.round(bucketY - S), S, S);
}
