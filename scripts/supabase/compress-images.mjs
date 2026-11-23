/**
 * Compress images in the pg-images bucket in place (same object names/URLs).
 * Downloads each file, re-encodes with sharp (max 1600px, JPEG q75), and
 * overwrites only when the result is at least 15% smaller.
 *
 * Usage:
 *   node --env-file=../../.env.migrate compress-images.mjs [--min-bytes=102400] [--limit=N] [--concurrency=6] [--dry-run]
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const sharp = require('sharp');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qtnevwoavtfipksvxipw.supabase.co';
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SECRET_KEY) {
  console.error('Missing SUPABASE_SECRET_KEY. Run with --env-file=../../.env.migrate');
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  })
);
const MIN_BYTES = Number(args['min-bytes'] ?? 102400);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const CONCURRENCY = Number(args.concurrency ?? 6);
const QUALITY = Number(args.quality ?? 75);
const MAX_DIM = Number(args.width ?? 1600);
const DRY_RUN = args['dry-run'] === 'true';

const headers = {
  Authorization: `Bearer ${SECRET_KEY}`,
  apikey: SECRET_KEY,
};

async function listAllObjects() {
  const objects = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/pg-images`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: pageSize, offset }),
    });
    if (!res.ok) throw new Error(`list failed: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    objects.push(...batch);
    if (batch.length < pageSize) break;
  }
  return objects;
}

async function processOne(obj) {
  const name = obj.name;
  const oldSize = obj.metadata?.size ?? 0;
  const url = `${SUPABASE_URL}/storage/v1/object/pg-images/${name.split('/').map(encodeURIComponent).join('/')}`;

  const dl = await fetch(url, { headers });
  if (!dl.ok) throw new Error(`download ${dl.status}`);
  const input = Buffer.from(await dl.arrayBuffer());

  const image = sharp(input, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  if (meta.format !== 'jpeg' && meta.format !== 'png' && meta.format !== 'webp') {
    return { name, status: 'skipped-format', oldSize, newSize: oldSize };
  }

  const pipeline = image
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true });
  const output = await pipeline.toBuffer();

  if (output.length >= oldSize * 0.85) {
    return { name, status: 'no-gain', oldSize, newSize: oldSize };
  }

  if (DRY_RUN) {
    return { name, status: 'dry-run', oldSize, newSize: output.length };
  }

  const up = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: output,
  });
  if (!up.ok) throw new Error(`upload ${up.status} ${await up.text()}`);
  return { name, status: 'compressed', oldSize, newSize: output.length };
}

async function pool(items, worker, concurrency) {
  const results = [];
  let i = 0;
  let done = 0;
  let bytesSaved = 0;
  const t0 = Date.now();
  const runners = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await worker(items[idx]);
      } catch (err) {
        results[idx] = { name: items[idx].name, status: 'error', error: err.message, oldSize: 0, newSize: 0 };
      }
      done++;
      bytesSaved += Math.max(0, (results[idx].oldSize || 0) - (results[idx].newSize || 0));
      if (done % 50 === 0 || done === items.length) {
        const rate = done / ((Date.now() - t0) / 1000);
        const eta = (items.length - done) / Math.max(rate, 0.1);
        console.log(
          `  ${done}/${items.length} | saved ${(bytesSaved / 1048576).toFixed(0)} MB | ` +
          `${rate.toFixed(1)}/s | ETA ${(eta / 60).toFixed(1)} min`
        );
      }
    }
  });
  await Promise.all(runners);
  return results;
}

console.log('Listing objects...');
const all = await listAllObjects();
const targets = all.filter((o) => (o.metadata?.size ?? 0) >= MIN_BYTES).slice(0, LIMIT);
const totalOld = targets.reduce((s, o) => s + (o.metadata?.size ?? 0), 0);
console.log(
  `${all.length} objects total, ${targets.length} >= ${Math.round(MIN_BYTES / 1024)} KB ` +
  `(${(totalOld / 1048576).toFixed(0)} MB)${DRY_RUN ? ' [DRY RUN]' : ''}, ` +
  `concurrency=${CONCURRENCY}, quality=${QUALITY}, maxDim=${MAX_DIM}`
);

const started = Date.now();
const results = await pool(targets, processOne, CONCURRENCY);

const byStatus = {};
for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
const saved = results.reduce((s, r) => s + Math.max(0, r.oldSize - r.newSize), 0);
const finalSize = totalOld - saved;
const errors = results.filter((r) => r.status === 'error');
if (errors.length) {
  console.log('\nErrors (first 10):');
  errors.slice(0, 10).forEach((e) => console.log(`  ${e.name}: ${e.error}`));
}

console.log('\n=== Summary ===');
console.table(byStatus);
console.log(`Before: ${(totalOld / 1048576).toFixed(0)} MB`);
console.log(`After:  ${(finalSize / 1048576).toFixed(0)} MB (saved ${(saved / 1048576).toFixed(0)} MB)`);
console.log(`Elapsed: ${((Date.now() - started) / 60000).toFixed(1)} min`);
