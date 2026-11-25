"use client";

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import LivioLogo from '../Shared/LivioLogo';
import { usePreferences } from '@/context/PreferencesContext';

export default function Footer() {
  const { currentCurrency, setIsCurrencyModalOpen } = usePreferences();

  return (
    <footer className="w-full bg-[#F7F7F7] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 transition-colors">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-12">
        {/* Brand Header */}
        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <LivioLogo />
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Livio (PG Near Me) — India&apos;s discovery platform for paying guest accommodations, student hostels, and co-living spaces across 14 cities.
          </p>
        </div>

        {/* Links Grid */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Popular Cities */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-xs">Popular Cities</h3>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/pg-in-bangalore" className="hover:underline">PG in Bangalore</Link></li>
              <li><Link href="/pg-in-hyderabad" className="hover:underline">PG in Hyderabad</Link></li>
              <li><Link href="/pg-in-pune" className="hover:underline">PG in Pune</Link></li>
              <li><Link href="/pg-in-mumbai" className="hover:underline">PG in Mumbai</Link></li>
              <li><Link href="/pg-in-delhi" className="hover:underline">PG in Delhi</Link></li>
              <li><Link href="/pg-in-noida" className="hover:underline">PG in Noida</Link></li>
              <li><Link href="/pg-in-gurgaon" className="hover:underline">PG in Gurgaon</Link></li>
              <li><Link href="/pg-in-chennai" className="hover:underline">PG in Chennai</Link></li>
            </ul>
          </div>

          {/* Col 2: Categories & Budgets */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-xs">PG Categories &amp; Budgets</h3>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/pg-in-india" className="hover:underline">All India PG Directory</Link></li>
              <li><Link href="/boys-pg" className="hover:underline">Boys PG Near Me</Link></li>
              <li><Link href="/girls-pg" className="hover:underline">Girls PG Near Me</Link></li>
              <li><Link href="/coliving-pg" className="hover:underline">Coliving PG Spaces</Link></li>
              <li><Link href="/student-pg" className="hover:underline">Student PG &amp; Hostels</Link></li>
              <li><Link href="/single-sharing-pg" className="hover:underline">Single Sharing PG</Link></li>
              <li><Link href="/pg-under-8000" className="hover:underline">PG Under ₹8,000</Link></li>
              <li><Link href="/pg-under-10000" className="hover:underline">PG Under ₹10,000</Link></li>
            </ul>
          </div>

          {/* Col 3: Guides & Resources */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-xs">Guides &amp; Resources</h3>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/blog" className="hover:underline">Livio PG Blog &amp; Guides</Link></li>
              <li><Link href="/blog/how-to-find-affordable-pg-in-india" className="hover:underline">How to Find Affordable PG</Link></li>
              <li><Link href="/blog/pg-vs-hostel-vs-coliving" className="hover:underline">PG vs Hostel vs Coliving</Link></li>
              <li><Link href="/blog/how-to-choose-safe-girls-pg" className="hover:underline">Safe Girls PG Guide</Link></li>
              <li><Link href="/blog/things-to-check-before-booking-pg" className="hover:underline">PG Booking Checklist</Link></li>
              <li><Link href="/affordable-pg-in-india" className="hover:underline">Affordable PG in India</Link></li>
              <li><Link href="/hostels-in-india" className="hover:underline">Hostels in India</Link></li>
            </ul>
          </div>

          {/* Col 4: Livio Support */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-xs">Support &amp; Legal</h3>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/about-us" className="hover:underline">About Livio &amp; Listing Standards</Link></li>
              <li><Link href="/list-your-pg" className="hover:underline">List Your PG Free</Link></li>
              <li><Link href="/contact-us" className="hover:underline">Contact Support</Link></li>
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:underline">Terms &amp; Conditions</Link></li>
              <li><Link href="/sitemap.xml" className="hover:underline">XML Sitemap</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>© 2026 Livio · PG Near Me</span>
            <span>·</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/terms-and-conditions" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:underline">Sitemap</Link>
            <span>·</span>
            <Link href="/about-us" className="hover:underline">About Us</Link>
            <span>·</span>
            <Link href="/blog" className="hover:underline">Blog</Link>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="flex items-center gap-2 hover:underline cursor-pointer"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>English (IN)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="hover:underline cursor-pointer"
              title={`Active currency: ${currentCurrency?.label || 'Indian Rupee'}`}
            >
              <span>
                {currentCurrency?.code === 'INR' ? '₹ INR' : `${currentCurrency?.symbol || '₹'} ${currentCurrency?.code}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
