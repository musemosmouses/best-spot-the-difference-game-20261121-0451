// Difference definitions for Twin Tides.
// Positions are panel-local coordinates in the 560x420 scene space; the
// same point is checked on both panels, so a player can click either
// picture to claim a find.
export const PANEL_W = 560;
export const PANEL_H = 420;

// Where the two pictures sit on the 1280x720 canvas.
export const PANEL = { w: 560, h: 420, leftX: 40, rightX: 680, y: 110 };

export const DIFFS = [
  { id: 'sun',       name: 'The sun',              x: 470, y: 55,  r: 30 },
  { id: 'sail',      name: 'The sail colour',      x: 150, y: 215, r: 28 },
  { id: 'lamp',      name: 'The lighthouse lamp',  x: 480, y: 105, r: 24 },
  { id: 'bird',      name: 'A seabird',            x: 330, y: 80,  r: 22 },
  { id: 'bucket',    name: 'The bucket',           x: 120, y: 340, r: 28 },
  { id: 'starfish',  name: 'The starfish',         x: 420, y: 330, r: 22 },
  { id: 'crab',      name: 'The crab',             x: 280, y: 360, r: 24 },
  { id: 'cloud',     name: 'A cloud',              x: 430, y: 90,  r: 26 },
  { id: 'fish',      name: 'A tidepool fish',      x: 365, y: 360, r: 20 },
  { id: 'flag',      name: 'The lighthouse flag',  x: 480, y: 78,  r: 20 },
  { id: 'shell',     name: 'The shell',            x: 200, y: 380, r: 20 },
  { id: 'footprint', name: 'A footprint',          x: 240, y: 395, r: 20 },
];

export function diffById(id) {
  return DIFFS.find((d) => d.id === id);
}
