// Level sets for Twin Tides.
// Each level names the differences in play, the seconds on the clock and
// the palette the scene is painted with. Later levels add differences, cut
// the clock and turn the light to dusk.
export const LEVELS = [
  {
    name: 'Calm Morning',
    blurb: 'Seven small changes hide in the cove.',
    diffIds: ['sun', 'sail', 'lamp', 'bucket', 'starfish', 'cloud', 'flag'],
    seconds: 120,
    palette: 'morning',
  },
  {
    name: 'Golden Hour',
    blurb: 'Ten changes now — look twice at the water.',
    diffIds: ['sun', 'sail', 'lamp', 'bird', 'bucket', 'starfish', 'crab', 'cloud', 'fish', 'flag'],
    seconds: 90,
    palette: 'golden',
  },
  {
    name: 'Dusk Tide',
    blurb: 'Twelve changes, one hour of light left.',
    diffIds: ['sun', 'sail', 'lamp', 'bird', 'bucket', 'starfish', 'crab', 'cloud', 'fish', 'flag', 'shell', 'footprint'],
    seconds: 60,
    palette: 'dusk',
  },
];

export function levelByIndex(i) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, i))];
}
