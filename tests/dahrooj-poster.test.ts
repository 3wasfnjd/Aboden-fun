import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadCatalog } from '../src/lib/catalog.ts';
import { renderHome, renderProject, renderLicenses } from '../src/lib/site.ts';
test('Dahrooj uses exactly the owner-attached poster on both portal views', () => {
  const p = loadCatalog().find(p => p.slug === 'dahrooj')!;
  assert.equal(p.cover, 'assets/projects/dahrooj-poster-80d2b29c.jpeg');
  const bytes = readFileSync('public/' + p.cover);
  assert.equal(bytes.length, 593236);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '80d2b29c8fa308bd135ac7897a4edda0007fb12ccdf3484967a85f9939f61432');
  for (const html of [renderHome(), renderProject(p)]) {
    assert.ok(html.includes(p.cover));
    assert.ok(!html.includes('assets/projects/dahrooj.webp'));
  }
  assert.equal(p.liveUrl, 'https://3wasfnjd.github.io/Dahrooj/');
  assert.equal(loadCatalog().length, 8);
  assert.ok(!existsSync('public/assets/projects/dahrooj.webp'));
});
test('Poster provenance distinguishes promotional art from a screenshot', () => {
  const records = JSON.parse(readFileSync('src/data/cover-sources.json', 'utf8'));
  const source = records.find((r: any) => r.slug === 'dahrooj');
  assert.equal(source.kind, 'owner-uploaded-poster');
  assert.equal(source.approvalInstruction, 'استبدلها في عالم عبودين');
  assert.ok(renderLicenses().includes('بوستر ترويجي'));
  assert.ok(readFileSync('public/assets/catalog.css', 'utf8').includes('object-fit:contain'));
});
