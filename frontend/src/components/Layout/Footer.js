"use client";

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import LivioLogo from '../Shared/LivioLogo';
import { usePreferences } from '@/context/PreferencesContext';

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Footer() {
  const { currentCurrency, setIsCurrencyModalOpen } = usePreferences();

  return (
    <footer className="w-full bg-[#F7F7F7] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 transition-colors">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-12">
        {/* Brand Header */}
        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <LivioLogo />
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Livio (PG Near Me) - India&apos;s fastest discovery platform for verified PG accommodations, hostels, and premium co-living spaces.
          </p>
        </div>

        {/* Links Grid */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Popular Cities */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Popular Cities</h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/search?query=Bengaluru" className="hover:underline">PG in Bengaluru</Link></li>
              <li><Link href="/search?query=Delhi" className="hover:underline">PG in Delhi NCR</Link></li>
              <li><Link href="/search?query=Mumbai" className="hover:underline">PG in Mumbai</Link></li>
              <li><Link href="/search?query=Pune" className="hover:underline">PG in Pune</Link></li>
              <li><Link href="/search?query=Hyderabad" className="hover:underline">PG in Hyderabad</Link></li>
              <li><Link href="/search?query=Chennai" className="hover:underline">PG in Chennai</Link></li>
            </ul>
          </div>

          {/* Col 2: Top Hubs */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Tech Parks & Colleges</h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/search?query=Manyata" className="hover:underline">PG near Manyata Tech Park</Link></li>
              <li><Link href="/search?query=Whitefield" className="hover:underline">PG near ITPL Whitefield</Link></li>
              <li><Link href="/search?query=Gurugram" className="hover:underline">PG near DLF Cyber City</Link></li>
              <li><Link href="/search?query=Koramangala" className="hover:underline">PG near Christ University</Link></li>
              <li><Link href="/search?query=Powai" className="hover:underline">PG near IIT Bombay</Link></li>
              <li><Link href="/search?query=Hinjewadi" className="hover:underline">PG near Hinjewadi Phase 1</Link></li>
            </ul>
          </div>

          {/* Col 3: Hosting */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Hosting on Livio</h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/admin/add-pg" className="hover:underline">List your PG Property</Link></li>
              <li><Link href="/about-us" className="hover:underline">Owner Protection Plan</Link></li>
              <li><Link href="/contact-us" className="hover:underline">Community Guidelines</Link></li>
              <li><Link href="/login" className="hover:underline">Host Dashboard</Link></li>
              <li><Link href="/contact-us" className="hover:underline">Owner FAQ</Link></li>
            </ul>
          </div>

          {/* Col 4: Livio Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Support & Legal</h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/contact-us" className="hover:underline">Help Centre</Link></li>
              <li><Link href="/about-us" className="hover:underline">About Livio</Link></li>
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/contact-us" className="hover:underline">Contact Support</Link></li>
              <li><Link href="/sitemap.xml" className="hover:underline">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          {/* Left Copyright */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>© 2026 Livio, Inc. · PG Near Me™</span>
            <span>·</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/terms-and-conditions" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:underline">Sitemap</Link>
            <span>·</span>
            <Link href="/about-us" className="hover:underline">Company details</Link>
          </div>

          {/* Right Language, Currency & Socials */}
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

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-800 dark:text-slate-200">
              <a href="#" aria-label="Facebook" className="hover:text-primary-600 transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-primary-600 transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-primary-600 transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
