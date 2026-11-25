"use client";

import React, { useEffect, useState } from 'react';
import PGCard from './PGCard';
import EmptyState from '../Shared/EmptyState';

export default function PGGrid({ pgs = [], pageSize = 24 }) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pgs, pageSize]);

  if (pgs.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <EmptyState message="No properties found matching your selection. Try clearing filters or choosing another category." />
      </div>
    );
  }

  const visiblePgs = pgs.slice(0, visibleCount);
  const remaining = pgs.length - visiblePgs.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
        {visiblePgs.map((pg, idx) => (
          <PGCard key={pg.id} pg={pg} priority={idx < 4} />
        ))}
      </div>

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
            className="px-7 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Show more stays ({Math.min(pageSize, remaining)} more · {remaining} remaining)
          </button>
          <span className="text-[11px] text-slate-400">
            Showing {visiblePgs.length} of {pgs.length} stays
          </span>
        </div>
      )}
    </div>
  );
}
