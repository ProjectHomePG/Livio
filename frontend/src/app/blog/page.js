import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Home, ChevronRight } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blogData';
import { buildBreadcrumbJsonLd, buildPageMetadata, safeJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'PG & Co-Living Guides, Rent Reports & Student Tips',
  description:
    'Practical guides on finding affordable PGs in India, comparing PG vs hostel vs coliving, city rent insights, girls PG safety checklists, and move-in tips.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white" aria-current="page">
            Blog &amp; Guides
          </span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 sm:p-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            <BookOpen className="w-4 h-4" />
            Livio Accommodation Guides
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            PG Living, Rent Guides &amp; Checklists for India
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Research city rental ranges, compare PG vs. hostel vs. co-living, and review practical
            safety and booking checklists before choosing your next stay.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:border-primary-500 transition-colors shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-primary-600 dark:text-primary-400">{post.category}</span>
                <span className="text-slate-400 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
                  {post.title}
                </Link>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <time dateTime={post.updatedAt} className="text-[11px] text-slate-400">
                Updated {post.updatedAt}
              </time>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Read guide
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
