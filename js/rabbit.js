// ── Zajączek ────────────────────────────────────────────────────────────────────
const rabbit = {
  x: 0.20, y: 0.40,
  dir: 1,
  mode: 'idle',      // idle | hopping
  idleLeft: 2000,
  hopTarget: 0.20,
  hopTargetY: 0.40,
  hopProgress: 0,
  hopHeight: 0,
};

function drawRabbit(period, nowMs) {
  const isNight = period === 'night' || period === 'dusk';

  // Movement logic
  const dt = 16;
  if (rabbit.mode === 'idle') {
    rabbit.idleLeft -= dt;
    if (rabbit.idleLeft <= 0) {
      rabbit.mode = 'hopping';
      rabbit.hopTarget  = 0.10 + Math.random() * 0.80;
      rabbit.hopTargetY = 0.10 + Math.random() * 0.80;
      rabbit.hopProgress = 0;
      rabbit.dir = rabbit.hopTarget > rabbit.x ? 1 : -1;
    }
    // Flee from fox when nearby
    const dist = Math.hypot(rabbit.x - fox.x, rabbit.y - fox.y);
    if (dist < 0.22) {
      rabbit.hopTarget  = rabbit.x + (rabbit.x - fox.x) * 0.8;
      rabbit.hopTargetY = rabbit.y + (rabbit.y - fox.y) * 0.8;
      rabbit.hopTarget  = Math.max(0.08, Math.min(0.92, rabbit.hopTarget));
      rabbit.hopTargetY = Math.max(0.08, Math.min(0.92, rabbit.hopTargetY));
      rabbit.mode = 'hopping';
      rabbit.dir = rabbit.hopTarget > rabbit.x ? 1 : -1;
    }
  } else {
    rabbit.hopProgress = Math.min(1, rabbit.hopProgress + 0.055);
    rabbit.hopHeight = Math.sin(rabbit.hopProgress * Math.PI) * 0.07;
    const dx = rabbit.hopTarget  - rabbit.x;
    const dy = rabbit.hopTargetY - rabbit.y;
    rabbit.x += dx * 0.055;
    rabbit.y += dy * 0.055;
    if (rabbit.hopProgress >= 1) {
      rabbit.mode = 'idle';
      rabbit.idleLeft = 800 + Math.floor(Math.random() * 2000);
    }
  }

  rabbit.x = Math.max(0.05, Math.min(0.95, rabbit.x));
  rabbit.y = Math.max(0.05, Math.min(0.95, rabbit.y));

  const depthScale = 0.35 + rabbit.y * 0.85;
  const RS = SCALE * 0.55 * depthScale;
  const rx = rabbit.x * W;
  const ry = H * (0.62 + rabbit.y * 0.16) - rabbit.hopHeight * H;
  const flip = rabbit.dir === -1;

  const bodyC  = isNight ? '#c0c0a8' : '#e8e8d0';
  const shadowC = isNight ? '#909080' : '#c0c0a8';
  const noseC  = '#ffaabb';
  const eyeC   = isNight ? '#ffcc44' : '#222211';

  ctx.save();
  if (flip) { ctx.translate(rx * 2, 0); ctx.scale(-1, 1); }

  // Body
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(rx - 4 * RS), Math.round(ry - 6 * RS), 8 * RS, 6 * RS);
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(rx + RS),     Math.round(ry - 5 * RS), 3 * RS, 4 * RS);
  // Belly
  ctx.fillStyle = isNight ? '#d8d8c8' : '#fffff0';
  ctx.fillRect(Math.round(rx - 2 * RS), Math.round(ry - 5 * RS), 4 * RS, 3 * RS);

  // Head
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(rx + RS),     Math.round(ry - 10 * RS), 5 * RS, 5 * RS);
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(rx + 4 * RS), Math.round(ry - 9 * RS),  2 * RS, 3 * RS);

  // Ears (long and upright, droop slightly when hopping)
  const earDroop = rabbit.mode === 'hopping' ? RS : 0;
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(rx + 2 * RS), Math.round(ry - 16 * RS + earDroop), RS, 6 * RS);
  ctx.fillRect(Math.round(rx + 4 * RS), Math.round(ry - 15 * RS + earDroop * 0.5), RS, 6 * RS);
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(rx + 3 * RS), Math.round(ry - 14 * RS + earDroop), Math.round(RS * 0.5), 4 * RS);
  ctx.fillRect(Math.round(rx + 5 * RS), Math.round(ry - 13 * RS + earDroop * 0.5), Math.round(RS * 0.5), 4 * RS);

  // Nose
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(rx + 6 * RS), Math.round(ry - 8 * RS), RS, RS);

  // Eye
  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(rx + 3 * RS), Math.round(ry - 9 * RS), RS, RS);
  if (isNight) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(Math.round(rx + 2 * RS), Math.round(ry - 10 * RS), 3 * RS, 3 * RS);
    ctx.globalAlpha = 1;
  }

  // Cotton tail
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.round(rx - 5 * RS), Math.round(ry - 5 * RS), 2 * RS, 2 * RS);

  // Legs (front and back)
  ctx.fillStyle = shadowC;
  if (rabbit.mode === 'hopping') {
    // Legs extended during hop
    ctx.fillRect(Math.round(rx - 3 * RS), Math.round(ry), 2 * RS, 2 * RS);
    ctx.fillRect(Math.round(rx),          Math.round(ry), 2 * RS, 2 * RS);
  } else {
    ctx.fillRect(Math.round(rx - 2 * RS), Math.round(ry - RS), 2 * RS, RS);
    ctx.fillRect(Math.round(rx + RS),     Math.round(ry - RS), 2 * RS, RS);
  }

  ctx.restore();
}
