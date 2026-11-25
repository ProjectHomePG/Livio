import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Info, Award, MapPin, Star, ChevronRight, Home } from 'lucide-react';
import { getPgBySlug, getRelatedPgs, getLowestPrice } from '@/lib/pgServer';
import { findMatchingLocalityForPg, getCityLandingSlug } from '@/lib/locations';
import { buildBreadcrumbJsonLd, buildPageMetadata, canonicalUrl, safeJsonLd } from '@/lib/seo';
import ImageGallery from '@/components/Details/ImageGallery';
import Amenities from '@/components/Details/Amenities';
import ReviewList from '@/components/Details/ReviewList';
import FoodQualityChart from '@/components/Details/FoodQualityChart';
import NearbyPlaces from '@/components/Details/NearbyPlaces';
import ContactOwner from '@/components/Details/ContactOwner';
import MapView from '@/components/Search/MapView';
import PropertyAdminActions from '@/components/Details/PropertyAdminActions';
import PropertyViewTracker from '@/components/Details/PropertyViewTracker';
import PropertyFavoriteButton from '@/components/Details/PropertyFavoriteButton';

export const revalidate = 3600;

function formatGenderLabel(genderType) {
  const g = (genderType || '').toUpperCase();
  if (g === 'MALE') return 'Boys PG';
  if (g === 'FEMALE') return 'Girls PG';
  return 'Co-Living / Unisex PG';
}

