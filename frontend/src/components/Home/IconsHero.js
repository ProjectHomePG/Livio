"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const ICON_EXPERIENCES = [
  {
    id: 'beetlejuice',
    title: 'Haunt the Beetlejuice house',
    host: 'Hosted by Delia Deetz',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Sold out',
    tag: 'Icons',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    price: 'Rs 0 per guest',
    slug: 'beetlejuice-house',
  },
  {
    id: 'doja-cat',
    title: 'Join the Living Room Session with Doja',
    host: 'Hosted by Doja Cat',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    status: 'Sold out',
    tag: 'Icons',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    price: 'Rs 0 per guest',
    slug: 'doja-cat-living-room',
  },
  {
    id: 'purple-rain',
    title: "Stay in Prince's Purple Rain house",
    host: 'Hosted by Wendy and Lisa',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Coming in Nov',
    tag: 'Icons',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    price: 'Rs 0 per guest',
    slug: 'purple-rain-house',
  },
  {
    id: 'x-mansion',
    title: 'Train at the X-Mansion',
    host: 'Hosted by Jubilee',
    hostAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    status: 'Sold out',
    tag: 'Icons',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    price: 'Rs 0 per guest',
    slug: 'x-mansion-stay',
  },
  {
    id: 'up-house',
    title: 'Drift off in the Up house',
    host: 'Hosted by Carl Fredricksen',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'Sold out',
    tag: 'Icons',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    price: 'Rs 0 per guest',
    slug: 'up-house-experience',
  },
];

export default function IconsHero() {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className="relative w-full pt-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            <Sparkles className="w-3.5 h-3.5" />
            Livio Icons
          </span>
          <span className="text-xs text-slate-400">· Extraordinary stays & experiences</span>
        </div>

        {/* Carousel arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Strip */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x pb-2"
      >
        {ICON_EXPERIENCES.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[84vw] max-w-[320px] sm:max-w-none sm:w-[400px] md:w-[440px] lg:w-[460px] group cursor-pointer"
          >
            {/* Image Box */}
            <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 shadow-md group-hover:shadow-xl transition-all duration-300">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur shadow-sm">
                  {item.status}
                </span>
              </div>

              {/* Bottom Content inside Image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={item.hostAvatar}
                    alt={item.host}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <span className="text-xs font-medium text-slate-200 drop-shadow">
                    {item.host}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug drop-shadow line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Info below image */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900 dark:text-white">
                {item.price}
              </span>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">
                Explore stay &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
