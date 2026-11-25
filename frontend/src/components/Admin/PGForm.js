"use client";

import React, { useState, useEffect } from 'react';
import { Save, Navigation } from 'lucide-react';
import { getCurrentCoords } from '@/utils/geolocation';
import ImageUploader from './ImageUploader';

/**
 * PGForm component.
 * Reusable form for creating or editing PG accommodation listings (Owner/Admin).
 * Supports direct file uploads to Supabase Storage via ImageUploader.
 */
export default function PGForm({ initialData = null, onSubmit, submitting = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceSingle, setPriceSingle] = useState('');
  const [priceDouble, setPriceDouble] = useState('');
  const [priceTriple, setPriceTriple] = useState('');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [genderType, setGenderType] = useState('MALE');
  const [sharingType, setSharingType] = useState('DOUBLE');
  const [rules, setRules] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState([]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price ?? '');
      setPriceSingle(initialData.priceSingle ?? '');
      setPriceDouble(initialData.priceDouble ?? '');
      setPriceTriple(initialData.priceTriple ?? '');
      setDepositAmount(initialData.depositAmount ?? '5000');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setZipCode(initialData.zipCode || '');
      setGenderType(initialData.genderType || 'MALE');
      setSharingType(initialData.sharingType || 'DOUBLE');
      setRules(initialData.rules || '');
      setLatitude(typeof initialData.latitude === 'number' ? String(initialData.latitude) : '');
      setLongitude(typeof initialData.longitude === 'number' ? String(initialData.longitude) : '');
      if (Array.isArray(initialData.images) && initialData.images.length > 0) {
        setImages(initialData.images.map((i) => i.url).filter(Boolean));
      }
    }
  }, [initialData]);

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        setLatitude(coords.lat.toFixed(6));
        setLongitude(coords.lng.toFixed(6));
      }
    } catch (err) {
      console.warn('Geolocation failed:', err);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericBase = Number(price || priceDouble || priceTriple || priceSingle || 0);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: numericBase,
      priceSingle: priceSingle !== '' ? Number(priceSingle) : null,
      priceDouble: priceDouble !== '' ? Number(priceDouble) : null,
      priceTriple: priceTriple !== '' ? Number(priceTriple) : null,
      depositAmount: depositAmount !== '' ? Number(depositAmount) : 5000,
      phone: phone.trim() || null,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim() || null,
      genderType,
      sharingType,
      rules: rules.trim(),
      latitude: latitude === '' ? null : Number(latitude),
      longitude: longitude === '' ? null : Number(longitude),
      imageUrls: images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PG Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Livio Comfort Stay Whitefield"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

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

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Base Monthly Rent (₹)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 9500"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
          <input
            type="number"
            min="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Single Sharing (₹)</label>
            <input
              type="number"
              min="0"
              value={priceSingle}
              onChange={(e) => setPriceSingle(e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Double Sharing (₹)</label>
            <input
              type="number"
              min="0"
              value={priceDouble}
              onChange={(e) => setPriceDouble(e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Triple Sharing (₹)</label>
            <input
              type="number"
              min="0"
              value={priceTriple}
              onChange={(e) => setPriceTriple(e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender Category</label>
          <select
            value={genderType}
            onChange={(e) => setGenderType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          >
            <option value="MALE">Boys PG</option>
            <option value="FEMALE">Girls PG</option>
            <option value="UNISEX">Coliving / Unisex</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sharing Type</label>
          <select
            value={sharingType}
            onChange={(e) => setSharingType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          >
            <option value="SINGLE">Single Room</option>
            <option value="DOUBLE">Double Sharing</option>
            <option value="TRIPLE">Triple Sharing</option>
            <option value="FOUR_PLUS">Four+ / Dormitory</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Street Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 24, Near ITPL Main Gate, Whitefield"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
            required
          />
        </div>

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

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PIN / ZIP Code (optional)</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 560066"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Latitude <span className="normal-case font-medium">(optional &mdash; powers &quot;Near Me&quot;)</span>
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
              {locating ? 'Locating...' : 'Use my location'}
            </button>
          </div>
        </div>

        {/* Dedicated Photo Uploader */}
        <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <ImageUploader images={images} onChange={setImages} maxImages={10} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PG House Rules</label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="e.g. In-time 10:30 PM. 30-day notice period."
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
