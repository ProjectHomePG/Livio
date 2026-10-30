"use client";

import React from 'react';
import PGCard from './PGCard';
import EmptyState from '../Shared/EmptyState';

export default function PGGrid({ pgs = [] }) {
  if (pgs.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <EmptyState message="No properties found matching your selection. Try clearing filters or choosing another category." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
      {pgs.map((pg) => (
        <PGCard key={pg.id} pg={pg} />
      ))}
    </div>
  );
}
