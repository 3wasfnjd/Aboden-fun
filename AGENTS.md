# Aboden Fun World: publishing policy

- Work only in this repository. Never modify a linked project's repository or deployment.
- The owner must explicitly approve EACH repository before it is added to the website.
- Approval of the design, implementation or publication does NOT approve any repositories.
- `src/data/catalog.json` and `src/data/approvals.json` must remain empty until explicit project approval.
- Do not discover/import repositories at runtime, call the GitHub API from the browser, or publish pending/private repository metadata.
- Record each approval with its exact repository, date and a faithful description of the owner's instruction. Do not invent approval.
- Use actual screenshots/assets from approved projects. No invented gameplay, reviews, player counts, compatibility badges, or working launch links.
- A project without a verified live URL has no play/open action. Never substitute its GitHub source URL as a play link.
- The owner requested completing publication on 2026-10-02. Publishing the interface is authorized; adding projects is NOT.
- Keep preview mode and noindex until public indexing is explicitly approved.
- Pages currently serves main at the repository root. The publication workflow validates, builds Astro, commits generated static files and explicitly requests a Pages build. `.nojekyll` prevents Jekyll from parsing Astro source.
- Edit `src/` and `public/`, NOT generated root HTML/CSS/JS. `scripts/sync-pages.mjs` and `.pages-files.json` manage generated files and remove obsolete generated pages.
- Keep Arabic RTL/mobile-first design. Respect browser zoom and reduced-motion preferences.
- Run `npm test` and `npm run build` before release. Do not bypass approval validation.
