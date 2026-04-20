// ── Główna pętla rysowania ─────────────────────────────────────────────────────
function draw(nowMs) {
  const now  = new Date();
  const hour = now.getHours(), min = now.getMinutes(), sec = now.getSeconds();
  const period = getPeriod(hour);

  windOffset = nowMs * 0.0005;
  t          = nowMs * 0.001;

  ctx.clearRect(0, 0, W, H);

  // Niebo
  drawSky(period);
  drawAurora(period, nowMs);
  drawStars(period, nowMs);
  drawConstellations(period, nowMs);
  drawShootingStars(period, nowMs);
  drawMoon(period, nowMs);
  drawSun(period, nowMs);
  drawRainbow(period, nowMs);

  // Zachmurzenie (overlay pogodowy)
  drawOvercast(period);

  // Chmury
  const baseAlpha  = period === 'day' ? 1 : period === 'morning' || period === 'evening' ? 0.6 : period === 'dawn' ? 0.4 : 0.15;
  const cloudAlpha = WEATHER.type === 'cloudy' ? Math.min(1, baseAlpha + 0.25) : (baseAlpha > 0.15 ? baseAlpha : 0);
  for (const c of clouds) drawCloud(c, nowMs, cloudAlpha);
  drawWeatherClouds(nowMs);

  drawBirds(period, nowMs);
  drawGround(period);
  drawPuddles(period, nowMs);
  drawPath(period);
  drawFence(period);
  drawCrow(period, nowMs);

  // Drzewa
  const groundY = H * 0.65;
  const tiltBias = tilt.active ? -(tilt.gamma / 45) * 8 : 0;
  drawTree(W * 0.12, groundY, 45, period, 1.2, tiltBias);
  drawTree(W * 0.18, groundY, 38, period, 0.8, tiltBias);
  drawTree(W * 0.82, groundY, 42, period, 1.0, tiltBias);
  drawTree(W * 0.88, groundY, 35, period, 1.5, tiltBias);
  drawTree(W * 0.72, groundY, 40, period, 0.9, tiltBias);
  drawTree(W * 0.28, groundY, 36, period, 1.3, tiltBias);

  // Krzewy
  drawBush(W * 0.38, groundY, 5,   period);
  drawBush(W * 0.62, groundY, 4,   period);
  drawBush(W * 0.35, groundY, 3,   period);
  drawBush(W * 0.65, groundY, 3.5, period);

  drawWell(period, nowMs);
  drawGarden(period, nowMs);
  drawPond(period, nowMs);
  drawHouse(period);
  drawCoopGlow(period, nowMs);
  drawChickenCoop(period, nowMs, coopDoorManualOpen);
  drawCat(period, nowMs);
  drawStork(period, nowMs);
  drawSeasonalEffects(period, nowMs);
  drawFog(period, nowMs);

  // Lis zjadający kurę
  const EAT_DIST = 0.07;
  for (const ch of chickens) {
    if (!ch.eaten && Math.hypot(ch.x - fox.x, ch.y - fox.y) < EAT_DIST) {
      ch.eaten = true;
      ch.eatRespawn = nowMs + 8000 + Math.random() * 4000;
      foxScore++;
      foxScoreFlash = 2000;
      const fx = ch.x * W;
      const fy = H * (0.62 + ch.y * 0.16);
      for (let i = 0; i < 10; i++) {
        feathers.push({
          x: fx, y: fy,
          vx: (Math.random() - 0.5) * 4,
          vy: -1.5 - Math.random() * 2.5,
          life: 1.0,
          size: SCALE * (0.6 + Math.random() * 0.8),
          color: ['#f5eedc', '#d4c4a0', '#e8dcc8', '#c4b490'][Math.floor(Math.random() * 4)],
        });
      }
    }
    if (ch.eaten && nowMs > ch.eatRespawn) {
      ch.eaten = false;
      ch.x = 0.12 + Math.random() * 0.76;
      ch.y = 0.12 + Math.random() * 0.76;
    }
  }

  // Pióra
  for (let i = feathers.length - 1; i >= 0; i--) {
    const f = feathers[i];
    f.x  += f.vx;
    f.y  += f.vy;
    f.vy += 0.06;
    f.vx *= 0.98;
    f.life -= 0.012;
    if (f.life <= 0) { feathers.splice(i, 1); continue; }
    ctx.globalAlpha = f.life;
    ctx.fillStyle = f.color;
    ctx.fillRect(Math.round(f.x), Math.round(f.y), Math.round(f.size), Math.round(f.size));
    ctx.globalAlpha = 1;
  }

  // Aktualizacja jajek
  for (let i = eggs.length - 1; i >= 0; i--) {
    eggs[i].life -= 16;
    if (eggs[i].life <= 0) eggs.splice(i, 1);
  }

  // Wynik lisa – timer flasha
  if (foxScoreFlash > 0) foxScoreFlash -= 16;

  // Kury, lis i zajączek – głębokość
  const coopNight = (period === 'night' || period === 'dusk') && !coopDoorManualOpen;
  const allEntities = [
    ...(coopNight ? [] : chickens.filter(ch => !ch.eaten).map(ch => ({ kind: 'chicken', ref: ch }))),
    ...eggs.map(eg => ({ kind: 'egg', ref: eg })),
    { kind: 'fox' },
    { kind: 'rabbit' },
  ];
  allEntities.sort((a, b) => {
    const ya = a.kind === 'fox' ? fox.y : a.kind === 'rabbit' ? rabbit.y : a.ref.y;
    const yb = b.kind === 'fox' ? fox.y : b.kind === 'rabbit' ? rabbit.y : b.ref.y;
    return ya - yb;
  });
  for (const e of allEntities) {
    if (e.kind === 'chicken') drawChicken(e.ref, period, nowMs, fox.x, fox.y);
    else if (e.kind === 'egg')    drawEgg(e.ref, period);
    else if (e.kind === 'rabbit') drawRabbit(period, nowMs);
    else drawDog(period, nowMs);
  }

  drawFireflies(period, nowMs);
  drawButterflies(period, nowMs);
  drawRain(nowMs);
  drawSnow(nowMs);
  drawLightning(nowMs);
  updateUI(period, hour, min, sec);

  requestAnimationFrame(draw);
}

// ── Inicjalizacja ──────────────────────────────────────────────────────────────
document.getElementById('audio-btn').addEventListener('click', toggleAudio);
updateWeatherInfo();
requestAnimationFrame(draw);
