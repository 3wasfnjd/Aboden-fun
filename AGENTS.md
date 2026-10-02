# Aboden Fun World: publishing policy

- Work only in this repository. Never modify a linked project's repository or deployment.
- The owner must explicitly approve EACH repository before it is added to the website.
- Approval of the design, implementation or publication does NOT approve any repositories.
- `src/data/catalog.json` must contain only exact repositories explicitly recorded in `src/data/approvals.json`.
- Do not discover/import repositories at runtime, call the GitHub API from the browser, or publish pending/private repository metadata.
- Record each approval with its exact repository, date and a faithful description of the owner's instruction. Do not invent approval.
- Use actual screenshots/assets from approved projects. No invented gameplay, reviews, player counts, compatibility badges, or working launch links.
- A project without a verified live URL has no play/open action. Never substitute its GitHub source URL as a play link.
- The owner requested completing publication on 2026-10-02. Screenshot approval originally covered nine projects; subsequent removal leaves eight currently approved repositories in approvals.json.
- Owner instruction: «احذف الرماية بالواقع المعزز». AR-Shooter must stay out of the directory, search, detail routes, published covers and license source list unless explicitly reapproved. Do not delete or modify its original repository.
- Owner instruction: «عدل صورة هجولة وحط صورة الواجهه للعبه اللي فيها شاص». Use the actual Hajwala images/menu/menu-bg.jpg artwork, verified against its source Git blob. Do not invent artwork or use the old racetrack screenshot.
- Keep preview mode and noindex until public indexing is explicitly approved.
- Pages currently serves main at the repository root. The publication workflow validates, builds Astro, commits generated static files and explicitly requests a Pages build. `.nojekyll` prevents Jekyll from parsing Astro source.
- Edit `src/` and `public/`, NOT generated root HTML/CSS/JS. `scripts/sync-pages.mjs` and `.pages-files.json` manage generated files and remove obsolete generated pages.
- Keep Arabic RTL/mobile-first design. Respect browser zoom and reduced-motion preferences.
- Run `npm test` and `npm run build` before release. Do not bypass approval validation.
- The portal itself is not a project card. Future repositories still require explicit approval.

- Owner-approved Dahrooj artwork exception: the owner attached 074E9DC1-BAAC-4DF1-9681-28DA210356C9.jpeg and explicitly requested replacing its portal cover. Use public/assets/projects/dahrooj-poster-80d2b29c.jpeg with the SHA-256 recorded in cover-sources.json. This is approved promotional artwork, not an in-game screenshot. Do not regenerate or replace it with another poster; retain the full composition. This does not authorize game-repository changes.
