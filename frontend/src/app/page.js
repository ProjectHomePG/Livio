"use client";

import React, { useEffect, useMemo, useState } from 'react';
import pgService from '../services/pgService';
import CategoryBar from '../components/Home/CategoryBar';
import LocationOptionsBar from '../components/Home/LocationOptionsBar';
import IconsHero from '../components/Home/IconsHero';
import PGGrid from '../components/Search/PGGrid';
import FilterModal from '../components/Home/FilterModal';
import MapView from '../components/Search/MapView';
import InspirationFooter from '../components/Home/InspirationFooter';
import { usePreferences } from '../context/PreferencesContext';
import { MapPin, X, Navigation } from 'lucide-react';
import { getCurrentCoords } from '../utils/geolocation';

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomePage() {
  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    activeNavTab,
    selectedLocation,
    setSelectedLocation,
    userCoords,
    setUserCoords,
    isMapView,
    setIsMapView,
  } = usePreferences();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState(null);
  const [locating, setLocating] = useState(false);

  const hasNearMeCoords =
    selectedLocation !== 'near_me' ||
    (userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lng === 'number');

  // Load all PGs from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const data = await pgService.getAll();
        setPgs(data || []);
      } catch (err) {
        console.error('Failed to load PGs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle location option selection
  const handleSelectLocation = (locId, coords) => {
    setSelectedLocation(locId);
    if (coords) {
      setUserCoords(coords);
    }
  };

  // Re-request GPS when near-me is active but coords are missing
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

  // Filter listings based on location, active category & filter modal settings
  const filteredPgs = useMemo(() => {
    let result = [...pgs];

    // 1. Location Filter
    if (selectedLocation === 'near_me') {
      if (userCoords && typeof userCoords.lat === 'number') {
        result = result
          .filter((pg) => typeof pg.latitude === 'number' && typeof pg.longitude === 'number')
          .map((pg) => ({
            ...pg,
            distance: distanceKm(userCoords.lat, userCoords.lng, pg.latitude, pg.longitude),
          }))
          .sort((a, b) => a.distance - b.distance);
      } else {
        // No GPS coords yet — show the enable-location prompt instead of unsorted listings
        result = [];
      }
    } else if (selectedLocation && selectedLocation !== 'all') {
      const query = selectedLocation.toLowerCase();
      result = result.filter((pg) => {
        const city = (pg.city || '').toLowerCase();
        const addr = (pg.address || '').toLowerCase();
        const title = (pg.title || '').toLowerCase();
        return city.includes(query) || addr.includes(query) || title.includes(query);
      });
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((pg) => {
        const desc = (pg.description || '').toLowerCase();
        const title = (pg.title || '').toLowerCase();
        const addr = (pg.address || '').toLowerCase();
        const price = pg.priceTriple || pg.priceDouble || pg.priceSingle || pg.price || 0;

        switch (selectedCategory) {
          case 'icons':
            return (pg.rating ?? 0) >= 4.8 || price > 13000;
          case 'single':
            return (
              pg.sharingType === 'SINGLE' ||
              (pg.priceSingle && pg.priceSingle > 0) ||
              desc.includes('single')
            );
          case 'shared':
            return (
              pg.sharingType === 'DOUBLE' ||
              pg.sharingType === 'TRIPLE' ||
              desc.includes('sharing')
            );
          case 'metro':
            return (
              desc.includes('metro') ||
              title.includes('metro') ||
              addr.includes('metro')
            );
          case 'techpark':
            return (
              desc.includes('tech') ||
              desc.includes('park') ||
              desc.includes('itpl') ||
              title.includes('tech') ||
              addr.includes('tech')
            );
          case 'luxury':
            return price >= 14000 || (pg.rating ?? 0) >= 4.85;
          case 'food':
            return (
              desc.includes('food') ||
              desc.includes('meal') ||
              desc.includes('breakfast') ||
              desc.includes('mess')
            );
          case 'ac':
            return desc.includes('ac') || desc.includes('air condition');
          case 'female':
            return pg.genderType === 'FEMALE';
          case 'male':
            return pg.genderType === 'MALE';
          case 'coliving':
            return pg.genderType === 'UNISEX' || desc.includes('coliving');
          case 'budget':
            return price <= 9000;
          case 'top_rated':
            return (pg.rating ?? 0) >= 4.6;
          case 'students':
            return (
              desc.includes('student') ||
              desc.includes('college') ||
              desc.includes('campus')
            );
          default:
            return true;
        }
      });
    }

    // 3. Modal Filters
    if (activeFilters) {
      if (activeFilters.placeType && activeFilters.placeType !== 'ALL') {
        result = result.filter((pg) => pg.sharingType === activeFilters.placeType);
      }
      if (activeFilters.gender && activeFilters.gender !== 'ALL') {
        result = result.filter((pg) => pg.genderType === activeFilters.gender);
      }
      if (activeFilters.minPrice) {
        const min = Number(activeFilters.minPrice);
        result = result.filter(
          (pg) => (pg.priceTriple || pg.priceDouble || pg.price || 0) >= min
        );
      }
      if (activeFilters.maxPrice) {
        const max = Number(activeFilters.maxPrice);
        result = result.filter(
          (pg) => (pg.priceTriple || pg.priceDouble || pg.price || 0) <= max
        );
      }
    }

    return result;
  }, [pgs, selectedLocation, userCoords, selectedCategory, activeFilters]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors">
      {/* 1. Sticky Category & Convenient Locations Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />
        <LocationOptionsBar
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-[2520px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20 pt-3 sm:pt-4 pb-24 md:pb-16">
        {/* Active Location Filter Banner (if filtering by specific location) */}
        {selectedLocation && selectedLocation !== 'all' && (
          <div className="mb-4 flex items-center justify-between p-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              {selectedLocation === 'near_me' ? (
                <>
                  <Navigation className="w-4 h-4 text-primary-500 animate-pulse" />
                  <span>
                    {hasNearMeCoords
                      ? 'Stays sorted by closest distance to your live location'
                      : 'Enable location to sort stays by distance'}
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>Showing stays in {selectedLocation} ({filteredPgs.length} available)</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedLocation('all')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              <span>View all</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Summer 2024 Airbnb Icons Showcase */}
        {(selectedCategory === 'all' || selectedCategory === 'icons' || activeNavTab === 'experiences') && selectedLocation === 'all' && (
          <IconsHero />
        )}

        {/* Content View: Clean Grid or Interactive Map */}
        {isMapView ? (
          <div className="py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {filteredPgs.length} stays on interactive map
              </div>
              <button
                type="button"
                onClick={() => setIsMapView(false)}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Switch to list view
              </button>
            </div>
            <MapView pgs={filteredPgs} height="h-[75vh]" />
          </div>
        ) : (
          <div className="pt-2">
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
            ) : filteredPgs.length > 0 ? (
              <PGGrid pgs={filteredPgs} />
            ) : selectedLocation === 'near_me' && !hasNearMeCoords ? (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-primary-500">
                  <Navigation className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  See stays near you
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow location access and we&apos;ll list the closest PGs first, with walking distances.
                </p>
                <button
                  type="button"
                  onClick={handleEnableLocation}
                  disabled={locating}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  {locating ? 'Locating...' : 'Enable location'}
                </button>
              </div>
            ) : (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No stays found in {selectedLocation}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try switching to another nearby locality or exploring All India.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('all');
                    setSelectedCategory('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                >
                  Clear location filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => setActiveFilters(filters)}
        totalCount={filteredPgs.length}
      />

      {/* 3. Inspiration Pre-Footer */}
      <InspirationFooter />
    </div>
  );
}
