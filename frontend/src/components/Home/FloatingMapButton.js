"use client";

import React from 'react';
import { Map, List } from 'lucide-react';

export default function FloatingMapButton({ isMapView, onToggle }) {
  return (
    <div className="fixed bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <button
        type="button"
        onClick={onToggle}
        className="pointer-events-auto flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 select-none"
      >
        <span>{isMapView ? 'Show list' : 'Show map'}</span>
        {isMapView ? (
          <List className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <Map className="w-4 h-4 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
}

