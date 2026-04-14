// Pixel art kura
function drawChicken(ch, period, nowMs, foxX) {
  const S = SCALE;
  const groundY = H * 0.65;
  const isNight = period === 'night' || period === 'dusk';

  ch.fleeing = Math.abs(ch.x - foxX) < 0.12;
  const spd = ch.fleeing ? ch.fleeSpeed : ch.speed;
  if (ch.fleeing) {
    ch.dir = ch.x > foxX ? 1 : -1;
  } else {
    if (Math.random() < 0.001) ch.dir *= -1;
  }
  ch.x += spd * ch.dir;
  if (ch.x > 0.90) { ch.dir = -1; ch.x = 0.90; }
  if (ch.x < 0.08) { ch.dir =  1; ch.x = 0.08; }
  ch.walkFrame += ch.fleeing ? 0.22 : 0.07;

  ch.cluckTimer -= 16;
  if (ch.cluckTimer <= 0) {
    ch.clucking = true;
    ch.cluckTimer = 2000 + Math.random() * 5000;
    setTimeout(() => { ch.clucking = false; }, ch.cluckDuration);
  }

  const cx  = ch.x * W;
  const cy  = groundY;
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

  // Nogi
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

  // Ogon
  ctx.fillStyle = tailSh;
  ctx.fillRect(Math.round(bx - 7*S), Math.round(cy - 12*S - bob), 2*S, 6*S);
  ctx.fillRect(Math.round(bx - 8*S), Math.round(cy - 15*S - bob), 2*S, 4*S);
  ctx.fillRect(Math.round(bx - 6*S), Math.round(cy - 16*S - bob), 2*S, 3*S);
  ctx.fillStyle = tailHi;
  ctx.fillRect(Math.round(bx - 7*S), Math.round(cy - 14*S - bob), S, 4*S);
  ctx.fillRect(Math.round(bx - 8*S), Math.round(cy - 16*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx - 6*S), Math.round(cy - 17*S - bob), S, 2*S);

  // Tułów
  ctx.fillStyle = bodySh;
  ctx.fillRect(Math.round(bx - 5*S), Math.round(cy - 9*S  - bob), 8*S, 2*S);
  ctx.fillStyle = bodyMid;
  ctx.fillRect(Math.round(bx - 5*S), Math.round(cy - 13*S - bob), 8*S, 5*S);
  ctx.fillStyle = bodyHi;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 15*S - bob), 6*S, 3*S);
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - 16*S - bob), 4*S, S);
  ctx.fillRect(Math.round(bx - 2*S), Math.round(cy - 11*S - bob), 3*S, 3*S);

  // Skrzydło
  ctx.fillStyle = wingHi;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 14*S - bob + wingFlap), 6*S, 4*S);
  ctx.fillStyle = wingSh;
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 11*S - bob + wingFlap), 6*S, 2*S);
  ctx.fillRect(Math.round(bx - 4*S), Math.round(cy - 10*S - bob + wingFlap), S, 2*S);
  ctx.fillRect(Math.round(bx - 3*S), Math.round(cy - 10*S - bob + wingFlap), S, S);
  ctx.fillRect(Math.round(bx + S),   Math.round(cy - 10*S - bob + wingFlap), S, 2*S);

  // Szyja + głowa
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

  // Grzebień
  ctx.fillStyle = combC;
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 26*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - 25*S - bob), S, 3*S);
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy - 24*S - bob), S, 2*S);
  ctx.fillRect(Math.round(bx + 2*S), Math.round(cy - 23*S - bob), 3*S, S);

  // Bródka
  ctx.fillStyle = wattleC;
  ctx.fillRect(Math.round(bx + 5*S), Math.round(cy - 20*S - bob), S,   2*S);
  ctx.fillRect(Math.round(bx + 5*S), Math.round(cy - 19*S - bob), 2*S, S);

  // Dziób
  ctx.fillStyle = beakC;
  ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 22*S - bob), 2*S, S);
  if (ch.clucking) {
    ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 21*S - bob), 2*S, S);
    ctx.fillStyle = '#cc2020';
    ctx.fillRect(Math.round(bx + 6*S), Math.round(cy - 21*S - bob), S, S);
  }

  // Oko
  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(bx + 3*S), Math.round(cy - 22*S - bob), 2*S, 2*S);
  ctx.fillStyle = eyeHi;
  ctx.fillRect(Math.round(bx + 4*S), Math.round(cy - 23*S - bob), S, S);

  ctx.restore();
}

