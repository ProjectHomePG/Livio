import React, { Suspense } from 'react';
import SearchPage from '@/components/Search/SearchPage';
import { Compass } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Search PG Accommodations Near You',
  description:
    'Filter PG rooms, hostels, and co-living spaces across India by locality, monthly budget, sharing type, and resident policy.',
  path: '/search',
  noIndex: true,
});

export default function SearchRoute() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
          <Compass className="w-10 h-10 text-primary-500 animate-spin mb-4" />
          <p className="text-sm font-semibold">Discovering stays...</p>
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
