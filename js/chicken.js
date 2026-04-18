// ── Pixel art kura ─────────────────────────────────────────────────────────────
function drawChicken(ch, period, nowMs, foxX, foxY) {
  const depthScale = 0.35 + ch.y * 0.85;
  const S = SCALE * 0.65 * depthScale;
  const cy = H * (0.62 + ch.y * 0.16);
  const isNight = period === 'night' || period === 'dusk';

  ch.fleeing = Math.hypot(ch.x - foxX, ch.y - foxY) < 0.20;
  const justScared = ch.fleeing && !ch.wasFleeingLastFrame;
  ch.wasFleeingLastFrame = ch.fleeing;
  if (ch.eggCooldown > 0) ch.eggCooldown -= 16;
  if (justScared && ch.eggCooldown <= 0) {
    eggs.push({ x: ch.x, y: ch.y, life: 25000 });
    ch.eggCooldown = 10000;
    playCluck();
  }
  const spd = ch.fleeing ? ch.fleeSpeed : ch.speed;
  if (ch.fleeing) {
    ch.dir  = ch.x > foxX ? 1 : -1;
    ch.dirY = ch.y > foxY ? 1 : -1;
  } else {
    if (Math.random() < 0.001)  ch.dir  *= -1;
    if (Math.random() < 0.0008) ch.dirY *= -1;
  }
  ch.x += spd * ch.dir;
  ch.y += spd * ch.dirY * 0.6;
  if (ch.x > 0.90) { ch.dir = -1; ch.x = 0.90; }
  if (ch.x < 0.08) { ch.dir =  1; ch.x = 0.08; }
  if (ch.y > 0.92) { ch.dirY = -1; ch.y = 0.92; }
  if (ch.y < 0.08) { ch.dirY =  1; ch.y = 0.08; }
  ch.walkFrame += ch.fleeing ? 0.22 : 0.07;

  ch.cluckTimer -= 16;
  if (ch.cluckTimer <= 0) {
    ch.clucking = true;
    ch.cluckTimer = 2000 + Math.random() * 5000;
    setTimeout(() => { ch.clucking = false; }, ch.cluckDuration);
  }

  const cx  = ch.x * W;
  const bob = ch.fleeing
    ? Math.abs(Math.sin(ch.walkFrame)) * 2.5 * S
    : Math.abs(Math.sin(ch.walkFrame * 0.5)) * 0.8 * S;
  const wingFlap = ch.fleeing ? Math.sin(ch.walkFrame * 2) * 3 * S : 0;

  const bodyHi  = isNight ? '#9a8a70' : '#f5eedc';
  const bodyMid = isNight ? '#7a6a50' : '#d4c4a0';
  const bodySh  = isNight ? '#5a4a30' : '#b0a080';
  const wingHi  = isNight ? '#8a7a60' : '#e8dcc8';
  const wingSh  = isNight ? '#6a5a40' : '#c4b490';
  const tailHi  = isNight ? '#7a6a50' : '#d8cca8';
  const tailSh  = isNight ? '#5a4a30' : '#b09870';
  const combC   = isNight ? '#7a1818' : '#cc2020';
  const wattleC = isNight ? '#8a1a1a' : '#dd1818';
  const beakC   = isNight ? '#907020' : '#d4a030';
  const legC    = isNight ? '#908050' : '#c8a040';
  const scaleC  = isNight ? '#706030' : '#b09030';
  const eyeC    = '#1a1010';
  const eyeHi   = '#fffbe0';

  const flip = ch.dir === -1;
  ctx.save();
  if (flip) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  const bx = cx;
  const lstep = Math.sin(ch.walkFrame);
  const leg1y = cy - 4 * S + lstep * 1.5 * S;
  const leg2y = cy - 4 * S - lstep * 1.5 * S;

  ctx.fillStyle = legC;
  ctx.fillRect(Math.round(bx - S),   Math.round(cy - 8 * S - bob), S, 4 * S);
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 8 * S - bob), S, 4 * S);
  ctx.fillRect(Math.round(bx - S),   Math.round(leg1y - bob), S, Math.round(cy - leg1y + bob));
  ctx.fillRect(Math.round(bx + 2*S), Math.round(leg2y - bob), S, Math.round(cy - leg2y + bob));
  ctx.fillStyle = scaleC;
  ctx.fillRect(Math.round(bx - S),   Math.round(leg1y + S - bob), S, S);
  ctx.fillRect(Math.round(bx + 2*S), Math.round(leg2y + S - bob), S, S);
  ctx.fillStyle = legC;
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - S), 2*S, S);
  ctx.fillRect(Math.round(bx - S),   Math.round(cy - S), S,   S);
  ctx.fillRect(Math.round(bx),       Math.round(cy - S), 3*S, S);
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - S), S,   S);
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - S + S * 0.5), 2*S, S);
  ctx.fillStyle = scaleC;
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - S), S, S);
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy),     S, S);

  ctx.fillStyle = tailSh;
  ctx.fillRect(Math.round(bx - 7*S), Math.round(cy - 12*S - bob), 2*S, 6*S);
  ctx.fillRect(Math.round(bx - 8*S), Math.round(cy - 15*S - bob), 2*S, 4*S);
  ctx.fillRect(Math.round(bx - 6*S), Math.round(cy - 16*S - bob), 2*S, 3*S);
  ctx.fillStyle = tailHi;
  ctx.fillRect(Math.round(bx - 7*S), Math.round(cy - 14*S - bob), S, 4*S);
  ctx.fillRect(Math.round(bx - 8*S), Math.round(cy - 16*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx - 6*S), Math.round(cy - 17*S - bob), S, 2*S);

  ctx.fillStyle = bodySh;
  ctx.fillRect(Math.round(bx - 5*S), Math.round(cy - 9*S  - bob), 8*S, 2*S);
  ctx.fillStyle = bodyMid;
  ctx.fillRect(Math.round(bx - 5*S), Math.round(cy - 13*S - bob), 8*S, 5*S);
  ctx.fillStyle = bodyHi;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 15*S - bob), 6*S, 3*S);
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - 16*S - bob), 4*S, S);
  ctx.fillRect(Math.round(bx - 2*S), Math.round(cy - 11*S - bob), 3*S, 3*S);

  ctx.fillStyle = wingHi;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 14*S - bob + wingFlap), 6*S, 4*S);
  ctx.fillStyle = wingSh;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 11*S - bob + wingFlap), 6*S, 2*S);
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 10*S - bob + wingFlap), S, 2*S);
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - 10*S - bob + wingFlap), S, S);
  ctx.fillRect(Math.round(bx + S),   Math.round(cy - 10*S - bob + wingFlap), S, 2*S);

  ctx.fillStyle = bodyMid;
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 18*S - bob), 3*S, 4*S);
  ctx.fillStyle = bodyHi;
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 18*S - bob), 2*S, 4*S);
  ctx.fillStyle = bodyMid;
  ctx.fillRect(Math.round(bx + S),   Math.round(cy - 22*S - bob), 5*S, 4*S);
  ctx.fillStyle = bodyHi;
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 23*S - bob), 3*S, 2*S);
  ctx.fillRect(Math.round(bx + S),   Math.round(cy - 22*S - bob), S,   3*S);
  ctx.fillStyle = bodyMid;
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy - 21*S - bob), 2*S, 2*S);

  ctx.fillStyle = combC;
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 26*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - 25*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy - 24*S - bob), S, 2*S);
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 23*S - bob), 3*S, S);

  ctx.fillStyle = wattleC;
  ctx.fillRect(Math.round(bx + 5*S), Math.round(cy - 20*S - bob), S,   2*S);
  ctx.fillRect(Math.round(bx + 5*S), Math.round(cy - 19*S - bob), 2*S, S);

  ctx.fillStyle = beakC;
  ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 22*S - bob), 2*S, S);
  if (ch.clucking) {
    ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 21*S - bob), 2*S, S);
    ctx.fillStyle = '#cc2020';
    ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 21*S - bob), S, S);
  }

  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - 22*S - bob), 2*S, 2*S);
  ctx.fillStyle = eyeHi;
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy - 23*S - bob), S, S);

  ctx.restore();
}

// ── Pixel art jajko ────────────────────────────────────────────────────────────
function drawEgg(egg, period) {
  const ex = egg.x * W;
  const ey = H * (0.62 + egg.y * 0.16);
  const depthScale = 0.35 + egg.y * 0.85;
  const S = Math.max(1, Math.round(SCALE * 0.45 * depthScale));
  const isNight = period === 'night' || period === 'dusk';
  const eggC = isNight ? '#a09060' : '#f5e8c0';
  const eggSh = isNight ? '#706040' : '#c0b070';

  ctx.globalAlpha = egg.life < 4000 ? egg.life / 4000 : 1;
  ctx.fillStyle = eggC;
  ctx.fillRect(Math.round(ex - S),   Math.round(ey - 4*S), 2*S, S);
  ctx.fillRect(Math.round(ex - 2*S), Math.round(ey - 3*S), 4*S, 3*S);
  ctx.fillRect(Math.round(ex - S),   Math.round(ey),       2*S, S);
  ctx.fillStyle = eggSh;
  ctx.fillRect(Math.round(ex),       Math.round(ey - 3*S), 2*S, 4*S);
  ctx.globalAlpha = 1;
}
