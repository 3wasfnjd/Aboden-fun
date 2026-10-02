# عالم عبودين — Aboden Fun World

Arabic RTL, mobile-first project directory. **Interface preview only: no repositories have been approved or added.**

## Approval policy

Every project requires the owner's explicit approval before it enters `src/data/catalog.json` or the published website. The build fails unless each catalog entry has a matching approval in `src/data/approvals.json`. Both files remain empty. There is no runtime GitHub import, browser API token, analytics, invented project image or usage count. See `AGENTS.md`.

## Development

Node >=22.12.0; CI uses Node 24.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

On a checkout without a lockfile, run `npm install` once instead. The publication workflow commits the initial resolved lockfile and uses `npm ci` thereafter.

`astro.config.mjs` uses `/Aboden-fun` as its base. Preserve this prefix for internal links and assets. The TypeScript renderer generates static HTML; only small search/menu scripts are shipped. Fonts come from the visitor's device.

Offline visual preview (not a substitute for the Astro build):

```sh
npm run preview:offline
python3 -m http.server 4173 --directory .preview
```

Open `http://localhost:4173/Aboden-fun/`.

## Publishing

The owner requested completion of interface publication on 2026-10-02. This does not approve any projects or search-engine indexing.

The existing Pages setting serves **main / (root)**. Do not feed `.astro` files to Jekyll. `Publish approved interface` now runs on main pushes or manual dispatch and:

1. Installs locked dependencies when available.
2. Runs approval validation, tests and the Astro build.
3. Copies only built `dist/` assets to the publishing root with `scripts/sync-pages.mjs`, removes obsolete generated files using `.pages-files.json`, and writes `.nojekyll`.
4. Commits the generated site and dependency lock using the repository's workflow token.
5. Explicitly requests a Pages build and checks the live build revision, homepage, CSS, JavaScript, icon and licenses page.

No administration-token access or change to another repository is required. Ordinary non-force git pushes protect against overwriting concurrent edits. The workflow's generated commits do not recursively start another workflow run.

Edit source files under `src/` or `public/`, not generated HTML/CSS/JS at the root. Keep preview badges, `noindex, nofollow` and the blocking robots file until the owner approves indexing. Do not report a live site until deployment and live-resource checks pass.

The separate `Verify interface` workflow remains a build-only check.

## Source structure

- `src/templates/`: shared semantic HTML and homepage.
- `src/lib/catalog.ts`: project schema and fail-closed approval validation.
- `src/lib/site.ts`: escaped static HTML renderer.
- `src/pages/`: Astro routes for the homepage, projects, licenses and 404.
- `public/`: responsive CSS, favicon, robots and local search/menu JavaScript.
- `tests/`: approval, security, route and normalization tests.
- `scripts/sync-pages.mjs`: safe built-output publication; never edits project source.

## Adding a project

Inspect the actual repository and ask the owner whether to add that exact repository. Only after approval, record it in the ledger and add verified names, description, category, genuine local image, instructions, supported devices and tested live HTTPS URL. No working URL means no play/open button. Preserve required attribution and licenses. Run tests and build, then review mobile rendering before publication.

This portal does not merge or move project source or replace game hosting/multiplayer servers.
