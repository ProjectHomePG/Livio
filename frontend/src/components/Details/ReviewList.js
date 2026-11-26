"use client";

import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import RatingStars from './RatingStars';
import ReviewFormModal from './ReviewFormModal';
import reviewService from '../../services/reviewService';
import { MessageSquarePlus } from 'lucide-react';

/**
 * ReviewList component.
 * Displays overall rating metrics and list of review cards.
 * Uses SSR-provided initialReviews when available so reviews appear in initial HTML.
 * Includes interactive "Write a review" modal.
 */
export default function ReviewList({ pgId, pgTitle = '', initialReviews = null }) {
  const [reviews, setReviews] = useState(Array.isArray(initialReviews) ? initialReviews : []);
  const [loading, setLoading] = useState(!Array.isArray(initialReviews));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialReviews)) return;
    async function loadReviews() {
      try {
        const data = await reviewService.getByPgId(pgId);
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [pgId, initialReviews]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  if (loading) {
    return <div className="text-sm font-semibold text-slate-500 animate-pulse py-4">Loading feedback...</div>;
  }

  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Guest Reviews &amp; Feedback</h2>
          <p className="text-xs text-slate-400 mt-1">Feedback and ratings from residents and visitors.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {hasReviews ? (
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block">{avgRating}</span>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Average rating</span>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-700 pl-4 space-y-1">
                <RatingStars rating={Number(avgRating)} size={4} />
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No reviews submitted yet
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-black dark:hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Write a review</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {!hasReviews ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/60">
            <p className="text-sm text-slate-500">Have you stayed at {pgTitle || 'this PG'}? Be the first to share your experience!</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-600 dark:text-primary-400 bg-rose-50 dark:bg-rose-950/40 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              Share your review
            </button>
          </div>
        ) : (
          reviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
        )}
      </div>

      <ReviewFormModal
        pgId={pgId}
        pgTitle={pgTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
}
