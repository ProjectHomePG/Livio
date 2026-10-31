"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Building2,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { getCurrentCoords } from '@/utils/geolocation';

export const LOCATION_OPTIONS = [
  { id: 'near_me', label: 'Near Me', sub: 'Live GPS', icon: Navigation, isGps: true },
  { id: 'all', label: 'All India', sub: 'All stays', icon: Compass },
  { id: 'Bengaluru', label: 'Bengaluru', sub: 'Silicon Valley', icon: Building2 },
  { id: 'Koramangala', label: 'Koramangala', sub: 'Startups & Cafes', icon: Sparkles },
  { id: 'HSR Layout', label: 'HSR Layout', sub: 'Tech & Coliving', icon: Building2 },
  { id: 'Whitefield', label: 'Whitefield', sub: 'ITPL Tech Park', icon: Building2 },
  { id: 'Indiranagar', label: 'Indiranagar', sub: 'Metro & 100ft Rd', icon: MapPin },
  { id: 'Electronic City', label: 'Electronic City', sub: 'Phase 1 & 2', icon: Building2 },
  { id: 'Bellandur', label: 'Bellandur', sub: 'RMZ Ecospace', icon: Building2 },
  { id: 'Delhi', label: 'Delhi NCR', sub: 'North & South', icon: Building2 },
  { id: 'Gurugram', label: 'Cyber City', sub: 'Gurugram MNCs', icon: Building2 },
  { id: 'Noida', label: 'Noida', sub: 'Sector 62 & Metro', icon: Building2 },
  { id: 'Mumbai', label: 'Mumbai', sub: 'Powai & Andheri', icon: Building2 },
  { id: 'Powai', label: 'Powai Lake', sub: 'IIT Bombay hub', icon: MapPin },
  { id: 'Pune', label: 'Pune', sub: 'IT & Student hub', icon: Building2 },
  { id: 'Hinjewadi', label: 'Hinjewadi', sub: 'Phase 1-3 Park', icon: Building2 },
  { id: 'Hyderabad', label: 'Hyderabad', sub: 'HITEC & Madhapur', icon: Building2 },
  { id: 'Chennai', label: 'Chennai', sub: 'OMR Corridor', icon: Building2 },
];

export default function LocationOptionsBar({ selectedLocation = 'all', onSelectLocation }) {
  const { userCoords, setUserCoords } = usePreferences();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -280 : 280;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const handleSelect = async (option) => {
    if (option.isGps) {
      setGpsLoading(true);
      setGpsError(null);
      try {
        const coords = await getCurrentCoords();
        setUserCoords(coords);
        onSelectLocation?.('near_me', coords);
      } catch (err) {
        setGpsError(err?.message || 'Location permission denied or unavailable.');
        onSelectLocation?.('all');
      } finally {
        setGpsLoading(false);
      }
      return;
    }

    onSelectLocation?.(option.id);
  };

  return (
    <div className="w-full bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 py-2 backdrop-blur-sm transition-colors">
      <div className="max-w-[2520px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20">
        <div className="relative flex items-center">
          {/* Desktop Left Chevron (hidden on mobile to prevent blocking touch gestures) */}
          {canScrollLeft && (
            <div className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center pr-6 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:scale-105 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Strip */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-0.5 w-full"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 pr-1.5 flex-shrink-0 select-none">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              <span className="hidden sm:inline">Locations:</span>
            </div>

            {LOCATION_OPTIONS.map((loc) => {
              const Icon = loc.icon;
              const isSelected = selectedLocation === loc.id;
              const isGpsLoc = loc.isGps;

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer flex-shrink-0 border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isGpsLoc
                        ? isSelected
                          ? 'text-white dark:text-slate-900 animate-pulse'
                          : 'text-primary-500'
                        : isSelected
                        ? 'text-white dark:text-slate-900'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {isGpsLoc && gpsLoading ? 'Locating...' : loc.label}
                  </span>
                  {loc.sub && !isSelected && (
                    <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">
                      · {loc.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Right Chevron (hidden on mobile to prevent blocking touch gestures) */}
          {canScrollRight && (
            <div className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center pl-6 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent">
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:scale-105 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {gpsError && (
          <div className="text-[11px] text-rose-500 font-medium pt-1 px-1">
            {gpsError}
          </div>
        )}
      </div>
    </div>
  );
}
