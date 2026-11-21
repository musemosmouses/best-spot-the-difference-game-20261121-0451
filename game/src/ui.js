// HUD, markers and banners for Twin Tides — everything drawn on the canvas.
import { PANEL, diffById } from './differences.js';

const INK = '#f5e9c8';
const GOLD = '#e8c97a';
const RED = '#e86a5a';

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Georgia, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Top bar: title, level name, timer bar with seconds, found counter, score.
export function drawHud(ctx, state) {
  ctx.fillStyle = '#101c26';
  ctx.fillRect(0, 0, 1280, 64);
  text(ctx, 'TWIN TIDES', 40, 32, 26, GOLD);
  text(ctx, state.level.name, 330, 32, 20, INK);
  text(ctx, `Level ${state.levelIndex + 1} of 3`, 330, 52, 12, 'rgba(245,233,200,0.7)');
  const barX = 560;
  const barW = 240;
  const frac = Math.max(0, state.timeLeft / state.level.seconds);
  ctx.fillStyle = '#26394d';
  ctx.fillRect(barX, 22, barW, 14);
  ctx.fillStyle = state.timeLeft <= 10 ? RED : GOLD;
  ctx.fillRect(barX, 22, barW * frac, 14);
  ctx.strokeStyle = 'rgba(245,233,200,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, 22, barW, 14);
  text(ctx, `${Math.ceil(state.timeLeft)}s`, barX + barW + 12, 30, 18, INK);
  const found = state.found.size;
  const total = state.level.diffIds.length;
  text(ctx, `Found ${found} / ${total}`, 920, 24, 20, INK);
  text(ctx, `${total - found} remaining`, 920, 48, 14, RED);
  text(ctx, `Score ${state.score}`, 1120, 32, 20, GOLD, 'left');
  // Bottom hint line.
  text(ctx, `Hints left: ${state.hints}  ·  H hint   R restart   N next level`, 40, 700, 14, 'rgba(245,233,200,0.65)');
  // "Spot the difference" label between the panels.
  ctx.save();
  ctx.translate(640, 320);
  ctx.rotate(-Math.PI / 2);
  text(ctx, 'SPOT THE DIFFERENCE', 0, 0, 15, 'rgba(245,233,200,0.55)', 'center');
  ctx.restore();
}

// A found difference gets a gold ring on BOTH pictures, plus its name.
export function drawMarkers(ctx, state) {
  for (const id of state.found) {
    const d = diffById(id);
    if (!d) continue;
    for (const px of [PANEL.leftX, PANEL.rightX]) {
      const cx = px + d.x;
      const cy = PANEL.y + d.y;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(232,201,122,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // The most recent find shows its name briefly above the left panel.
  if (state.lastFind && state.lastFindAt > 0) {
    const age = performance.now() - state.lastFindAt;
    if (age < 1800) {
      ctx.fillStyle = `rgba(16,28,38,${1 - age / 1800})`;
      ctx.fillRect(40, 66, 300, 34);
      text(ctx, `Found: ${state.lastFind}`, 52, 84, 16, GOLD);
    }
  }
}

// The hint pulses a ring around one unfound difference on both pictures.
export function drawHint(ctx, state) {
  if (!state.hintTarget || !state.hintUntil) return;
  const remain = state.hintUntil - performance.now();
  if (remain <= 0) return;
  const d = diffById(state.hintTarget);
  if (!d) return;
  const pulse = 1 + 0.18 * Math.sin(performance.now() / 130);
  for (const px of [PANEL.leftX, PANEL.rightX]) {
    const cx = px + d.x;
    const cy = PANEL.y + d.y;
    ctx.strokeStyle = '#7fd4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, (d.r + 6) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// A wrong click flashes a red X where the player clicked.
export function drawMisses(ctx, state) {
  const now = performance.now();
  state.misses = state.misses.filter((m) => now - m.at < 700);
  for (const m of state.misses) {
    const alpha = 1 - (now - m.at) / 700;
    ctx.strokeStyle = `rgba(232,106,90,${alpha})`;
    ctx.lineWidth = 3;
    const s = 10;
    ctx.beginPath();
    ctx.moveTo(m.x - s, m.y - s);
    ctx.lineTo(m.x + s, m.y + s);
    ctx.moveTo(m.x + s, m.y - s);
    ctx.lineTo(m.x - s, m.y + s);
    ctx.stroke();
  }
}

function banner(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,18,26,0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#16283a';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  const bw = 620;
  const bh = 150 + lines.length * 34;
  ctx.beginPath();
  ctx.roundRect((1280 - bw) / 2, (720 - bh) / 2, bw, bh, 16);
  ctx.fill();
  ctx.stroke();
  text(ctx, title, 640, (720 - bh) / 2 + 52, 36, accent, 'center');
  lines.forEach((line, i) => {
    text(ctx, line, 640, (720 - bh) / 2 + 104 + i * 34, 19, INK, 'center', 'normal');
  });
}

export function drawWinBanner(ctx, state) {
  const total = state.level.diffIds.length;
  banner(ctx, 'Level Complete!', [
    `You found all ${total} differences in ${state.level.name}.`,
    `Score ${state.score}  ·  Time bonus +${state.timeBonus}`,
    'Press N or Next level to keep hunting.',
  ], GOLD);
}

export function drawLoseBanner(ctx, state) {
  banner(ctx, "Time's Up!", [
    `The tide came in with ${state.level.diffIds.length - state.found.size} differences still hidden.`,
    'Press R or Restart level to try again.',
  ], RED);
}

export function drawDoneBanner(ctx, state) {
  banner(ctx, 'All Three Levels Done!', [
    'You hunted every difference from morning to dusk.',
    `Final score ${state.score} — the cove keeps its secrets now.`,
    'Press R to play again from Calm Morning.',
  ], GOLD);
}
export function drawMenuBanner(ctx) {
  banner(ctx, 'Twin Tides', [
    'Two pictures of one quiet cove — but they are not quite the same.',
    'Click every difference you can find before the clock runs out.',
    'Click anywhere to start.  H hints, R restarts, N goes to the next level.',
  ], GOLD);
}
