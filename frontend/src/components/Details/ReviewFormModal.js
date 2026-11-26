"use client";

import React, { useState } from 'react';
import { Star, X, Check, Loader2, MessageSquarePlus } from 'lucide-react';
import reviewService from '../../services/reviewService';
import authService from '../../services/authService';
import Link from 'next/link';

const RATING_LABELS = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Average',
  4: 'Very Good',
  5: 'Excellent',
};

export default function ReviewFormModal({ pgId, pgTitle, isOpen, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const user = authService.getCurrentUser();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setError('Please provide at least 10 characters describing your experience.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const newReview = await reviewService.create(pgId, rating, comment.trim());
      setSuccess(true);
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-primary-500">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rate &amp; Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {pgTitle || 'This accommodation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!user ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Sign in to leave a review
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              We verify occupant reviews to keep recommendations trusted and transparent for everyone.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-black transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Thank you! Your review has been submitted successfully.</span>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-2 text-center py-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overall Experience
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-extrabold text-primary-600 dark:text-rose-400 inline-block min-h-[16px]">
                {RATING_LABELS[hoverRating || rating] || ''}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label
                htmlFor="review-comment"
                className="block text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                Your Feedback
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the food, cleanliness, warden, WiFi, and overall vibe? Share details to help fellow seekers."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-medium p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors resize-none placeholder-slate-400 text-slate-900 dark:text-white"
                required
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Minimum 10 characters</span>
                <span>{comment.length} chars</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-500/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
