// Twin Tides — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ from beside this file to /output and
// writes /output/dossier.json with the vendored make.fun library. The
// grader runs it as an unprivileged user on a read-only filesystem, so it
// never removes or rewrites anything outside /output, and it skips dotfiles
// (a dotfile copied into /output fails the grader's output check).
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function skipDotfiles(src: string): boolean {
  const base = src.split('/').pop() ?? '';
  return !base.startsWith('.');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true, filter: skipDotfiles });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true, filter: skipDotfiles });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
