// ── Zorza polarna (zima, noc) ────────────────────────────────────────────────────
function drawAurora(period, nowMs) {
  if (period !== 'night' && period !== 'dusk') return;
  const season = getSeason();
  if (season !== 'winter') return;

  const groundY = H * 0.65;
  const skyH = groundY;

  // Three aurora curtains with different colors and speeds
  const bands = [
    { color: [0, 255, 120],  yBase: 0.10, amp: 0.06, freq: 0.00045, phase: 0 },
    { color: [0, 200, 255],  yBase: 0.16, amp: 0.05, freq: 0.00038, phase: 1.5 },
    { color: [140, 0, 255],  yBase: 0.22, amp: 0.04, freq: 0.00055, phase: 3.0 },
  ];

  for (const band of bands) {
    const [r, g, b] = band.color;
    const segments = 20;
    const segW = W / segments;

    for (let i = 0; i < segments; i++) {
      const xLeft  = i * segW;
      const xRight = (i + 1) * segW;
      const xMid   = (i + 0.5) / segments;

      // Wavy top edge
      const waveL = Math.sin(nowMs * band.freq + i * 0.6 + band.phase) * band.amp;
      const waveR = Math.sin(nowMs * band.freq + (i + 1) * 0.6 + band.phase) * band.amp;
      const topL  = (band.yBase + waveL) * skyH;
      const topR  = (band.yBase + waveR) * skyH;
      const botL  = topL + 0.10 * skyH;
      const botR  = topR + 0.10 * skyH;

      // Brightness varies along width for curtain effect
      const bright = 0.5 + 0.5 * Math.sin(nowMs * 0.0003 + xMid * 5 + band.phase);
      const alpha  = 0.08 + bright * 0.12;

      const grad = ctx.createLinearGradient(xLeft, topL, xLeft, botL);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.7})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(xLeft,  topL);
      ctx.lineTo(xRight, topR);
      ctx.lineTo(xRight, botR);
      ctx.lineTo(xLeft,  botL);
      ctx.closePath();
      ctx.fill();
    }
  }
}
