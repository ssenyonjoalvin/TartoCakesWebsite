import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEventDate, todayInKampala } from '../src/lib/quote-form.ts';
import { parseDatabaseUrl } from '../src/lib/db-url.ts';
import { getAuthSecret } from '../src/lib/auth-secret.ts';
import { paginateItems } from '../src/lib/table-pagination.ts';

test('calendar validation rejects rolled-over and malformed dates', () => {
  for (const value of ['2026-02-30', '2026-13-01', '2026-00-10', '2026-1-01', 'not-a-date']) assert.equal(parseEventDate(value), null);
  assert.equal(parseEventDate('2028-02-29')?.toISOString(), '2028-02-29T12:00:00.000Z');
});

test('bakery date crosses midnight in Kampala rather than UTC', () => {
  assert.equal(todayInKampala(new Date('2026-11-25T20:59:00Z')), '2026-11-25');
  assert.equal(todayInKampala(new Date('2026-11-25T21:00:00Z')), '2026-11-26');
});

test('database verification modes never disable certificate verification', () => {
  for (const mode of ['VERIFY_CA', 'VERIFY_IDENTITY']) assert.equal(parseDatabaseUrl(`mysql://local@localhost/test?ssl-mode=${mode}`).ssl.rejectUnauthorized, true);
  assert.equal(parseDatabaseUrl('mysql://local@localhost/test?ssl-mode=REQUIRED').ssl.rejectUnauthorized, false);
  assert.equal(parseDatabaseUrl('mysql://local@localhost/test?ssl-mode=DISABLED').ssl, undefined);
});

test('production authentication refuses a missing or short signing secret', () => {
  const previous = { mode: process.env.NODE_ENV, secret: process.env.AUTH_SECRET };
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_SECRET;
    assert.throws(() => getAuthSecret());
    process.env.AUTH_SECRET = 'short';
    assert.throws(() => getAuthSecret());
  } finally {
    for (const [key, value] of [['NODE_ENV', previous.mode], ['AUTH_SECRET', previous.secret]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('pagination remains valid when filtering removes the current page', () => {
  const result = paginateItems([1, 2], 9, 10);
  assert.equal(result.page, 1);
  assert.deepEqual(result.items, [1, 2]);
  assert.equal(paginateItems([], 9).from, 0);
});
