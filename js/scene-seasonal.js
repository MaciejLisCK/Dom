// ── Pory roku ──────────────────────────────────────────────────────────────────
function getSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

const autumnLeaves = Array.from({length: 40}, () => ({
  x: Math.random(),
  y: -Math.random(),
  vx: (Math.random() - 0.5) * 0.00014,
  vy: 0.00025 + Math.random() * 0.00035,
  size: 1 + Math.floor(Math.random() * 2),
  color: ['#c84010','#e07820','#c03010','#e8a030','#f0c040','#a03018','#d05008'][Math.floor(Math.random() * 7)],
  swing: Math.random() * Math.PI * 2,
  swingSpeed: 0.4 + Math.random() * 1.2,
}));

const springFlowers = [
  [0.20, 0], [0.34, 0], [0.44, 0], [0.56, 0],
  [0.66, 0], [0.76, 0], [0.82, 0], [0.25, 0], [0.72, 0],
].map(([fx, _], i) => ({
  fx,
  colors: ['#ff88bb','#ffccee','#ff66aa','#ffffff','#ffaacc','#dd88ff','#ffddaa'][i % 7],
}));

function drawSeasonalEffects(period, nowMs) {
  const season = getSeason();
  const groundY = H * 0.65;
  if (season === 'autumn') {
    for (const l of autumnLeaves) {
      l.x += l.vx + Math.sin(nowMs * 0.001 * l.swingSpeed + l.swing) * 0.00018;
      l.y += l.vy;
      if (l.y > 1.02) { l.y = -0.02 - Math.random() * 0.05; l.x = Math.random(); }
      ctx.globalAlpha = 0.80;
      ctx.fillStyle = l.color;
      ctx.fillRect(Math.round(l.x * W), Math.round(l.y * H), l.size * SCALE, l.size * SCALE);
    }
    ctx.globalAlpha = 1;
  } else if (season === 'spring') {
    for (let i = 0; i < springFlowers.length; i++) {
      const { fx, colors: fc } = springFlowers[i];
      const bx = fx * W;
      const by = groundY + SCALE * 2;
      const blink = 0.65 + 0.35 * Math.sin(nowMs * 0.0008 + i * 1.1);
      ctx.globalAlpha = blink;
      ctx.fillStyle = fc;
      ctx.fillRect(Math.round(bx - SCALE), Math.round(by - 2 * SCALE), 2 * SCALE, 2 * SCALE);
      ctx.fillRect(Math.round(bx - 2 * SCALE), Math.round(by - SCALE), SCALE, SCALE);
      ctx.fillRect(Math.round(bx + SCALE), Math.round(by - SCALE), SCALE, SCALE);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(Math.round(bx), Math.round(by - SCALE), SCALE, SCALE);
    }
    ctx.globalAlpha = 1;
  }
}
