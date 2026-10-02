# Aboden Fun World: non-negotiable publishing policy

- Work only in this repository. Never modify a linked project's repository or deployment.
- The owner must explicitly approve EACH repository before it is added to the website.
- Approval of the design or of this implementation does NOT approve any repositories.
- `src/data/catalog.json` and `src/data/approvals.json` start empty. Keep them empty until explicit approval.
- Do not discover/import repositories at runtime, call the GitHub API from the browser, or publish pending/private repository metadata.
- Record each approval in `approvals.json` with its exact repository, date and a faithful description of the owner's instruction. Do not invent approval.
- Use actual screenshots/assets from approved projects. No invented gameplay, reviews, player counts, compatibility badges, or working launch links.
- A project without a verified live URL has no play/open action. Never substitute its GitHub source URL as a play link.
- Preview mode remains on and deployment remains manual until the owner approves the interface and public launch.
- Keep the Arabic RTL/mobile-first design. Respect browser zoom and reduced-motion preferences.
- Run `npm test` and `npm run build` before release. Do not silently bypass validation.
