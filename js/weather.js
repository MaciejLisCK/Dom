// Piastów, woj. mazowieckie – aktualna pogoda
const WEATHER = { temp: 13, wind: 3, desc: 'Zachmurzenie zmienne', type: 'cloudy' };

// Dodatkowe chmury pogodowe – ciemniejsze i cięższe
const weatherClouds = Array.from({length: 10}, (_, i) => ({
  x:     i * 0.11 + Math.random() * 0.08,
  y:     0.03 + Math.random() * 0.26,
  w:     5 + Math.floor(Math.random() * 7),
  speed: 0.000012 + Math.random() * 0.000022,
  alpha: 0.55 + Math.random() * 0.38,
  grey:  0.3  + Math.random() * 0.6,   // 0 = białe, 1 = ciemnoszare
}));

function drawWeatherClouds(nowMs) {
  for (const cl of weatherClouds) {
    const cx = ((cl.x + nowMs * cl.speed) % 1.35 - 0.15) * W;
    const cy = cl.y * H;
    const cw = cl.w * 8 * SCALE;
    const ch = 5 * SCALE;
    const g  = Math.round(200 - cl.grey * 55);     // 145–200
    ctx.globalAlpha = cl.alpha;
    ctx.fillStyle   = `rgb(${g},${g + 4},${g + 8})`;
    for (const [bx, by, bw, bh] of [
      [0,         ch * 0.5,  cw,        ch       ],
      [cw * 0.10, 0,         cw * 0.55, ch * 1.05],
      [cw * 0.45, ch * 0.15, cw * 0.40, ch * 0.90],
    ]) ctx.fillRect(Math.round(cx + bx), Math.round(cy + by), Math.round(bw), Math.round(bh));
    ctx.globalAlpha = 1;
  }
}

function drawOvercast(period) {
  const night = period === 'night' || period === 'dusk';
  ctx.globalAlpha = night ? 0.10 : 0.20;
  const gr = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  gr.addColorStop(0,    'rgb(155,170,188)');
  gr.addColorStop(0.55, 'rgba(180,192,205,0.45)');
  gr.addColorStop(1,    'rgba(200,210,215,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.globalAlpha = 1;
}
