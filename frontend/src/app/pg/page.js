import { notFound, permanentRedirect } from 'next/navigation';
import { getPgSlugById } from '@/lib/pgServer';

export default async function LegacyPgRedirectPage({ searchParams }) {
  const params = await searchParams;
  const slug = params?.slug;
  const id = params?.id;

  if (slug && typeof slug === 'string') {
    permanentRedirect(`/property/${encodeURIComponent(slug)}`);
  }

  if (id && typeof id === 'string') {
    const resolvedSlug = await getPgSlugById(id);
    if (resolvedSlug) {
      permanentRedirect(`/property/${encodeURIComponent(resolvedSlug)}`);
    }
    notFound();
  }

  permanentRedirect('/pg-in-india');
}
