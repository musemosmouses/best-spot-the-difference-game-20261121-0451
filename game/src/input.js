// Mouse + keyboard input for Twin Tides.
import { PANEL, diffById } from './differences.js';

// Convert a pointer event to canvas coordinates, accounting for the canvas
// being scaled by CSS.
export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// Which panel a canvas point is in, and its panel-local coordinates.
// Returns null when the point is outside both pictures.
export function panelAt(point) {
  if (point.y >= PANEL.y && point.y < PANEL.y + PANEL.h) {
    if (point.x >= PANEL.leftX && point.x < PANEL.leftX + PANEL.w) {
      return { side: 'left', x: point.x - PANEL.leftX, y: point.y - PANEL.y };
    }
    if (point.x >= PANEL.rightX && point.x < PANEL.rightX + PANEL.w) {
      return { side: 'right', x: point.x - PANEL.rightX, y: point.y - PANEL.y };
    }
  }
  return null;
}

// Find the unfound difference nearest to a panel-local point, if any lies
// within its click radius. Nearest wins, so close neighbours resolve fairly.
export function hitTest(local, activeIds, foundIds) {
  let best = null;
  let bestDist = Infinity;
  for (const id of activeIds) {
    if (foundIds.has(id)) continue;
    const d = diffById(id);
    if (!d) continue;
    const dist = Math.hypot(local.x - d.x, local.y - d.y);
    if (dist <= d.r && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

// Wire mouse clicks and the H / R / N keys. Handlers: onPick(point),
// onHint(), onRestart(), onNext().
export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handlers.onPick(canvasPoint(canvas, event));
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onHint();
    else if (key === 'r') handlers.onRestart();
    else if (key === 'n') handlers.onNext();
  });
}
