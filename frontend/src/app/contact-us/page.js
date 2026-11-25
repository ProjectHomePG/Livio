import Link from 'next/link';
import { Mail, Clock } from 'lucide-react';
import ContactForm from './ContactForm';

import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'Contact Us & Support',
  description:
    'Get in touch with the Livio PG Near Me support team about property listings, updates, partnerships, or seeker assistance.',
  path: '/contact-us',
});

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@bestpgnearme.com',
    href: 'mailto:support@bestpgnearme.com',
  },
  {
    icon: Clock,
    label: 'Support hours',
    value: 'Mon - Sat, 9:00 AM to 7:00 PM IST',
  },
];

export default function ContactUsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Get in touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Contact Us
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Questions about a listing, need help with your account, or want to partner with us?
          Send a message and our team will get back to you within one business day.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Channels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Reach us directly
            </h2>
            {CHANNELS.map((channel) => {
              const content = (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <channel.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {channel.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {channel.value}
                    </span>
                  </div>
                </>
              );

              return channel.href ? (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="flex items-center gap-3 hover:text-primary-600 transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div key={channel.label} className="flex items-center gap-3">
                  {content}
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Quick links
            </h2>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about-us" className="hover:text-primary-600 transition-colors">
                  About PG Near Me
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-primary-600 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary-600 transition-colors">
                  Browse PGs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
