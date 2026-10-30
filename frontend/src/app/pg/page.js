"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Info, Calendar, DollarSign, ShieldAlert, Award, MapPin, Star, Trash2, Pencil, Loader2 } from 'lucide-react';
import pgService from '../../services/pgService';
import authService from '../../services/authService';
import ImageGallery from '../../components/Details/ImageGallery';
import Amenities from '../../components/Details/Amenities';
import ReviewList from '../../components/Details/ReviewList';
import FoodQualityChart from '../../components/Details/FoodQualityChart';
import NearbyPlaces from '../../components/Details/NearbyPlaces';
import ContactOwner from '../../components/Details/ContactOwner';
import MapView from '../../components/Search/MapView';
import LoadingSkeleton from '../../components/Shared/LoadingSkeleton';
import { Suspense } from 'react';

function PGDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OWNER';

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await pgService.delete(pg.id);
      router.push('/admin');
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  useEffect(() => {
    async function loadDetails() {
      try {
        if (!slug) return;
        const data = await pgService.getBySlug(slug);
        setPg(data);
      } catch (err) {
        setError(err.message || "Failed to load stay details");
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <LoadingSkeleton type="TEXT" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !pg) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Listing Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The requested PG accommodation does not exist."}</p>
        <Link href="/search" className="inline-block px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Schema.org JSON-LD for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Accommodation",
            "name": pg.title,
            "description": pg.description,
            "image": pg.images?.map(img => img.url) || [],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": pg.address,
              "addressLocality": pg.city,
              "addressRegion": pg.state,
              "postalCode": pg.zipCode,
              "addressCountry": "IN"
            },
            "offers": {
              "@type": "Offer",
              "price": pg.price,
              "priceCurrency": "INR"
            }
          })
        }}
      />
      
      {/* Breadcrumbs / Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Search Results
        </button>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={pg.images} />

      {/* Details Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (Main Information) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/30 text-primary-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                {pg.genderType} accommodation
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {pg.sharingType} sharing
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              {pg.title}
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-primary-500 flex-shrink-0" />
              {pg.address}, {pg.city}, {pg.state}
            </p>
            {pg.reviews && pg.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold">
                    {(pg.reviews.reduce((a, r) => a + r.rating, 0) / pg.reviews.length).toFixed(1)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {pg.reviews.length} Google review{pg.reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
              About this accommodation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pg.description}
            </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Amenities checklist */}
          <Amenities amenities={pg.amenities} />

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Map Location placeholder */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
              Property Location
            </h2>
            <p className="text-xs text-slate-400">Convenient transport links and local food markets located directly outside the building.</p>
            <MapView pgs={[pg]} height="h-[300px]" />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Nearby places */}
          <NearbyPlaces places={pg.nearbyPlaces} />

          <hr className="border-slate-100 dark:border-slate-800" />

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Food quality insights extracted from review keywords */}
          <FoodQualityChart reviews={pg.reviews} />

          {/* Review list */}
          <ReviewList pgId={pg.id} />

        </div>

        {/* Right Column (Inquiry / Sticky Form Widget) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
          
          {/* Quick Pricing Summary */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Single</div>
                <div className="text-lg font-black text-primary-400">₹{pg.priceSingle?.toLocaleString('en-IN') || pg.price?.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Double</div>
                <div className="text-lg font-black text-primary-400">₹{pg.priceDouble?.toLocaleString('en-IN') || pg.price?.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Triple</div>
                <div className="text-lg font-black text-primary-400">₹{pg.priceTriple?.toLocaleString('en-IN') || pg.price?.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-center space-x-2 text-[10px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
              <span>Approx. prices. Includes daily cleaning & power backup. Final price may vary.</span>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex gap-3">
              <Link
                href={`/admin/edit-pg?id=${pg.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}

          {/* Owner Inquiry Form */}
          <ContactOwner pgId={pg.id} />

          {/* Rules Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Award className="w-4 h-4 mr-1.5 text-primary-500" />
              PG Stay Guidelines
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {pg.rules}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PGDetailsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6"><div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div></div>}>
      <PGDetailsContent />
    </Suspense>
  );
}
