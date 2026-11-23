import HomePageClient from '../components/Home/HomePageClient';
import HomeSeoContent from '../components/Home/HomeSeoContent';
import {
  HOME_TITLE,
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_FAQS,
  SITE_NAME,
  SITE_URL,
} from '../lib/seo';

export const metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  keywords: HOME_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
    siteName: `${SITE_NAME} - PG Near Me`,
    locale: 'en_IN',
    type: 'website',
    countryName: 'India',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    site: '@livio',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: `${SITE_NAME} - PG Near Me`,
      alternateName: 'Livio PG Near Me',
      url: `${SITE_URL}/`,
      inLanguage: 'en-IN',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: 'PG Near Me',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
        width: 512,
        height: 512,
      },
      sameAs: [`${SITE_URL}/`],
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-8 pb-5 space-y-1.5">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            PG Near Me - Verified Paying Guest, Hostel &amp; Co-Living Stays Near You
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Search PG for boys, PG for girls, student PG and coliving PG near colleges, tech parks and
            metro stations across India - free, verified and broker-free.
          </p>
        </div>
      </header>

      <HomePageClient />

      <HomeSeoContent />
    </>
  );
}
