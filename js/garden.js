// ── Ogród kwiatowy ──────────────────────────────────────────────────────────────
const gardenFlowers = [
  { ox: -4, color: '#ff6688', color2: '#ff99aa' },
  { ox: -2, color: '#ffdd44', color2: '#ffee88' },
  { ox:  0, color: '#aa66ff', color2: '#cc99ff' },
  { ox:  2, color: '#ff8844', color2: '#ffaa77' },
  { ox:  4, color: '#44ccff', color2: '#88ddff' },
  { ox: -3, color: '#ff66aa', color2: '#ffaacc' },
  { ox:  3, color: '#88ee44', color2: '#aaff77' },
];

function drawGarden(period, nowMs) {
  const S = SCALE;
  const groundY = H * 0.65;
  const gx = W * 0.60;
  const isNight = period === 'night' || period === 'dusk';
  const season = getSeason();

  // Small wooden fence border for the garden patch
  const fenceC = isNight ? '#3a2010' : '#8a5020';
  const patchW = 12 * S;
  ctx.fillStyle = isNight ? '#1a2810' : '#4a6830';
  ctx.fillRect(Math.round(gx - patchW / 2 - S), Math.round(groundY - S), patchW + 2 * S, 2 * S);
  ctx.fillStyle = fenceC;
  for (let i = 0; i <= 4; i++) {
    const fx = gx - patchW / 2 + i * (patchW / 4);
    ctx.fillRect(Math.round(fx), Math.round(groundY - 4 * S), S, 4 * S);
    ctx.fillRect(Math.round(fx - Math.round(S * 0.5)), Math.round(groundY - 5 * S), 2 * S, S);
  }
  ctx.fillRect(Math.round(gx - patchW / 2), Math.round(groundY - 2 * S), patchW, S);

  if (season === 'winter') {
    // Snow-covered garden
    ctx.fillStyle = isNight ? '#c8d8e8' : '#ddeeff';
    ctx.fillRect(Math.round(gx - patchW / 2), Math.round(groundY - 3 * S), patchW, 3 * S);
    return;
  }

  if (season === 'autumn') {
    // Withered plants
    const witheredC = isNight ? '#3a2808' : '#7a5018';
    for (const f of gardenFlowers) {
      const fx = gx + f.ox * S;
      ctx.fillStyle = witheredC;
      ctx.fillRect(Math.round(fx), Math.round(groundY - 4 * S), S, 3 * S);
    }
    return;
  }

  // Spring / Summer: blooming flowers
  for (let i = 0; i < gardenFlowers.length; i++) {
    const f = gardenFlowers[i];
    const fx = gx + f.ox * S;
    const sway = Math.sin(nowMs * 0.001 + i * 0.9) * S * 0.3;

    // Stem
    ctx.fillStyle = isNight ? '#1a4010' : '#2a7020';
    ctx.fillRect(Math.round(fx + sway), Math.round(groundY - 5 * S), S, 4 * S);

    // Petal pulse
    const pulse = 0.75 + 0.25 * Math.sin(nowMs * 0.0008 + i * 1.3);
    ctx.globalAlpha = isNight ? pulse * 0.55 : pulse;

    // Petals (four around center)
    ctx.fillStyle = f.color;
    ctx.fillRect(Math.round(fx - S + sway), Math.round(groundY - 8 * S), S,     S);
    ctx.fillRect(Math.round(fx + S + sway), Math.round(groundY - 8 * S), S,     S);
    ctx.fillRect(Math.round(fx + sway),     Math.round(groundY - 9 * S), S,     S);
    ctx.fillRect(Math.round(fx + sway),     Math.round(groundY - 7 * S), S,     S);

    // Center
    ctx.fillStyle = f.color2;
    ctx.fillRect(Math.round(fx + sway), Math.round(groundY - 8 * S), S, S);

    ctx.globalAlpha = 1;
  }
}
