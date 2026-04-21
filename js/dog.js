// ── Pixel art lis ──────────────────────────────────────────────────────────────
function drawDog(period, nowMs) {
  const depthScale = 0.35 + fox.y * 0.85;
  const S = SCALE * depthScale;
  const isNight = period === 'night' || period === 'dusk';

  const IDLE_MS = 2500;
  const cursorActive = cursor.x !== null && (Date.now() - cursor.lastMoved) < IDLE_MS;
  let targetX, targetY;
  if (cursorActive) {
    targetX = Math.max(0.06, Math.min(0.92, cursor.x));
    const rawDepth = cursor.y !== null ? (cursor.y - 0.50) / 0.35 : fox.y;
    targetY = Math.max(0.06, Math.min(0.92, rawDepth));
  } else if (tilt.active) {
    const DEAD = 5, MAX = 45;
    const absG = Math.abs(tilt.gamma);
    const norm = absG < DEAD ? 0 : Math.sign(tilt.gamma) * (absG - DEAD) / (MAX - DEAD);
    targetX = Math.max(0.06, Math.min(0.92, 0.5 + norm * 0.43));
    targetY = fox.autoTargetY;
  } else {
    if (Math.abs(fox.x - fox.autoTarget) < 0.02 || Math.random() < 0.002) {
      fox.autoTarget = 0.15 + Math.random() * 0.70;
    }
    if (Math.abs(fox.y - fox.autoTargetY) < 0.02 || Math.random() < 0.0015) {
      fox.autoTargetY = 0.10 + Math.random() * 0.80;
    }
    targetX = fox.autoTarget;
    targetY = fox.autoTargetY;
  }

  const foxSpeed = cursorActive ? 0.0010 : tilt.active ? 0.0007 : 0.0004;
  const dx2 = targetX - fox.x;
  if (Math.abs(dx2) > 0.005) {
    fox.x += Math.sign(dx2) * Math.min(Math.abs(dx2), foxSpeed);
    fox.dir = dx2 > 0 ? 1 : -1;
    fox.walkFrame = nowMs * 0.01;
  }

  const foxSpeedY = cursorActive ? 0.0008 : 0.0003;
  const dy2 = targetY - fox.y;
  if (Math.abs(dy2) > 0.005) {
    fox.y += Math.sign(dy2) * Math.min(Math.abs(dy2), foxSpeedY);
  }

  const JUMP_DUR = 500;
  if (fox.jumpStartMs !== null) {
    const elapsed = nowMs - fox.jumpStartMs;
    if (elapsed >= JUMP_DUR) {
      fox.jumpOffset = 0;
      fox.jumpStartMs = null;
    } else {
      const tNorm = elapsed / JUMP_DUR;
      fox.jumpOffset = -S * 15 * 4 * tNorm * (1 - tNorm);
    }
  }

  const dx = fox.x * W;
  const dy = H * (0.62 + fox.y * 0.16) + fox.jumpOffset;
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

  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(dx - 5*S), Math.round(dy - 4*S + leg),  2*S, 4*S + Math.abs(leg));
  ctx.fillRect(Math.round(dx - 2*S), Math.round(dy - 4*S + leg2), 2*S, 4*S + Math.abs(leg2));
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx - 7*S), Math.round(dy - 9*S), 11*S, 5*S);
  ctx.fillStyle = bellyC;
  ctx.fillRect(Math.round(dx - 4*S), Math.round(dy - 8*S), 6*S, 3*S);
  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(dx + 2*S), Math.round(dy - 4*S + leg2), 2*S, 4*S + Math.abs(leg2));
  ctx.fillRect(Math.round(dx + 5*S), Math.round(dy - 4*S + leg),  2*S, 4*S + Math.abs(leg));

  const wag = Math.sin(nowMs * 0.005) * 3 * S;
  ctx.fillStyle = tailC;
  ctx.fillRect(Math.round(dx - 9*S),  Math.round(dy - 8*S  + wag * 0.5), 3*S, 3*S);
  ctx.fillRect(Math.round(dx - 11*S), Math.round(dy - 11*S + wag),        4*S, 3*S);
  ctx.fillRect(Math.round(dx - 12*S), Math.round(dy - 14*S + wag * 1.3),  3*S, 3*S);
  ctx.fillStyle = tailTip;
  ctx.fillRect(Math.round(dx - 13*S), Math.round(dy - 16*S + wag * 1.5), 3*S, 3*S);

  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 12*S), 3*S, 4*S);
  ctx.fillRect(Math.round(dx + 3*S), Math.round(dy - 16*S), 7*S, 5*S);
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 20*S), 2*S, 4*S);
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 20*S), 2*S, 4*S);
  ctx.fillStyle = earIn;
  ctx.fillRect(Math.round(dx + 4*S), Math.round(dy - 19*S), S, 3*S);
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 19*S), S, 3*S);

  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 14*S), 5*S, 3*S);
  ctx.fillStyle = bellyC;
  ctx.fillRect(Math.round(dx + 8*S), Math.round(dy - 13*S), 4*S, 2*S);
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(dx + 12*S), Math.round(dy - 14*S), S, S);

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
