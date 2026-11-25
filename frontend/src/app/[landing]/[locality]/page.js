import { notFound, permanentRedirect } from 'next/navigation';
import LandingPageView from '@/components/SEO/LandingPageView';
import { getAllApprovedPgs, getLowestPrice } from '@/lib/pgServer';
import {
  CITY_ALIASES,
  MIN_LOCALITY_LISTINGS,
  findCityByLandingSlug,
  findLocality,
  matchesCity,
  matchesLocality,
} from '@/lib/locations';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { landing, locality } = await params;

  if (CITY_ALIASES[landing]) {
    return {
      title: 'Redirecting...',
      robots: { index: false, follow: true },
    };
  }

  const cityObj = findCityByLandingSlug(landing);
  const localityObj = findLocality(cityObj, locality);

  if (!cityObj || !localityObj) {
    return {
      title: 'Locality Not Found',
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: `PG in ${localityObj.name}, ${cityObj.name} | Rooms, Rent & Reviews`,
    description: `Find paying guest and co-living accommodations in ${localityObj.name}, ${cityObj.name}. Compare monthly rent, sharing options, nearby landmarks, and transit links on Livio.`,
    path: `/${cityObj.slug}/${localityObj.slug}`,
    keywords: [
      `PG in ${localityObj.name}`,
      `PG near ${localityObj.name}`,
      `PG in ${localityObj.name} ${cityObj.name}`,
      `boys PG in ${localityObj.name}`,
      `girls PG in ${localityObj.name}`,
    ],
  });
}

export default async function LocalityLandingPage({ params }) {
  const { landing, locality } = await params;

  if (CITY_ALIASES[landing]) {
    permanentRedirect(`/${CITY_ALIASES[landing]}/${locality}`);
  }

  const cityObj = findCityByLandingSlug(landing);
  const localityObj = findLocality(cityObj, locality);

  if (!cityObj || !localityObj) {
    notFound();
  }

  const allPgs = await getAllApprovedPgs({ revalidate: 3600 });
  const cityPgs = allPgs.filter((pg) => matchesCity(pg, cityObj));
  const localityPgs = cityPgs
    .filter((pg) => matchesLocality(pg, localityObj))
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || (b.rating || 0) - (a.rating || 0));

  // Enforce thin-page guard: do not serve indexable locality pages with insufficient inventory
  if (localityPgs.length < MIN_LOCALITY_LISTINGS) {
    notFound();
  }

  const prices = localityPgs.map(getLowestPrice).filter((p) => p > 0);
  const minRent = prices.length ? Math.min(...prices) : null;

  const siblingLocalities = cityObj.localities
    .filter((loc) => loc.slug !== localityObj.slug)
    .filter((loc) => cityPgs.filter((pg) => matchesLocality(pg, loc)).length >= MIN_LOCALITY_LISTINGS);

  const relatedLinks = [
    { label: `All PG in ${cityObj.name}`, href: `/${cityObj.slug}` },
    ...siblingLocalities.map((loc) => ({
      label: `PG in ${loc.name}`,
      href: `/${cityObj.slug}/${loc.slug}`,
    })),
    { label: 'Boys PG Near Me', href: '/boys-pg' },
    { label: 'Girls PG Near Me', href: '/girls-pg' },
  ];

  const faqs = [
    {
      question: `What is the starting rent for a PG in ${localityObj.name}, ${cityObj.name}?`,
      answer: minRent
        ? `Listed PG accommodations in ${localityObj.name}, ${cityObj.name} start from ₹${minRent.toLocaleString('en-IN')} per month, varying by single, double, or triple sharing and included facilities.`
        : `Monthly PG rates in ${localityObj.name} depend on room sharing and amenities.`,
    },
    {
      question: `How is transport connectivity in ${localityObj.name}?`,
      answer: `${localityObj.name} is served by ${localityObj.transit}, offering convenient commutes to ${localityObj.landmarks.join(', ')}.`,
    },
    {
      question: `Can I find both boys and girls PGs in ${localityObj.name}?`,
      answer: `Yes, Livio indexes ${localityPgs.length} active PG properties in ${localityObj.name} across boys, girls, and unisex co-living policies.`,
    },
  ];

  return (
    <LandingPageView
      h1={`PG in ${localityObj.name}, ${cityObj.name} — Verified Listings & Rent`}
      intro={localityObj.intro}
      path={`/${cityObj.slug}/${localityObj.slug}`}
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'PG in India', path: '/pg-in-india' },
        { name: `PG in ${cityObj.name}`, path: `/${cityObj.slug}` },
        { name: localityObj.name, path: `/${cityObj.slug}/${localityObj.slug}` },
      ]}
      pgs={localityPgs}
      highlights={[
        `Close to ${localityObj.landmarks.join(', ')}`,
        `${localityPgs.length} active PG and co-living stays in ${localityObj.name}`,
        'Transparent sharing prices with direct owner enquiries',
      ]}
      transport={localityObj.transit}
      landmarks={localityObj.landmarks}
      relatedTitle={`Nearby PG Localities in ${cityObj.name}`}
      relatedLinks={relatedLinks}
      faqs={faqs}
      searchHref={`/search?query=${encodeURIComponent(localityObj.name)}`}
    />
  );
}
