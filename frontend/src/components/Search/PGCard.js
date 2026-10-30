import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Heart, ChevronRight, ShieldCheck } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';

/**
 * Premium PGCard component.
 * Renders individual list items with striking imagery, glassmorphism badges, and smooth hover effects.
 */
export default function PGCard({ pg }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine gender badge styles - Premium gradients
  const getGenderBadge = (gender) => {
    switch (gender) {
      case 'MALE':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30';
      case 'FEMALE':
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/30';
      default:
        return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-purple-500/30';
    }
  };

  const checkFavoriteStatus = async () => {
    if (authService.isAuthenticated()) {
      try {
        const status = await pgService.checkFavoriteStatus(pg.id);
        setIsFavorite(status);
      } catch (error) {
        console.warn('Failed to check favorite status:', error);
      }
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [pg.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await pgService.removeFavorite(pg.id);
        setIsFavorite(false);
      } else {
        await pgService.addFavorite(pg.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft shadow-card-hover relative">
      
      {/* Save Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isLoading}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/50 dark:hover:bg-black/50 transition-all shadow-lg cursor-pointer disabled:cursor-wait"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${
            isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white hover:text-rose-400'
          }`}
          strokeWidth={isFavorite ? 0 : 2}
        />
      </button>

      {/* Image / Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {pg.images && pg.images.length > 0 ? (
          <img
            src={pg.images.find(img => img.isPrimary)?.url || pg.images[0].url}
            alt={pg.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-medium bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
             <ShieldCheck className="w-12 h-12 mb-2 opacity-50 text-slate-300 dark:text-slate-600" />
            <span className="text-sm tracking-widest uppercase opacity-60">
              {pg.sharingType} sharing
            </span>
          </div>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Absolute Gender Tag */}
        <span className={`absolute bottom-4 left-4 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest ${getGenderBadge(pg.genderType)}`}>
          {pg.genderType}
        </span>
      </div>

      {/* Details Container */}
      <div className="p-6 flex-grow flex flex-col justify-between relative z-10 bg-white dark:bg-slate-900">
        <div>
          {/* Rating and Address */}
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-4 h-4 mr-1.5 text-primary-500" />
              {pg.city}
            </span>
            <span className="flex items-center text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 mr-1.5" />
              {(pg.rating ?? 0).toFixed(1)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-1">
            <Link href={`/pg?slug=${pg.slug}`} className="focus:outline-none">
              {pg.title}
            </Link>
          </h3>

          {/* Description Snippet */}
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 font-medium">
            {pg.description}
          </p>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Starts From
            </span>
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{(pg.priceTriple || pg.priceDouble || pg.price || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-medium">/mo</span>
            </div>
          </div>

          <Link
            href={`/pg?slug=${pg.slug}`}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white dark:bg-primary-900/30 dark:hover:bg-primary-600 dark:text-primary-400 dark:hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-500/25"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}