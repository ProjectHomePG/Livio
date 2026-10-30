'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Home, Search, Loader2, X } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';
import PGCard from '@/components/Search/PGCard';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pgService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadFavorites();
  }, [router]);

  const handleRemoveFavorite = async (pgId) => {
    try {
      await pgService.removeFavorite(pgId);
      setFavorites(favorites.filter(pg => pg.id !== pgId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (!authService.isAuthenticated()) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">HomePg</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/search" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Search PGs
                </Link>
                <Link href="/favorites" className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Favorites
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {favorites.length} saved
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Favorites</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {favorites.length > 0 
                ? `You have ${favorites.length} saved PG${favorites.length !== 1 ? 's' : ''}`
                : 'Start saving PGs you like by clicking the heart icon'
              }
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse PGs
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadFavorites} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 flex-grow">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No favorites yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              When you find a PG you like, click the heart icon to save it here for easy access later.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((pg) => (
              <div key={pg.id} className="relative">
                <PGCard pg={pg} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavorite(pg.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 backdrop-blur text-rose-500 hover:text-rose-600 transition-colors shadow-sm"
                  aria-label="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
            © 2024 HomePg. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}