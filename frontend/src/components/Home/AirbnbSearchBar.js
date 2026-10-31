"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  X,
  Minus,
  Plus,
  Navigation,
  Building2,
  GraduationCap,
  TrainFront,
  Sparkles,
  Loader2,
  ArrowRight,
  Star,
  Home,
} from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { pgService } from '@/services/pgService';
import { getCurrentCoords } from '@/utils/geolocation';

export const LOCATION_CATEGORIES = {
  cities: [
    { city: 'Bengaluru', label: 'Bengaluru', sub: 'Koramangala, HSR, Indiranagar', icon: Building2 },
    { city: 'Delhi', label: 'Delhi NCR', sub: 'North Campus, Gurgaon, Noida', icon: Building2 },
    { city: 'Mumbai', label: 'Mumbai', sub: 'Powai, Andheri, Bandra', icon: Building2 },
    { city: 'Pune', label: 'Pune', sub: 'Hinjewadi, Kharadi, Viman Nagar', icon: Building2 },
    { city: 'Hyderabad', label: 'Hyderabad', sub: 'HITEC City, Madhapur, Gachibowli', icon: Building2 },
    { city: 'Chennai', label: 'Chennai', sub: 'OMR, Guindy, Velachery', icon: Building2 },
  ],
  techparks: [
    { city: 'Manyata', label: 'Manyata Tech Park', sub: 'Nagawara, Bengaluru', icon: Building2 },
    { city: 'Whitefield', label: 'ITPL & Whitefield', sub: 'EPIP Zone, Bengaluru', icon: Building2 },
    { city: 'Gurugram', label: 'DLF Cyber City', sub: 'CyberHub MNCs, Gurugram', icon: Building2 },
    { city: 'Bellandur', label: 'RMZ Ecospace & Ecoworld', sub: 'Outer Ring Road, Bengaluru', icon: Building2 },
    { city: 'Hinjewadi', label: 'Hinjewadi IT Park', sub: 'Phase 1, 2, 3, Pune', icon: Building2 },
    { city: 'HITEC City', label: 'HITEC City & Mindspace', sub: 'Cyberabad, Hyderabad', icon: Building2 },
  ],
  colleges: [
    { city: 'Delhi', label: 'DU North Campus', sub: 'Kamla Nagar, GTB Nagar', icon: GraduationCap },
    { city: 'Koramangala', label: 'Christ University', sub: 'Koramangala & Hosur Rd', icon: GraduationCap },
    { city: 'Powai', label: 'IIT Bombay', sub: 'Powai Lake, Mumbai', icon: GraduationCap },
    { city: 'Delhi', label: 'IIT Delhi', sub: 'Hauz Khas, New Delhi', icon: GraduationCap },
    { city: 'Pune', label: 'Symbiosis International', sub: 'Viman Nagar, Pune', icon: GraduationCap },
  ],
  metro: [
    { city: 'Bengaluru', label: 'Purple Line Metro', sub: 'Whitefield to Challaghatta', icon: TrainFront },
    { city: 'Delhi', label: 'Yellow Line Metro', sub: 'Samaypur Badli to Millennium City', icon: TrainFront },
    { city: 'Noida', label: 'Blue Line Metro', sub: 'Dwarka to Noida Electronic City', icon: TrainFront },
  ],
};

export default function AirbnbSearchBar() {
  const router = useRouter();
  const {
    searchParams,
    setSearchParams,
    isSearchModalOpen,
    setIsSearchModalOpen,
    setUserCoords,
    formatPrice,
  } = usePreferences();

  const [activeTab, setActiveTab] = useState('where'); // 'where' | 'checkin' | 'checkout' | 'who'
  const [activeLocCategory, setActiveLocCategory] = useState('cities'); // 'cities' | 'techparks' | 'colleges' | 'metro'

  const [location, setLocation] = useState(searchParams?.location || '');
  const [checkIn, setCheckIn] = useState(searchParams?.checkIn || '');
  const [checkOut, setCheckOut] = useState(searchParams?.checkOut || '');
  const [sharingType, setSharingType] = useState(searchParams?.sharing || 'ALL');
  const [genderType, setGenderType] = useState(searchParams?.gender || 'ALL');
  const [guestCount, setGuestCount] = useState(searchParams?.guests || 1);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState({ pgs: [], locations: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);

  const containerRef = useRef(null);

  // Sync initial values from context
  useEffect(() => {
    if (searchParams) {
      if (searchParams.location !== undefined) setLocation(searchParams.location);
      if (searchParams.checkIn !== undefined) setCheckIn(searchParams.checkIn);
      if (searchParams.checkOut !== undefined) setCheckOut(searchParams.checkOut);
      if (searchParams.sharing !== undefined) setSharingType(searchParams.sharing);
      if (searchParams.gender !== undefined) setGenderType(searchParams.gender);
      if (searchParams.guests !== undefined) setGuestCount(searchParams.guests);
    }
  }, [searchParams]);

  // Close when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsSearchModalOpen(false);
      }
    }
    if (isSearchModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  // Debounced Auto-suggestion Fetching
  useEffect(() => {
    const q = (location || '').trim();
    if (!q || q.length < 2 || q === 'Near Me') {
      setSuggestions({ pgs: [], locations: [] });
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await pgService.getSuggestions(q, 6);

        // Also check static categories for instant local matches
        const lowerQ = q.toLowerCase();
        const allLandmarks = [
          ...LOCATION_CATEGORIES.cities.map((c) => ({ ...c, cat: 'City' })),
          ...LOCATION_CATEGORIES.techparks.map((t) => ({ ...t, cat: 'Tech Park' })),
          ...LOCATION_CATEGORIES.colleges.map((c) => ({ ...c, cat: 'College' })),
          ...LOCATION_CATEGORIES.metro.map((m) => ({ ...m, cat: 'Metro' })),
        ];

        const matchedLandmarks = allLandmarks.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQ) ||
            item.city.toLowerCase().includes(lowerQ) ||
            (item.sub && item.sub.toLowerCase().includes(lowerQ))
        );

        const mergedLocations = [...(results.locations || [])];
        matchedLandmarks.forEach((lm) => {
          const alreadyExists = mergedLocations.some(
            (l) => (l.label || l.name || '').toLowerCase() === lm.label.toLowerCase()
          );
          if (!alreadyExists) {
            mergedLocations.push({
              name: lm.city,
              label: lm.label,
              sub: lm.sub,
              type: lm.cat,
            });
          }
        });

        setSuggestions({
          pgs: results.pgs || [],
          locations: mergedLocations.slice(0, 5),
        });
      } catch (err) {
        console.warn('Auto-suggestion failed:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 220);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [location]);

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentCoords({ timeout: 8000 });
      setUserCoords(coords);
      setLocation('Near Me');
      setActiveTab('checkin');
    } catch (err) {
      alert(err?.message || 'Could not access your location. Please type your city instead.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSelectLocationSuggestion = (locName) => {
    setLocation(locName);
    setSuggestions({ pgs: [], locations: [] });
    setActiveTab('checkin');
  };

  const handleSelectPGSuggestion = (pg) => {
    setIsSearchModalOpen(false);
    if (pg.slug) {
      router.push(`/pg?slug=${encodeURIComponent(pg.slug)}`);
    } else {
      router.push(`/pg?id=${pg.id}`);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim() && location !== 'Near Me') params.set('query', location.trim());
    if (sharingType !== 'ALL') params.set('sharing', sharingType);
    if (genderType !== 'ALL') params.set('gender', genderType);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);

    setSearchParams((prev) => ({
      ...prev,
      location,
      checkIn,
      checkOut,
      sharing: sharingType,
      gender: genderType,
      guests: guestCount,
    }));

    setIsSearchModalOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setLocation('');
    setSuggestions({ pgs: [], locations: [] });
    setCheckIn('');
    setCheckOut('');
    setSharingType('ALL');
    setGenderType('ALL');
    setGuestCount(1);
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    setIsSearchModalOpen(true);
  };

  const getGenderBadge = (gender) => {
    const g = (gender || '').toUpperCase();
    if (g === 'MALE') return { label: 'Boys', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/40' };
    if (g === 'FEMALE') return { label: 'Girls', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' };
    return { label: 'Unisex', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/40' };
  };

  const isQueryMode = location.trim().length >= 2 && location.trim() !== 'Near Me';

  return (
    <div ref={containerRef} className="relative w-full flex justify-center">
      {/* 1. Desktop Search Pill: Isolated Interactive Segments */}
      <div className="hidden md:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-xs hover:shadow-md transition-shadow select-none">
        {/* Anywhere Segment */}
        <button
          type="button"
          onClick={() => openTab('where')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 font-semibold text-xs lg:text-sm transition-colors truncate max-w-[150px] cursor-pointer"
        >
          {location || 'Anywhere'}
        </button>

        {/* Divider */}
        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 flex-shrink-0" />

        {/* Any week / Move In Segment */}
        <button
          type="button"
          onClick={() => openTab('checkin')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 font-semibold text-xs lg:text-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          {checkIn ? `Move in: ${checkIn}` : 'Any week'}
        </button>

        {/* Divider */}
        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 flex-shrink-0" />

        {/* Add Guests / Who Segment */}
        <button
          type="button"
          onClick={() => openTab('who')}
          className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-normal text-xs lg:text-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          {guestCount > 1 ? `${guestCount} Guests` : 'Add guests'}
        </button>

        {/* Search Icon CTA */}
        <button
          type="button"
          onClick={handleSearch}
          title="Search verified stays"
          className="ml-1 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer flex-shrink-0"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Mobile Search Pill Button */}
      <button
        type="button"
        onClick={() => openTab('where')}
        className="flex md:hidden items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-1.5 sm:py-2 px-2.5 sm:px-3.5 shadow-xs hover:shadow-md transition-shadow cursor-pointer w-full max-w-full text-left"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {location || 'Where to?'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {checkIn ? `${checkIn} · ` : 'Anywhere · '}
            {guestCount > 1 ? `${guestCount} Guests` : 'Add guests'}
          </div>
        </div>
      </button>

      {/* 2. Interactive Search Overlay / Popover Modal */}
      {isSearchModalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsSearchModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
          />

          {/* Modal Container */}
          <div className="fixed inset-x-2 top-2 bottom-3 sm:bottom-auto md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:inset-x-auto md:w-[860px] max-h-[95vh] md:max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary-500">
                  Search Stays
                </span>
                <span className="text-xs text-slate-400 hidden xs:inline">· Livio (PG Near Me)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segment Controls: Isolated & Clean Transitions */}
            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
                {/* Where Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('where')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                    activeTab === 'where'
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Where
                  </label>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {location || 'Search location / PG'}
                  </div>
                </button>

                {/* Check In Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('checkin')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                    activeTab === 'checkin'
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Move In
                  </label>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {checkIn || 'Add date'}
                  </div>
                </button>

                {/* Duration Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('checkout')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                    activeTab === 'checkout'
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duration
                  </label>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {checkOut || 'Add duration'}
                  </div>
                </button>

                {/* Who Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('who')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                    activeTab === 'who'
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Who
                  </label>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {guestCount > 1 ? `${guestCount} Guests` : '1 Guest'} · {sharingType === 'ALL' ? 'Any' : sharingType}
                  </div>
                </button>
              </div>
            </div>

            {/* Active Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
              {/* 1. WHERE TAB CONTENT */}
              {activeTab === 'where' && (
                <div className="space-y-4 sm:space-y-5">
                  {/* Free-text input with live loading spinner */}
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                    {isLoadingSuggestions ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 animate-spin mr-2.5 sm:mr-3 flex-shrink-0" />
                    ) : (
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                    )}
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e);
                        }
                      }}
                      placeholder="Type PG name, city, locality, tech park, or college..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                      autoFocus
                    />
                    {location && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocation('');
                          setSuggestions({ pgs: [], locations: [] });
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* DYNAMIC AUTO-SUGGESTIONS VIEW (When typing >= 2 chars) */}
                  {isQueryMode ? (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      {/* Suggestion status header */}
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                        <span>
                          {isLoadingSuggestions
                            ? 'Searching verified stays & locations...'
                            : `Suggestions matching "${location}"`}
                        </span>
                        {!isLoadingSuggestions && (suggestions.pgs.length > 0 || suggestions.locations.length > 0) && (
                          <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400">
                            {suggestions.pgs.length + suggestions.locations.length} matches
                          </span>
                        )}
                      </div>

                      {/* No results fallback */}
                      {!isLoadingSuggestions && suggestions.pgs.length === 0 && suggestions.locations.length === 0 && (
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center text-slate-400">
                            <Search className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              No direct match found for &quot;{location}&quot;
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Try searching by city (e.g. Bengaluru, Pune), area (e.g. Koramangala), or click below to search all available stays.
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSearch}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span>Search all stays for &quot;{location}&quot;</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* 1. MATCHING LOCATIONS & HUBS */}
                      {suggestions.locations.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                            Locations & Hubs
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {suggestions.locations.map((loc, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectLocationSuggestion(loc.label || loc.name)}
                                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/40 dark:hover:bg-primary-950/20 text-left transition-all cursor-pointer group"
                              >
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 flex items-center justify-center text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                                    {loc.label || loc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {loc.sub || (loc.type === 'city' ? 'City' : 'Area / Hub')}
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-primary-500 flex-shrink-0">
                                  Select &rarr;
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. MATCHING PG STAYS (Title, Image, Starting Price) */}
                      {suggestions.pgs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                            Verified PG Stays
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {suggestions.pgs.map((pg) => {
                              const badge = getGenderBadge(pg.genderType);
                              const startingPrice = pg.priceTriple || pg.priceDouble || pg.priceSingle || pg.price || 8000;
                              const primaryImg =
                                pg.images?.find((img) => img.isPrimary)?.url ||
                                pg.images?.[0]?.url ||
                                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80';

                              return (
                                <div
                                  key={pg.id}
                                  onClick={() => handleSelectPGSuggestion(pg)}
                                  className="flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-500 hover:shadow-md hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                    <img
                                      src={primaryImg}
                                      alt={pg.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {pg.title}
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${badge.color}`}>
                                        {badge.label}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                      {pg.address ? `${pg.address}, ${pg.city}` : pg.city}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                        {formatPrice(startingPrice)}
                                        <span className="text-[9px] font-normal text-slate-400">/mo</span>
                                      </span>
                                      {pg.rating && (
                                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                                          <Star className="w-2.5 h-2.5 fill-current" />
                                          {Number(pg.rating).toFixed(1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pr-1 text-slate-300 group-hover:text-primary-500 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DEFAULT CATEGORIES VIEW (When input is empty or < 2 chars) */
                    <>
                      {/* Quick GPS "Near Me" Option */}
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={gpsLoading}
                        className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Navigation className={`w-4 h-4 sm:w-5 sm:h-5 ${gpsLoading ? 'animate-spin' : ''}`} />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300">
                              {gpsLoading ? 'Detecting your GPS location...' : 'Use my current location (Near Me)'}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-primary-600/70 dark:text-primary-400/70 line-clamp-1 sm:line-clamp-none">
                              Discover verified PG stays near you right now
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 hidden sm:inline">
                          Locate &rarr;
                        </span>
                      </button>

                      {/* Location Category Tabs */}
                      <div>
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 text-xs font-bold overflow-x-auto no-scrollbar">
                          {[
                            { id: 'cities', label: 'Top Cities' },
                            { id: 'techparks', label: 'Tech Parks & Hubs' },
                            { id: 'colleges', label: 'Colleges & Campuses' },
                            { id: 'metro', label: 'Metro Connected' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveLocCategory(cat.id)}
                              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
                                activeLocCategory === cat.id
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Locations Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                          {(LOCATION_CATEGORIES[activeLocCategory] || LOCATION_CATEGORIES.cities).map((item, idx) => {
                            const Icon = item.icon;
                            const isMatch = location.toLowerCase() === item.city.toLowerCase() || location.toLowerCase() === item.label.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setLocation(item.city);
                                  setActiveTab('checkin');
                                }}
                                className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                                  isMatch
                                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30'
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                              >
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary-500 transition-colors flex-shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {item.sub}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 2. CHECK IN TAB CONTENT */}
              {activeTab === 'checkin' && (
                <div className="space-y-4 sm:space-y-5 max-w-md mx-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">When do you want to move in?</h3>
                    <p className="text-xs text-slate-400">Pick an expected date or quick timeframe</p>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                      }}
                      className="w-full p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary-500"
                    />
                    {checkIn && (
                      <button
                        type="button"
                        onClick={() => setCheckIn('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {[
                      { label: 'Immediately', days: 0 },
                      { label: 'This Weekend', days: 3 },
                      { label: '1st of Month', days: 15 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + item.days);
                          setCheckIn(d.toISOString().split('T')[0]);
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CHECK OUT / DURATION TAB CONTENT */}
              {activeTab === 'checkout' && (
                <div className="space-y-4 sm:space-y-5 max-w-md mx-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">How long do you plan to stay?</h3>
                    <p className="text-xs text-slate-400">Flexible agreements or fixed term coliving</p>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                      }}
                      className="w-full p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary-500"
                    />
                    {checkOut && (
                      <button
                        type="button"
                        onClick={() => setCheckOut('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {[
                      { label: '1-3 Months', months: 2 },
                      { label: '6 Months', months: 6 },
                      { label: 'Long Stay (1 Yr+)', months: 12 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + item.months);
                          setCheckOut(d.toISOString().split('T')[0]);
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. WHO TAB CONTENT */}
              {activeTab === 'who' && (
                <div className="space-y-5 sm:space-y-6 max-w-lg mx-auto">
                  {/* Guest count */}
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Occupants</div>
                      <div className="text-[11px] sm:text-xs text-slate-400">Number of people moving in</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={guestCount <= 1}
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 1)}
                        className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sharing Type */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Room Configuration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      {[
                        { id: 'ALL', label: 'Any Room' },
                        { id: 'SINGLE', label: 'Private Room' },
                        { id: 'DOUBLE', label: '2 Sharing' },
                        { id: 'TRIPLE', label: '3+ Sharing' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSharingType(item.id)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-center text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            sharingType === item.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gender Policy */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Resident Gender Policy
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      {[
                        { id: 'ALL', label: 'All Stays' },
                        { id: 'MALE', label: 'Boys Only' },
                        { id: 'FEMALE', label: 'Girls Only' },
                        { id: 'UNISEX', label: 'Coliving / Unisex' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setGenderType(item.id)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-center text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            genderType === item.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 underline hover:text-black dark:hover:text-white cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary-500 to-rose-600 hover:from-primary-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Search Stays</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
