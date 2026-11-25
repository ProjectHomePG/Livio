'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Search, Sparkles } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';
import PGGrid from '@/components/Search/PGGrid';
import { usePreferences } from '@/context/PreferencesContext';

export default function FavoritesPage() {
  const { favoriteIds } = usePreferences();
  const [allFetchedPgs, setAllFetchedPgs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (authService.isAuthenticated()) {
        const data = await pgService.getFavorites();
        setAllFetchedPgs(data || []);
      } else {
        const localFavIds = Array.from(favoriteIds.size > 0 ? favoriteIds : new Set(JSON.parse(localStorage.getItem('livio_local_favs') || '[]')));
        if (localFavIds.length > 0) {
          const allPgs = await pgService.getAll();
          const matched = allPgs.filter((p) => localFavIds.includes(p.id));
          setAllFetchedPgs(matched);
        } else {
          setAllFetchedPgs([]);
        }
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load saved stays. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Filter in real-time according to current favoriteIds
  const displayedFavorites = useMemo(() => {
    if (favoriteIds.size === 0) return [];
    return allFetchedPgs.filter((p) => favoriteIds.has(p.id));
  }, [allFetchedPgs, favoriteIds]);

  return (
    <div className="w-full max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-8 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Wishlists
            </h1>
            {displayedFavorites.length > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950/50 text-primary-600 dark:text-rose-400">
                {displayedFavorites.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {displayedFavorites.length > 0
              ? `${displayedFavorites.length} saved stay${displayedFavorites.length !== 1 ? 's' : ''} ready to compare and enquire`
              : 'Save places you like to keep track of them here'}
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-black dark:hover:bg-slate-100 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          Browse Stays
        </Link>
      </div>

      {error && (
        <div className="my-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={loadFavorites} className="text-rose-500 hover:text-rose-700 font-bold">
            Retry
          </button>
        </div>
      )}

      <div className="pt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[20/19] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : displayedFavorites.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              As you search, tap the heart icon on any PG card to save your favorite rooms and compare them anytime.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-black dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Start exploring
            </Link>
          </div>
        ) : (
          <PGGrid pgs={displayedFavorites} />
        )}
      </div>
    </div>
  );
}
