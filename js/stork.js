// ── Bocian na kominie (wiosna/lato) ─────────────────────────────────────────────
const storkState = { lookTimer: 0, lookDir: 1, wingTimer: 0 };

function drawStork(period, nowMs) {
  const season = getSeason();
  if (season !== 'spring' && season !== 'summer') return;

  const S = SCALE;
  const groundY = H * 0.65;
  const cx = W * 0.5;
  const hh = 30 * S;
  const hy = groundY - hh;
  const roofH = 20 * S;
  const isNight = period === 'night' || period === 'dusk';

  // Chimney top position (mirrors scene-buildings.js)
  const chimX = cx + 8 * S;
  const chimW = 5 * S;
  const chimH = 12 * S;
  const chimY = hy - roofH * 0.55;
  const chimTopY = chimY - chimH + roofH * 0.3 - S;

  const sx = chimX + chimW / 2;  // stork stands centered on chimney
  const sy = chimTopY;

  // Nest on top of chimney
  const nestC = isNight ? '#302010' : '#7a5020';
  ctx.fillStyle = nestC;
  ctx.fillRect(Math.round(sx - 5 * S), Math.round(sy),          10 * S, 2 * S);
  ctx.fillRect(Math.round(sx - 4 * S), Math.round(sy - S),      8 * S,  S);
  ctx.fillRect(Math.round(sx - 5 * S), Math.round(sy + S),      2 * S,  S);
  ctx.fillRect(Math.round(sx + 3 * S), Math.round(sy + S),      2 * S,  S);
  ctx.fillStyle = isNight ? '#201408' : '#5a3808';
  ctx.fillRect(Math.round(sx - 3 * S), Math.round(sy),          S, S);
  ctx.fillRect(Math.round(sx + 2 * S), Math.round(sy),          S, S);
  ctx.fillRect(Math.round(sx - S),     Math.round(sy - S),      S, S);

  // State updates
  storkState.lookTimer += 16;
  if (storkState.lookTimer > 3000 + Math.floor(Math.random() * 5000)) {
    storkState.lookDir *= -1;
    storkState.lookTimer = 0;
  }

  const bodyC  = isNight ? '#aaaaaa' : '#ffffff';
  const darkC  = isNight ? '#222222' : '#111111';
  const beakC  = isNight ? '#884420' : '#dd5500';
  const legC   = isNight ? '#884420' : '#dd5500';
  const eyeC   = '#111111';

  const storkX = sx + storkState.lookDir * S;
  const flip   = storkState.lookDir === -1;

  ctx.save();
  if (flip) {
    ctx.translate(sx * 2, 0);
    ctx.scale(-1, 1);
  }

  // Legs (long, on the nest)
  ctx.fillStyle = legC;
  ctx.fillRect(Math.round(storkX - S),     Math.round(sy - 8 * S), S, 8 * S);
  ctx.fillRect(Math.round(storkX + 2 * S), Math.round(sy - 8 * S), S, 8 * S);
  // Feet/toes
  ctx.fillRect(Math.round(storkX - 2 * S), Math.round(sy - S), 2 * S, S);
  ctx.fillRect(Math.round(storkX - S),     Math.round(sy - S), 3 * S, S);
  ctx.fillRect(Math.round(storkX + 2 * S), Math.round(sy - S), 3 * S, S);

  // Body (white with black wing patches)
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(storkX - 3 * S), Math.round(sy - 18 * S), 8 * S, 10 * S);

  // Black wing patches
  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(storkX - 3 * S), Math.round(sy - 15 * S), 8 * S, 4 * S);
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(storkX - 2 * S), Math.round(sy - 15 * S), 6 * S, 3 * S);

  // Neck
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(storkX),         Math.round(sy - 24 * S), 2 * S, 6 * S);

  // Head
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(storkX - S),     Math.round(sy - 28 * S), 4 * S, 4 * S);

  // Beak (long orange)
  ctx.fillStyle = beakC;
  ctx.fillRect(Math.round(storkX + 3 * S), Math.round(sy - 27 * S), 5 * S, S);
  ctx.fillRect(Math.round(storkX + 3 * S), Math.round(sy - 26 * S), 4 * S, S);

  // Eye
  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(storkX + S),     Math.round(sy - 27 * S), S, S);
  ctx.fillStyle = '#ffeecc';
  ctx.fillRect(Math.round(storkX + S),     Math.round(sy - 28 * S), S, S);

  ctx.restore();
}
