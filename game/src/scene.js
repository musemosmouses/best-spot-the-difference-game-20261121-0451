// Scene renderer for Twin Tides: one quiet seaside cove, drawn procedurally
// on canvas. The left panel always shows the base scene; the right panel
// shows the variant for every difference in play.
import { PANEL_W, PANEL_H } from './differences.js';

export const PALETTES = {
  morning: {
    skyTop: '#a8d8e8', skyBot: '#eaf6f8', sun: '#ffd76a',
    seaTop: '#4a9db5', seaBot: '#8fc9d6', sandTop: '#f0dcae', sandBot: '#ddbf87',
    cliff: '#8a7a66', rock: '#7a6a58', stars: false,
  },
  golden: {
    skyTop: '#ffc98f', skyBot: '#fff1d6', sun: '#ffbe4d',
    seaTop: '#5a8fa8', seaBot: '#e8a56b', sandTop: '#f2cf96', sandBot: '#dda96f',
    cliff: '#7a6a5c', rock: '#6a5a4c', stars: false,
  },
  dusk: {
    skyTop: '#4a5a8a', skyBot: '#c98a7a', sun: '#ff8c42',
    seaTop: '#3a5a7a', seaBot: '#7a5a7a', sandTop: '#c9a87e', sandBot: '#8a6f52',
    cliff: '#5a4f45', rock: '#4c4239', stars: true,
  },
};

const STARS = [[60, 30], [150, 22], [260, 34], [350, 20], [520, 30], [90, 70], [210, 90], [300, 60]];

function gradient(ctx, x0, y0, x1, y1, top, bot) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  return g;
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 18 * s, y + 4 * s, 20 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 20 * s, y + 4 * s, 22 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y) {
  ctx.strokeStyle = '#33414f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 4, y - 7, x, y);
  ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
  ctx.stroke();
}

function starfishShape(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}

function fishShape(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x - 17, y - 6);
  ctx.lineTo(x - 17, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#12303f';
  ctx.beginPath();
  ctx.arc(x + 5, y - 1, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSky(ctx, p, on) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, 200, p.skyTop, p.skyBot);
  ctx.fillRect(0, 0, PANEL_W, 200);
  if (p.stars) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [sx, sy] of STARS) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (!on('sun')) {
    const glow = ctx.createRadialGradient(470, 55, 4, 470, 55, 64);
    glow.addColorStop(0, p.sun);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(400, -10, 140, 130);
    ctx.fillStyle = p.sun;
    ctx.beginPath();
    ctx.arc(470, 55, 26, 0, Math.PI * 2);
    ctx.fill();
  }
  cloud(ctx, 120, 60, 1);
  cloud(ctx, 300, 40, 1.15);
  if (!on('cloud')) cloud(ctx, 430, 90, 0.9);
  bird(ctx, 180, 70);
  bird(ctx, 230, 55);
  if (!on('bird')) bird(ctx, 330, 80);
}

function drawSea(ctx, p, on) {
  ctx.fillStyle = gradient(ctx, 0, 200, 0, 300, p.seaTop, p.seaBot);
  ctx.fillRect(0, 200, PANEL_W, 100);
  if (!on('sun')) {
    ctx.strokeStyle = 'rgba(255,214,106,0.75)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const y = 208 + i * 14;
      const w = 46 - i * 5;
      ctx.beginPath();
      ctx.moveTo(470 - w / 2, y);
      ctx.lineTo(470 + w / 2, y);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[80, 225, 70], [260, 245, 90], [380, 220, 60], [120, 275, 80], [330, 282, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 5, wx + wl, wy);
    ctx.stroke();
  }
}

function drawBoat(ctx, p, on) {
  const sail = on('sail') ? '#2e7f8f' : '#e86a5a';
  ctx.fillStyle = '#5a3d2b';
  ctx.beginPath();
  ctx.moveTo(118, 232);
  ctx.lineTo(186, 232);
  ctx.lineTo(172, 248);
  ctx.lineTo(130, 248);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3223';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 232);
  ctx.lineTo(150, 192);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(150, 194);
  ctx.lineTo(150, 230);
  ctx.lineTo(182, 230);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(147, 196);
  ctx.lineTo(147, 230);
  ctx.lineTo(126, 230);
  ctx.closePath();
  ctx.fill();
}

