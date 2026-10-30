import Link from 'next/link';
import { AUTH_ENABLED } from '../../config';
import {
  Search,
  ShieldCheck,
  MessageSquare,
  Heart,
  MapPin,
  Users,
  Building2,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'About Us | Livio - PG Near Me',
  description:
    'Livio (PG Near Me) helps students and professionals find verified PG and co-living accommodations near colleges, tech parks, and metro stations across India.',
};

const STEPS = [
  {
    icon: Search,
    title: 'Search your area',
    text: 'Browse verified PGs near your college, office, or metro station using smart filters for budget, sharing type, and gender.',
  },
  {
    icon: MessageSquare,
    title: 'Contact the owner',
    text: 'Send an inquiry directly from the listing. The owner or host responds with availability, pricing, and visit slots.',
  },
  {
    icon: Building2,
    title: 'Move in',
    text: 'Visit the property, confirm the terms with the host, and lock in your room. No brokerage, no guesswork.',
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified listings',
    text: 'Every property is checked by our ground team so you know the photos, rent, and amenities are real.',
  },
  {
    icon: MapPin,
    title: 'Location first',
    text: 'Listings are mapped against tech parks, colleges, hospitals, and transit hubs so commute time is never a surprise.',
  },
  {
    icon: Heart,
    title: 'Built for shortlists',
    text: 'Save favorites, compare options side by side, and share them with friends or family before deciding.',
  },
  {
    icon: Users,
    title: 'Direct owners',
    text: 'Talk to the host directly. No middlemen skimming a cut of your deposit or rent.',
  },
];

export default function AboutUsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <header className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          About Livio - PG Near Me
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
          Finding a place to live should not take months.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Livio (PG Near Me) is India&apos;s modern discovery platform for paying guest (PG) and co-living accommodations.
          We connect seekers directly with verified hosts, so students and working professionals can find a room
          near their college or workplace without paying a broker.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            Browse Stays
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
          >
            Talk to us
          </Link>
        </div>
      </header>

      {/* How it works */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">How Livio works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Three simple steps between you and your next room.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <div key={step.title} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-primary-600 flex items-center justify-center">
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Why seekers pick Livio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            What we optimise for on every listing.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map((value) => (
            <div key={value.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 flex items-center justify-center flex-shrink-0">
                <value.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{value.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
                  {value.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For hosts */}
      <section className="bg-gradient-to-r from-primary-600 to-rose-500 rounded-3xl shadow-sm p-8 sm:p-12 text-white space-y-4">
        <h2 className="text-xl font-black">List your property on Livio</h2>
        <p className="text-sm text-white/85 leading-relaxed max-w-3xl">
          Hosts and property owners can create a dashboard, publish listings with photos and amenities,
          and receive booking inquiries from verified seekers. It takes a few minutes to get started.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {AUTH_ENABLED && (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-700 bg-white hover:bg-rose-50 rounded-xl transition-colors"
            >
              Become a host
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white border border-white/40 hover:bg-white/10 rounded-xl transition-colors"
          >
            Contact our team
          </Link>
        </div>
      </section>
    </div>
  );
}
