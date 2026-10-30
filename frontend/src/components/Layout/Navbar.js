"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Globe,
  Menu,
  User,
  Heart,
  Shield,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  HelpCircle,
  Map,
  List,
} from 'lucide-react';
import authService from '@/services/authService';
import { AUTH_ENABLED } from '@/config';
import LivioLogo from '../Shared/LivioLogo';
import AirbnbSearchBar from '../Home/AirbnbSearchBar';
import ThemeToggle from '../Shared/ThemeToggle';
import CurrencyModal from '../Shared/CurrencyModal';
import { usePreferences } from '@/context/PreferencesContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentCurrency,
    setIsCurrencyModalOpen,
    isMapView,
    toggleMapView,
    setIsMapView,
  } = usePreferences();

  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Authentication sync
  useEffect(() => {
    setUser(authService.getCurrentUser());

    authService.getSessionUser().then((sessionUser) => {
      if (sessionUser) setUser(sessionUser);
    });

    const { data: authListener } = authService.onAuthStateChange?.((updatedUser) => {
      setUser(updatedUser);
    }) || {};

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleToggleMap = () => {
    if (pathname !== '/' && pathname !== '/search') {
      setIsMapView(true);
      router.push('/');
    } else {
      toggleMapView();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[2520px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-3 md:gap-4">
          
          {/* 1. Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="inline-block focus:outline-none" aria-label="Livio Home">
              <LivioLogo />
            </Link>
          </div>

          {/* 2. Center: Sleek Airbnb Search Pill */}
          <div className="flex-1 flex justify-center items-center px-1 sm:px-2 md:px-4 min-w-0 max-w-full">
            <AirbnbSearchBar />
          </div>

          {/* 3. Right: Show Map, Host CTA, Currency, Theme & User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Show Map / List Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMap}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 md:px-3.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isMapView
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              aria-label={isMapView ? 'Show list view' : 'Show map view'}
              title={isMapView ? 'Show list view' : 'Show map view'}
            >
              {isMapView ? (
                <>
                  <List className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline ml-1.5">Show list</span>
                </>
              ) : (
                <>
                  <Map className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-primary-500 stroke-[2.2]" />
                  <span className="hidden sm:inline ml-1.5">Show map</span>
                </>
              )}
            </button>

            {/* List your PG CTA (Large screens only) */}
            <Link
              href={user ? '/admin/add-pg' : '/login'}
              className="hidden xl:inline-block px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              List your PG
            </Link>

            {/* Currency / Language selector (Tablet & Desktop) */}
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer hidden md:flex items-center justify-center text-xs font-semibold gap-1.5"
              aria-label="Language & currency"
              title={`Currency: ${currentCurrency?.label || 'Indian Rupee'} (${currentCurrency?.code || 'INR'})`}
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="font-bold">
                {currentCurrency?.code === 'INR' ? '₹ INR' : `${currentCurrency?.symbol || '₹'} ${currentCurrency?.code}`}
              </span>
            </button>

            {/* Theme Toggle (Always visible) */}
            <ThemeToggle />

            {/* User Profile Pill Menu (Hidden on mobile as MobileBottomNav handles it) */}
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-full border border-slate-300 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-900"
                aria-label="Main navigation menu"
                aria-expanded={userMenuOpen}
              >
                <Menu className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user ? (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  ) : (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {user ? (
                    <>
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Heart className="w-4 h-4 text-slate-500" />
                          <span>Wishlists</span>
                        </Link>

                        {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_OWNER') && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Shield className="w-4 h-4 text-slate-500" />
                            <span>Manage listings</span>
                          </Link>
                        )}

                        <Link
                          href="/admin/add-pg"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-500" />
                          <span>List your PG</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <Link
                          href="/contact-us"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-500" />
                          <span>Help Centre</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {AUTH_ENABLED && (
                        <div className="py-1">
                          <Link
                            href="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <UserPlus className="w-4 h-4 text-primary-500" />
                            <span>Sign up</span>
                          </Link>
                          <Link
                            href="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <LogIn className="w-4 h-4 text-slate-500" />
                            <span>Log in</span>
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-500" />
                          <span>List your PG</span>
                        </Link>
                        <Link
                          href="/contact-us"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-500" />
                          <span>Help Centre</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Currency Selection Modal */}
      <CurrencyModal />
    </header>
  );
}
