// ── Wrona na płocie ─────────────────────────────────────────────────────────────
const crow = {
  postIndex: 5,        // which fence post to sit on
  mode: 'sit',         // sit | caw | flyaway | returning
  timer: 0,
  nextCaw: 4000 + Math.floor(Math.random() * 6000),
  flyX: 0,
  flyY: 0,
  returnAt: 0,
  alpha: 1,
};

function drawCrow(period, nowMs) {
  const S = SCALE;
  const groundY = H * 0.65;
  const isNight = period === 'night' || period === 'dusk';

  const startX = W * 0.05;
  const step = (W * 0.90) / 30;
  const postX = startX + crow.postIndex * step;
  const postTopY = groundY - 12 * S;

  crow.timer += 16;

  if (crow.mode === 'sit') {
    if (crow.timer > crow.nextCaw) {
      if (Math.random() < 0.3) {
        crow.mode = 'flyaway';
        crow.flyX = postX;
        crow.flyY = postTopY;
        crow.returnAt = nowMs + 12000 + Math.random() * 15000;
      } else {
        crow.mode = 'caw';
      }
      crow.timer = 0;
      crow.nextCaw = 3000 + Math.floor(Math.random() * 7000);
    }
  } else if (crow.mode === 'caw' && crow.timer > 700) {
    crow.mode = 'sit';
    crow.timer = 0;
  } else if (crow.mode === 'flyaway') {
    crow.flyX += 3.5 * S;
    crow.flyY -= 1.5 * S;
    crow.alpha = Math.max(0, crow.alpha - 0.025);
    if (crow.alpha <= 0) {
      crow.mode = 'returning';
      crow.alpha = 0;
    }
  } else if (crow.mode === 'returning' && nowMs > crow.returnAt) {
    crow.flyX = postX - 80 * S;
    crow.flyY = postTopY - 30 * S;
    crow.mode = 'landing';
  } else if (crow.mode === 'landing') {
    crow.flyX += 2 * S;
    crow.flyY += S;
    crow.alpha = Math.min(1, crow.alpha + 0.04);
    if (crow.flyX >= postX && crow.flyY >= postTopY) {
      crow.mode = 'sit';
      crow.alpha = 1;
      crow.timer = 0;
    }
  }

  if (crow.mode === 'flyaway' || crow.mode === 'landing') {
    _drawCrowBody(crow.flyX, crow.flyY, true, isNight, nowMs);
    return;
  }
  if (crow.mode === 'returning') return;

  _drawCrowBody(postX, postTopY, false, isNight, nowMs);
}

function _drawCrowBody(bx, by, flying, isNight, nowMs) {
  const S = SCALE;
  ctx.save();
  ctx.globalAlpha = crow.alpha;

  const bodyC = isNight ? '#1a1a1a' : '#222222';
  const shineC = isNight ? '#2a2a40' : '#3a3a55';  // blue-black sheen
  const beakC  = isNight ? '#333322' : '#555533';
  const eyeC   = '#ffeeaa';

  if (flying) {
    // Flying silhouette – wings spread
    const flap = Math.sin(nowMs * 0.015) * 3 * S;
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(bx - 6 * S), Math.round(by - 2 * S + flap), 4 * S, 2 * S);
    ctx.fillRect(Math.round(bx + 2 * S), Math.round(by - 2 * S + flap), 4 * S, 2 * S);
    ctx.fillRect(Math.round(bx - 2 * S), Math.round(by - S), 4 * S, 3 * S);
    ctx.fillRect(Math.round(bx),         Math.round(by - 3 * S), 2 * S, 2 * S);
  } else {
    // Perching body
    ctx.fillStyle = bodyC;
    ctx.fillRect(Math.round(bx - 3 * S), Math.round(by - 4 * S), 6 * S, 5 * S);
    ctx.fillStyle = shineC;
    ctx.fillRect(Math.round(bx - 2 * S), Math.round(by - 5 * S), 3 * S, 3 * S);
    ctx.fillStyle = bodyC;

    // Tail feathers
    ctx.fillRect(Math.round(bx - 5 * S), Math.round(by - 2 * S), 2 * S, 3 * S);
    ctx.fillRect(Math.round(bx - 6 * S), Math.round(by - S),     S,     2 * S);

    // Head
    ctx.fillRect(Math.round(bx - S),     Math.round(by - 8 * S), 4 * S, 4 * S);
    ctx.fillStyle = shineC;
    ctx.fillRect(Math.round(bx - S),     Math.round(by - 8 * S), 2 * S, 2 * S);

    // Beak
    const cawOpen = crow.mode === 'caw' && crow.timer < 400;
    ctx.fillStyle = beakC;
    ctx.fillRect(Math.round(bx + 3 * S), Math.round(by - 7 * S), 3 * S, S);
    if (cawOpen) {
      ctx.fillRect(Math.round(bx + 3 * S), Math.round(by - 6 * S), 3 * S, S);
      ctx.fillStyle = '#cc2200';
      ctx.fillRect(Math.round(bx + 3 * S), Math.round(by - 6 * S), 2 * S, S);
    }

    // Eye (tiny yellow dot)
    ctx.fillStyle = eyeC;
    ctx.fillRect(Math.round(bx + S), Math.round(by - 7 * S), S, S);

    // Feet gripping the post
    ctx.fillStyle = beakC;
    ctx.fillRect(Math.round(bx - 2 * S), Math.round(by), 2 * S, S);
    ctx.fillRect(Math.round(bx + S),     Math.round(by), 2 * S, S);
    ctx.fillRect(Math.round(bx - 3 * S), Math.round(by), S, S);
    ctx.fillRect(Math.round(bx + 3 * S), Math.round(by), S, S);
    ctx.fillRect(Math.round(bx - 4 * S), Math.round(by + S), S, S);

    // Head bobbing when cawing
    if (crow.mode === 'caw') {
      const bob = Math.sin(crow.timer * 0.03) * S;
      ctx.fillStyle = 'rgba(0,0,0,0.01)'; // force re-draw head shifted
      // (already drawn above, this is just a marker; real bob effect is in the head draw)
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}
