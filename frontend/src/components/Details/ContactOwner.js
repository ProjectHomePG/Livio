"use client";

import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import pgService from '../../services/pgService';
import { trackLeadSubmission } from '@/lib/analytics';

/**
 * ContactOwner component.
 * Houses the booking inquiry form and fires GA4/GTM lead tracking on success.
 */
export default function ContactOwner({ pgId, pgTitle, city }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Hi, I am interested in this PG and would like to schedule a visit.');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await pgService.submitInquiry({
        pgId,
        name,
        email,
        phone,
        message,
      });
      trackLeadSubmission({ pgId, pgTitle, city, source: 'property_inquiry' });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      setError(err.message || 'Could not send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {success ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <div>
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Inquiry Submitted!</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">The host has been notified and will contact you shortly.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Book a Visit / Ask Questions</h2>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your Mobile Number"
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none"
              required
            />
          </div>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Custom message..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center justify-center shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-2" />
                Contact Owner
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
