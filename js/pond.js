// ── Oczko wodne ─────────────────────────────────────────────────────────────────
function drawPond(period, nowMs) {
  const S = SCALE;
  const isNight = period === 'night' || period === 'dusk';
  const season = getSeason();

  const cx = W * 0.75;
  const cy = H * 0.78;
  const rx = Math.round(W * 0.062);
  const ry = Math.round(rx * 0.38);

  let waterDeep, waterMid, waterShimmer;
  switch (period) {
    case 'night':
      waterDeep = '#060d18'; waterMid = '#0a1828'; waterShimmer = '#1a3048'; break;
    case 'dusk':
      waterDeep = '#0f1828'; waterMid = '#1a2840'; waterShimmer = '#4a5878'; break;
    case 'dawn':
      waterDeep = '#2a4868'; waterMid = '#3a6888'; waterShimmer = '#60a0c0'; break;
    case 'morning':
      waterDeep = '#306090'; waterMid = '#4888b0'; waterShimmer = '#80c0e0'; break;
    case 'evening':
      waterDeep = '#483868'; waterMid = '#605888'; waterShimmer = '#a090b8'; break;
    default:
      waterDeep = '#2860a0'; waterMid = '#3878b0'; waterShimmer = '#70b8e8';
  }

  const stoneC   = isNight ? '#2a2a2a' : '#9a8a78';
  const stoneD   = isNight ? '#181818' : '#7a6a58';
  const stoneLit = isNight ? '#383838' : '#b09880';

  // Outer stone rim
  ctx.fillStyle = stoneD;
  ctx.beginPath();
  ctx.ellipse(Math.round(cx), Math.round(cy), rx + 3 * S, ry + 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Deep water body
  ctx.fillStyle = waterDeep;
  ctx.beginPath();
  ctx.ellipse(Math.round(cx), Math.round(cy), rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upper water layer (lighter, slightly shifted up for depth illusion)
  ctx.fillStyle = waterMid;
  ctx.beginPath();
  ctx.ellipse(Math.round(cx), Math.round(cy - Math.round(ry * 0.15)), Math.round(rx * 0.82), Math.round(ry * 0.68), 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated shimmer lines
  const s1 = 0.28 + 0.22 * Math.sin(nowMs * 0.0012);
  const s2 = 0.25 + 0.22 * Math.sin(nowMs * 0.0017 + 1.5);
  const s3 = 0.20 + 0.18 * Math.sin(nowMs * 0.0009 + 2.8);
  ctx.fillStyle = waterShimmer;
  ctx.globalAlpha = s1;
  ctx.fillRect(Math.round(cx - rx * 0.42), Math.round(cy - ry * 0.28), Math.round(rx * 0.28), S);
  ctx.fillRect(Math.round(cx + rx * 0.12), Math.round(cy - ry * 0.08), Math.round(rx * 0.20), S);
  ctx.globalAlpha = s2;
  ctx.fillRect(Math.round(cx - rx * 0.18), Math.round(cy + ry * 0.12), Math.round(rx * 0.24), S);
  ctx.globalAlpha = s3;
  ctx.fillRect(Math.round(cx - rx * 0.52), Math.round(cy + ry * 0.02), Math.round(rx * 0.14), S);
  ctx.globalAlpha = 1;

  // Individual stones around the rim
  const numStones = 20;
  for (let i = 0; i < numStones; i++) {
    const angle = (i / numStones) * Math.PI * 2;
    const spread = 1 + (i % 3) * 0.12;
    const sx = cx + Math.cos(angle) * (rx + S * 1.6 * spread);
    const sy = cy + Math.sin(angle) * (ry + S * 0.9 * spread);
    const sw = Math.round(S * (1.4 + (i % 3) * 0.5));
    const sh = Math.round(S * (0.8 + (i % 2) * 0.4));
    ctx.fillStyle = i % 3 === 0 ? stoneD : (i % 3 === 1 ? stoneC : stoneLit);
    ctx.fillRect(Math.round(sx - sw / 2), Math.round(sy - sh / 2), sw, sh);
  }

  // Ripple ring
  const rippleScale = 0.42 + 0.12 * Math.sin(nowMs * 0.0005);
  const rippleAlpha = 0.14 + 0.08 * Math.sin(nowMs * 0.0008);
  ctx.globalAlpha = rippleAlpha;
  ctx.fillStyle = waterShimmer;
  ctx.beginPath();
  ctx.ellipse(Math.round(cx), Math.round(cy), Math.round(rx * rippleScale), Math.round(ry * rippleScale), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = waterMid;
  ctx.beginPath();
  ctx.ellipse(Math.round(cx), Math.round(cy), Math.max(1, Math.round(rx * rippleScale - S)), Math.max(1, Math.round(ry * rippleScale - S * 0.5)), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Lily pads (spring/summer)
  if (season !== 'winter' && season !== 'autumn') {
    const lilies = [
      { ox: -0.36, oy: -0.22, r: 1.8, hasFlower: true },
      { ox:  0.38, oy:  0.14, r: 1.4, hasFlower: false },
      { ox:  0.04, oy:  0.30, r: 1.6, hasFlower: season === 'spring' },
      { ox: -0.48, oy:  0.18, r: 1.2, hasFlower: false },
    ];
    const padC = isNight ? '#0a2808' : '#2a7018';
    const padD = isNight ? '#061404' : '#1a5010';

    for (let i = 0; i < lilies.length; i++) {
      const lp = lilies[i];
      const lx = cx + lp.ox * rx;
      const ly = cy + lp.oy * ry;
      const lr = lp.r * S;
      const sway = Math.sin(nowMs * 0.0007 + i * 1.2) * S * 0.3;

      ctx.fillStyle = padC;
      ctx.beginPath();
      ctx.ellipse(Math.round(lx + sway), Math.round(ly), Math.round(lr), Math.round(lr * 0.45), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = padD;
      ctx.beginPath();
      ctx.ellipse(Math.round(lx + sway), Math.round(ly + Math.round(lr * 0.12)), Math.round(lr * 0.65), Math.round(lr * 0.25), 0, 0, Math.PI * 2);
      ctx.fill();

      if (lp.hasFlower) {
        const fx = Math.round(lx + sway);
        const fy = Math.round(ly - lr * 0.55);
        ctx.globalAlpha = isNight ? 0.55 : 1;
        ctx.fillStyle = isNight ? '#601828' : '#ff6688';
        ctx.fillRect(fx - S, fy, S, S);
        ctx.fillRect(fx + S, fy, S, S);
        ctx.fillRect(fx, fy - S, S, S);
        ctx.fillRect(fx, fy + S, S, S);
        ctx.fillStyle = isNight ? '#504010' : '#ffee44';
        ctx.fillRect(fx, fy, S, S);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Winter: ice cover
  if (season === 'winter') {
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = isNight ? '#c8d8e8' : '#ddeeff';
    ctx.beginPath();
    ctx.ellipse(Math.round(cx), Math.round(cy), Math.round(rx * 0.92), Math.round(ry * 0.88), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(cx - rx * 0.25), Math.round(cy - ry * 0.2), Math.round(rx * 0.22), S);
    ctx.fillRect(Math.round(cx + rx * 0.05), Math.round(cy + ry * 0.1), Math.round(rx * 0.18), S);
    ctx.globalAlpha = 1;
  }
}
