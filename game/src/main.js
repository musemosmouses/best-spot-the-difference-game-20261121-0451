// Twin Tides — bootstrap, state machine and game loop.
import { PANEL, diffById } from './differences.js';
import { levelByIndex } from './levels.js';
import { drawScene } from './scene.js';
import { canvasPoint, panelAt, hitTest, attachInput } from './input.js';
import { SoundFX } from './sound.js';
import {
  drawHud, drawMarkers, drawHint, drawMisses,
  drawWinBanner, drawLoseBanner, drawMenuBanner, drawDoneBanner,
} from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');

const sound = new SoundFX();

// Seeded PRNG so hint picks are reproducible per level.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function freshState(levelIndex, carryScore = 0) {
  const level = levelByIndex(levelIndex);
  return {
    level,
    levelIndex,
    found: new Set(),
    activeIds: new Set(level.diffIds),
    timeLeft: level.seconds,
    score: carryScore,
    scoreAtLevelStart: carryScore,
    timeBonus: 0,
    hints: 3,
    hintTarget: null,
    hintUntil: 0,
    misses: [],
    lastFind: null,
    lastFindAt: 0,
    phase: 'menu', // menu | playing | won | lost | done
    paused: false,
    lastTickSecond: level.seconds,
    rng: mulberry32(1234 + levelIndex * 999),
  };
}

let state = freshState(0);

function remaining() {
  return state.level.diffIds.length - state.found.size;
}

function render() {
  ctx.fillStyle = '#0e1a24';
  ctx.fillRect(0, 0, 1280, 720);
  for (const [px, side] of [[PANEL.leftX, 'left'], [PANEL.rightX, 'right']]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, PANEL.y, PANEL.w, PANEL.h);
    ctx.clip();
    ctx.translate(px, PANEL.y);
    drawScene(ctx, state.level.palette, state.activeIds, side);
    ctx.restore();
    ctx.strokeStyle = 'rgba(245,233,200,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, PANEL.y, PANEL.w, PANEL.h);
  }
  text(ctx, 'Picture A', PANEL.leftX, 552, 15, 'rgba(245,233,200,0.7)', 'left', 'normal');
  text(ctx, 'Picture B', PANEL.rightX, 552, 15, 'rgba(245,233,200,0.7)', 'left', 'normal');
  drawMarkers(ctx, state);
  drawHint(ctx, state);
  drawMisses(ctx, state);
  drawHud(ctx, state);
  if (state.phase === 'menu') drawMenuBanner(ctx);
  else if (state.phase === 'won') drawWinBanner(ctx, state);
  else if (state.phase === 'lost') drawLoseBanner(ctx, state);
  else if (state.phase === 'done') drawDoneBanner(ctx, state);
  syncButtons();
}

function text(ctx2, str, x, y, size, color, align = 'left', weight = 'normal') {
  ctx2.fillStyle = color;
  ctx2.font = `${weight} ${size}px Georgia, serif`;
  ctx2.textAlign = align;
  ctx2.textBaseline = 'middle';
  ctx2.fillText(str, x, y);
}

function syncButtons() {
  hintBtn.disabled = state.phase !== 'playing' || state.hints <= 0;
  restartBtn.disabled = state.phase === 'menu';
  nextBtn.disabled = !(state.phase === 'won' || state.phase === 'done');
}

let lastFrame = performance.now();

function loop(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (state.phase === 'playing' && !state.paused) {
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      if (whole <= 10 && whole > 0) sound.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.phase = 'lost';
      sound.lose();
      statusEl.textContent = `Time's up in ${state.level.name}. Press R to try again.`;
    }
  }
  render();
  requestAnimationFrame(loop);
}

function onPick(point) {
  if (state.phase === 'menu') {
    state.phase = 'playing';
    statusEl.textContent = `Find ${state.level.diffIds.length} differences in ${state.level.name}.`;
    return;
  }
  if (state.phase !== 'playing') return;
  const spot = panelAt(point);
  if (!spot) return;
  const hit = hitTest(spot, state.activeIds, state.found);
  if (hit) {
    state.found.add(hit.id);
    state.score += 100;
    state.lastFind = hit.name;
    state.lastFindAt = performance.now();
    sound.pop();
    statusEl.textContent = `Found ${hit.name}. ${remaining()} remaining.`;
    if (state.found.size === state.level.diffIds.length) {
      state.timeBonus = Math.ceil(state.timeLeft) * 10;
      state.score += state.timeBonus + 250;
      state.phase = state.levelIndex >= 2 ? 'done' : 'won';
      sound.win();
      statusEl.textContent = `${state.level.name} complete! Score ${state.score}.`;
    }
    return;
  }
  state.misses.push({ x: point.x, y: point.y, at: performance.now() });
  state.timeLeft = Math.max(0, state.timeLeft - 3);
  sound.miss();
}

function onHint() {
  if (state.phase !== 'playing' || state.hints <= 0) return;
  const left = state.level.diffIds.filter((id) => !state.found.has(id));
  if (left.length === 0) return;
  state.hints -= 1;
  state.hintTarget = left[Math.floor(state.rng() * left.length)];
  state.hintUntil = performance.now() + 2500;
  sound.hint();
  const d = diffById(state.hintTarget);
  statusEl.textContent = d ? `Hint: look near ${d.name.toLowerCase()}.` : 'Hint used.';
}

function onRestart() {
  if (state.phase === 'menu') return;
  state = freshState(state.levelIndex, state.scoreAtLevelStart);
  state.phase = 'playing';
  statusEl.textContent = `${state.level.name} restarted.`;
}

function onNext() {
  if (state.phase === 'won') {
    state = freshState(state.levelIndex + 1, state.score);
    state.phase = 'playing';
    statusEl.textContent = `Level ${state.levelIndex + 1}: ${state.level.name}.`;
  } else if (state.phase === 'done') {
    state = freshState(0, 0);
    statusEl.textContent = 'Back to Calm Morning.';
  }
}

// Deterministic states for screenshots and tests: ?shot=start|mid|hint|win
// all open Golden Hour (level 2) with the clock frozen.
function applyShot(shot) {
  if (!shot) return;
  state = freshState(1, 0);
  state.paused = true;
  state.phase = 'playing';
  if (shot === 'start') return;
  const firstThree = ['sun', 'sail', 'lamp'];
  if (shot === 'mid' || shot === 'hint') {
    for (const id of firstThree) state.found.add(id);
    state.score = 300;
    state.timeLeft = 61;
    state.lastFind = 'The lighthouse lamp';
    state.lastFindAt = performance.now();
  }
  if (shot === 'hint') {
    state.hints = 2;
    state.hintTarget = 'bucket';
    state.hintUntil = performance.now() + 60000;
  }
  if (shot === 'win') {
    for (const id of state.level.diffIds) state.found.add(id);
    state.timeBonus = 610;
    state.score = 1000 + state.timeBonus + 250;
    state.phase = 'won';
  }
}

attachInput(canvas, { onPick, onHint, onRestart, onNext });
hintBtn.addEventListener('click', onHint);
restartBtn.addEventListener('click', onRestart);
nextBtn.addEventListener('click', onNext);

applyShot(new URLSearchParams(window.location.search).get('shot'));

// Exposed for automated play-testing: state, and the pieces a test drives.
window.__game = { get state() { return state; }, freshState, onPick, onHint, onRestart, onNext };

render();
requestAnimationFrame(loop);
