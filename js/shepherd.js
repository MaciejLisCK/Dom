// ── Owczarek podhalański ──────────────────────────────────────────────────────
const shepherd = {
  x: 0.72, y: 0.50,
  dir: -1,
  walkFrame: 0,
  autoTarget: 0.62,
  autoTargetY: 0.50,
  mode: 'wander',   // 'wander' | 'chase' | 'return'
  barkTimer: 0,
  chaseStart: 0,
};

const SHEPHERD_HOME_X = 0.72;
const SHEPHERD_HOME_Y = 0.50;
const CHASE_TIMEOUT_MS = 5000;

function drawShepherd(period, nowMs) {
  const isNight = period === 'night' || period === 'dusk';
  const dt = 16;

  // ── Logika ruchu ──────────────────────────────────────────────────────────
  const distToFox = Math.hypot(shepherd.x - fox.x, shepherd.y - fox.y);
  const CHASE_DIST = 0.28;
  const BARK_DIST  = 0.13;

  if (shepherd.mode === 'return') {
    // Wracamy do kurnika, ignorujemy lisa
    shepherd.autoTarget  = SHEPHERD_HOME_X;
    shepherd.autoTargetY = SHEPHERD_HOME_Y;
    const distHome = Math.hypot(shepherd.x - SHEPHERD_HOME_X, shepherd.y - SHEPHERD_HOME_Y);
    if (distHome < 0.03) {
      shepherd.mode = 'wander';
    }
  } else if (distToFox < CHASE_DIST) {
    if (shepherd.mode !== 'chase') {
      shepherd.mode = 'chase';
      shepherd.chaseStart = nowMs;
    }
    if (nowMs - shepherd.chaseStart >= CHASE_TIMEOUT_MS) {
      // Minęło 5 sekund – rezygnuje i wraca
      shepherd.mode = 'return';
    } else {
      shepherd.autoTarget  = fox.x;
      shepherd.autoTargetY = fox.y;
      if (distToFox < BARK_DIST && shepherd.barkTimer <= 0) {
        shepherd.barkTimer = 1000;
      }
    }
  } else {
    shepherd.mode = 'wander';
    if (Math.abs(shepherd.x - shepherd.autoTarget) < 0.02 || Math.random() < 0.001) {
      shepherd.autoTarget  = 0.40 + Math.random() * 0.52;
    }
    if (Math.abs(shepherd.y - shepherd.autoTargetY) < 0.02 || Math.random() < 0.001) {
      shepherd.autoTargetY = 0.10 + Math.random() * 0.80;
    }
  }

  if (shepherd.barkTimer > 0) shepherd.barkTimer -= dt;

  const speed  = shepherd.mode === 'chase' ? 0.00065 : shepherd.mode === 'return' ? 0.00035 : 0.00028;
  const speedY = shepherd.mode === 'chase' ? 0.00050 : shepherd.mode === 'return' ? 0.00025 : 0.00020;

  const sdx = shepherd.autoTarget - shepherd.x;
  if (Math.abs(sdx) > 0.005) {
    shepherd.x += Math.sign(sdx) * Math.min(Math.abs(sdx), speed);
    shepherd.dir = sdx > 0 ? 1 : -1;
    shepherd.walkFrame = nowMs * 0.012;
  }
  const sdy = shepherd.autoTargetY - shepherd.y;
  if (Math.abs(sdy) > 0.005) {
    shepherd.y += Math.sign(sdy) * Math.min(Math.abs(sdy), speedY);
  }
  shepherd.x = Math.max(0.05, Math.min(0.95, shepherd.x));
  shepherd.y = Math.max(0.05, Math.min(0.95, shepherd.y));

  // ── Rysowanie ─────────────────────────────────────────────────────────────
  const depthScale = 0.35 + shepherd.y * 0.85;
  const S  = SCALE * depthScale * 1.15;
  const px = shepherd.x * W;
  const py = H * (0.62 + shepherd.y * 0.16);
  const flip = shepherd.dir === -1;

  const bodyC   = isNight ? '#c8c4b4' : '#ede8d8';
  const shadowC = isNight ? '#a8a498' : '#ccc7b4';
  const darkC   = isNight ? '#1a1a10' : '#2a2a18';
  const noseC   = '#1a1008';
  const eyeC    = isNight ? '#ffcc44' : '#2a2010';

  const moving = Math.abs(shepherd.autoTarget - shepherd.x) > 0.005;
  const leg  = moving ? Math.sin(shepherd.walkFrame) * 1.5 * S : 0;
  const leg2 = moving ? Math.sin(shepherd.walkFrame + Math.PI) * 1.5 * S : 0;

  ctx.save();
  if (flip) { ctx.translate(px, 0); ctx.scale(-1, 1); ctx.translate(-px, 0); }

  // Tylne nogi
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px - 5*S), Math.round(py - 4*S + leg),  2*S, 5*S + Math.abs(leg));
  ctx.fillRect(Math.round(px - 2*S), Math.round(py - 4*S + leg2), 2*S, 5*S + Math.abs(leg2));

  // Tułów
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(px - 7*S), Math.round(py - 11*S), 13*S, 7*S);
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px + 3*S), Math.round(py - 10*S),  3*S, 5*S);
  ctx.fillRect(Math.round(px - 7*S), Math.round(py -  6*S),  4*S, 2*S);

  // Brzuch
  ctx.fillStyle = isNight ? '#d8d4c4' : '#f8f4e8';
  ctx.fillRect(Math.round(px - 3*S), Math.round(py - 9*S), 6*S, 4*S);

  // Przednie nogi
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px + 2*S), Math.round(py - 4*S + leg2), 2*S, 5*S + Math.abs(leg2));
  ctx.fillRect(Math.round(px + 5*S), Math.round(py - 4*S + leg),  2*S, 5*S + Math.abs(leg));

  // Ogon (szybsze machanie gdy goni, opuszczony gdy wraca)
  const wagSpeed = shepherd.mode === 'chase' ? 0.015 : shepherd.mode === 'return' ? 0.003 : 0.005;
  const wag = Math.sin(nowMs * wagSpeed) * 2 * S;
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(px - 9*S),  Math.round(py - 9*S  + wag * 0.4), 4*S, 3*S);
  ctx.fillRect(Math.round(px - 11*S), Math.round(py - 12*S + wag * 0.8), 4*S, 4*S);
  ctx.fillRect(Math.round(px - 12*S), Math.round(py - 15*S + wag * 1.2), 3*S, 4*S);
  ctx.fillStyle = isNight ? '#e0dccc' : '#ffffff';
  ctx.fillRect(Math.round(px - 13*S), Math.round(py - 17*S + wag * 1.4), 3*S, 3*S);

  // Szyja
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(px + 4*S), Math.round(py - 14*S), 4*S, 4*S);

  // Głowa
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(px + 3*S), Math.round(py - 18*S), 8*S, 5*S);
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px + 8*S), Math.round(py - 17*S), 3*S, 4*S);

  // Uszy opadające
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px + 3*S), Math.round(py - 18*S), 2*S, 5*S);
  ctx.fillRect(Math.round(px + 9*S), Math.round(py - 18*S), 2*S, 5*S);
  ctx.fillStyle = darkC;
  ctx.fillRect(Math.round(px + 3*S), Math.round(py - 17*S), S, 3*S);
  ctx.fillRect(Math.round(px + 9*S), Math.round(py - 17*S), S, 3*S);

  // Pysk
  ctx.fillStyle = bodyC;
  ctx.fillRect(Math.round(px + 9*S), Math.round(py - 15*S), 5*S, 3*S);
  ctx.fillStyle = shadowC;
  ctx.fillRect(Math.round(px + 11*S), Math.round(py - 14*S), 3*S, S);

  // Nos
  ctx.fillStyle = noseC;
  ctx.fillRect(Math.round(px + 13*S), Math.round(py - 15*S), 2*S, S);

  // Oko
  ctx.fillStyle = eyeC;
  ctx.fillRect(Math.round(px + 6*S), Math.round(py - 16*S), S, S);
  if (isNight) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(Math.round(px + 5*S), Math.round(py - 17*S), 3*S, 3*S);
    ctx.globalAlpha = 1;
  }

  // Szczekanie
  if (shepherd.barkTimer > 0) {
    const bAlpha = Math.min(1, shepherd.barkTimer / 300);
    ctx.globalAlpha = bAlpha;
    ctx.fillStyle = isNight ? '#e8e840' : '#ffffff';
    ctx.font = `bold ${Math.round(7 * S)}px sans-serif`;
    ctx.fillText('HAU!', Math.round(px + 10*S), Math.round(py - 22*S));
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
