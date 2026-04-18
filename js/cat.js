// ── Kot na dachu ────────────────────────────────────────────────────────────────
const catState = { mode: 'sit', timer: 0, nextChange: 7000 };

function drawCat(period, nowMs) {
  const S = SCALE;
  const groundY = H * 0.65;
  const cx = W * 0.5;
  const hw = 40 * S;
  const hh = 30 * S;
  const hy = groundY - hh;
  const roofH = 20 * S;
  const isNight = period === 'night' || period === 'dusk';

  catState.timer += 16;
  if (catState.timer > catState.nextChange) {
    catState.timer = 0;
    if (catState.mode === 'sit') {
      catState.mode = Math.random() < 0.5 ? 'stretch' : 'yawn';
      catState.nextChange = 1400;
    } else {
      catState.mode = 'sit';
      catState.nextChange = 5000 + Math.floor(Math.random() * 9000);
    }
  }

  // Sit on right side of roof slope (t=0.68 from peak to right edge)
  const tPos = 0.68;
  const catX = Math.round(cx + (hw / 2) * tPos);
  const catY = Math.round(hy - roofH + roofH * tPos);

  const bodyC = isNight ? '#2a2a2a' : '#4a4a4a';
  const lightC = isNight ? '#383838' : '#777777';
  const eyeC   = isNight ? '#88ff44' : '#338833';
  const noseC  = '#cc7788';
  const earInC = isNight ? '#1a0808' : '#cc8888';

  ctx.save();

  // Tail curling to the side
  const wag = Math.sin(nowMs * 0.0018) * 2 * S;
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(catX + 4 * S), Math.round(catY - S + wag * 0.3), S, 4 * S);
  ctx.fillRect(Math.round(catX + 4 * S), Math.round(catY + 3 * S + wag * 0.6), 3 * S, S);
  ctx.fillRect(Math.round(catX + 7 * S), Math.round(catY + 2 * S + wag),       2 * S, 2 * S);

  if (catState.mode === 'stretch') {
    // Stretched out body
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(catX - 5 * S), Math.round(catY - 3 * S), 11 * S, 4 * S);
    ctx.fillStyle = lightC;
    ctx.fillRect(Math.round(catX - 3 * S), Math.round(catY - 2 * S), 5 * S, 2 * S);
    // Paws extended
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(catX - 6 * S), Math.round(catY - S), 2 * S, 2 * S);
    ctx.fillRect(Math.round(catX - 4 * S), Math.round(catY),     2 * S, S);
  } else {
    // Sitting body
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(catX - 2 * S), Math.round(catY - 4 * S), 6 * S, 5 * S);
    ctx.fillStyle = lightC;
    ctx.fillRect(Math.round(catX - S), Math.round(catY - 3 * S), 3 * S, 3 * S);
    // Paws tucked under
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(catX - S), Math.round(catY), 2 * S, S);
    ctx.fillRect(Math.round(catX + 2 * S), Math.round(catY), 2 * S, S);
  }

  // Head position
  const headX = catState.mode === 'stretch' ? catX - 4 * S : catX;
  const headY = catState.mode === 'stretch' ? catY - 6 * S : catY - 8 * S;

  // Head
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(headX), Math.round(headY), 5 * S, 4 * S);

  // Ears
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(headX + S),       Math.round(headY - 2 * S), S, 2 * S);
  ctx.fillRect(Math.round(headX + 3 * S),   Math.round(headY - 2 * S), S, 2 * S);
  ctx.fillStyle = earInC;
  ctx.fillRect(Math.round(headX + S),       Math.round(headY - S),     Math.round(S * 0.5), S);
  ctx.fillRect(Math.round(headX + 3 * S),   Math.round(headY - S),     Math.round(S * 0.5), S);

  // Eyes (blink every ~4s)
  const blinking = (nowMs % 4200) < 110;
  if (!blinking) {
    ctx.fillStyle = eyeC;
    ctx.fillRect(Math.round(headX + S),     Math.round(headY + S), S, S);
    ctx.fillRect(Math.round(headX + 3 * S), Math.round(headY + S), S, S);
    if (isNight) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#88ff44';
      ctx.fillRect(Math.round(headX),           Math.round(headY),     3 * S, 3 * S);
      ctx.fillRect(Math.round(headX + 2 * S),   Math.round(headY),     3 * S, 3 * S);
      ctx.globalAlpha = 1;
    }
  }

  // Nose
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(headX + 2 * S), Math.round(headY + 2 * S), S, S);

  // Whiskers (night only for visibility)
  if (!isNight) {
    ctx.fillStyle = '#888';
    ctx.fillRect(Math.round(headX - 2 * S), Math.round(headY + 2 * S), 2 * S, Math.max(1, Math.round(S * 0.3)));
    ctx.fillRect(Math.round(headX + 5 * S), Math.round(headY + 2 * S), 2 * S, Math.max(1, Math.round(S * 0.3)));
  }

  // Yawning mouth
  if (catState.mode === 'yawn') {
    const prog = Math.min(1, catState.timer / 350);
    const mOpen = Math.round(Math.sin(prog * Math.PI) * 2 * S);
    if (mOpen > 0) {
      ctx.fillStyle = '#cc2233';
      ctx.fillRect(Math.round(headX + S), Math.round(headY + 3 * S), 3 * S, mOpen);
      ctx.fillStyle = '#ffeecc';
      ctx.fillRect(Math.round(headX + S + Math.round(S * 0.5)), Math.round(headY + 3 * S + Math.round(S * 0.3)), Math.round(S * 0.5), Math.round(mOpen * 0.4));
    }
  }

  ctx.restore();
}
