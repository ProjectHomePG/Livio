import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

export const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://qtnevwoavtfipksvxipw.supabase.co';
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_SECRET_KEY) {
  console.error(
    'Missing SUPABASE_SECRET_KEY. Run:\n' +
      '  node --env-file=.env.migrate scripts/supabase/<script>.mjs\n' +
      'with SUPABASE_SECRET_KEY set in .env.migrate'
  );
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

export const PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/pg-images`;

/** RFC4180 CSV parser (handles quoted fields, embedded commas/newlines/quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  const [header, ...data] = rows;
  return data.map((r) => {
    const obj = {};
    header.forEach((h, idx) => {
      const v = r[idx];
      obj[h] = v === undefined || v === '@@NULL@@' ? null : v;
    });
    return obj;
  });
}

export function readCsv(path) {
  return parseCsv(fs.readFileSync(path, 'utf8'));
}

export function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function bool(v) {
  if (v === null || v === undefined) return null;
  return String(v).toUpperCase() === 'TRUE';
}

/** H2 timestamp 'YYYY-MM-DD HH:MM:SS.ffffff' -> ISO-8601 for PostgREST. */
export function ts(v) {
  if (!v) return null;
  return v.replace(' ', 'T') + 'Z';
}

export async function upsertInBatches(table, rows, opts = {}) {
  const size = opts.batchSize || 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    const { error } = await supabase.from(table).upsert(batch, {
      onConflict: opts.onConflict,
      ignoreDuplicates: false,
    });
    if (error) {
      throw new Error(`upsert ${table} batch ${i}: ${error.message}`);
    }
    inserted += batch.length;
    process.stdout.write(`  ${table}: ${inserted}/${rows.length}\r`);
  }
  process.stdout.write(`  ${table}: ${inserted}/${rows.length} done\n`);
  return inserted;
}
