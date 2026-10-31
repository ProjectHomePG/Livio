"use client";

import React, { useState, useEffect } from 'react';
import { Save, PlusCircle, Trash, Navigation } from 'lucide-react';
import { getCurrentCoords } from '@/utils/geolocation';

/**
 * PGForm component.
 * Reusable form for creating or editing PG accommodation listings.
 */
export default function PGForm({ initialData = null, onSubmit, submitting = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [genderType, setGenderType] = useState('MALE');
  const [sharingType, setSharingType] = useState('DOUBLE');
  const [rules, setRules] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locating, setLocating] = useState(false);

  // Load initialData if present (Edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setZipCode(initialData.zipCode || '');
      setGenderType(initialData.genderType || 'MALE');
      setSharingType(initialData.sharingType || 'DOUBLE');
      setRules(initialData.rules || '');
      setLatitude(
        typeof initialData.latitude === 'number' ? String(initialData.latitude) : ''
      );
      setLongitude(
        typeof initialData.longitude === 'number' ? String(initialData.longitude) : ''
      );
    }
  }, [initialData]);

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      setLatitude(String(coords.lat));
      setLongitude(String(coords.lng));
    } catch (err) {
      alert(err?.message || 'Could not access your location.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      price: Number(price),
      address,
      city,
      state,
      zipCode,
      genderType,
      sharingType,
      rules,
      latitude: latitude === '' ? null : Number(latitude),
      longitude: longitude === '' ? null : Number(longitude),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PG Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stanza Living Dublin House"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the rooms, food services, cleaning schedule..."
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none resize-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Rent (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 9500"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Gender Policy */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender Restriction Policy</label>
          <select
            value={genderType}
            onChange={(e) => setGenderType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none cursor-pointer focus:border-primary-500 transition-colors"
          >
            <option value="MALE">Male Only</option>
            <option value="FEMALE">Female Only</option>
            <option value="UNISEX">Unisex / Co-Living</option>
          </select>
        </div>

        {/* Sharing Type */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sharing Mode</label>
          <select
            value={sharingType}
            onChange={(e) => setSharingType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none cursor-pointer focus:border-primary-500 transition-colors"
          >
            <option value="SINGLE">Single Sharing (Private Room)</option>
            <option value="DOUBLE">Double Sharing</option>
            <option value="TRIPLE">Triple Sharing</option>
            <option value="QUAD">Quadruple Sharing</option>
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 24, Near Gate 5, Manyata Tech Park Road, Hebbal"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bangalore"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Karnataka"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Latitude */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Latitude <span className="normal-case font-medium">(optional — powers &quot;Near Me&quot;)</span>
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 12.9716"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Longitude</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 77.5946"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              title="Fill coordinates from your current location"
              className="flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : 'text-primary-500'}`} />
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PG House Rules</label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="e.g. In-time 10:30 PM. No outside guests after 10 PM. No drinking or smoking."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none resize-none focus:border-primary-500 transition-colors"
          />
        </div>

      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs flex items-center shadow-md cursor-pointer transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          {submitting ? 'Saving Stay...' : 'Save PG Stay'}
        </button>
      </div>
    </form>
  );
}
