/** Offline preview uses the EXACT same renderer and assets as the Astro routes. */
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { renderHome, renderLicenses, renderNotFound, renderProject } from '../src/lib/site.ts';
import { loadCatalog } from '../src/lib/catalog.ts';
const root = '.preview/Aboden-fun';
if (existsSync('.preview')) rmSync('.preview', { recursive: true });
mkdirSync(`${root}/licenses`, { recursive: true });
cpSync('public', root, { recursive: true });
writeFileSync(`${root}/index.html`, renderHome());
writeFileSync(`${root}/licenses/index.html`, renderLicenses());
writeFileSync(`${root}/404.html`, renderNotFound());
for (const project of loadCatalog()) {
  mkdirSync(`${root}/projects/${project.slug}`, { recursive: true });
  writeFileSync(`${root}/projects/${project.slug}/index.html`, renderProject(project));
}
console.log('Preview generated in .preview/Aboden-fun; serve .preview and open /Aboden-fun/.');
