import 'dotenv/config';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { parseDatabaseUrl } from '../src/lib/db-url.ts';

const db = parseDatabaseUrl();
assert.ok(['localhost', '127.0.0.1', '::1'].includes(db.host), 'Synthetic write tests require a local database');
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ ...db, connectionLimit: 1 }) });
const email = `qa-review-${Date.now()}@example.invalid`;
const passed = [];
const check = (name, condition) => { assert.ok(condition, name); passed.push(name); };
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 375, height: 900 } });
await context.route('**/*', route => {
  const u = new URL(route.request().url());
  return ['localhost', '127.0.0.1'].includes(u.hostname) || ['data:', 'blob:'].includes(u.protocol) ? route.continue() : route.abort();
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
try {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  check('Mobile header quote action is hidden', !(await page.locator('header').getByRole('link', { name: 'Request a Quote' }).first().isVisible()));
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  check('Mobile navigation opens', await page.locator('#mobile-menu').isVisible());
  await page.keyboard.press('Escape');
  check('Escape closes menu and restores focus', await page.getByRole('button', { name: 'Open menu', exact: true }).evaluate(e => e === document.activeElement));
  const occasion = page.getByRole('list', { name: 'Shop by occasion' });
  check('Occasions remain on one row', await occasion.locator(':scope > li').evaluateAll(items => new Set(items.map(i => Math.round(i.getBoundingClientRect().top))).size === 1));
  check('WhatsApp opens configured destination', (await page.getByRole('link', { name: 'Chat with Tarto Cakes on WhatsApp' }).getAttribute('href')).startsWith('https://wa.me/'));

  await page.goto('http://localhost:3000/cakes');
  const cakeHref = await page.locator('a[href^="/cakes/"]').first().getAttribute('href');
  await page.getByRole('searchbox', { name: 'Search cakes' }).fill('qa-no-such-cake-9z9z');
  check('Catalog has a useful empty state', await page.getByText(/No cakes/i).first().isVisible());
  await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  check('Clearing filters restores results', await page.locator('a[href^="/cakes/"]').count() > 0);
  await page.goto('http://localhost:3000' + cakeHref);
  await page.getByRole('button', { name: 'Review cake', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  check('Review modal receives keyboard focus', await dialog.evaluate(e => e.contains(document.activeElement)));
  await dialog.getByRole('button', { name: 'Submit review' }).focus();
  await page.keyboard.press('Tab');
  check('Tab wraps within review modal', await dialog.getByRole('button', { name: 'Close review form' }).evaluate(e => e === document.activeElement));
  await page.keyboard.press('Escape');
  check('Review modal restores trigger focus', await page.getByRole('button', { name: 'Review cake', exact: true }).first().evaluate(e => e === document.activeElement));

  await page.goto('http://localhost:3000/blog');
  await page.getByRole('searchbox', { name: 'Search stories' }).fill('qa-no-such-story-9z9z');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.waitForURL('**/blog?q=*');
  check('Blog search returns an empty state', await page.getByText(/No stories found/).isVisible());
  await page.getByRole('link', { name: 'Clear search', exact: true }).click();
  await page.locator('article').first().waitFor();
  check('Clearing blog search restores stories', await page.locator('article').count() > 0);

  await page.goto('http://localhost:3000/design-your-cake');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  check('Builder blocks an empty occasion', await page.getByText('Please choose an occasion.', { exact: true }).isVisible());
  await page.getByRole('radio').first().press('Space');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  check('Builder advances after choosing an occasion', await page.getByRole('heading', { name: 'How big should it be?' }).isVisible());
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  check('Builder preserves prior selection', await page.getByRole('radio').first().isChecked());

  await page.goto('http://localhost:3000/admin/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-invalid-password');
  await page.getByRole('button', { name: 'Show password' }).click();
  check('Password visibility toggle works', await page.getByLabel('Password', { exact: true }).getAttribute('type') === 'text');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  const loginError = page.locator('form [role="alert"]');
  await loginError.waitFor();
  check('Invalid login gives useful feedback', /Invalid email or password/.test(await loginError.innerText()));
  check('Invalid login preserves typed email', await page.getByLabel('Email', { exact: true }).inputValue() === email);
  check('Login background stays off-white', await page.locator('main').count() === 0 && await page.locator('div.bg-\\[\\#faf9f6\\]').first().evaluate(e => getComputedStyle(e).backgroundImage === 'none'));
  await page.goto('http://localhost:3000/admin/orders');
  check('Private admin route requires sign in', new URL(page.url()).pathname === '/admin/login');
  const session = await context.request.get('http://localhost:3000/api/admin/session');
  check('Session endpoint rejects unauthenticated access', session.status() === 401);
  const logout = await context.request.post('http://localhost:3000/api/admin/logout');
  check('Logout clears session cookie', logout.ok() && /Max-Age=0/.test(logout.headers()['set-cookie']));

  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
  await page.locator('#referenceImages-input').setInputFiles({ name: 'qa-preview.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6V9sAAAAASUVORK5CYII=', 'base64') });
  await page.locator('form img').waitFor();
  check('Reference photo has a local preview', await page.locator('form img').count() === 1);
  await page.getByRole('button', { name: 'Remove photo 1' }).click();
  await page.locator('form img').waitFor({ state: 'detached' });
  check('Reference photo can be removed before upload', await page.locator('form img').count() === 0);
  await page.getByRole('button', { name: 'Send Request', exact: true }).click();
  await page.getByText('Please enter your name.', { exact: true }).waitFor();
  check('Invalid quote focuses first error', await page.getByLabel('Name', { exact: true }).evaluate(e => e === document.activeElement));
  await page.getByLabel('Name', { exact: true }).fill('QA Synthetic Browser');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Phone Number', { exact: true }).fill('0700000000');
  for (const label of ['Occasion', 'Size', 'Flavour']) {
    const field = page.getByLabel(label, { exact: true });
    const value = await field.locator('option').nth(1).getAttribute('value');
    await field.selectOption(value);
  }
  await page.locator('#eventDate').fill(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  await page.getByRole('button', { name: 'Send Request', exact: true }).click();
  await page.waitForURL('**/quote/thank-you?id=*');
  await page.getByRole('heading', { name: 'Thank you, QA!' }).waitFor();
  check('Synthetic quote succeeds', await page.getByRole('heading', { name: 'Thank you, QA!' }).isVisible());
  check('Submitting browser sees quote summary', await page.getByRole('heading', { name: 'Your request', exact: true }).isVisible());
  const saved = await prisma.cakeOrder.findFirst({ where: { email }, select: { id: true } });
  check('Synthetic quote was persisted', Boolean(saved));
  const privateUrl = page.url();
  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(privateUrl);
  check('Shared URL does not expose quote summary', await anonymousPage.getByRole('heading', { name: 'Your request', exact: true }).count() === 0);
  check('Shared URL does not expose customer name', await anonymousPage.getByRole('heading', { name: 'Thank you!', exact: true }).isVisible());
  await anonymous.close();
  check('No browser runtime errors', pageErrors.length === 0);
  fs.mkdirSync('.qa/artifacts', { recursive: true });
  fs.writeFileSync('.qa/artifacts/flows.json', JSON.stringify({ passed, pageErrors }, null, 2));
  console.log(`${passed.length} browser flow checks passed.`);
} catch (error) {
  fs.mkdirSync('.qa/artifacts', { recursive: true });
  await page.screenshot({ path: '.qa/artifacts/flow-failure.png' });
  throw error;
} finally {
  await browser.close();
  await prisma.cakeOrder.deleteMany({ where: { email } });
  await prisma.customer.deleteMany({ where: { email } });
  await prisma.$disconnect();
}
