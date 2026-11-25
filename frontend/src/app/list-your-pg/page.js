import ListYourPgClient from '@/components/ListPg/ListYourPgClient';
import { buildBreadcrumbJsonLd, buildPageMetadata, safeJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'List Your PG Property Free — Partner With Livio',
  description:
    'List your paying guest, hostel, or co-living property on Livio (PG Near Me). Reach students and working professionals across 14 Indian cities with zero brokerage.',
  path: '/list-your-pg',
  keywords: [
    'list your PG',
    'post PG property free',
    'PG owner listing',
    'hostel owner registration',
    'Livio PG partner',
  ],
});

export default function ListYourPgPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'List Your PG', path: '/list-your-pg' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <ListYourPgClient />
    </>
  );
}
