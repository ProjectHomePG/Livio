"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Loader2, AlertCircle, MessageSquare, Building2, ShieldAlert, MessageCircle, ExternalLink, Send } from 'lucide-react';
import AdminHeader from '../../../components/Admin/AdminHeader';
import inquiryService from '../../../services/inquiryService';
import authService from '../../../services/authService';

const EMPTY_STATES = {
  loading: 'Loading inquiries...',
};

/**
 * AdminInquiries page.
 * Loads booking leads and Contact Us messages from the backend inbox.
 */
export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAdmin(user?.role === 'ROLE_ADMIN');
    setChecked(true);
  }, []);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.getAll();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setError(err.message || 'Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadInquiries();
    } else if (checked) {
      setLoading(false);
    }
  }, [isAdmin, checked, loadInquiries]);

  const toggleStatus = async (id, newStatus) => {
    const previous = inquiries;
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    try {
      await inquiryService.updateStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      setInquiries(previous);
      setError('Failed to update status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
      case 'CONTACTED':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-450';
      default:
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader
        title="Customer Inquiries"
        subtitle="Manage booking leads and Contact Us messages in one inbox."
      />

      {!isAdmin && checked && (
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Admin access required</h2>
          <p className="text-xs text-slate-400">
            The shared inquiry inbox is only visible to administrators.
          </p>
        </div>
      )}

      {isAdmin && error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </span>
          <button onClick={loadInquiries} className="underline underline-offset-2 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Inquiry list container */}
      {isAdmin && (loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs font-semibold">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          {EMPTY_STATES.loading}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-semibold">No inquiries yet. They will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const formattedDate = new Date(inq.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={inq.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                {/* Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{formattedDate}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-1">
                      {inq.name}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded mt-1 inline-block ${
                        inq.pg
                          ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/20'
                          : 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      {inq.pg ? (
                        <>
                          <Building2 className="w-3 h-3 inline mr-1" />
                          Inquiry on: {inq.pg.title}
                        </>
                      ) : inq.message?.startsWith('[LIST_PG_REQUEST]') ? (
                        <>
                          <Building2 className="w-3 h-3 inline mr-1" />
                          New PG Listing Request
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          Contact Us message
                        </>
                      )}
                    </span>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getStatusBadge(inq.status)}`}>
                      {inq.status}
                    </span>

                    <select
                      value={inq.status}
                      onChange={(e) => toggleStatus(inq.id, e.target.value)}
                      className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-900 outline-none cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Inquiry Message */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
                  &quot;{inq.message}&quot;
                </div>

                {/* Contact Channels & Direct Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <a href={`mailto:${inq.email}`} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors">
                      <Mail className="w-4 h-4 mr-1.5 text-primary-500" />
                      {inq.email}
                    </a>
                    {inq.phone && (
                      <a href={`tel:${inq.phone}`} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors">
                        <Phone className="w-4 h-4 mr-1.5 text-primary-500" />
                        {inq.phone}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {inq.phone && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${inq.name}, thank you for your inquiry about ${inq.pg?.title || 'our PG'} on Livio. When would you like to visit?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        <span>WhatsApp Chat</span>
                      </a>
                    )}

                    <a
                      href={`mailto:${inq.email}?subject=${encodeURIComponent(
                        `Regarding your inquiry for ${inq.pg?.title || 'Livio PG Stay'}`
                      )}&body=${encodeURIComponent(
                        `Hi ${inq.name},\n\nThank you for reaching out regarding ${inq.pg?.title || 'our accommodation'}.\n\nWe would be happy to share details on room availability, monthly rent, and schedule a visit.\n\nBest regards,\nLivio Team`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-black dark:hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply Email</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
