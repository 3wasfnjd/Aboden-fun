import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

// Publish only built assets. Never copy or delete application source.
const root = process.cwd();
const dist = join(root, 'dist');
const manifest = '.pages-files.json';
const rootFiles = new Set(['index.html', '404.html', 'app.js', 'site.css', 'favicon.svg', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'sitemap-index.xml', 'build-info.json']);
const assetDirs = new Set(['assets', 'images', 'projects', 'licenses', '_astro']);
function safe(path) {
  if (typeof path !== 'string' || path.includes('\\')) throw new Error('Invalid Pages path');
  const parts = path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..') || (!rootFiles.has(path) && !assetDirs.has(parts[0]))) throw new Error(`Refusing unmanaged path: ${path}`);
  let at = root;
  for (const part of parts) {
    at = join(at, part);
    if (existsSync(at) && lstatSync(at).isSymbolicLink()) throw new Error(`Refusing symlink: ${path}`);
  }
  return path;
}
function walk(folder, prefix = '') {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('Build contains a symlink');
    const path = prefix + entry.name;
    if (entry.isDirectory()) return walk(join(folder, entry.name), path + '/');
    if (!entry.isFile()) throw new Error('Build contains an unsupported entry');
    return [safe(path)];
  });
}
if (!existsSync(join(dist, 'index.html'))) throw new Error('Build the site before syncing Pages');
const oldFiles = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : [];
if (!Array.isArray(oldFiles)) throw new Error('Invalid Pages manifest');
oldFiles.forEach(safe);
const files = walk(dist).sort();
const source = process.env.GITHUB_SHA;
if (source) {
  if (!/^[a-f0-9]{40}$/.test(source)) throw new Error('Invalid source commit');
  writeFileSync(join(dist, 'build-info.json'), JSON.stringify({ source }) + '\n');
  if (!files.includes('build-info.json')) files.push('build-info.json');
  files.sort();
}
for (const path of oldFiles) if (!files.includes(path)) rmSync(join(root, path), { force: true });
for (const path of files) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  cpSync(join(dist, path), join(root, path));
}
writeFileSync('.nojekyll', '');
writeFileSync(manifest, JSON.stringify(files, null, 2) + '\n');
execFileSync('git', ['add', '-A', '--', ...new Set([...oldFiles, ...files, manifest, '.nojekyll'])], { stdio: 'inherit' });
console.log(`Prepared ${files.length} built files for branch-based GitHub Pages.`);
