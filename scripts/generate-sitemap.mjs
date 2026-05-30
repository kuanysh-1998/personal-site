// Генерация src/sitemap.xml из метаданных постов (posts.data.ts).
// Запускается автоматически перед сборкой (npm run prebuild) или вручную:
//   node scripts/generate-sitemap.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SITE_URL = 'https://kuanysh.dev';
const POSTS_DATA = resolve(root, 'src/app/features/blog/data/posts.data.ts');
const OUTPUT = resolve(root, 'src/sitemap.xml');

/** Извлекает { slug, date } из каждого объекта в массиве POSTS. */
function parsePosts(source) {
  const posts = [];
  const objectRegex = /\{([^{}]*)\}/g;
  let match;
  while ((match = objectRegex.exec(source)) !== null) {
    const body = match[1];
    const slug = body.match(/slug:\s*['"]([^'"]+)['"]/)?.[1];
    const date = body.match(/date:\s*['"]([^'"]+)['"]/)?.[1];
    if (slug && date) {
      posts.push({ slug, date });
    }
  }
  return posts;
}

function urlEntry(loc, lastmod, priority) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

const today = new Date().toISOString().slice(0, 10);
const posts = parsePosts(readFileSync(POSTS_DATA, 'utf-8'));

const staticEntries = [
  urlEntry(`${SITE_URL}/about`, today, '1.0'),
  urlEntry(`${SITE_URL}/blog`, today, '0.9'),
];

const postEntries = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map((post) => urlEntry(`${SITE_URL}/blog/${post.slug}`, post.date, '0.8'));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticEntries,
  ...postEntries,
  '</urlset>',
  '',
].join('\n');

writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`[sitemap] ${posts.length} posts + ${staticEntries.length} static -> src/sitemap.xml`);
