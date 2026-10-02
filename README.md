# عالم عبودين — Aboden Fun World

Arabic RTL project directory, published at https://3wasfnjd.github.io/Aboden-fun/.

## Approved catalog

Eight repositories remain approved: Aboden-Hero, AR-Aboden, Motri, BIG-BATTLES, Boom, Dahrooj, hajwala, and SANDLINE. The owner subsequently removed AR-Shooter from the original screenshot-approved group. Its repository is unchanged; its portal card, page and cover are removed. The portal does not list itself. Future projects still require explicit owner approval; there is no automatic account import. See `src/data/approvals.json` and `AGENTS.md`.

Each project has a local genuine cover, an Arabic description, instructions, a details page, and a direct launch link. Search and category filters run locally. No API credentials, tracking, invented statistics or certified-device badges are shipped. Existing noindex preview mode is retained until public indexing is separately approved.

## Development

Node >=22.12.0 is required; CI uses Node 24.

```sh
npm ci
python3 -m pip install 'Pillow==11.3.0'
python3 scripts/prepare-approved-assets.py
npm test
npm run build
npm run dev
```

The asset preparer downloads only approved source art, verified against a recorded SHA-256 or exact Git blob hash, when a local cover is missing. Existing covers require no network. The browser never downloads source artwork from GitHub. Interface captures are committed locally and are not regenerated or fabricated. The BIG BATTLES poster is reconstructed from its original 2-column/4-row tiles in LTR image order; artwork is displayed without cropping or mirroring. Hajwala uses the owner-requested original menu artwork with the Shas, under the new `hajwala-shas.webp` filename to avoid reusing the cached racetrack image.

## Deployment

GitHub Pages serves main/root. `.github/workflows/deploy.yml` prepares covers, tests and builds Astro, copies generated files using `scripts/sync-pages.mjs`, commits the generated result and explicitly requests a Pages build. It then checks the deployed revision, all eight project routes, launch destinations in the HTML, local image resources and the stylesheet. It also checks that removed AR-Shooter portal resources return 404. Do not edit generated root HTML/CSS/JS directly.

Edit `src/`, `public/` and approved metadata. `.pages-files.json` tracks generated files and removes obsolete generated routes. Keep the `/Aboden-fun/` prefix in internal links. Unapproved projects fail validation and must not be put in runtime data or hidden cards.

## Evidence and credits

`src/data/cover-sources.json` records original cover URLs and source hashes. `src/data/link-verification.json` records the initial historical HTTP checks of destination pages and entry resources; it is not an approval list. These checks are not an end-to-end gameplay or physical-device certification. AR support depends on the visitor's hardware and browser. Actual game servers and repositories remain independent and unchanged.

Original source credits are shown on `/licenses/`; the Motri and hajwala license notices are retained under `public/assets/credits/`. No game music is copied into the portal. System fonts are used, with no redistributed font files.