// Pixel art lis
function drawDog(period, nowMs) {
  const S = SCALE;
  const groundY = H * 0.65;
  const isNight = period === 'night' || period === 'dusk';

  const IDLE_MS = 2500;
  const cursorActive = cursor.x !== null && (Date.now() - cursor.lastMoved) < IDLE_MS;
  let targetX;
  if (cursorActive) {
    targetX = Math.max(0.06, Math.min(0.92, cursor.x));
  } else if (tilt.active) {
    // Przechylenie telefonu (-45..45°) → pozycja lisa (0.06..0.92)
    targetX = Math.max(0.06, Math.min(0.92, (tilt.gamma + 45) / 90));
  } else {
    if (Math.abs(fox.x - fox.autoTarget) < 0.02 || Math.random() < 0.002) {
      fox.autoTarget = 0.15 + Math.random() * 0.70;
    }
    targetX = fox.autoTarget;
  }

  const foxSpeed = cursorActive ? 0.0010 : 0.0004;
  const dx2 = targetX - fox.x;
  if (Math.abs(dx2) > 0.005) {
    fox.x += Math.sign(dx2) * Math.min(Math.abs(dx2), foxSpeed);
    fox.dir = dx2 > 0 ? 1 : -1;
    fox.walkFrame = nowMs * 0.01;
  }

  const dx = fox.x * W;
  const dy = groundY;
  const flip = fox.dir === -1;

  ctx.save();
  if (flip) { ctx.translate(dx, 0); ctx.scale(-1, 1); ctx.translate(-dx, 0); }

  const bodyC   = isNight ? '#7a3010' : '#e05c10';
  const bellyC  = isNight ? '#5a4030' : '#f0c890';
  const darkC   = isNight ? '#1a0a00' : '#2a1000';
  const tailC   = isNight ? '#7a3010' : '#e05c10';
  const tailTip = isNight ? '#555555' : '#ffffff';
  const earIn   = isNight ? '#3a1010' : '#c03010';
  const noseC   = '#1a0800';
  const eyeC    = isNight ? '#ffcc00' : '#2a1800';

  const moving = Math.abs(targetX - fox.x) > 0.005;
  const leg  = moving ? Math.sin(fox.walkFrame) * 1.5 * S : 0;
  const leg2 = moving ? Math.sin(fox.walkFrame + Math.PI) * 1.5 * S : 0;

  // Tylne nogi
  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(dx - 5*S), Math.round(dy - 4*S + leg),  2*S, 4*S + Math.abs(leg));
  ctx.fillRect(Math.round(dx - 2*S), Math.round(dy - 4*S + leg2), 2*S, 4*S + Math.abs(leg2));
  // Tułów
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx - 7*S), Math.round(dy - 9*S), 11*S, 5*S);
  ctx.fillStyle = bellyC;
  ctx.fillRect(Math.round(dx - 4*S), Math.round(dy - 8*S), 6*S, 3*S);
  // Przednie nogi
  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(dx + 2*S), Math.round(dy - 4*S + leg2), 2*S, 4*S + Math.abs(leg2));
  ctx.fillRect(Math.round(dx + 5*S), Math.round(dy - 4*S + leg),  2*S, 4*S + Math.abs(leg));
  // Ogon
  const wag = Math.sin(nowMs * 0.005) * 3 * S;
  ctx.fillStyle = tailC;
  ctx.fillRect(Math.round(dx - 9*S),  Math.round(dy - 8*S  + wag * 0.5), 3*S, 3*S);
  ctx.fillRect(Math.round(dx - 11*S), Math.round(dy - 11*S + wag),        4*S, 3*S);
  ctx.fillRect(Math.round(dx - 12*S), Math.round(dy - 14*S + wag * 1.3),  3*S, 3*S);
  ctx.fillStyle = tailTip;
  ctx.fillRect(Math.round(dx - 13*S), Math.round(dy - 16*S + wag * 1.5), 3*S, 3*S);
  // Szyja + głowa
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 12*S), 3*S, 4*S);
  ctx.fillRect(Math.round(dx + 3*S), Math.round(dy - 16*S), 7*S, 5*S);
  // Uszy
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 20*S), 2*S, 4*S);
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 20*S), 2*S, 4*S);
  ctx.fillStyle = earIn;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 19*S), S, 3*S);
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 19*S), S, 3*S);
  // Pysk
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 14*S), 5*S, 3*S);
  ctx.fillStyle = bellyC;
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 13*S), 4*S, 2*S);
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(dx + 12*S), Math.round(dy - 14*S), S, S);
  // Oko
  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(dx + 5*S), Math.round(dy - 15*S), S, S);
  if (isNight) {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 16*S), 3*S, 3*S);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
