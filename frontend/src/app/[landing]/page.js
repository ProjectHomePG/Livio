import { notFound, permanentRedirect } from 'next/navigation';
import LandingPageView from '@/components/SEO/LandingPageView';
import { getAllApprovedPgs, getLowestPrice } from '@/lib/pgServer';
import {
  CITIES,
  CITY_ALIASES,
  CATEGORY_PAGES,
  MIN_LOCALITY_LISTINGS,
  findCityByLandingSlug,
  findStaticLanding,
  matchesCity,
  matchesLocality,
} from '@/lib/locations';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { landing } = await params;

  if (CITY_ALIASES[landing]) {
    return {
      title: 'Redirecting...',
      robots: { index: false, follow: true },
    };
  }

  const cityObj = findCityByLandingSlug(landing);
  if (cityObj) {
    return buildPageMetadata({
      title: `PG in ${cityObj.name} | Boys, Girls & Co-Living PG Near Me`,
      description: `Compare verified PG accommodations in ${cityObj.displayName}, ${cityObj.state}. Browse single, double, and triple sharing rooms for boys, girls, and professionals near major tech parks and colleges.`,
      path: `/${cityObj.slug}`,
      keywords: [
        `PG in ${cityObj.name}`,
        `PG near ${cityObj.name}`,
        `boys PG in ${cityObj.name}`,
        `girls PG in ${cityObj.name}`,
        `hostel in ${cityObj.name}`,
      ],
    });
  }

  const staticPage = findStaticLanding(landing);
  if (staticPage) {
    return buildPageMetadata({
      title: staticPage.title,
      description: staticPage.description,
      path: `/${staticPage.slug}`,
    });
  }

  return {
    title: 'Page Not Found',
    robots: { index: false, follow: false },
  };
}

export default async function SeoLandingPage({ params }) {
  const { landing } = await params;

  if (CITY_ALIASES[landing]) {
    permanentRedirect(`/${CITY_ALIASES[landing]}`);
  }

  const cityObj = findCityByLandingSlug(landing);
  const staticPage = findStaticLanding(landing);

  if (!cityObj && !staticPage) {
    notFound();
  }

  const allPgs = await getAllApprovedPgs({ revalidate: 3600 });

  if (cityObj) {
    const cityPgs = allPgs
      .filter((pg) => matchesCity(pg, cityObj))
      .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || (b.rating || 0) - (a.rating || 0));

    if (cityPgs.length === 0) {
      notFound();
    }

    const prices = cityPgs.map(getLowestPrice).filter((p) => p > 0);
    const minRent = prices.length ? Math.min(...prices) : null;

    const validLocalities = cityObj.localities.filter(
      (loc) => cityPgs.filter((pg) => matchesLocality(pg, loc)).length >= MIN_LOCALITY_LISTINGS
    );

    const relatedLinks = [
      ...validLocalities.map((loc) => ({
        label: `PG in ${loc.name}`,
        href: `/${cityObj.slug}/${loc.slug}`,
      })),
      ...CATEGORY_PAGES.slice(0, 6).map((cat) => ({
        label: cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
        href: `/${cat.slug}`,
      })),
    ];

    const faqs = [
      {
        question: `What is the starting PG rent in ${cityObj.name}?`,
        answer: minRent
          ? `Active PG listings in ${cityObj.displayName} on Livio start from ₹${minRent.toLocaleString('en-IN')} per month for shared occupancy, depending on locality, sharing type, and room facilities.`
          : `Monthly PG rents in ${cityObj.displayName} depend on sharing type, locality, and included amenities.`,
      },
      {
        question: `Which areas are most popular for PG stays in ${cityObj.name}?`,
        answer:
          validLocalities.length > 0
            ? `Popular neighborhoods with high PG inventory in ${cityObj.name} include ${validLocalities
                .map((l) => l.name)
                .join(', ')}.`
            : `${cityObj.displayName} offers PG stays near major educational campuses, IT corridors, and metro stations.`,
      },
      {
        question: `Are separate boys and girls PGs available in ${cityObj.name}?`,
        answer: `Yes. Livio lists separate boys PG, girls PG, and unisex co-living accommodations across ${cityObj.name} so you can filter by resident policy before enquiring.`,
      },
    ];

    return (
      <LandingPageView
        h1={`PG in ${cityObj.displayName} — Boys, Girls & Co-Living Stays`}
        intro={cityObj.intro}
        path={`/${cityObj.slug}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'PG in India', path: '/pg-in-india' },
          { name: `PG in ${cityObj.name}`, path: `/${cityObj.slug}` },
        ]}
        pgs={cityPgs}
        highlights={cityObj.highlights}
        transport={cityObj.transport}
        landmarks={validLocalities.map((l) => l.name)}
        relatedTitle={`Explore Localities in ${cityObj.name} & PG Categories`}
        relatedLinks={relatedLinks}
        faqs={faqs}
        searchHref={`/search?query=${encodeURIComponent(cityObj.name)}`}
      />
    );
  }

  // National, Category, or Budget landing page
  const matchingPgs = allPgs
    .filter(staticPage.filter)
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || (b.rating || 0) - (a.rating || 0));

  if (matchingPgs.length === 0) {
    notFound();
  }

  const relatedLinks = [
    ...CITIES.slice(0, 10).map((c) => ({
      label: `PG in ${c.name}`,
      href: `/${c.slug}`,
    })),
    ...CATEGORY_PAGES.filter((c) => c.slug !== staticPage.slug)
      .slice(0, 6)
      .map((c) => ({
        label: c.title.split('|')[0].trim(),
        href: `/${c.slug}`,
      })),
  ];

  const faqs = [
    {
      question: `How many ${staticPage.slug.replace(/-/g, ' ')} listings are currently active on Livio?`,
      answer: `Livio currently lists ${matchingPgs.length} matching properties across India for this category. Each listing includes room sharing options, locality details, and direct enquiry support.`,
    },
    {
      question: 'Does Livio charge brokerage to book or contact PG owners?',
      answer:
        'No. Livio connects seekers directly with hosts and does not charge any brokerage fee.',
    },
  ];

  return (
    <LandingPageView
      h1={staticPage.h1}
      intro={staticPage.intro}
      path={`/${staticPage.slug}`}
      breadcrumbs={[
        { name: 'Home', path: '/' },
        ...(staticPage.slug !== 'pg-in-india'
          ? [{ name: 'PG in India', path: '/pg-in-india' }]
          : []),
        { name: staticPage.title.split('|')[0].trim(), path: `/${staticPage.slug}` },
      ]}
      pgs={matchingPgs}
      highlights={[
        'Compare real monthly rent across single, double, and triple sharing rooms',
        'Filter by city, locality, and resident policy before scheduling a visit',
        'Submit direct enquiries without middlemen or brokerage charges',
      ]}
      relatedTitle="Browse by City & Category"
      relatedLinks={relatedLinks}
      faqs={faqs}
      searchHref="/search"
    />
  );
}
