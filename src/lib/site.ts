import { readFileSync } from 'node:fs';
import { loadCatalog, categoryLabels, type Project } from './catalog.ts';

export const escapeHtml = (s: string) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const template = (name: string) => readFileSync(`${process.cwd()}/src/templates/${name}.html`, 'utf8');
const replace = (html: string, values: Record<string, string>) => html.replace(/\{\{([A-Z_]+)\}\}/g, (_, name: string) => {
  if (!(name in values)) throw new Error(`Missing template value: ${name}`);
  return values[name];
});
const basePath = (base: string) => `/${base.split('/').filter(Boolean).join('/')}${base.split('/').filter(Boolean).length ? '/' : ''}`;
const icon = (name: string) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
function page(content: string, title: string, description: string, base: string, route = ''): string {
  return replace(template('layout'), { CONTENT: content, TITLE: escapeHtml(title), DESCRIPTION: escapeHtml(description), BASE: basePath(base), CANONICAL: `https://3wasfnjd.github.io${basePath(base)}${route}`, CURRENT: route ? '' : 'aria-current="page"' });
}
export function projectCard(p: Project, base: string): string {
  const href = `${basePath(base)}projects/${p.slug}/`;
  return `<article class="project-card" data-project data-category="${p.category}" data-title="${escapeHtml(p.title)}" data-added="${p.addedAt}" data-search="${escapeHtml([p.title,p.titleEn,p.description,categoryLabels[p.category]].join(' '))}"><a href="${href}"><div class="project-cover"><img src="${basePath(base)}${p.cover}" alt="${escapeHtml(p.coverAlt)}" width="640" height="400" loading="lazy" decoding="async"/><span class="project-category">${categoryLabels[p.category]}</span></div><div class="project-copy"><h3>${escapeHtml(p.title)}</h3><span class="project-english" lang="en" dir="ltr">${escapeHtml(p.titleEn)}</span><p>${escapeHtml(p.description)}</p><span class="project-action">اكتشف المشروع ${icon('arrow')}</span></div></a></article>`;
}
export function renderHome(base = '/Aboden-fun/'): string {
  const projects = loadCatalog();
  const categories = Object.entries(categoryLabels).filter(([id]) => projects.some(p => p.category === id));
  const filter = (id: string, label: string, count: number) => `<button type="button" class="filter-button${id === 'all' ? ' active' : ''}" data-filter="${id}" aria-pressed="${id === 'all'}">${label}<span>${count}</span></button>`;
  const content = replace(template('home'), {
    FILTERS: filter('all','الكل',projects.length) + categories.map(([id,label]) => filter(id,label,projects.filter(p=>p.category===id).length)).join(''),
    SORT: projects.length ? '<label class="sort-label" for="sort">الترتيب<select id="sort"><option value="added">الأحدث إضافة</option><option value="name">الاسم</option></select></label>' : '',
    COUNT: projects.length ? `${projects.length} مشروع` : 'لا توجد مشاريع منشورة بعد',
    CARDS: [...projects].sort((a,b)=>b.addedAt.localeCompare(a.addedAt)).map(p=>projectCard(p,base)).join(''),
    EMPTY_HIDDEN: projects.length ? 'hidden' : ''
  });
  return page(content,'عالم عبودين | Aboden Fun World','عالم عبودين الترفيهي. مساحة تجمع الألعاب والتجارب التفاعلية والأدوات الإبداعية.',base);
}
export function renderProject(p: Project, base = '/Aboden-fun/'): string {
  const url = p.liveUrl ? `<a class="button button-primary" href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer">${p.category === 'games' ? 'العب الآن' : 'افتح التجربة'}${icon('out')}<span class="sr-only">يفتح في علامة تبويب جديدة</span></a>` : '<p class="project-unavailable">لا تتوفر نسخة تشغيل منشورة لهذا المشروع.</p>';
  return page(`<section class="shell detail-page"><a class="text-link" href="${basePath(base)}#library">→ العودة إلى المكتبة</a><p class="eyebrow">${categoryLabels[p.category]}</p><h1>${escapeHtml(p.title)}</h1><p lang="en" dir="ltr" class="detail-english">${escapeHtml(p.titleEn)}</p><p class="detail-description">${escapeHtml(p.description)}</p><img class="detail-cover" src="${basePath(base)}${p.cover}" alt="${escapeHtml(p.coverAlt)}" width="1280" height="800"/><div class="detail-actions">${url}<a class="text-link" href="https://github.com/${escapeHtml(p.repository)}" target="_blank" rel="noopener noreferrer">المصدر على GitHub ${icon('out')}<span class="sr-only">يفتح في علامة تبويب جديدة</span></a></div><h2>طريقة التجربة</h2><p class="instructions">${escapeHtml(p.instructions)}</p>${p.devices.length ? `<h2>الأجهزة التي تم التحقق منها</h2><p>${p.devices.map(escapeHtml).join(' · ')}</p>` : ''}</section>`,`${p.title} | عالم عبودين`,p.description,base,`projects/${p.slug}/`);
}
export function renderLicenses(base = '/Aboden-fun/'): string {
  return page(`<section class="shell prose-page"><a class="text-link" href="${basePath(base)}">→ الرئيسية</a><p class="eyebrow">معلومات الموقع</p><h1>التراخيص والمصادر<span class="heading-dot">.</span></h1><h2>واجهة عالم عبودين</h2><p>الرمز البصري والعناصر الزخرفية في هذه الواجهة مصممة للموقع، ولا تمثل صورًا من أي لعبة. لا تحتوي نسخة المعاينة على موسيقى أو صور مشاريع خارجية.</p><h2>الخطوط</h2><p>تستخدم الواجهة خطوط النظام المتوفرة على جهاز الزائر، دون توزيع ملفات خطوط.</p><h2>البرمجيات</h2><p>الموقع مبني باستخدام Astro، المرخص برخصة MIT. تُحفظ إشعارات رخصة إطار العمل واعتمادياته مع الحزم المستخدمة في البناء.</p><h2>المشاريع المضافة</h2><p>لا توجد مشاريع مدرجة حاليًا. عند اعتماد مشروع، تبقى حقوقه وتراخيص أصوله مستقلة وتُوثّق متطلبات النسب قبل إضافته.</p></section>`,'التراخيص | عالم عبودين','معلومات تراخيص واجهة عالم عبودين ومصادرها.',base,'licenses/');
}
export function renderNotFound(base = '/Aboden-fun/'): string {
  return page(`<section class="shell not-found"><span class="error-code" dir="ltr">404</span><h1>يبدو أنك خارج العالم.</h1><p>هذه الصفحة غير موجودة. ارجع للمكتبة واختر وجهة أخرى.</p><a class="button button-primary" href="${basePath(base)}#library">العودة إلى العالم ${icon('arrow')}</a></section>`,'الصفحة غير موجودة | عالم عبودين','العودة إلى عالم عبودين.',base,'404.html');
}
