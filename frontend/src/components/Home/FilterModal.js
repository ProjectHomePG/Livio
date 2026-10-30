"use client";

import React, { useState } from 'react';
import { X, Wifi, Utensils, Snowflake, Shield, Car, Dumbbell, Sparkles, Tv, Coffee } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'High-speed Wifi', icon: Wifi },
  { id: 'food', label: 'Meals Included (3-Time)', icon: Utensils },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'washroom', label: 'Attached Bathroom', icon: Shield },
  { id: 'parking', label: 'Free Parking', icon: Car },
  { id: 'gym', label: 'Gym & Fitness', icon: Dumbbell },
  { id: 'housekeeping', label: 'Daily Cleaning', icon: Sparkles },
  { id: 'tv', label: 'Smart TV & OTT', icon: Tv },
  { id: 'fridge', label: 'Refrigerator & Pantry', icon: Coffee },
];

export default function FilterModal({ isOpen, onClose, onApplyFilters, totalCount = 0 }) {
  const { searchParams, setSearchParams } = usePreferences();

  const [placeType, setPlaceType] = useState('ALL'); // ALL, SINGLE, DOUBLE, STUDIO
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '');
  const [gender, setGender] = useState(searchParams.gender || 'ALL');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [instantBook, setInstantBook] = useState(false);
  const [verifiedHost, setVerifiedHost] = useState(false);

  if (!isOpen) return null;

  const handleToggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setPlaceType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setGender('ALL');
    setSelectedAmenities([]);
    setInstantBook(false);
    setVerifiedHost(false);
  };

  const handleApply = () => {
    const filters = {
      placeType,
      minPrice,
      maxPrice,
      gender,
      amenities: selectedAmenities,
      instantBook,
      verifiedHost,
    };
    onApplyFilters?.(filters);
    setSearchParams((prev) => ({
      ...prev,
      ...filters,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-modal overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Filters</h2>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 no-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
          {/* 1. Type of place */}
          <div className="space-y-4 pt-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Type of place</h3>
            <p className="text-xs text-slate-500">Search rooms, entire flats, or shared beds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'ALL', label: 'Any type', desc: 'All options' },
                { id: 'SINGLE', label: 'Room', desc: 'Private room' },
                { id: 'DOUBLE', label: 'Shared', desc: '2 sharing' },
                { id: 'STUDIO', label: 'Entire place', desc: 'Studio flat' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlaceType(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    placeType === opt.id
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price range */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Price range</h3>
            <p className="text-xs text-slate-500">Monthly rents per person</p>

            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Minimum</label>
                <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white mt-1">
                  <span className="mr-1">₹</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="5,000"
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </div>
              </div>

              <div className="text-slate-300">-</div>

              <div className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Maximum</label>
                <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white mt-1">
                  <span className="mr-1">₹</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="30,000+"
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Under ₹8k', min: '', max: '8000' },
                { label: '₹8k - ₹12k', min: '8000', max: '12000' },
                { label: '₹12k - ₹18k', min: '12000', max: '18000' },
                { label: '₹18k+', min: '18000', max: '' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-700 dark:text-slate-300"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Gender preference */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resident policy</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'ALL', label: 'All Residents' },
                { id: 'MALE', label: 'Male Only' },
                { id: 'FEMALE', label: 'Female Only' },
                { id: 'UNISEX', label: 'Co-Living / Unisex' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-semibold transition-all ${
                    gender === g.id
                      ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Amenities */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((am) => {
                const IconComp = am.icon;
                const active = selectedAmenities.includes(am.id);
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => handleToggleAmenity(am.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <IconComp className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-medium">{am.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Booking Options */}
          <div className="space-y-4 pt-6 pb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Booking options</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Instant Booking</div>
                <div className="text-xs text-slate-500">Listings you can book without waiting for host approval</div>
              </div>
              <button
                type="button"
                onClick={() => setInstantBook(!instantBook)}
                role="switch"
                aria-checked={instantBook}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  instantBook ? 'bg-slate-900 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    instantBook ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Verified Host</div>
                <div className="text-xs text-slate-500">Stay with verified PG managers and audited properties</div>
              </div>
              <button
                type="button"
                onClick={() => setVerifiedHost(!verifiedHost)}
                role="switch"
                aria-checked={verifiedHost}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  verifiedHost ? 'bg-slate-900 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    verifiedHost ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 underline hover:text-black dark:hover:text-white cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:bg-black dark:hover:bg-slate-100 transition-all cursor-pointer"
          >
            Show {totalCount > 0 ? `${totalCount}+ stays` : 'results'}
          </button>
        </div>
      </div>
    </div>
  );
}

