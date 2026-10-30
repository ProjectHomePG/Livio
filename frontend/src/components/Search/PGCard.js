"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';
import { usePreferences } from '@/context/PreferencesContext';

// Curated high quality interior & architectural fallback photos
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
];

export default function PGCard({ pg }) {
  const router = useRouter();
  const { formatPrice, showTotalBeforeTax } = usePreferences();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Extract all images
  const images = React.useMemo(() => {
    if (pg.images && pg.images.length > 0) {
      const urls = pg.images.map((img) => img.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    return FALLBACK_IMAGES;
  }, [pg.images]);

  // Check initial favorite status
  useEffect(() => {
    let isMounted = true;
    async function checkFav() {
      if (authService.isAuthenticated()) {
        try {
          const status = await pgService.checkFavoriteStatus(pg.id);
          if (isMounted) setIsFavorite(status);
        } catch (e) {}
      } else {
        try {
          const localFavs = JSON.parse(localStorage.getItem('livio_local_favs') || '[]');
          if (isMounted) setIsFavorite(localFavs.includes(pg.id));
        } catch (e) {}
      }
    }
    checkFav();
    return () => {
      isMounted = false;
    };
  }, [pg.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      if (authService.isAuthenticated()) {
        if (nextState) {
          await pgService.addFavorite(pg.id);
        } else {
          await pgService.removeFavorite(pg.id);
        }
      } else {
        const localFavs = JSON.parse(localStorage.getItem('livio_local_favs') || '[]');
        let updated;
        if (nextState) {
          updated = Array.from(new Set([...localFavs, pg.id]));
        } else {
          updated = localFavs.filter((id) => id !== pg.id);
        }
        localStorage.setItem('livio_local_favs', JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const basePrice = pg.priceTriple || pg.priceDouble || pg.priceSingle || pg.price || 9500;
  const isGuestFavourite = (pg.rating ?? 0) >= 4.7;

  return (
    <div className="group relative flex flex-col cursor-pointer select-none">
      {/* 1. Image Container / Carousel */}
      <div className="relative aspect-[20/19] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-300">
        <Link href={`/pg?slug=${pg.slug}`} className="block w-full h-full">
          <img
            src={images[currentImageIndex] || FALLBACK_IMAGES[0]}
            alt={pg.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 z-10 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
              isFavorite
                ? 'fill-[#FF385C] text-[#FF385C]'
                : 'fill-black/20 text-white hover:text-white/90'
            } ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}
            strokeWidth={1.8}
          />
        </button>

        {/* "Guest favourite" Pill */}
        {isGuestFavourite && (
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-[11px] font-bold shadow-md backdrop-blur">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Guest favourite</span>
          </div>
        )}

        {/* Left / Right Chevron Arrows (Appear on card hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer z-10"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer z-10"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            {/* Dots Pagination */}
            <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    currentImageIndex % 5 === idx
                      ? 'w-4 bg-white shadow-sm'
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Text Details below Image */}
      <Link href={`/pg?slug=${pg.slug}`} className="mt-3 block focus:outline-none">
        {/* Line 1: Title / Locality & Rating */}
        <div className="flex items-center justify-between text-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2 group-hover:text-primary-600 transition-colors">
            {pg.title || `${pg.city || 'Bangalore'} Stay`}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 text-slate-900 dark:text-white font-medium text-xs sm:text-sm">
            <Star className="w-3.5 h-3.5 fill-current text-slate-900 dark:text-white" />
            <span>{(pg.rating ?? 4.8).toFixed(2)}</span>
          </div>
        </div>

        {/* Line 2: Distance / Landmark / City */}
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
          {typeof pg.distance === 'number' ? (
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              📍 {pg.distance < 1 ? `${Math.round(pg.distance * 1000)} m` : `${pg.distance.toFixed(1)} km`} away · {pg.city}
            </span>
          ) : pg.address ? (
            `${pg.address}, ${pg.city}`
          ) : (
            `${pg.city || 'Bengaluru'} · Near Tech Park`
          )}
        </div>

        {/* Line 3: Sharing type / Amenities */}
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
          {pg.sharingType ? `${pg.sharingType} Sharing` : 'Single & Double Sharing'} · {pg.genderType || 'Coliving'}
        </div>

        {/* Line 4: Price */}
        <div className="mt-1.5 flex items-baseline gap-1 text-sm">
          <span className="font-extrabold text-slate-900 dark:text-white text-base">
            {formatPrice(basePrice)}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">
            {showTotalBeforeTax ? 'total before taxes' : 'month'}
          </span>
        </div>
      </Link>
    </div>
  );
}
