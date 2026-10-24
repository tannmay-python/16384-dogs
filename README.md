# 16384 Dogs

A faithful dog-themed adaptation of [2048 Cupcakes](https://2048cupcake-dec6f6.gitlab.io/). Keeps the white and pink styling, Clear Sans typography, board dimensions, slide/pop animations, two counter rows, and vertical tile legend. Fourteen breeds run from Chihuahua (2) to Great Dane (16,384).

Play with arrow keys, WASD, HJKL, or touch swipes. Merge matching breeds to win at 16,384. You can keep playing after winning; subsequent values retain Great Dane artwork. Progress and best scores are saved locally in your browser. Press R or Play Again to restart.

## Run locally

```sh
python3 -m http.server 8768
```

Open http://localhost:8768. No installation or build step is needed.

## Tests and deployment

```sh
node --test tests/*.test.cjs
```

Every push to main runs the game tests and deploys the static files using the GitHub Pages Actions workflow in `.github/workflows/deploy.yml`. In repository settings, Pages uses GitHub Actions as its build source.

## Credits

Original 2048 by Gabriele Cirulli, MIT licensed. Cupcake adaptation by 0x0800 and contributors; presentation based on the linked reference. See LICENSE.txt. Clear Sans is retained from the reference. Dog photographs come from Dog CEO and its contributors; exact photo URLs are recorded in assets.json. All gameplay assets are hosted locally; no API calls, analytics, or third-party scripts run during play.
