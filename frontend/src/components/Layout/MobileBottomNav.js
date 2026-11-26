"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, PlusCircle } from 'lucide-react';
import authService from '@/services/authService';
import { AUTH_ENABLED } from '@/config';
import { usePreferences } from '@/context/PreferencesContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const { setIsSearchModalOpen } = usePreferences();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  // Don't show inside admin screens
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-around shadow-lg">
      <Link
        href="/"
        onClick={(e) => {
          // Already on home — open the search overlay instead of a dead link
          if (pathname === '/') {
            e.preventDefault();
            setIsSearchModalOpen(true);
          }
        }}
        aria-label="Search stays"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/' || pathname === '/search'
            ? 'text-primary-500 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Search className="w-5 h-5 stroke-[2.2]" />
        <span>Explore</span>
      </Link>

      <Link
        href="/favorites"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/favorites'
            ? 'text-primary-500 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Heart className="w-5 h-5 stroke-[2.2]" />
        <span>Wishlists</span>
      </Link>

      <Link
        href={user ? '/favorites' : AUTH_ENABLED ? '/login' : '/list-your-pg'}
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/login' || pathname === '/register' || pathname === '/list-your-pg'
            ? 'text-primary-500 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {user || AUTH_ENABLED ? (
          <User className="w-5 h-5 stroke-[2.2]" />
        ) : (
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
        )}
        <span>{user ? 'Profile' : AUTH_ENABLED ? 'Log in' : 'List PG'}</span>
      </Link>
    </nav>
  );
}

