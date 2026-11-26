import Link from 'next/link';
import { ChevronRight, Home, MapPin, TrainFront, Building2, IndianRupee, Users, ArrowRight } from 'lucide-react';
import PGGrid from '@/components/Search/PGGrid';
import { buildBreadcrumbJsonLd, canonicalUrl, safeJsonLd } from '@/lib/seo';
import { getLowestPrice } from '@/lib/pgServer';

function computeStats(pgs) {
  const prices = pgs.map(getLowestPrice).filter((p) => p > 0);
  const singlePrices = pgs.map((p) => Number(p.priceSingle || 0)).filter((p) => p > 0);
  const doublePrices = pgs.map((p) => Number(p.priceDouble || 0)).filter((p) => p > 0);
  const triplePrices = pgs.map((p) => Number(p.priceTriple || 0)).filter((p) => p > 0);

  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const boysCount = pgs.filter((p) => (p.genderType || '').toUpperCase() === 'MALE').length;
  const girlsCount = pgs.filter((p) => (p.genderType || '').toUpperCase() === 'FEMALE').length;
  const colivingCount = pgs.filter((p) => (p.genderType || '').toUpperCase() === 'UNISEX').length;

  return {
    total: pgs.length,
    minPrice,
    maxPrice,
    minSingle: singlePrices.length ? Math.min(...singlePrices) : null,
    minDouble: doublePrices.length ? Math.min(...doublePrices) : null,
    minTriple: triplePrices.length ? Math.min(...triplePrices) : null,
    boysCount,
    girlsCount,
    colivingCount,
  };
}

export default function LandingPageView({
  h1,
  intro,
  path,
  breadcrumbs = [],
  pgs = [],
  highlights = [],
  transport = '',
  landmarks = [],
  relatedLinks = [],
  relatedTitle = 'Explore Nearby Localities & Categories',
  faqs = [],
  searchHref = '/search',
}) {
  const stats = computeStats(pgs);
  const displayedPgs = pgs.slice(0, 36);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
    url: canonicalUrl(path),
    numberOfItems: displayedPgs.length,
    itemListElement: displayedPgs.slice(0, 12).map((pg, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: pg.title,
      url: canonicalUrl(`/property/${encodeURIComponent(pg.slug)}`),
    })),
  };

  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}

      {/* Header & Stats */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10 space-y-5">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <span key={item.path} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    {isLast ? (
                      <span className="text-slate-900 dark:text-white" aria-current="page">
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
          )}

          <div className="space-y-2.5 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {h1}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {intro}
            </p>
          </div>

          {/* Live Database Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary-500" />
                Active Listings
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {stats.total} Stays
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-primary-500" />
                Monthly Rent Range
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {stats.minPrice
                  ? stats.maxPrice && stats.maxPrice > stats.minPrice
                    ? `₹${stats.minPrice.toLocaleString('en-IN')} – ₹${stats.maxPrice.toLocaleString('en-IN')}`
                    : `From ₹${stats.minPrice.toLocaleString('en-IN')}`
                  : 'On Request'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary-500" />
                Resident Options
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                {[
                  stats.boysCount ? `${stats.boysCount} Boys` : null,
                  stats.girlsCount ? `${stats.girlsCount} Girls` : null,
                  stats.colivingCount ? `${stats.colivingCount} Co-living` : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Boys, Girls & Co-living'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                Sharing Starting From
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                {[
                  stats.minTriple ? `Triple ₹${stats.minTriple.toLocaleString('en-IN')}` : null,
                  stats.minDouble ? `Double ₹${stats.minDouble.toLocaleString('en-IN')}` : null,
                  stats.minSingle ? `Single ₹${stats.minSingle.toLocaleString('en-IN')}` : null,
                ]
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(' · ') || 'Single & Shared'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Listings Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-12">
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Available PG &amp; Co-Living Listings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Showing {displayedPgs.length} of {stats.total} active stays with direct host enquiries
              </p>
            </div>
            <Link
              href={searchHref}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity self-start sm:self-auto"
            >
              <span>Filter on Map &amp; Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PGGrid pgs={displayedPgs} />
        </section>

        {/* Local Insights, Landmarks & Transit */}
        {(highlights.length > 0 || transport || landmarks.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            {highlights.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Why Choose This Area
                </h2>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                  {highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {transport && (
                <div className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrainFront className="w-4 h-4 text-primary-500" />
                    Metro &amp; Commute Connectivity
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {transport}
                  </p>
                </div>
              )}

              {landmarks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Key Landmarks &amp; Hubs Nearby
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {landmarks.map((lm) => (
                      <span
                        key={lm}
                        className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Internal Links */}
        {relatedLinks.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {relatedTitle}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 max-w-4xl">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
                >
                  <dt className="text-sm font-bold text-slate-900 dark:text-white">{faq.question}</dt>
                  <dd className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
    </div>
  );
}
