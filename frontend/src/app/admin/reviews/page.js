"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, Trash2, Loader2, AlertCircle, Building2, User, ExternalLink, Search, Filter } from 'lucide-react';
import AdminHeader from '../../../components/Admin/AdminHeader';
import RatingStars from '../../../components/Details/RatingStars';
import reviewService from '../../../services/reviewService';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.getAll();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to fetch reviews. Please check your admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await reviewService.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete review error:', err);
      alert(err.message || 'Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (ratingFilter !== 'ALL' && rev.rating !== Number(ratingFilter)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const commentMatch = (rev.comment || '').toLowerCase().includes(q);
      const userMatch = (rev.user?.name || '').toLowerCase().includes(q);
      const pgMatch = (rev.pg?.title || '').toLowerCase().includes(q);
      return commentMatch || userMatch || pgMatch;
    });
  }, [reviews, ratingFilter, searchQuery]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { total: 0, avg: '0.0', positive: 0, critical: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = (sum / total).toFixed(1);
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const critical = reviews.filter((r) => r.rating <= 2).length;
    return { total, avg, positive, critical };
  }, [reviews]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Review Moderation"
        subtitle="Review, approve, and moderate customer ratings across all listed properties."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-500">{stats.avg}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Positive (4-5★)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.positive}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Critical (1-2★)</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{stats.critical}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by feedback text, resident, or PG title..."
            className="w-full bg-white dark:bg-slate-800 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Stars:
          </span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Review Cards List */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Star className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No reviews found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || ratingFilter !== 'ALL'
              ? 'No reviews match your current filter criteria.'
              : 'Feedback submitted by occupants will appear here for review and moderation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '';

            return (
              <div
                key={rev.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={rev.rating || 5} size={3.5} />
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {rev.rating}.0
                      </span>
                      <span className="text-[11px] text-slate-400">&bull; {dateStr}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-bold">
                        <User className="w-3.5 h-3.5 text-primary-500" />
                        {rev.user?.name || 'Verified Occupant'}
                      </span>
                      {rev.pg && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {rev.pg.title} {rev.pg.city ? `(${rev.pg.city})` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {rev.pg?.id && (
                      <Link
                        href={`/pg?id=${rev.pg.id}`}
                        target="_blank"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
                        title="View PG on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">View stay</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled={deletingId === rev.id}
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Delete review"
                    >
                      {deletingId === rev.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
