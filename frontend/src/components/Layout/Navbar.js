"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LogIn, UserPlus, LogOut, Menu, X, PlusCircle, Shield, Heart } from 'lucide-react';
import authService from '../../services/authService';
import { AUTH_ENABLED } from '../../config';
import ThemeToggle from '../Shared/ThemeToggle';
import LogoMark from '../Shared/LogoMark';

/**
 * Navbar component for PG Near Me.
 * Provides sticky header navigation, role-based controls, theme toggle, and responsive layout.
 */
export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <LogoMark className="w-7 h-7" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-rose-500 bg-clip-text text-transparent">
                PG Near Me
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
              <Search className="w-5 h-5 mr-1" />
              Find PGs
            </Link>
            
            {user ? (
              <>
                <Link href="/favorites" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  <Heart className="w-5 h-5 mr-1" />
                  Favorites
                </Link>
                {user.role === 'ROLE_ADMIN' && (
                  <Link href="/admin" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                    <Shield className="w-5 h-5 mr-1" />
                    Admin Panel
                  </Link>
                )}
                {user.role === 'ROLE_OWNER' && (
                  <Link href="/admin" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-1" />
                    My Listings
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role.replace('ROLE_', '').toLowerCase()}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              AUTH_ENABLED && (
                <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                  <Link href="/login" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                    <LogIn className="w-5 h-5 mr-1" />
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium shadow-sm transition-all hover:shadow"
                  >
                    <UserPlus className="w-5 h-5 mr-1.5" />
                    Sign Up
                  </Link>
                </div>
              )
            )}

            {/* Theme Toggle */}
            <div className="border-l border-slate-200 dark:border-slate-700 pl-6">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 animate-in fade-in duration-200">
          <Link 
            href="/search" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Search className="w-6 h-6 mr-3 text-slate-500" />
            Find PGs
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Heart className="w-6 h-6 mr-3 text-slate-500" />
                Favorites
              </Link>
              {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_OWNER') && (
                <Link 
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Shield className="w-6 h-6 mr-3 text-slate-500" />
                  Dashboard ({user.role.replace('ROLE_', '')})
                </Link>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 px-3">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            AUTH_ENABLED && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 space-y-2">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <LogIn className="w-5 h-5 mr-2 text-slate-500" />
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold shadow-sm"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