function drawHeadland(ctx, p, on) {
  ctx.fillStyle = p.cliff;
  ctx.beginPath();
  ctx.moveTo(420, 300);
  ctx.lineTo(448, 222);
  ctx.lineTo(478, 182);
  ctx.lineTo(520, 162);
  ctx.lineTo(560, 172);
  ctx.lineTo(560, 300);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = p.rock;
  ctx.lineWidth = 3;
  for (const [x0, y0, x1, y1] of [[440, 260, 480, 240], [500, 220, 540, 205], [455, 285, 505, 270]]) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  // Lighthouse tower on the headland.
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(468, 108, 24, 88);
  ctx.fillStyle = '#c94f43';
  ctx.fillRect(468, 132, 24, 12);
  ctx.fillRect(468, 168, 24, 12);
  ctx.fillStyle = '#2c3a48';
  ctx.fillRect(464, 96, 32, 12);
  if (!on('lamp')) {
    const glow = ctx.createRadialGradient(480, 102, 2, 480, 102, 34);
    glow.addColorStop(0, 'rgba(255,230,120,0.95)');
    glow.addColorStop(1, 'rgba(255,230,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(444, 66, 72, 72);
    ctx.fillStyle = '#ffe678';
    ctx.beginPath();
    ctx.arc(480, 102, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a4a58';
    ctx.beginPath();
    ctx.arc(480, 102, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!on('flag')) {
    ctx.strokeStyle = '#2c3a48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(468, 96);
    ctx.lineTo(468, 70);
    ctx.stroke();
    ctx.fillStyle = '#e86a5a';
    ctx.beginPath();
    ctx.moveTo(468, 70);
    ctx.lineTo(488, 75);
    ctx.lineTo(468, 81);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBeach(ctx, p, on) {
  ctx.fillStyle = gradient(ctx, 0, 300, 0, 420, p.sandTop, p.sandBot);
  ctx.fillRect(0, 300, PANEL_W, 120);
  ctx.fillStyle = p.rock;
  ctx.beginPath();
  ctx.ellipse(60, 320, 26, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(510, 395, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tidepool with fish.
  ctx.fillStyle = '#2f7d8f';
  ctx.beginPath();
  ctx.ellipse(350, 360, 55, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#57a8b8';
  ctx.beginPath();
  ctx.ellipse(350, 358, 48, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  fishShape(ctx, 335, 358, '#f2a541');
  if (!on('fish')) fishShape(ctx, 365, 362, '#f2a541');
  // Crab by the tidepool.
  if (!on('crab')) {
    ctx.fillStyle = '#d95f4b';
    ctx.beginPath();
    ctx.ellipse(280, 360, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d95f4b';
    ctx.lineWidth = 2;
    for (const s of [-1, 1]) {
      for (const dy of [-4, 0, 4]) {
        ctx.beginPath();
        ctx.moveTo(280 + s * 8, 360 + dy);
        ctx.lineTo(280 + s * 16, 360 + dy + 3);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#b94a38';
    ctx.beginPath();
    ctx.arc(272, 352, 3.5, 0, Math.PI * 2);
    ctx.arc(288, 352, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bucket and spade.
  if (!on('bucket')) {
    ctx.fillStyle = '#3f7fb5';
    ctx.beginPath();
    ctx.moveTo(104, 326);
    ctx.lineTo(136, 326);
    ctx.lineTo(130, 352);
    ctx.lineTo(110, 352);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2c5a82';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(120, 326, 12, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 330);
    ctx.lineTo(152, 306);
    ctx.stroke();
    ctx.fillStyle = '#e8c97a';
    ctx.beginPath();
    ctx.moveTo(146, 302);
    ctx.lineTo(158, 302);
    ctx.lineTo(152, 312);
    ctx.closePath();
    ctx.fill();
  }
  // Starfish resting on the rock.
  if (!on('starfish')) starfishShape(ctx, 420, 330, 13, '#e87a4d');
  // Shell on the sand.
  if (!on('shell')) {
    ctx.fillStyle = '#f2e3c9';
    ctx.beginPath();
    ctx.arc(200, 380, 10, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d9a05f';
    ctx.lineWidth = 1.5;
    for (const dx of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(200 + dx, 380);
      ctx.lineTo(200 + dx * 1.6, 372);
      ctx.stroke();
    }
  }
  // Footprints trailing across the sand.
  ctx.fillStyle = 'rgba(120,90,50,0.55)';
  ctx.beginPath();
  ctx.ellipse(205, 388, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.ellipse(222, 394, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  if (!on('footprint')) {
    ctx.beginPath();
    ctx.ellipse(240, 395, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawScene(ctx, paletteName, activeIds, side) {
  const p = PALETTES[paletteName] || PALETTES.morning;
  const variant = side === 'right';
  const on = (id) => variant && activeIds.has(id);
  drawSky(ctx, p, on);
  drawSea(ctx, p, on);
  drawBoat(ctx, p, on);
  drawHeadland(ctx, p, on);
  drawBeach(ctx, p, on);
}
