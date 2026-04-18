// ── Konstelacje gwiazdowe ────────────────────────────────────────────────────────
// Pozycje w znormalizowanych współrzędnych nieba (x: 0-1, y: 0-0.55)
const CONSTELLATIONS = [
  {
    name: 'Wielki Wóz',
    stars: [
      [0.08, 0.08], [0.12, 0.06], [0.17, 0.07], [0.20, 0.10],
      [0.18, 0.14], [0.13, 0.15], [0.09, 0.13],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[3,5]],
    labelStar: 0,
  },
  {
    name: 'Kasjopeja',
    stars: [
      [0.55, 0.05], [0.60, 0.09], [0.65, 0.06], [0.70, 0.10], [0.75, 0.07],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
    labelStar: 2,
  },
  {
    name: 'Orion',
    stars: [
      [0.40, 0.28], [0.46, 0.26], [0.52, 0.28],
      [0.43, 0.33], [0.49, 0.33],
      [0.40, 0.38], [0.52, 0.38],
    ],
    lines: [[0,1],[1,2],[0,3],[2,4],[3,4],[3,5],[4,6]],
    labelStar: 1,
  },
  {
    name: 'Mała Niedźwiedzica',
    stars: [
      [0.28, 0.04], [0.31, 0.07], [0.34, 0.08], [0.36, 0.12],
      [0.33, 0.15], [0.29, 0.14], [0.26, 0.11],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
    labelStar: 0,
  },
];

function drawConstellations(period, nowMs) {
  if (period !== 'night') return;

  const skyH = H * 0.65;
  const alpha = 0.30 + 0.10 * Math.sin(nowMs * 0.0003);

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#aaccff';
  ctx.lineWidth = Math.max(1, SCALE * 0.4);

  for (const con of CONSTELLATIONS) {
    // Draw connecting lines
    for (const [a, b] of con.lines) {
      const [ax, ay] = con.stars[a];
      const [bx, by] = con.stars[b];
      ctx.beginPath();
      ctx.moveTo(ax * W, ay * skyH);
      ctx.lineTo(bx * W, by * skyH);
      ctx.stroke();
    }

    // Draw star dots
    ctx.fillStyle = '#ddeeff';
    for (const [sx, sy] of con.stars) {
      ctx.fillRect(
        Math.round(sx * W - SCALE * 0.5),
        Math.round(sy * skyH - SCALE * 0.5),
        Math.max(1, SCALE), Math.max(1, SCALE)
      );
    }

    // Label near the labelStar
    const [lx, ly] = con.stars[con.labelStar];
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = '#aaccee';
    ctx.font = `${Math.max(8, SCALE * 4)}px monospace`;
    ctx.fillText(con.name, Math.round(lx * W + 2 * SCALE), Math.round(ly * skyH - 2 * SCALE));
    ctx.globalAlpha = alpha;
  }

  ctx.globalAlpha = 1;
}
