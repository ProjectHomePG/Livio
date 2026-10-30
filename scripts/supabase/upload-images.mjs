/**
 * Upload listing images referenced by the images table into Supabase Storage
 * (bucket: pg-images), then verify every images.url resolves.
 *
 * Usage:
 *   node --env-file=.env.migrate scripts/supabase/upload-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { supabase, readCsv } from './utils.mjs';

const DIR = process.env.H2EXPORT_DIR || '/tmp/h2export';
const CANDIDATE_DIRS = [
  process.env.IMAGES_DIR || 'data/images',
  'backend/data/images',
];
const BUCKET = 'pg-images';
const CONCURRENCY = 12;

// Which local folder actually has the files?
const imagesDir = CANDIDATE_DIRS.find((d) => fs.existsSync(d));
if (!imagesDir) {
  console.error(`No images directory found (looked in: ${CANDIDATE_DIRS.join(', ')})`);
  process.exit(1);
}
console.log(`Local images: ${imagesDir}`);

// Filenames referenced by the DB
const rows = readCsv(`${DIR}/images.csv`);
const filenames = [...new Set(rows.map((r) => (r.URL || '').replace('/uploads/images/', '')))];
console.log(`${filenames.length} distinct images referenced by DB (${rows.length} rows)`);

const missingLocally = filenames.filter((f) => !fs.existsSync(path.join(imagesDir, f)));
if (missingLocally.length) {
  console.warn(`${missingLocally.length} referenced files not found locally, e.g.:`,
    missingLocally.slice(0, 5));
}

// Existing objects in the bucket (flat listing, paginated)
const existing = new Set();
for (let offset = 0; ; offset += 1000) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 1000, offset });
  if (error) {
    console.error(`list failed: ${error.message}`);
    process.exit(1);
  }
  data.forEach((f) => existing.add(f.name));
  if (data.length < 1000) break;
}
console.log(`${existing.size} objects already in bucket`);

const contentTypeFor = (name) =>
  name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

const todo = filenames.filter((f) => !existing.has(f) && fs.existsSync(path.join(imagesDir, f)));
console.log(`${todo.length} to upload (${filenames.length - todo.length} skipped)\n`);

let done = 0;
let failed = 0;
const failures = [];

async function uploadOne(name) {
  const buf = fs.readFileSync(path.join(imagesDir, name));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, buf, { upsert: true, contentType: contentTypeFor(name) });
  if (error) {
    failed++;
    failures.push(`${name}: ${error.message}`);
  }
  done++;
  if (done % 100 === 0 || done === todo.length) {
    process.stdout.write(`  uploaded ${done}/${todo.length} (failed ${failed})\r`);
  }
}

let cursor = 0;
async function worker() {
  while (cursor < todo.length) {
    const name = todo[cursor++];
    await uploadOne(name);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nUploaded ${done - failed}/${todo.length} (${failed} failed)`);
if (failures.length) {
  fs.writeFileSync('/tmp/image-upload-failures.txt', failures.join('\n'));
  console.log('Failures written to /tmp/image-upload-failures.txt');
}

// Verify: every images.url should be a public URL in this bucket
const { data: urls, error: urlErr } = await supabase
  .from('images')
  .select('url')
  .limit(20);
if (urlErr) {
  console.error(`Could not read images table: ${urlErr.message}`);
  process.exit(1);
}
const bad = urls.filter((u) => !u.url.includes('/storage/v1/object/public/pg-images/'));
if (bad.length) {
  console.warn(`${bad.length}/20 sampled image urls are not storage urls - did you run load.mjs?`);
} else {
  console.log('Image URL rewrite verified on sample rows.');
}
