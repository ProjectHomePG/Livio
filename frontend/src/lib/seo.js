export const SITE_NAME = 'Livio';
export const SITE_BRAND = 'Livio PG Near Me';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestpgnearme.com').replace(/\/+$/, '');
export const SITE_HOST = 'bestpgnearme.com';
export const SUPPORT_EMAIL = 'support@bestpgnearme.com';

export const HOME_TITLE = 'PG Near Me | Verified Paying Guest, Hostel & Co-Living | Livio';

export const HOME_DESCRIPTION =
  'Search PG near me on Livio to compare verified paying guest rooms for boys and girls, student PG, coliving spaces, and hostels near colleges, tech parks, and metro stations across India.';

export const HOME_KEYWORDS = [
  'PG near me',
  'find PG near me',
  'PG accommodation in India',
  'affordable PG in India',
  'PG for boys',
  'PG for girls',
  'coliving PG',
  'hostel near me',
  'paying guest rooms',
  'student PG',
  'PG for working professionals',
  'single sharing PG',
  'double sharing PG',
  'PG with food',
  'Livio PG Near Me',
];

export const HOME_FAQS = [
  {
    question: 'How do I find a PG near me on Livio?',
    answer:
      'Open Livio, enable location access or select your city or locality, and sort available PG stays by distance, rent, sharing type, and resident policy. You can compare amenities and contact property hosts directly without brokerage.',
  },
  {
    question: 'Are there separate PG for boys and PG for girls?',
    answer:
      'Yes. Livio categorizes properties by resident policy into Boys PG, Girls PG, and Unisex Co-Living spaces so seekers and families can filter single-gender or co-living stays clearly.',
  },
  {
    question: 'What is the difference between a PG, a hostel and a coliving PG?',
    answer:
      'A paying guest stay typically offers furnished single or shared rooms with optional meals and housekeeping. A hostel is usually a budget shared or dormitory stay popular with students. A coliving accommodation provides managed private or shared rooms with Wi-Fi, shared lounges, and bundled utility bills.',
  },
  {
    question: 'Can students find a student PG near their college?',
    answer:
      'Yes. You can browse city and locality guides or use the Student Hubs filter to find PG accommodations near major universities, coaching centres, and metro stations across India.',
  },
  {
    question: 'Does Livio charge brokerage for PG enquiries?',
    answer:
      'No. Livio is a free PG discovery marketplace. Seekers can browse listings and submit enquiries directly to property owners without paying brokerage fees to Livio.',
  },
];

/**
 * Safely serialize JSON-LD for inline script injection without XSS risk.
 */
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Build an absolute canonical URL respecting trailingSlash: false.
 */
export function canonicalUrl(path = '/') {
  const clean = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}`;
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

/**
 * Build standard BreadcrumbList JSON-LD from [{ name, path }].
 */
export function buildBreadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : canonicalUrl(item.path),
    })),
  };
}

/**
 * Build consistent Next.js page metadata with canonical, OG, Twitter, and robots.
 */
export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords,
  image,
  noIndex = false,
  type = 'website',
}) {
  const url = canonicalUrl(path);
  const ogImages = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_BRAND,
      locale: 'en_IN',
      type,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}
