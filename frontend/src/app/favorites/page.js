'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, X } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';
import PGGrid from '@/components/Search/PGGrid';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (authService.isAuthenticated()) {
        const data = await pgService.getFavorites();
        setFavorites(data || []);
      } else {
        const localFavIds = JSON.parse(localStorage.getItem('livio_local_favs') || '[]');
        if (localFavIds.length > 0) {
          const allPgs = await pgService.getAll();
          const matched = allPgs.filter((p) => localFavIds.includes(p.id));
          setFavorites(matched);
        } else {
          setFavorites([]);
        }
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="w-full max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-8 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Wishlists</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {favorites.length > 0
              ? `${favorites.length} saved stay${favorites.length !== 1 ? 's' : ''}`
              : 'Save places you like to keep track of them here'}
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-black transition-colors self-start sm:self-auto"
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
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Create your first wishlist
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              As you search, tap the heart icon to save your favorite stays and rooms to a wishlist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-black transition-colors"
            >
              Start exploring
            </Link>
          </div>
        ) : (
          <PGGrid pgs={favorites} />
        )}
      </div>
    </div>
  );
}
