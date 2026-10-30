#!/usr/bin/env node
// Fetch missing Google Maps photo galleries into the scraper CSV.
//
// Google removed the photo-gallery array from the place page's
// APP_INITIALIZATION_STATE blob (darray[171] is now null), so the gosom
// docker scraper returns an empty `images` column. The full gallery is
// still rendered on the place page itself (as <img> tags and CSS
// background-images inside the photo viewer), so we recover it with
// Playwright: open each place link, open the photo viewer, scroll the
// grid, collect lh3.googleusercontent.com photo URLs, and rewrite the
// CSV rows in the same {"title","image"} JSON shape gosom used to emit.
//
// Usage:
//   node fetch-images.mjs <file.csv> [--out <file.csv>] [--concurrency 3]
//                         [--limit N] [--max-photos 15]
//
// Only rows whose `images` column is empty/[] are processed; everything
// else in the CSV is preserved byte-for-byte after re-quoting.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const input = positional[0];
if (!input) {
  console.error('Usage: node fetch-images.mjs <file.csv> [--out <file.csv>] [--concurrency 3] [--limit N] [--max-photos 15]');
  process.exit(1);
}
const output = flag('out', input);
const CONCURRENCY = Math.max(1, parseInt(flag('concurrency', '3'), 10));
const LIMIT = parseInt(flag('limit', '0'), 10) || Infinity;
const MAX_PHOTOS = Math.max(1, parseInt(flag('max-photos', '15'), 10));

// ---------------------------------------------------------------------------
// Minimal RFC4180 CSV
// ---------------------------------------------------------------------------
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(v) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
const toCsv = (rows) => rows.map((r) => r.map(csvField).join(',')).join('\n') + '\n';

// ---------------------------------------------------------------------------
// Photo extraction
// ---------------------------------------------------------------------------
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Only real place photos live under these lh3 prefixes; avatars are /a-/ or
// /a/ACg8..., street view is on streetviewpixels-pa.googleapis.com, and map
// tiles are on google.com/maps/vt/.
const PHOTO_HOST_RE = /^https:\/\/lh3\.googleusercontent\.com\/(gps-cs-s|gps-cs|grass-cs)\//;

function photoId(url) {
  // size/variant suffix starts at the first '='; the long token before it is
  // the stable image id (same photo at different sizes shares it)
  const base = url.split('=')[0];
  return base.slice(base.lastIndexOf('/') + 1);
}

function upgrade(url) {
  return `${url.split('=')[0]}=w1200`;
}

async function collectFromPage(page) {
  return page.evaluate(() => {
    const urls = [];
    document.querySelectorAll('img').forEach((i) => { if (i.src) urls.push(i.src); });
    document.querySelectorAll('div,button,li').forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      const m = bg && bg.match(/url\("([^"]+)"\)/);
      if (m) urls.push(m[1]);
    });
    return urls;
  });
}

async function scrapeGallery(page, link) {
  await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  try { await page.click('button:has-text("Accept all")', { timeout: 1500 }); } catch { /* no consent dialog */ }

  const seen = new Map(); // photoId -> url
  const add = (urls) => {
    for (const u of urls) {
      if (!PHOTO_HOST_RE.test(u)) continue;
      const id = photoId(u);
      if (!seen.has(id)) seen.set(id, u);
    }
  };

  add(await collectFromPage(page));

  // Open the photo viewer ("imagepack" collage button) and scroll its grid
  const btn = await page.$('[jsaction*="imagepack"], button[aria-label*="hoto"]');
  if (btn) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(2500);
    add(await collectFromPage(page));
    for (let i = 0; i < 6 && seen.size < MAX_PHOTOS; i++) {
      await page.evaluate(() => {
        document.querySelectorAll('div').forEach((d) => {
          if (d.scrollHeight > d.clientHeight + 50) d.scrollTop += 1000;
        });
      }).catch(() => {});
      await page.mouse.wheel(0, 1500).catch(() => {});
      await page.waitForTimeout(800);
      add(await collectFromPage(page));
    }
  }

  return [...seen.values()].slice(0, MAX_PHOTOS).map(upgrade);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const raw = fs.readFileSync(input, 'utf8');
const table = parseCsv(raw);
if (table.length < 2) { console.error('CSV has no data rows'); process.exit(1); }

const header = table[0];
const col = (name) => header.indexOf(name);
const iLink = col('link'), iImages = col('images'), iThumb = col('thumbnail');
if (iLink === -1 || iImages === -1) {
  console.error(`CSV missing required columns (link=${iLink}, images=${iImages})`);
  process.exit(1);
}

const rows = table.slice(1);
const needs = [];
rows.forEach((r, idx) => {
  const imgs = (r[iImages] || '').trim();
  if (!imgs || imgs === '[]' || imgs === 'null') needs.push(idx);
});
console.log(`${path.basename(input)}: ${rows.length} rows, ${needs.length} missing images`);

if (!needs.length) { console.log('Nothing to do.'); process.exit(0); }

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });

let done = 0, failed = 0, next = 0;
const todo = needs.slice(0, LIMIT);

async function worker(workerId) {
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  while (true) {
    const idx = todo[next++];
    if (idx === undefined) break;
    const row = rows[idx];
    const link = (row[iLink] || '').trim();
    const title = (row[header.indexOf('title')] || '').slice(0, 40);
    if (!link) { failed++; continue; }
    try {
      const photos = await scrapeGallery(page, link);
      if (!photos.length) throw new Error('no photos found');
      row[iImages] = JSON.stringify(photos.map((u, i) => ({ title: i === 0 ? 'All' : 'Photos', image: u })));
      if (iThumb !== -1 && !(row[iThumb] || '').trim()) row[iThumb] = photos[0];
      done++;
    } catch (e) {
      failed++;
      console.log(`  [w${workerId}] FAIL ${title}: ${e.message.split('\n')[0].slice(0, 90)}`);
    }
    if ((done + failed) % 10 === 0) console.log(`  progress: ${done + failed}/${todo.length} (ok ${done}, failed ${failed})`);
  }
  await ctx.close();
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, (_, i) => worker(i + 1)));
await browser.close();

fs.writeFileSync(output, toCsv([header, ...rows]));
console.log(`Done: ${done} enriched, ${failed} failed -> ${output}`);
if (failed && !done) process.exit(2);
