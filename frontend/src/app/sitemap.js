import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8082";

export const dynamic = "force-static";
export const revalidate = 86400;

const staticPages = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.8 },
  { path: "/about-us", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contact-us", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
];

function toDate(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function getListingEntries() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('pgs')
      .select('slug, updated_at, created_at')
      .limit(10000);
    if (error || !data) return [];

    return data
      .filter((pg) => pg && pg.slug)
      .map((pg) => ({
        url: `${baseUrl}/pg?slug=${pg.slug}`,
        lastModified: toDate(pg.updated_at ?? pg.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const staticEntries = staticPages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const listingEntries = await getListingEntries();

  return [...staticEntries, ...listingEntries];
}
