"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

export default function CurrencyModal() {
  const {
    currency,
    changeCurrency,
    currencies,
    isCurrencyModalOpen,
    setIsCurrencyModalOpen,
  } = usePreferences();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isCurrencyModalOpen) {
        setIsCurrencyModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCurrencyModalOpen, setIsCurrencyModalOpen]);

  // Extract regions
  const regions = useMemo(() => {
    const list = ['All'];
    currencies.forEach((c) => {
      if (c.region && !list.includes(c.region)) {
        list.push(c.region);
      }
    });
    return list;
  }, [currencies]);

  // Filtered currencies
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return currencies.filter((c) => {
      const matchRegion = selectedRegion === 'All' || c.region === selectedRegion;
      const matchQuery =
        !q ||
        c.label.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q));
      return matchRegion && matchQuery;
    });
  }, [currencies, searchQuery, selectedRegion]);

  if (!isCurrencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 id="currency-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a Currency
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Default: Indian Rupee (₹ INR). Real-time conversions for all stays.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCurrencyModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close currency modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="py-3">
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search currency by name, code, or region..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100 dark:border-slate-800">
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* Currency Grid */}
        <div className="flex-1 overflow-y-auto py-3 no-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredCurrencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  changeCurrency(c.code);
                  setIsCurrencyModalOpen(false);
                }}
                className={`relative flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {c.label}
                    </span>
                    {c.isDefault && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {c.code} – {c.symbol}
                  </div>
                  {c.region && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {c.region}
                    </div>
                  )}
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {c.symbol}
                  </span>
                )}
              </button>
            );
          })}

          {filteredCurrencies.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No currencies match &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              changeCurrency('INR');
              setIsCurrencyModalOpen(false);
            }}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
          >
            Reset to Indian Rupee (₹ INR)
          </button>
          <button
            type="button"
            onClick={() => setIsCurrencyModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

