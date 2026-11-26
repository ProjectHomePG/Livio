import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Home, ChevronRight, ArrowLeft } from 'lucide-react';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blogData';
import { buildBreadcrumbJsonLd, buildPageMetadata, canonicalUrl, safeJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo';

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: 'article',
  });
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl(`/blog/${post.slug}`),
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <span key={item.path} className="inline-flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {isLast ? (
                <span className="text-slate-900 dark:text-white truncate max-w-[260px] sm:max-w-none" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-primary-600 inline-flex items-center gap-1">
                  {idx === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <article className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-7 sm:p-10 space-y-8 shadow-sm">
        <header className="space-y-3 border-b border-slate-100 dark:border-slate-700 pb-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <span className="text-primary-600 dark:text-primary-400">{post.category}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-slate-400">·</span>
            <time dateTime={post.updatedAt} className="text-slate-400">
              Updated {post.updatedAt}
            </time>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.description}
          </p>
        </header>

        <div className="space-y-6">
          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {post.relatedLinks?.length > 0 && (
          <footer className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Explore Related Stays
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {post.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </footer>
        )}
      </article>

      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all PG guides
        </Link>
      </div>
    </div>
  );
}
