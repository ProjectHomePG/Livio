import Link from 'next/link';
import { HOME_FAQS } from '../../lib/seo';

const RELATED_LINKS = [
  { label: 'PG for boys', href: '/search?query=boys%20PG' },
  { label: 'PG for girls', href: '/search?query=girls%20PG' },
  { label: 'Coliving PG', href: '/search?query=coliving' },
  { label: 'Student PG', href: '/search?query=student' },
  { label: 'Boys and girls hostel', href: '/search?query=hostel' },
  { label: 'Paying guest near metro', href: '/search?query=metro' },
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
            Find a PG near me with Livio - the free paying guest search tool
          </h2>
          <p>
            Livio is a location-first discovery tool built for one job: helping you find a{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">PG near me</strong>{' '}
            without brokers, fake photos or endless group chats. Whether you are a student moving to a
            new city for the first time or a working professional joining an office near a tech park,
            Livio brings thousands of verified{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">paying guest</strong>{' '}
            rooms, hostels and co-living spaces into one clean list. Search by locality, metro station,
            college or workplace, compare rent, sharing type and amenities side by side, and message the
            owner directly from the listing. Every property on the platform is reviewed by our ground
            team, so the photos, pricing and house rules you see are the ones you get when you visit.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            PG near you, sorted by distance and locality
          </h2>
          <p>
            The core of the tool is the <em>near me</em> experience. Turn on location and Livio ranks
            every available stay by real walking and driving distance from where you stand, so the
            closest{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">PG near</strong>{' '}
            your office or campus appears first. Prefer browsing first? Pick a neighbourhood instead -
            Koramangala, HSR Layout, Whitefield, Hinjewadi, Kharadi, Powai, Gurgaon, Noida or any other
            locality - and see all PG in that area with live counts. Our directory covers the corridors
            people actually search for: tech parks such as ITPL, RMZ Ecospace and DLF Cyber City,
            campuses like Christ University and Delhi University, and metro lines across Bengaluru,
            Delhi, Mumbai, Pune and Hyderabad. Each card shows rent per month, sharing type, gender
            policy, food availability and rating, which means you can shortlist five strong options in
            the time it takes to send one message.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            PG for boys and PG for girls with clear resident policies
          </h2>
          <p>
            Safety and comfort are not negotiable when you move into a new city. Livio separates{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">PG for boys</strong>{' '}
            and <strong className="font-semibold text-slate-800 dark:text-slate-200">PG for girls</strong>{' '}
            with an explicit resident policy on every listing, so you never have to guess who else lives
            in the building. Girls-only properties highlight gated entry, caretaker support, CCTV and
            curfew norms, while boys PG often showcase gym access, sports rooms and study-friendly
            quiet hours. Families sending their daughter or son to another city can filter for{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              paying guest for boys
            </strong>{' '}
            or{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              paying guest for girls
            </strong>{' '}
            and share the shortlist with a quick link. Unisex options and{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              boys and girls hostel
            </strong>{' '}
            properties are tagged separately, so mixed-governance buildings never show up in a
            single-gender search by accident.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Coliving PG, hostel and student PG stays for every budget
          </h2>
          <p>
            Not every seeker wants the same kind of stay, which is why Livio indexes the full spectrum
            of budget and premium options. A{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">coliving PG</strong>{' '}
            (also searched as a{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">colive PG</strong>)
            gives you a fully managed community experience: private or shared rooms, high-speed Wi-Fi,
            housekeeping, laundry, common lounges, weekly events and a single monthly bill. If you are
            watching your spend, the Budget Stays filter surfaces listings under Rs. 9,000, while the
            Luxe category collects premium rooms with attached balconies, AC and city views. Students
            can jump straight into the Student Hubs category to find a{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">student PG</strong>{' '}
            near colleges, libraries and exam hubs, with food-included mess plans and study corners.
            Travellers and interns often prefer a classic{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">hostel</strong> or a
            dorm bed for the first few weeks, then upgrade to a private room once they settle. Whatever
            you pick, every option is a verified{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">paying guest</strong>{' '}
            listing with transparent rent, deposit and notice-period terms.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            How the PG near me tool works
          </h2>
          <ol className="space-y-2 list-decimal list-inside marker:text-primary-600 dark:marker:text-primary-400">
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Search your area</strong>{' '}
              - type a locality, tech park, college or enable GPS to see PG near you instantly.
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Filter smartly</strong>{' '}
              - narrow by budget, single or sharing room, gender policy, food, AC and move-in date.
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Compare and save</strong>{' '}
              - open photos, amenities, reviews and nearby places, then add favourites to a shortlist.
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Contact the owner</strong>{' '}
              - send an inquiry directly and confirm availability, visit slots and terms.
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Move in</strong> -
              visit the property, lock the room and pay the host - no brokerage, no middlemen.
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            Why seekers search PG on Livio
          </h2>
          <p>
            Livio was designed as a search tool first, so the interface stays fast and honest. Filters
            apply instantly, results re-sort by distance, and the map view shows exactly where each stay
            sits relative to your commute. Ratings and reviews come from real residents, favourites sync
            across devices, and price displays can switch between per-month and total-before-tax so there
            are no surprises at payment time. Hosts get a simple dashboard to publish listings with
            photos, amenities and pricing, which keeps inventory fresh and competitive. Best of all, the
            entire experience is free for seekers - from the first search to the day you collect your
            keys. Start with a{' '}
            <Link
              href="/search"
              className="font-semibold text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:opacity-80"
            >
              city-wide search
            </Link>
            , jump to a{' '}
            <Link
              href="/search?query=near%20me"
              className="font-semibold text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:opacity-80"
            >
              near me listing
            </Link>
            , or read more about{' '}
            <Link
              href="/about-us"
              className="font-semibold text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:opacity-80"
            >
              how Livio verifies properties
            </Link>
            .
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
            Popular searches on Livio
          </h2>
          <ul className="flex flex-wrap gap-2">
            {RELATED_LINKS.map((link) => (
              <li key={link.label}>
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
