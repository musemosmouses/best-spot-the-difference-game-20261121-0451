# Twin Tides — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/musemosmouses/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/musemosmouses/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
"best-spot-the-difference-game-20261121-0451" ($50, top 10 paid $5 each).

Two pictures of one quiet seaside cove — but they are not quite the same.
Click every difference before the clock runs out: gold rings mark each find
on both pictures, the counter shows how many remain, hints point at a
difference that is still hiding, and three levels raise the hunt from 7
differences in the morning light to 12 at dusk.

## Play

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080 in a desktop browser
```

Mouse: click a difference on either picture. Keyboard: `H` hint,
`R` restart level, `N` next level.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.
