import { chromium } from 'playwright';
import fs from 'node:fs';

(async () => {
  fs.mkdirSync('.qa/artifacts', { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext();
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['localhost', '127.0.0.1'].includes(url.hostname) || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const rows = [];
  const links = new Set();
  const paths = ['/', '/cakes', '/about', '/blog', '/contact', '/design-your-cake', '/faq', '/delivery', '/reviews', '/admin/login', '/missing-qa-page'];
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      const response = await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
      rows.push({ width, path, status: response.status(), ...await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        headings: document.querySelectorAll('h1').length,
        brokenImages: [...document.images].filter(i => i.offsetWidth && i.complete && !i.naturalWidth).length,
        unlabeled: [...document.querySelectorAll('input:not([type=hidden]):not([tabindex="-1"]),select,textarea')].filter(e => !e.labels?.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e => e.name || e.type)
      })) });
      for (const href of await page.locator('a[href^="/"]').evaluateAll(items => items.map(item => item.getAttribute('href')))) links.add(href);
      if (['/', '/admin/login', '/contact', '/cakes'].includes(path)) await page.screenshot({ path: `.qa/artifacts/${path === '/' ? 'home' : path.replaceAll('/', '-')}-${width}.png` });
    }
  }
  await page.goto('http://localhost:3000/cakes');
  const cakeHref = await page.locator('a[href^="/cakes/"]').first().getAttribute('href');
  if (cakeHref) {
    const r = await page.goto('http://localhost:3000' + cakeHref);
    rows.push({ path: 'cake detail', status: r.status() });
  }
  const brokenLinks = [];
  for (const href of links) {
    const response = await context.request.get('http://localhost:3000' + href);
    if (response.status() >= 400) brokenLinks.push({ href, status: response.status() });
  }
  const report = { rows, checkedLinks: links.size, brokenLinks, errors: [...new Set(errors)] };
  fs.writeFileSync('.qa/artifacts/browser-review.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: rows.length, checkedLinks: links.size, brokenLinks, findings: rows.filter(row => row.overflow || row.brokenImages || row.unlabeled?.length || row.headings !== 1 && row.headings !== undefined), errors: report.errors }, null, 2));
  await browser.close();
})().catch(e => { console.error(e.message); process.exitCode = 1; });
