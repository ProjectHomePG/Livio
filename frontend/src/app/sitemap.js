import { SITE_URL } from '../lib/seo';
import { getAllApprovedPgs, getSitemapPgEntries } from '../lib/pgServer';
import {
  CITIES,
  NATIONAL_PAGES,
  CATEGORY_PAGES,
  MIN_LOCALITY_LISTINGS,
  matchesCity,
  matchesLocality,
} from '../lib/locations';
import { BLOG_POSTS } from '../lib/blogData';

export const revalidate = 86400;

function toDate(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap() {
  const now = new Date();

  const staticPaths = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/list-your-pg', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/about-us', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contact-us', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms-and-conditions', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticEntries = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const nationalEntries = NATIONAL_PAGES.map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const categoryEntries = CATEGORY_PAGES.map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const cityEntries = CITIES.map((city) => ({
    url: `${SITE_URL}/${city.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Only include locality pages that have sufficient real inventory (>= MIN_LOCALITY_LISTINGS)
  let localityEntries = [];
  try {
    const allPgs = await getAllApprovedPgs({
      select: 'id,title,city,address',
      revalidate: 86400,
    });
    for (const city of CITIES) {
      const cityPgs = allPgs.filter((pg) => matchesCity(pg, city));
      for (const loc of city.localities) {
        const count = cityPgs.filter((pg) => matchesLocality(pg, loc)).length;
        if (count >= MIN_LOCALITY_LISTINGS) {
          localityEntries.push({
            url: `${SITE_URL}/${city.slug}/${loc.slug}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    localityEntries = [];
  }

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: toDate(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  let listingEntries = [];
  try {
    const pgs = await getSitemapPgEntries();
    listingEntries = pgs.map((pg) => ({
      url: `${SITE_URL}/property/${encodeURIComponent(pg.slug)}`,
      lastModified: toDate(pg.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    listingEntries = [];
  }

  return [
    ...staticEntries,
    ...nationalEntries,
    ...cityEntries,
    ...localityEntries,
    ...categoryEntries,
    ...blogEntries,
    ...listingEntries,
  ];
}
