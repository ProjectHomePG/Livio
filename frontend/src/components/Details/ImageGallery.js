"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Heart, Share2, Grid, X, Check } from 'lucide-react';
import { trackContactClick } from '@/lib/analytics';

function isOptimizableUrl(url) {
  if (!url) return false;
  return url.includes('.supabase.co/') || url.includes('images.unsplash.com/');
}

export default function ImageGallery({ images = [], pgTitle = 'PG Accommodation', pgLocation = 'India' }) {
  const [liked, setLiked] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const galleryImages = images.filter((img) => !img.url?.includes('_thumb'));
  const sortedImages = galleryImages.length > 0 ? galleryImages : images;

  useEffect(() => {
    if (showAll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAll]);

  const handleShare = async () => {
    trackContactClick('share_property');
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: pgTitle, url: shareUrl });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore user-cancelled share
    }
  };

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
            Photo Gallery
          </h2>
        </div>
        <div className="h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
          <span className="text-white text-sm font-extrabold bg-slate-900/60 px-4 py-2 rounded-full uppercase tracking-wider">
            No photos available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
          Photo Gallery
        </h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center text-xs font-bold px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Link copied' : 'Share'}
          </button>
          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className={`flex items-center text-xs font-bold px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer ${
              liked ? 'text-rose-500 border-rose-200' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 mr-1.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            {liked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {sortedImages.length === 1 && (
        <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm bg-slate-200 dark:bg-slate-700">
          <Image
            src={sortedImages[0].url}
            alt={`${pgTitle} in ${pgLocation} — exterior and room view`}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
            unoptimized={!isOptimizableUrl(sortedImages[0].url)}
            className="object-cover"
          />
        </div>
      )}

      {sortedImages.length > 1 && (
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm">
          <div className="col-span-2 row-span-2 relative bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <Image
              src={sortedImages[0].url}
              alt={`${pgTitle} in ${pgLocation} — main property view`}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority
              unoptimized={!isOptimizableUrl(sortedImages[0].url)}
              className="object-cover"
            />
          </div>

          {sortedImages.slice(1, 5).map((img, i) => (
            <div key={img.id || i} className="relative bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <Image
                src={img.url}
                alt={`${pgTitle} in ${pgLocation} — photo ${i + 2}`}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                unoptimized={!isOptimizableUrl(img.url)}
                className="object-cover"
              />
            </div>
          ))}

          {sortedImages.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 cursor-pointer z-10"
            >
              <Grid className="w-4 h-4" />
              <span>Show all {sortedImages.length} photos</span>
            </button>
          )}
        </div>
      )}

      {showAll && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-white text-lg font-bold">
              All {sortedImages.length} Photos
            </h3>
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
              aria-label="Close photo gallery"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sortedImages.map((img, i) => (
                <div key={img.id || i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={img.url}
                    alt={`${pgTitle} in ${pgLocation} — gallery photo ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    unoptimized={!isOptimizableUrl(img.url)}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
