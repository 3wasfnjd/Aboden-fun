import test from 'node:test';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import { loadCatalog, validateCatalog, type Project, type Approval } from '../src/lib/catalog.ts';
import { escapeHtml, renderHome, renderProject, renderLicenses, renderNotFound } from '../src/lib/site.ts';
import { normalizeSearch } from '../public/app.js';

// Synthetic test-only data. Never loaded by the site; NOT a real owner approval.
const fixture: Project = { slug:'test-fixture', repository:'3wasfnjd/test-fixture', title:'تجربة اختبار', titleEn:'Test fixture', description:'Test only', category:'games', addedAt:'2026-10-02', cover:'assets/projects/test-fixture.webp', coverAlt:'Test image', instructions:'Test instructions', devices:[] };
const approval: Approval = { repository:fixture.repository, approvedAt:'2026-10-02', instruction:'SYNTHETIC UNIT TEST ONLY — NOT A REAL APPROVAL' };
const validate = (p: Partial<Project> = {}, a: Approval[] = [approval]) => validateCatalog([{...fixture,...p}],a);

const expected = ["3wasfnjd/Motri", "3wasfnjd/Dahrooj", "3wasfnjd/Boom", "3wasfnjd/Aboden-Hero", "3wasfnjd/BIG-BATTLES", "3wasfnjd/hajwala", "3wasfnjd/SANDLINE", "3wasfnjd/AR-Aboden", "3wasfnjd/AR-Shooter"];
test('catalog contains exactly the nine owner-approved projects',()=>assert.deepEqual(loadCatalog().map(p=>p.repository).sort(), [...expected].sort()));
test('empty approved catalog is valid',()=>assert.deepEqual(validateCatalog([],[]),[]));
test('unapproved metadata fails closed',()=>assert.throws(()=>validate({},[]),/approval required/));
test('approval must name the exact repository',()=>assert.throws(()=>validate({},[{...approval,repository:'3wasfnjd/another-fixture'}])));
test('approval must have an instruction',()=>assert.throws(()=>validate({},[{...approval,instruction:''}])));
test('valid explicit fixture passes',()=>assert.equal(validate().length,1));
test('duplicate projects rejected',()=>assert.throws(()=>validateCatalog([fixture,fixture],[approval])));
test('duplicate approvals rejected',()=>assert.throws(()=>validate({},[approval,approval])));
test('unsafe slugs rejected',()=>assert.throws(()=>validate({slug:'../private'})));
test('invalid date rejected',()=>assert.throws(()=>validate({addedAt:'2026-02-30'})));
test('invalid categories rejected',()=>assert.throws(()=>validate({category:'unknown' as any})));
test('external project images rejected',()=>assert.throws(()=>validate({cover:'https://example.com/image.jpg'})));
test('image path traversal rejected',()=>assert.throws(()=>validate({cover:'assets/projects/../secret.png'})));
test('script launch URL rejected',()=>assert.throws(()=>validate({liveUrl:'javascript:alert(1)'})));
test('source code is not a launch link',()=>assert.throws(()=>validate({liveUrl:'https://github.com/3wasfnjd/test-fixture'})));
test('credential URLs rejected',()=>assert.throws(()=>validate({liveUrl:'https://user:pass@example.com'})));
test('HTML and attribute characters escaped',()=>assert.equal(escapeHtml('<"&\'>'),'&lt;&quot;&amp;&#39;&gt;'));
test('Arabic variations normalize consistently',()=>assert.equal(normalizeSearch('إِبْداعٌ'),normalizeSearch('ابداع')));
test('English search is case independent',()=>assert.equal(normalizeSearch('Aboden'),normalizeSearch('ABODEN')));
test('homepage has base-aware CSS, JS and page links',()=>{
 const html=renderHome();
 for(const url of ['/Aboden-fun/site.css','/Aboden-fun/app.js','/Aboden-fun/licenses/']) assert.ok(html.includes(url));
 assert.ok(!html.includes('{{'));
});
test('root deployment can use the same renderer',()=>assert.ok(renderHome('/').includes('href="/site.css"')));
test('no unapproved cards, routes or fixtures appear in homepage',()=>{
 const html=renderHome();
 assert.equal((html.match(/data-project /g)||[]).length,9);assert.ok(!html.includes('test-fixture'));
 assert.equal((html.match(/data-filter=/g)||[]).length,3);
 for(const project of loadCatalog()) assert.ok(html.includes('projects/'+project.slug+'/'));
 assert.ok(!html.includes('projects/aboden-fun/'));
});
test('RTL and preview noindex are explicit',()=>{
 const html=renderHome();assert.ok(html.includes('lang="ar" dir="rtl"'));assert.ok(html.includes('noindex, nofollow'));
});
test('approved cards and launch links do not require JavaScript',()=>{const html=renderHome();for(const p of loadCatalog()){assert.ok(html.includes(p.title));assert.ok(html.includes(p.liveUrl!));}});
test('no launch link without a verified URL',()=>{
 const html=renderProject(fixture);assert.ok(!html.includes('العب الآن'));assert.ok(html.includes('لا تتوفر نسخة تشغيل'));
});
test('launch and repo links open safely',()=>{
 const html=renderProject({...fixture,liveUrl:'https://example.com/test'});assert.ok(html.includes('العب الآن'));assert.ok(html.includes('rel="noopener noreferrer"'));
});
test('unverified device claims do not appear',()=>assert.ok(!renderProject(fixture).includes('الأجهزة التي تم التحقق منها')));
test('project text cannot inject HTML',()=>assert.ok(!renderProject({...fixture,title:'<script>alert(1)</script>'}).includes('<script>alert(1)</script>')));
test('secondary pages render without unresolved tokens',()=>{
 for(const html of [renderLicenses(),renderNotFound()]) {assert.ok(html.startsWith('<!doctype html>'));assert.ok(!html.includes('{{'));}
});
test('every catalog cover exists locally',()=>{for(const p of loadCatalog()) assert.ok(existsSync('public/'+p.cover),p.cover);});
test('every approved project has an independently verified published URL',()=>{for(const p of loadCatalog()) assert.ok(p.liveUrl?.startsWith('https://3wasfnjd.github.io/'));});
