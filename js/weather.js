// Piastów, woj. mazowieckie – aktualna pogoda (pobierana z Open-Meteo)
const WEATHER = { temp: '–', wind: '–', desc: 'Pobieranie…', type: 'cloudy' };

// Mapowanie kodów WMO na typ pogody i opis po polsku
function wmoToWeather(code) {
  if (code === 0)                          return { type: 'clear',         desc: 'Bezchmurnie' };
  if (code <= 2)                           return { type: 'partly_cloudy', desc: 'Częściowe zachmurzenie' };
  if (code === 3)                          return { type: 'cloudy',        desc: 'Zachmurzenie całkowite' };
  if (code <= 48)                          return { type: 'foggy',         desc: 'Mgła' };
  if (code <= 57)                          return { type: 'rainy',         desc: 'Mżawka' };
  if (code <= 67)                          return { type: 'rainy',         desc: 'Deszcz' };
  if (code <= 77)                          return { type: 'snowy',         desc: 'Śnieg' };
  if (code <= 82)                          return { type: 'rainy',         desc: 'Przelotny deszcz' };
  if (code <= 86)                          return { type: 'snowy',         desc: 'Przelotny śnieg' };
  if (code <= 99)                          return { type: 'stormy',        desc: 'Burza' };
  return { type: 'cloudy', desc: 'Zachmurzenie zmienne' };
}

async function fetchWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=52.19&longitude=20.84' +
      '&current=temperature_2m,wind_speed_10m,weather_code' +
      '&wind_speed_unit=ms&timezone=Europe%2FWarsaw'
    );
    if (!res.ok) return;
    const data = await res.json();
    const c = data.current;
    const { type, desc } = wmoToWeather(c.weather_code);
    WEATHER.temp = Math.round(c.temperature_2m);
    WEATHER.wind = Math.round(c.wind_speed_10m);
    WEATHER.desc = desc;
    WEATHER.type = type;
    updateWeatherInfo();
  } catch (e) {
    // brak sieci – zostawiamy ostatnie wartości
  }
}

// Pierwsze pobranie i odświeżanie co 30 minut
fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);

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

// ── Deszcz ────────────────────────────────────────────────────────────────────
const rainDrops = Array.from({length: 200}, () => ({
  x:     Math.random(),
  y:     Math.random(),
  speed: 0.003 + Math.random() * 0.003,
  len:   4 + Math.floor(Math.random() * 6),
  alpha: 0.4 + Math.random() * 0.4,
}));

function drawRain(nowMs) {
  if (WEATHER.type !== 'rainy' && WEATHER.type !== 'stormy') return;
  const intensity = WEATHER.type === 'stormy' ? 1.0 : 0.65;
  ctx.strokeStyle = 'rgba(150,180,220,0.6)';
  ctx.lineWidth = SCALE * 0.5;
  for (const d of rainDrops) {
    d.y += d.speed;
    if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); }
    ctx.globalAlpha = d.alpha * intensity;
    ctx.beginPath();
    ctx.moveTo(d.x * W, d.y * H);
    ctx.lineTo(d.x * W + d.len * SCALE * 0.3, d.y * H + d.len * SCALE);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ── Śnieg ─────────────────────────────────────────────────────────────────────
const snowFlakes = Array.from({length: 120}, () => ({
  x:          Math.random(),
  y:          Math.random(),
  speed:      0.0004 + Math.random() * 0.0008,
  drift:      Math.random() * Math.PI * 2,
  driftSpeed: 0.3 + Math.random() * 0.8,
  size:       1 + Math.floor(Math.random() * 2),
  alpha:      0.6 + Math.random() * 0.4,
}));

function drawSnow(nowMs) {
  if (WEATHER.type !== 'snowy') return;
  for (const f of snowFlakes) {
    f.y += f.speed;
    f.x += Math.sin(nowMs * 0.001 * f.driftSpeed + f.drift) * 0.0003;
    if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(Math.round(f.x * W), Math.round(f.y * H), f.size * SCALE, f.size * SCALE);
  }
  ctx.globalAlpha = 1;
}

// ── Błyskawice ────────────────────────────────────────────────────────────────
const lightningState = { active: false, bolt: [], startedAt: 0, duration: 0, nextAt: 0 };

function generateBolt(lx) {
  const pts = [{x: lx, y: H * 0.05}];
  let cx = lx, cy = H * 0.05;
  while (cy < H * 0.62) {
    cx += (Math.random() - 0.5) * 28 * SCALE;
    cy += 18 * SCALE;
    pts.push({x: cx, y: Math.min(cy, H * 0.62)});
  }
  return pts;
}

function drawLightning(nowMs) {
  if (WEATHER.type !== 'stormy') return;
  const now = Date.now();
  if (!lightningState.active && now >= lightningState.nextAt) {
    const lx = (0.15 + Math.random() * 0.70) * W;
    lightningState.active    = true;
    lightningState.bolt      = generateBolt(lx);
    lightningState.startedAt = now;
    lightningState.duration  = 180 + Math.random() * 140;
    lightningState.nextAt    = now + 4000 + Math.random() * 7000;
  }
  if (!lightningState.active) return;
  const elapsed = now - lightningState.startedAt;
  if (elapsed > lightningState.duration) { lightningState.active = false; return; }
  const tL = elapsed / lightningState.duration;
  // Błysk ekranu
  ctx.globalAlpha = Math.max(0, 0.22 - tL * 0.22);
  ctx.fillStyle = '#fffff8';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  // Piorun (widoczny tylko w pierwszej połowie)
  if (tL < 0.45) {
    ctx.globalAlpha = 1 - tL / 0.45;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = SCALE * 1.5;
    ctx.beginPath();
    ctx.moveTo(lightningState.bolt[0].x, lightningState.bolt[0].y);
    for (let i = 1; i < lightningState.bolt.length; i++)
      ctx.lineTo(lightningState.bolt[i].x, lightningState.bolt[i].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ── Mgła ──────────────────────────────────────────────────────────────────────
function drawFog(period, nowMs) {
  if (WEATHER.type !== 'foggy') return;
  const groundY = H * 0.65;
  const night = period === 'night' || period === 'dusk';
  const r = night ? 100 : 200, g = night ? 115 : 212, b2 = night ? 130 : 218;
  for (let i = 0; i < 3; i++) {
    const fogH = (0.18 + i * 0.07) * H;
    const gr = ctx.createLinearGradient(0, groundY - fogH, 0, groundY + fogH * 0.25);
    gr.addColorStop(0,   `rgba(${r},${g},${b2},0)`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b2},${0.28 - i * 0.05})`);
    gr.addColorStop(1,   `rgba(${r},${g},${b2},0)`);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = gr;
    ctx.fillRect(0, Math.round(groundY - fogH), W, Math.round(fogH * 1.25));
  }
  // Zamglenie atmosferyczne
  const atmo = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  atmo.addColorStop(0, `rgba(${r},${g},${b2},0.18)`);
  atmo.addColorStop(1, `rgba(${r},${g},${b2},0)`);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = atmo;
  ctx.fillRect(0, 0, W, H * 0.72);
  ctx.globalAlpha = 1;
}
