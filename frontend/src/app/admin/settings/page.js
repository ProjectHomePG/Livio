"use client";

import React, { useState, useEffect } from 'react';
import { Save, Bell, ShieldAlert, Check, User, Phone, Mail, Loader2 } from 'lucide-react';
import AdminHeader from '../../../components/Admin/AdminHeader';
import authService from '../../../services/authService';
import { supabase } from '../../../lib/supabase';

/**
 * AdminSettingsPage component.
 * Allows host/admin users to adjust profile contacts, phone, and notification preferences.
 */
export default function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const curr = authService.getCurrentUser();
    if (curr) {
      setUser(curr);
      setName(curr.name || '');
      setPhone(curr.phone || '');
    }
    try {
      const savedEmail = localStorage.getItem('livio_owner_email_alerts');
      const savedWa = localStorage.getItem('livio_owner_wa_alerts');
      if (savedEmail !== null) setEmailAlerts(savedEmail === 'true');
      if (savedWa !== null) setWhatsappAlerts(savedWa === 'true');
    } catch {}
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            phone: phone.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
      localStorage.setItem('livio_owner_email_alerts', String(emailAlerts));
      localStorage.setItem('livio_owner_wa_alerts', String(whatsappAlerts));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error('Settings save error:', err);
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Settings &amp; Contact Preferences"
        subtitle="Manage host contact details, inquiry notification triggers, and security."
      />

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>Profile configurations saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        {/* Section 1: Host Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <User className="w-4 h-4 mr-2 text-primary-500" />
            Host Identity &amp; Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name or Property Group"
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Contact Phone (WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Section 2: Notifications */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Bell className="w-4 h-4 mr-2 text-primary-500" />
            Lead Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded bg-slate-50 border-slate-200"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Email Alerts on New Inquiries
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded bg-slate-50 border-slate-200"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                WhatsApp Lead Routing
              </span>
            </label>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Section 3: Security */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-primary-500" />
            Security &amp; Sessions
          </h3>
          <p className="text-xs text-slate-400">
            Account sessions and role access are secured via Supabase JWT with Row Level Security.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
