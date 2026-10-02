import { readFileSync } from 'node:fs';

export type Category = 'games' | 'experiences' | 'tools';
export interface Approval { repository: string; approvedAt: string; instruction: string }
export interface Project {
  slug: string; repository: string; title: string; titleEn: string;
  description: string; category: Category; addedAt: string;
  cover: string; coverAlt: string; instructions: string; devices: string[];
  liveUrl?: string;
}
export const categoryLabels: Record<Category, string> = {
  games: 'الألعاب', experiences: 'التجارب', tools: 'الأدوات'
};
const repoPattern = /^3wasfnjd\/[A-Za-z0-9_.-]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateValid = (v: string) => datePattern.test(v) && new Date(v).toISOString().slice(0, 10) === v;
const requireText = (v: unknown, key: string): void => {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Missing ${key}`);
};

/** Fail closed: pending metadata cannot reach page HTML, search or generated routes. */
export function validateCatalog(projects: Project[], approvals: Approval[]): Project[] {
  if (!Array.isArray(projects) || !Array.isArray(approvals)) throw new Error('Catalog and approvals must be arrays');
  const allow = new Set<string>();
  for (const approval of approvals) {
    requireText(approval.repository, 'approval repository');
    requireText(approval.instruction, 'approval instruction');
    if (!repoPattern.test(approval.repository) || !dateValid(approval.approvedAt)) throw new Error('Invalid approval record');
    if (allow.has(approval.repository)) throw new Error('Duplicate approval');
    allow.add(approval.repository);
  }
  const slugs = new Set<string>();
  const repos = new Set<string>();
  for (const p of projects) {
    if (!allow.has(p.repository)) throw new Error(`Explicit owner approval required: ${p.repository}`);
    if (!repoPattern.test(p.repository)) throw new Error('Invalid repository');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug) || repos.has(p.repository)) throw new Error('Invalid or duplicate project identifier');
    for (const key of ['title', 'titleEn', 'description', 'coverAlt', 'instructions'] as const) requireText(p[key], key);
    if (!Object.hasOwn(categoryLabels, p.category)) throw new Error('Invalid category');
    if (!dateValid(p.addedAt)) throw new Error('Invalid project date');
    if (!/^assets\/projects\/[a-zA-Z0-9_/-]+\.(avif|webp|png|jpg|jpeg)$/.test(p.cover) || p.cover.includes('..')) throw new Error('A local project image is required');
    if (!Array.isArray(p.devices) || p.devices.some(d => typeof d !== 'string' || !d.trim())) throw new Error('Invalid verified device list');
    if (p.liveUrl) {
      const url = new URL(p.liveUrl);
      if (url.protocol !== 'https:' || url.username || url.password || ['github.com', 'api.github.com', 'raw.githubusercontent.com'].includes(url.hostname)) throw new Error('Launch URL must be a verified HTTPS application, not source code');
    }
    slugs.add(p.slug); repos.add(p.repository);
  }
  return projects;
}

export function loadCatalog(): Project[] {
  const read = (name: string) => JSON.parse(readFileSync(`${process.cwd()}/src/data/${name}.json`, 'utf8'));
  return validateCatalog(read('catalog'), read('approvals'));
}
