"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, MapPin, X, Navigation } from 'lucide-react';
import pgService from '@/services/pgService';
import CategoryBar from '../Home/CategoryBar';
import LocationOptionsBar from '../Home/LocationOptionsBar';
import PGGrid from './PGGrid';
import FilterModal from '../Home/FilterModal';
import MapView from './MapView';
import LoadingSkeleton from '../Shared/LoadingSkeleton';
import { usePreferences } from '@/context/PreferencesContext';
import { getCurrentCoords } from '@/utils/geolocation';

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const sharingParam = searchParams.get('sharing') || 'ALL';
  const genderParam = searchParams.get('gender') || 'ALL';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    userCoords,
    setUserCoords,
    isMapView,
    setIsMapView,
  } = usePreferences();

  const [filters, setFilters] = useState({
    query: queryParam,
    sharing: sharingParam,
    gender: genderParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNearMeMode, setIsNearMeMode] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasNearMeCoords =
    !isNearMeMode ||
    (userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lng === 'number');

  // Sync from URL params
  useEffect(() => {
    setFilters({
      query: queryParam,
      sharing: sharingParam,
      gender: genderParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
    });
    if (queryParam) {
      setIsNearMeMode(false);
    }
  }, [queryParam, sharingParam, genderParam, minPriceParam, maxPriceParam]);

  const performSearch = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pgService.search(currentFilters.query || '', currentFilters);
      let list = data || [];
      if (isNearMeMode) {
        if (userCoords && typeof userCoords.lat === 'number') {
          list = list
            .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
            .map((p) => ({
              ...p,
              distance: distanceKm(userCoords.lat, userCoords.lng, p.latitude, p.longitude),
            }))
            .sort((a, b) => a.distance - b.distance);
        } else {
          // Near-me mode without GPS coords — wait for location instead of showing unsorted results
          list = [];
        }
      }
      setResults(list);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [isNearMeMode, userCoords]);

  useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);

  const handleSelectLocation = (locId, coords) => {
    if (locId === 'all') {
      setIsNearMeMode(false);
      const updated = { ...filters, query: '' };
      setFilters(updated);
      router.push('/search');
    } else if (locId === 'near_me') {
      setIsNearMeMode(true);
      if (coords) setUserCoords(coords);
      const updated = { ...filters, query: '' };
      setFilters(updated);
    } else {
      setIsNearMeMode(false);
      const updated = { ...filters, query: locId };
      setFilters(updated);
      router.push(`/search?query=${encodeURIComponent(locId)}`);
    }
  };

  const handleEnableLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      setUserCoords(coords);
    } catch {
      // stays on the prompt so the user can retry
    } finally {
      setLocating(false);
    }
  };

  const handleApplyModalFilters = (modalFilters) => {
    const updated = {
      ...filters,
      sharing: modalFilters.placeType || 'ALL',
      gender: modalFilters.gender || 'ALL',
      minPrice: modalFilters.minPrice || '',
      maxPrice: modalFilters.maxPrice || '',
    };
    setFilters(updated);
    performSearch(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors">
      {/* Sticky Category & Convenient Locations Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />
        <LocationOptionsBar
          selectedLocation={isNearMeMode ? 'near_me' : (filters.query || 'all')}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-[2520px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20 pt-4 sm:pt-6 pb-24 md:pb-16">
        {/* Subheader info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isNearMeMode ? (
                <>
                  <Navigation className="w-5 h-5 text-primary-500 animate-pulse" />
                  Stays Near Your Location
                </>
              ) : filters.query ? (
                <>
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Stays in {filters.query}
                </>
              ) : (
                'All Verified Stays & Coliving Homes'
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Found {results.length} verified stays ready for move-in
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(filters.query || isNearMeMode) && (
              <button
                type="button"
                onClick={() => handleSelectLocation('all')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Clear location</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-white text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Content View: Grid or Map */}
        {isMapView ? (
          <div className="py-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {results.length} stays on interactive map
              </div>
              <button
                type="button"
                onClick={() => setIsMapView(false)}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Switch to list view
              </button>
            </div>
            <MapView pgs={results} height="h-[75vh]" />
          </div>
        ) : (
          <div className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[20/19] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : isNearMeMode && !hasNearMeCoords ? (
              <div className="text-center py-24 max-w-md mx-auto">
                <Navigation className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  See stays near you
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Allow location access and we&apos;ll list the closest PGs first, with distances.
                </p>
                <button
                  type="button"
                  onClick={handleEnableLocation}
                  disabled={locating}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  {locating ? 'Locating...' : 'Enable location'}
                </button>
              </div>
            ) : results.length > 0 ? (
              <PGGrid pgs={results} />
            ) : (
              <div className="text-center py-24 max-w-md mx-auto">
                <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Try changing your location, expanding your price range, or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectLocation('all');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyModalFilters}
        totalCount={results.length}
      />
    </div>
  );
}
