import Link from 'next/link';
import { HOME_FAQS } from '../../lib/seo';

const RELATED_LINKS = [
  { label: 'PG in India', href: '/pg-in-india' },
  { label: 'Boys PG', href: '/boys-pg' },
  { label: 'Girls PG', href: '/girls-pg' },
  { label: 'Coliving PG', href: '/coliving-pg' },
  { label: 'Student PG', href: '/student-pg' },
  { label: 'Working Professionals PG', href: '/working-professionals-pg' },
  { label: 'Single Sharing PG', href: '/single-sharing-pg' },
  { label: 'PG Under ₹8,000', href: '/pg-under-8000' },
  { label: 'PG Under ₹10,000', href: '/pg-under-10000' },
  { label: 'Hostels in India', href: '/hostels-in-india' },
  { label: 'PG in Bangalore', href: '/pg-in-bangalore' },
  { label: 'PG in Hyderabad', href: '/pg-in-hyderabad' },
  { label: 'PG in Pune', href: '/pg-in-pune' },
  { label: 'PG in Mumbai', href: '/pg-in-mumbai' },
  { label: 'PG in Delhi', href: '/pg-in-delhi' },
  { label: 'PG in Noida', href: '/pg-in-noida' },
  { label: 'PG in Gurgaon', href: '/pg-in-gurgaon' },
  { label: 'PG in Chennai', href: '/pg-in-chennai' },
  { label: 'PG Rental Guides and Blog', href: '/blog' },
];

export default function HomeSeoContent() {
  return (
    <section
      id="about-pg-near-me"
      aria-label="About finding a PG near me with Livio"
      className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 space-y-10 text-slate-600 dark:text-slate-400 text-sm sm:text-[15px] leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Find a PG near me with Livio: India wide paying guest discovery
          </h2>
          <p>
            Livio is a location-first accommodation marketplace built for one goal: helping you find a{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">PG near me</strong>{' '}
            without brokers or scattered listings. Whether you are a student moving to a new campus or
            a working professional joining an office near a tech park, Livio brings together{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">paying guest</strong>{' '}
            rooms, hostels, and co-living spaces across 14 major Indian cities. Search by locality,
            metro station, college, or workplace, compare monthly rent and sharing options side by
            side, and submit enquiries directly from each property page.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            PG near you, organized by city, locality, and distance
          </h2>
          <p>
            Turn on location access to sort nearby stays by distance from where you stand, or browse
            dedicated city and locality pages across{' '}
            <Link href="/pg-in-bangalore" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Bangalore
            </Link>
            ,{' '}
            <Link href="/pg-in-hyderabad" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Hyderabad
            </Link>
            ,{' '}
            <Link href="/pg-in-pune" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Pune
            </Link>
            ,{' '}
            <Link href="/pg-in-mumbai" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Mumbai
            </Link>
            ,{' '}
            <Link href="/pg-in-delhi" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Delhi
            </Link>
            ,{' '}
            <Link href="/pg-in-noida" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Noida
            </Link>
            ,{' '}
            <Link href="/pg-in-gurgaon" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Gurgaon
            </Link>
            , and{' '}
            <Link href="/pg-in-chennai" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Chennai
            </Link>
            . Explore high-demand neighborhoods such as Whitefield, Koramangala, Gachibowli,
            Madhapur, Kharadi, Hinjewadi, Powai, Sector 62, and Perungudi with transparent sharing
            rates and resident reviews.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Boys PG, Girls PG, and Co-Living stays with clear resident policies
          </h2>
          <p>
            Every property clearly states whether it is a{' '}
            <Link href="/boys-pg" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              boys PG
            </Link>
            ,{' '}
            <Link href="/girls-pg" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              girls PG
            </Link>
            , or{' '}
            <Link href="/coliving-pg" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              unisex co-living PG
            </Link>
            . Students and parents can compare single, double, and triple sharing pricing, read real
            occupant reviews, and review our{' '}
            <Link href="/about-us" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              listing standards
            </Link>{' '}
            and{' '}
            <Link href="/blog" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              PG booking guides
            </Link>{' '}
            before visiting a property.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Frequently asked questions about PG near me
          </h2>
          <dl className="space-y-5">
            {HOME_FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-bold text-slate-900 dark:text-white">{faq.question}</dt>
                <dd className="mt-1">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Explore PG categories &amp; cities across India
          </h2>
          <ul className="flex flex-wrap gap-2">
            {RELATED_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