function formatCleanDescription(rawDescription, pg, genderLabel) {
  const fallback = `${pg.title} is a verified ${genderLabel.toLowerCase()} located at ${pg.address || pg.city}, ${pg.city}, ${pg.state}. It offers comfortable single, double, and triple sharing accommodations with quick access to nearby tech parks, colleges, and transit stations. Submit an enquiry to check current bed availability and arrange a property visit.`;

  if (!rawDescription || typeof rawDescription !== 'string') {
    return fallback;
  }

  let text = rawDescription.trim();

  // If scraper artifact, raw JSON, or Google Maps default prefix
  if (
    text.startsWith('Imported from Google Maps:') ||
    text.startsWith('{') ||
    text.startsWith('[') ||
    text.includes('""') ||
    text.length < 20
  ) {
    return fallback;
  }

  // Remove brackets, curly braces, and redundant dashed sequences
  text = text
    .replace(/[\[\]{}]/g, '')
    .replace(/--+/g, ' ')
    .replace(/\s*-\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();

  return text.length > 20 ? text : fallback;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const pg = await getPgBySlug(decodedSlug);

  if (!pg) {
    return {
      title: 'Listing Not Found',
      robots: { index: false, follow: false },
    };
  }

  const lowestPrice = getLowestPrice(pg);
  const genderLabel = formatGenderLabel(pg.genderType);
  const priceText = lowestPrice > 0 ? ` starting at ₹${lowestPrice.toLocaleString('en-IN')}/month` : '';
  const title = `${pg.title} | ${genderLabel} in ${pg.city}`;
  const description = `${pg.title} in ${pg.address || pg.city}, ${pg.state}${priceText}. Compare single, double, and triple sharing rooms, amenities, photos, and reviews on Livio.`;

  const primaryImage = pg.images?.find((img) => img.isPrimary)?.url || pg.images?.[0]?.url;

  return buildPageMetadata({
    title,
    description,
    path: `/property/${pg.slug}`,
    image: primaryImage,
  });
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const pg = await getPgBySlug(decodedSlug);

  if (!pg) {
    notFound();
  }

  const [relatedPgs] = await Promise.all([
    getRelatedPgs(pg.city, pg.id, 4),
  ]);

  const locationMatch = findMatchingLocalityForPg(pg);
  const cityLandingSlug = locationMatch?.city?.slug || getCityLandingSlug(pg.city);
  const cityDisplayName = locationMatch?.city?.name || pg.city;

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...(cityLandingSlug
      ? [{ name: `PG in ${cityDisplayName}`, path: `/${cityLandingSlug}` }]
      : []),
    ...(cityLandingSlug && locationMatch?.locality
      ? [
          {
            name: locationMatch.locality.name,
            path: `/${cityLandingSlug}/${locationMatch.locality.slug}`,
          },
        ]
      : []),
    { name: pg.title, path: `/property/${pg.slug}` },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  const realReviews = Array.isArray(pg.reviews) ? pg.reviews : [];
  const reviewCount = realReviews.length > 0 ? realReviews.length : pg.reviewsCount || 0;
  const computedAvgRating =
    realReviews.length > 0
      ? Number((realReviews.reduce((a, r) => a + r.rating, 0) / realReviews.length).toFixed(2))
      : pg.rating && pg.rating > 0
      ? Number(pg.rating)
      : null;

  const lowestPrice = getLowestPrice(pg);
  const highestPrice = Math.max(
    ...[pg.priceSingle, pg.priceDouble, pg.priceTriple, pg.price]
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0),
    0
  );

  const lodgingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': canonicalUrl(`/property/${pg.slug}`),
    name: pg.title,
    description:
      pg.description ||
      `${pg.title} is a ${formatGenderLabel(pg.genderType)} located at ${pg.address}, ${pg.city}, ${pg.state}.`,
    url: canonicalUrl(`/property/${pg.slug}`),
    image: pg.images?.map((img) => img.url).filter(Boolean) || [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: pg.address,
      addressLocality: pg.city,
      addressRegion: pg.state,
      ...(pg.zipCode ? { postalCode: pg.zipCode } : {}),
      addressCountry: 'IN',
    },
    ...(typeof pg.latitude === 'number' && typeof pg.longitude === 'number'
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: pg.latitude,
            longitude: pg.longitude,
          },
        }
      : {}),
    ...(lowestPrice > 0
      ? {
          priceRange:
            highestPrice > lowestPrice
              ? `₹${lowestPrice.toLocaleString('en-IN')} - ₹${highestPrice.toLocaleString('en-IN')}/month`
              : `₹${lowestPrice.toLocaleString('en-IN')}/month`,
        }
      : {}),
    ...(pg.amenities?.length > 0
      ? {
          amenityFeature: pg.amenities.map((a) => ({
            '@type': 'LocationFeatureSpecification',
            name: a.name,
            value: true,
          })),
        }
      : {}),
    ...(computedAvgRating && reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: computedAvgRating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const genderLabel = formatGenderLabel(pg.genderType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PropertyViewTracker pg={pg} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(lodgingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          return (
            <span key={item.path} className="inline-flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {isLast ? (
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[260px] sm:max-w-none" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-primary-600 transition-colors inline-flex items-center gap-1">
                  {idx === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Image Gallery */}
      <ImageGallery
        images={pg.images}
        pgTitle={pg.title}
        pgLocation={`${pg.city}${pg.state ? `, ${pg.state}` : ''}`}
      />

      {/* Details Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/30 text-primary-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                  {genderLabel}
                </span>
                {pg.sharingType && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {pg.sharingType} sharing
                  </span>
                )}
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                  Active Listing
                </span>
              </div>
              <PropertyFavoriteButton pgId={pg.id} title={pg.title} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              {pg.title}
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-primary-500 flex-shrink-0" />
              {pg.address}, {pg.city}, {pg.state}
              {pg.zipCode ? `, ${pg.zipCode}` : ''}
            </p>
            {computedAvgRating && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold">{computedAvgRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">
                  Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
              About this accommodation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {formatCleanDescription(pg.description, pg, genderLabel)}
            </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <Amenities amenities={pg.amenities} />

          <hr className="border-slate-100 dark:border-slate-800" />

          <div className="space-y-3">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
              Property Location
            </h2>
            <p className="text-xs text-slate-400">
              Explore the location and nearby transit links around {pg.city}.
            </p>
            <MapView pgs={[pg]} height="h-[300px]" />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <NearbyPlaces places={pg.nearbyPlaces} />

          <hr className="border-slate-100 dark:border-slate-800" />

          <FoodQualityChart reviews={realReviews} />

          <ReviewList pgId={pg.id} pgTitle={pg.title} initialReviews={realReviews} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monthly Rent by Sharing Type
            </h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Single</div>
                <div className="text-lg font-black text-primary-400">
                  {pg.priceSingle || pg.price
                    ? `₹${(pg.priceSingle || pg.price).toLocaleString('en-IN')}`
                    : 'On Request'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Double</div>
                <div className="text-lg font-black text-primary-400">
                  {pg.priceDouble || pg.price
                    ? `₹${(pg.priceDouble || pg.price).toLocaleString('en-IN')}`
                    : 'On Request'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Triple</div>
                <div className="text-lg font-black text-primary-400">
                  {pg.priceTriple || pg.price
                    ? `₹${(pg.priceTriple || pg.price).toLocaleString('en-IN')}`
                    : 'On Request'}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-center space-x-2 text-[10px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
              <span>Indicative monthly pricing. Confirm final rent, deposit, and meal inclusions directly with the host.</span>
            </div>
          </div>

          <PropertyFavoriteButton pgId={pg.id} title={pg.title} variant="compact" />

          <PropertyAdminActions pgId={pg.id} />

          <ContactOwner pgId={pg.id} pgTitle={pg.title} city={pg.city} />

          {pg.rules && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Award className="w-4 h-4 mr-1.5 text-primary-500" />
                PG Stay Guidelines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {pg.rules}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related PGs in the same city */}
      {relatedPgs.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              More PG Stays in {cityDisplayName}
            </h2>
            {cityLandingSlug && (
              <Link
                href={`/${cityLandingSlug}`}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all in {cityDisplayName} &rarr;
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedPgs.map((item) => {
              const itemPrice = getLowestPrice(item);
              const thumb = item.images?.[0]?.url;
              return (
                <Link
                  key={item.id}
                  href={`/property/${encodeURIComponent(item.slug)}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary-500 transition-colors"
                >
                  {thumb && (
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <Image
                        src={thumb}
                        alt={`${item.title} in ${item.city}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-3.5 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.address}
                    </p>
                    {itemPrice > 0 && (
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-1">
                        From ₹{itemPrice.toLocaleString('en-IN')}/mo
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
