const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let W, H, SCALE;
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  SCALE = Math.max(2, Math.floor(Math.min(W, H) / 200));
}
resize();
window.addEventListener('resize', resize);

function getTimeFraction() {
  const now = new Date();
  return (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
}
function getPeriod(h) {
  if (h >= 5  && h < 8)  return 'dawn';
  if (h >= 8  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  if (h >= 20 && h < 22) return 'dusk';
  return 'night';
}

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function rgb(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }
