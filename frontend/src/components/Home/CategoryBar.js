"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  BedSingle,
  Users,
  TrainFront,
  Building2,
  Crown,
  Utensils,
  Snowflake,
  HeartHandshake,
  Shield,
  Home,
  Tag,
  Star,
  GraduationCap,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

export const CATEGORIES = [
  { id: 'all', label: 'All Stays', icon: Home },
  { id: 'icons', label: 'Icons', icon: Sparkles, badge: 'New' },
  { id: 'single', label: 'Private Rooms', icon: BedSingle },
  { id: 'shared', label: 'Sharing', icon: Users },
  { id: 'metro', label: 'Near Metro', icon: TrainFront },
  { id: 'techpark', label: 'Tech Parks', icon: Building2 },
  { id: 'luxury', label: 'Luxe', icon: Crown },
  { id: 'food', label: 'Food Included', icon: Utensils },
  { id: 'ac', label: 'AC Rooms', icon: Snowflake },
  { id: 'female', label: 'Girls PG', icon: HeartHandshake },
  { id: 'male', label: 'Boys PG', icon: Shield },
  { id: 'coliving', label: 'Coliving', icon: Users },
  { id: 'budget', label: 'Budget Stays', icon: Tag },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'students', label: 'Student Hubs', icon: GraduationCap },
];

export default function CategoryBar({ selectedCategory = 'all', onSelectCategory }) {
  const {
    showTotalBeforeTax,
    toggleShowTotalBeforeTax,
    setIsFilterModalOpen,
  } = usePreferences();

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[2520px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3">
          {/* Categories Carousel */}
          <div className="relative flex-1 min-w-0">
            {/* Desktop Left Chevron (hidden on mobile) */}
            {canScrollLeft && (
              <div className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center pr-8 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:scale-110 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-transform cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable strip */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-1"
            >
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory?.(cat.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 pb-2 border-b-2 transition-all cursor-pointer flex-shrink-0 group relative ${
                      isSelected
                        ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="relative">
                      <IconComponent
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-105 ${
                          isSelected ? 'stroke-[2.2]' : 'stroke-[1.6]'
                        }`}
                      />
                      {cat.badge && (
                        <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold uppercase bg-rose-500 text-white px-1.5 py-0.2 rounded-full scale-90">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs whitespace-nowrap tracking-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Right Chevron (hidden on mobile) */}
            {canScrollRight && (
              <div className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center pl-8 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent">
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:scale-110 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-transform cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-1 sm:pl-2">
            {/* Mobile / Desktop Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-800 dark:hover:border-white text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Total Before Taxes Switch (Desktop only) */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
              <span className="select-none text-[11px] xl:text-xs">Display total before taxes</span>
              <button
                type="button"
                onClick={toggleShowTotalBeforeTax}
                role="switch"
                aria-checked={showTotalBeforeTax}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showTotalBeforeTax
                    ? 'bg-slate-900 dark:bg-primary-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showTotalBeforeTax ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
