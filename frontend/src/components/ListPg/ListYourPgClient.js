"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Users,
  IndianRupee,
  Send,
  ShieldAlert,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';
import inquiryService from '@/services/inquiryService';
import { AUTH_ENABLED } from '@/config';
import { trackLeadSubmission } from '@/lib/analytics';
import PGForm from '@/components/Admin/PGForm';

const INITIAL_REQUEST = {
  propertyName: '',
  ownerName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  state: '',
  genderType: 'UNISEX',
  sharingType: 'DOUBLE',
  priceSingle: '',
  priceDouble: '',
  priceTriple: '',
  depositAmount: '5000',
  amenities: [],
  rules: '',
  description: '',
};

const AMENITY_CHOICES = [
  'High-speed WiFi',
  '3-Time Meals',
  'AC Rooms',
  'Attached Washroom',
  'Laundry',
  'Housekeeping',
  'Power Backup',
  'CCTV Security',
  'Two-Wheeler Parking',
];

export default function ListYourPgClient() {
  const [user, setUser] = useState(null);
  const [checkedUser, setCheckedUser] = useState(false);

  // Logged-in Host/Admin direct publish state
  const [publishing, setPublishing] = useState(false);
  const [publishedPg, setPublishedPg] = useState(null);
  const [publishError, setPublishError] = useState(null);

  // Public Host Onboarding request state
  const [form, setForm] = useState(INITIAL_REQUEST);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let active = true;
    const cached = authService.getCurrentUser();
    if (cached) setUser(cached);
    authService.getSessionUser().then((sessionUser) => {
      if (active) {
        if (sessionUser) setUser(sessionUser);
        setCheckedUser(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isStaff = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OWNER';

  const handleToggleAmenity = (label) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter((a) => a !== label)
        : [...prev.amenities, label],
    }));
  };

  const handleDirectPublish = async (pgData) => {
    setPublishing(true);
    setPublishError(null);
    try {
      const created = await pgService.create(pgData);
      trackLeadSubmission({
        pgId: created?.id,
        pgTitle: created?.title,
        city: created?.city,
        source: 'host_direct_publish',
      });
      setPublishedPg(created);
    } catch (err) {
      setPublishError(err?.message || 'Failed to publish PG listing.');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const rentParts = [
      form.priceSingle ? `Single: ₹${form.priceSingle}` : null,
      form.priceDouble ? `Double: ₹${form.priceDouble}` : null,
      form.priceTriple ? `Triple: ₹${form.priceTriple}` : null,
    ].filter(Boolean);

    const structuredMessage = [
      `[LIST_PG_REQUEST]`,
      `Property: ${form.propertyName.trim()}`,
      `Location: ${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()}`,
      `Policy: ${form.genderType} | Primary Sharing: ${form.sharingType}`,
      `Monthly Rents: ${rentParts.join(', ') || 'Not specified'} | Deposit: ₹${form.depositAmount || '5000'}`,
      `Amenities: ${form.amenities.length ? form.amenities.join(', ') : 'None selected'}`,
      form.rules ? `Rules: ${form.rules.trim()}` : null,
      form.description ? `Details: ${form.description.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await inquiryService.submitContact({
        pgId: null,
        name: form.ownerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: structuredMessage,
      });
      trackLeadSubmission({
        pgTitle: form.propertyName.trim(),
        city: form.city.trim(),
        source: 'list_your_pg',
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not submit your property details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero Banner */}
      <header className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-7 sm:p-10 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              <Building2 className="w-4 h-4" />
              Partner with Livio (PG Near Me)
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              List Your PG, Hostel or Co-Living Space on Livio
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Reach students and working professionals searching across 14 Indian cities. Zero
              listing fees and direct seeker enquiries straight to your contact details.
            </p>
          </div>

          {isStaff && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity shrink-0 self-start"
            >
              <LayoutDashboard className="w-4 h-4" />
              Open Host Console
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">High-Intent Seekers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Matched by city, locality, metro proximity, sharing type, and monthly budget.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <IndianRupee className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">Zero Brokerage</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connect directly with prospective tenants without middlemen commissions.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">Dedicated SEO Pages</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every approved stay gets a fast, search-indexed property page and map pin.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Logged-in Staff Direct Publish Mode */}
      {checkedUser && isStaff ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Publish a New PG Stay Immediately
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Signed in as {user.name} ({user.role === 'ROLE_ADMIN' ? 'Admin' : 'Host'}). Listings go live right away.
              </p>
            </div>
          </div>

          {publishError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{publishError}</span>
            </div>
          )}

          {publishedPg ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300">
                {publishedPg.title} is Now Live!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Your property page is published and ready to receive enquiries.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href={`/property/${encodeURIComponent(publishedPg.slug)}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700"
                >
                  View Live Listing
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPublishedPg(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Add Another PG
                </button>
              </div>
            </div>
          ) : (
            <PGForm onSubmit={handleDirectPublish} submitting={publishing} />
          )}
        </section>
      ) : (
        /* Public Owner / Host Onboarding Submission Form */
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Submit Your PG Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Fill out your property details below. Our onboarding team reviews and activates verified listings within 24 hours.
              </p>
            </div>
            {AUTH_ENABLED && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Host Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  Create Host Account
                </Link>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Property Submission Received!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <span className="font-bold">{form.ownerName}</span>. We have received your
                submission for <span className="font-bold">{form.propertyName}</span> in{' '}
                <span className="font-bold">{form.city}</span> and will contact you at{' '}
                <span className="font-semibold">{form.phone}</span> /{' '}
                <span className="font-semibold">{form.email}</span> shortly to finalize activation.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(INITIAL_REQUEST);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold cursor-pointer"
                >
                  Submit Another Property
                </button>
                <Link
                  href="/pg-in-india"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Browse Existing Listings
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handlePublicSubmit}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {submitError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label htmlFor="pg-name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Property / PG Name *
                  </label>
                  <input
                    id="pg-name"
                    type="text"
                    required
                    value={form.propertyName}
                    onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
                    placeholder="e.g. Comfort Living Boys & Girls PG"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="owner-name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Owner / Manager Name *
                  </label>
                  <input
                    id="owner-name"
                    type="text"
                    required
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="owner-phone" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="owner-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="owner-email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="owner-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="pg-gender" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Resident Policy *
                  </label>
                  <select
                    id="pg-gender"
                    value={form.genderType}
                    onChange={(e) => setForm({ ...form, genderType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer focus:border-primary-500"
                  >
                    <option value="MALE">Boys PG (Male Only)</option>
                    <option value="FEMALE">Girls PG (Female Only)</option>
                    <option value="UNISEX">Unisex / Co-Living</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="pg-address" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Street Address &amp; Locality *
                  </label>
                  <input
                    id="pg-address"
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 14th Cross, Whitefield Main Rd, Near ITPL"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="pg-city" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    id="pg-city"
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Bangalore"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="pg-state" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    id="pg-state"
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>

                {/* Pricing Grid */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="rent-single" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Single Rent (₹)
                    </label>
                    <input
                      id="rent-single"
                      type="number"
                      min="0"
                      value={form.priceSingle}
                      onChange={(e) => setForm({ ...form, priceSingle: e.target.value })}
                      placeholder="14000"
                      className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="rent-double" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Double Rent (₹) *
                    </label>
                    <input
                      id="rent-double"
                      type="number"
                      min="0"
                      required
                      value={form.priceDouble}
                      onChange={(e) => setForm({ ...form, priceDouble: e.target.value })}
                      placeholder="9500"
                      className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="rent-triple" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Triple Rent (₹)
                    </label>
                    <input
                      id="rent-triple"
                      type="number"
                      min="0"
                      value={form.priceTriple}
                      onChange={(e) => setForm({ ...form, priceTriple: e.target.value })}
                      placeholder="7500"
                      className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="deposit-amt" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Deposit (₹)
                    </label>
                    <input
                      id="deposit-amt"
                      type="number"
                      min="0"
                      value={form.depositAmount}
                      onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                      placeholder="5000"
                      className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Amenities Chips */}
                <div className="md:col-span-2 space-y-2">
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Available Facilities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_CHOICES.map((label) => {
                      const active = form.amenities.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleToggleAmenity(label)}
                          className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-500'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="pg-desc" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Property Description &amp; Meal Details *
                  </label>
                  <textarea
                    id="pg-desc"
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe room furnishing, meal timings, nearby tech parks or colleges..."
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none resize-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="pg-rules" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    House Rules &amp; Notice Period (Optional)
                  </label>
                  <input
                    id="pg-rules"
                    type="text"
                    value={form.rules}
                    onChange={(e) => setForm({ ...form, rules: e.target.value })}
                    placeholder="e.g. 30-day notice period, gate closing timing, visitor policy"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  By submitting, you confirm that the property details and pricing are accurate.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Property...' : 'Submit PG for Listing'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
