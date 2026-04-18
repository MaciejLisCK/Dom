// ── Pogoda – Piastów, woj. mazowieckie ────────────────────────────────────────
const WEATHER = { temp: '–', wind: '–', desc: 'Pobieranie…', type: 'cloudy' };

function wmoToWeather(code) {
  if (code === 0)   return { type: 'clear',         desc: 'Bezchmurnie' };
  if (code <= 2)    return { type: 'partly_cloudy', desc: 'Częściowe zachmurzenie' };
  if (code === 3)   return { type: 'cloudy',        desc: 'Zachmurzenie całkowite' };
  if (code <= 48)   return { type: 'foggy',         desc: 'Mgła' };
  if (code <= 57)   return { type: 'rainy',         desc: 'Mżawka' };
  if (code <= 67)   return { type: 'rainy',         desc: 'Deszcz' };
  if (code <= 77)   return { type: 'snowy',         desc: 'Śnieg' };
  if (code <= 82)   return { type: 'rainy',         desc: 'Przelotny deszcz' };
  if (code <= 86)   return { type: 'snowy',         desc: 'Przelotny śnieg' };
  if (code <= 99)   return { type: 'stormy',        desc: 'Burza' };
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

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);

// ── Chmury pogodowe (ciemniejsze i cięższe) ────────────────────────────────────
const weatherClouds = Array.from({length: 10}, (_, i) => ({
  x:     i * 0.11 + Math.random() * 0.08,
  y:     0.03 + Math.random() * 0.26,
  w:     5 + Math.floor(Math.random() * 7),
  speed: 0.000012 + Math.random() * 0.000022,
  alpha: 0.55 + Math.random() * 0.38,
  grey:  0.3  + Math.random() * 0.6,
}));

function drawWeatherClouds(nowMs) {
  for (const cl of weatherClouds) {
    const cx = ((cl.x + nowMs * cl.speed) % 1.35 - 0.15) * W;
    const cy = cl.y * H;
    const cw = cl.w * 8 * SCALE;
    const ch = 5 * SCALE;
    const g  = Math.round(200 - cl.grey * 55);
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
