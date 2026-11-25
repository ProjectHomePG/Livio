"use client";

import React, { useState } from 'react';
import { Heart, Share2, Check } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

export default function PropertyFavoriteButton({ pgId, title, variant = "bar" }) {
  const { isFavorite, toggleFavorite } = usePreferences();
  const [copied, setCopied] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const favorited = isFavorite(pgId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    toggleFavorite(pgId);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title || 'PG Stay on Livio',
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-200 cursor-pointer active:scale-95 ${
          favorited
            ? 'bg-rose-50 dark:bg-rose-950/40 text-primary-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
        }`}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 ${
            favorited ? 'fill-[#FF385C] text-[#FF385C]' : 'text-current'
          } ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}
          strokeWidth={2}
        />
        <span>{favorited ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95"
        aria-label="Share listing"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95 ${
          favorited
            ? 'bg-rose-50 dark:bg-rose-950/40 text-primary-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
        aria-label={favorited ? 'Saved to wishlist' : 'Save to wishlist'}
      >
        <Heart
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            favorited
              ? 'fill-[#FF385C] text-[#FF385C]'
              : 'text-slate-500 dark:text-slate-400'
          } ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}
          strokeWidth={2}
        />
        <span>{favorited ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
