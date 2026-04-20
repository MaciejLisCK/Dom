// ── Dom ────────────────────────────────────────────────────────────────────────
function drawHouse(period) {
  const S = SCALE;
  const groundY = H * 0.65;
  const cx = W * 0.5;
  const isNight = period === 'night' || period === 'dusk';
  const wallC  = isNight ? '#5a4030' : '#c87840';
  const wallD  = isNight ? '#4a3020' : '#a06030';
  const roofC  = isNight ? '#2a1a1a' : '#6a2020';
  const roofD  = isNight ? '#1a0a0a' : '#4a1010';
  const winC   = isNight ? '#ffee80' : '#80c8ff';
  const doorC  = isNight ? '#3a2010' : '#7a4020';
  const chimC  = isNight ? '#333333' : '#666666';

  const hw = 40 * S, hh = 30 * S;
  const hx = cx - hw / 2, hy = groundY - hh;
  const roofH = 20 * S;

  // Dach
  ctx.fillStyle = roofC;
  ctx.beginPath(); ctx.moveTo(cx, hy - roofH); ctx.lineTo(hx + hw, hy); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = roofD;
  ctx.beginPath(); ctx.moveTo(cx, hy - roofH); ctx.lineTo(cx, hy); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fill();

  // Komin
  const chimX = cx + 8 * S, chimW = 5 * S, chimH = 12 * S, chimY = hy - roofH * 0.55;
  ctx.fillStyle = chimC;
  ctx.fillRect(Math.round(chimX), Math.round(chimY - chimH + roofH * 0.3), chimW, chimH);
  ctx.fillStyle = '#444';
  ctx.fillRect(Math.round(chimX - S), Math.round(chimY - chimH + roofH * 0.3 - S), chimW + 2 * S, 2 * S);
  if (isNight || period === 'dawn' || period === 'morning') {
    const t2 = Date.now() * 0.001;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      const sr  = (2 + i) * S;
      const sy2 = chimY - chimH + roofH * 0.3 - i * 5 * S + Math.sin(t2 + i) * S;
      const sx2 = chimX + chimW / 2 + Math.sin(t2 * 0.7 + i * 1.3) * 4 * S;
      ctx.fillStyle = `rgba(${isNight ? '200,200,200' : '180,180,180'},${0.7 - i * 0.12})`;
      ctx.beginPath(); ctx.arc(sx2, sy2, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Ściany
  ctx.fillStyle = wallC;
  ctx.fillRect(Math.round(hx), Math.round(hy), hw, hh);
  ctx.fillStyle = wallD;
  ctx.fillRect(Math.round(hx + hw * 0.6), Math.round(hy), hw * 0.4, hh);
  ctx.fillStyle = isNight ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)';
  for (let row = 0; row < 15; row++) {
    const offset = (row % 2) * 5 * S;
    for (let col = 0; col < 5; col++) {
      ctx.fillRect(Math.round(hx + col * 8 * S + offset), Math.round(hy + row * 2 * S + S), 7 * S, S * 0.5);
    }
  }

  // Okna
  function drawWindow(wx, wy, lit) {
    const ww = 10 * S, wh = 10 * S;
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(Math.round(wx - S), Math.round(wy - S), ww + 2 * S, wh + 2 * S);
    if (lit) {
      ctx.fillStyle = winC;
      ctx.fillRect(Math.round(wx), Math.round(wy), ww, wh);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(Math.round(wx + ww / 2 - S * 0.5), Math.round(wy), S, wh);
      ctx.fillRect(Math.round(wx), Math.round(wy + wh / 2 - S * 0.5), ww, S);
      if (isNight) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffee80';
        ctx.fillRect(Math.round(wx - 4 * S), Math.round(wy - 4 * S), ww + 8 * S, wh + 8 * S);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = '#1a3050';
      ctx.fillRect(Math.round(wx), Math.round(wy), ww, wh);
    }
  }
  drawWindow(hx + 5 * S,       hy + 8 * S, isNight || period === 'dusk');
  drawWindow(hx + hw - 15 * S, hy + 8 * S, isNight);

  // Drzwi
  const dw = 10 * S, dh = 16 * S;
  const dx = cx - dw / 2, dy = groundY - dh;
  ctx.fillStyle = '#2a1008';
  ctx.fillRect(Math.round(dx - S), Math.round(dy - S), dw + 2 * S, dh + 2 * S);
  ctx.fillStyle = doorC;
  ctx.fillRect(Math.round(dx), Math.round(dy), dw, dh);
  ctx.fillStyle = isNight ? '#5a3018' : '#8a5028';
  ctx.fillRect(Math.round(dx), Math.round(dy), dw, dh * 0.3);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(Math.round(dx + dw * 0.75), Math.round(dy + dh * 0.5), S, S);
  ctx.fillStyle = isNight ? '#3a3030' : '#8a7060';
  ctx.fillRect(Math.round(dx - 2 * S), Math.round(groundY - 2 * S), dw + 4 * S, 2 * S);
}

// ── Poświata kurnika (hover / pulse mobilny) ──────────────────────────────────
function drawCoopGlow(period, nowMs) {
  const isNight = period === 'night' || period === 'dusk';
  if (!isNight && !coopDoorManualOpen) return;

  let alpha;
  if (isTouchOnly) {
    const pulse = 0.5 + 0.5 * Math.sin(nowMs * 0.003);
    alpha = 0.06 + pulse * 0.10;
  } else {
    if (!coopGlow.hover) return;
    alpha = 0.22;
  }

  const S = SCALE;
  const groundY = H * 0.65;
  const coopCX  = W * 0.70;
  const coopH   = 12 * S;
  const roofH   = 8  * S;
  const hy      = groundY - coopH;
  const outerR  = 14 * S + roofH;

  const glowCX = coopCX;
  const glowCY = hy - roofH * 0.2;
  const grad = ctx.createRadialGradient(glowCX, glowCY, S * 2, glowCX, glowCY, outerR);
  grad.addColorStop(0, `rgba(255, 200, 80, ${alpha})`);
  grad.addColorStop(1, 'rgba(255, 160, 40, 0)');

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(glowCX, glowCY, outerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Kurnik ─────────────────────────────────────────────────────────────────────
function drawChickenCoop(period, nowMs, doorOverride = false) {
  const S = SCALE;
  const groundY = H * 0.65;
  const coopCX = W * 0.70;
  const isNight = (period === 'night' || period === 'dusk') && !doorOverride;

  const coopW = 16 * S, coopH = 12 * S, roofH = 8 * S;
  const hx = coopCX - coopW / 2;
  const hy = groundY - coopH;

  const wallC = isNight ? '#3a2810' : '#7a4828';
  const wallD = isNight ? '#2a1a08' : '#573018';
  const roofC = isNight ? '#1e1208' : '#4a2808';
  const roofD = isNight ? '#120a04' : '#2e1804';

  // Dach
  ctx.fillStyle = roofC;
  ctx.beginPath();
  ctx.moveTo(coopCX, hy - roofH);
  ctx.lineTo(hx + coopW, hy);
  ctx.lineTo(hx, hy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = roofD;
  ctx.beginPath();
  ctx.moveTo(coopCX, hy - roofH);
  ctx.lineTo(coopCX, hy);
  ctx.lineTo(hx, hy);
  ctx.closePath();
  ctx.fill();

  // Ściany
  ctx.fillStyle = wallC;
  ctx.fillRect(Math.round(hx), Math.round(hy), coopW, coopH);
  ctx.fillStyle = wallD;
  ctx.fillRect(Math.round(hx + coopW * 0.55), Math.round(hy), Math.round(coopW * 0.45), coopH);
  ctx.fillStyle = isNight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.18)';
  for (let row = 0; row < 5; row++) {
    ctx.fillRect(Math.round(hx), Math.round(hy + row * 2 * S + S), coopW, Math.max(1, Math.round(S * 0.5)));
  }

  // Wywietrznik
  ctx.fillStyle = '#080608';
  ctx.fillRect(Math.round(coopCX - S), Math.round(hy + S), 2 * S, S);

  // Okienko
  const winW = 5 * S, winH = 4 * S;
  const winX = hx + 2 * S, winY = hy + 3 * S;
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(Math.round(winX - S), Math.round(winY - S), winW + 2 * S, winH + 2 * S);

  if (isNight) {
    ctx.fillStyle = '#e88020';
    ctx.fillRect(Math.round(winX), Math.round(winY), winW, winH);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffaa40';
    ctx.fillRect(Math.round(winX - 3 * S), Math.round(winY - 3 * S), winW + 6 * S, winH + 6 * S);
    ctx.globalAlpha = 1;
    // Sylwetki kur w okienku
    ctx.fillStyle = 'rgba(30,12,4,0.9)';
    ctx.fillRect(Math.round(winX + S),         Math.round(winY + 2 * S), 2 * S, S);
    ctx.fillRect(Math.round(winX + 1.5 * S),   Math.round(winY + S),     S,     S);
    ctx.fillRect(Math.round(winX + 1.5 * S),   Math.round(winY + 0.5*S), S*0.5, S*0.5);
    ctx.fillRect(Math.round(winX + 3 * S),     Math.round(winY + 2 * S), 1.5*S, S);
    ctx.fillRect(Math.round(winX + 3.5 * S),   Math.round(winY + S),     S,     S);
    ctx.fillRect(Math.round(winX + 3.5 * S),   Math.round(winY + 0.5*S), S*0.5, S*0.5);
    ctx.fillRect(Math.round(winX + 0.5 * S),   Math.round(winY + S),     S*0.5, S);
  } else {
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(Math.round(winX), Math.round(winY), winW, winH);
  }

  // Drzwi
  const doorW = 4 * S, doorH = 6 * S;
  const doorX = coopCX + 2 * S;
  const doorY = groundY - doorH;
  ctx.fillStyle = '#0a0505';
  ctx.fillRect(Math.round(doorX - S), Math.round(doorY - S), doorW + 2 * S, doorH + S);

  if (isNight) {
    ctx.fillStyle = wallC;
    ctx.fillRect(Math.round(doorX), Math.round(doorY), doorW, doorH);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(Math.round(doorX + doorW / 2), Math.round(doorY), Math.max(1, Math.round(S * 0.5)), doorH);
  } else {
    ctx.fillStyle = '#080506';
    ctx.fillRect(Math.round(doorX), Math.round(doorY), doorW, doorH);
    // Drabinka
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(Math.round(doorX - S), Math.round(groundY - S), doorW + S, S);
    ctx.fillStyle = '#5a3010';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(Math.round(doorX + i * S * 0.8), Math.round(groundY - 2 * S + i * S * 0.5),
        doorW - i * S * 0.5, Math.max(1, Math.round(S * 0.4)));
    }
  }
}
