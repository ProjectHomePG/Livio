"use client";

import React, { useMemo } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { analyzeFoodQuality } from '../../utils/foodSentiment';

const REACTION_TIERS = [
  { min: 4.5, emoji: '🤩', label: 'Outstanding' },
  { min: 4.0, emoji: '😋', label: 'Delicious' },
  { min: 3.0, emoji: '🙂', label: 'Decent' },
  { min: 2.0, emoji: '😕', label: 'Below average' },
  { min: 0, emoji: '😞', label: 'Poor' },
];

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * FoodQualityChart component.
 * Analyses review comments for food-related keywords and renders an
 * attractive reaction chart (emoji + score + sentiment bar + keyword chips).
 * Renders nothing when no reviews mention food.
 */
export default function FoodQualityChart({ reviews }) {
  const analysis = useMemo(() => analyzeFoodQuality(reviews), [reviews]);

  if (!analysis || analysis.totalMentions === 0) return null;

  const { totalMentions, positive, neutral, negative, score, positiveKeywords, negativeKeywords } = analysis;
  const reaction = REACTION_TIERS.find((tier) => score >= tier.min) || REACTION_TIERS[REACTION_TIERS.length - 1];

  const segments = [
    { count: positive, color: 'bg-emerald-400', emoji: '😋', label: 'Loved it' },
    { count: neutral, color: 'bg-amber-400', emoji: '🙂', label: 'Okay' },
    { count: negative, color: 'bg-rose-400', emoji: '😞', label: 'Did not like' },
  ];

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs flex items-center">
          <UtensilsCrossed className="w-4 h-4 mr-1.5 text-primary-500" />
          Food Quality
        </h2>
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30">
          From {totalMentions} review{totalMentions !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Big reaction + score */}
      <div className="flex items-center gap-5">
        <span className="text-6xl animate-bounce select-none" role="img" aria-label={reaction.label}>
          {reaction.emoji}
        </span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{score.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">/ 5</span>
          </div>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{reaction.label}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Based on reviews mentioning food &amp; meals</p>
        </div>
      </div>

      {/* Sentiment distribution bar */}
      <div className="space-y-2">
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700/50" role="img" aria-label="Food sentiment distribution">
          {segments.map((seg) =>
            seg.count > 0 ? (
              <div
                key={seg.label}
                className={`${seg.color} transition-all duration-500`}
                style={{ width: `${(seg.count / totalMentions) * 100}%` }}
              />
            ) : null
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {segments.map((seg) => (
            <span key={seg.label} className="inline-flex items-center gap-1">
              <span>{seg.emoji}</span>
              <span>{seg.label}</span>
              <span className="text-slate-400 dark:text-slate-500">({seg.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Keyword chips pulled from real review text */}
      {(positiveKeywords.length > 0 || negativeKeywords.length > 0) && (
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">What guests say about the food</p>
          <div className="flex flex-wrap gap-2">
            {positiveKeywords.map((kw) => (
              <span
                key={`pos-${kw.word}`}
                className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
              >
                😋 {capitalize(kw.word)}
              </span>
            ))}
            {negativeKeywords.map((kw) => (
              <span
                key={`neg-${kw.word}`}
                className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
              >
                😞 {capitalize(kw.word)}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3">
        Automatically analysed from keywords in guest reviews.
      </p>
    </div>
  );
}
