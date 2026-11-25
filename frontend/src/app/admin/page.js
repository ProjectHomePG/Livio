"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import pgService from '../../services/pgService';
import authService from '../../services/authService';
import inquiryService from '../../services/inquiryService';
import AdminHeader from '../../components/Admin/AdminHeader';
import DashboardCard from '../../components/Admin/DashboardCard';

/**
 * AdminDashboard page.
 * Aggregates listing statistics and displays table of current property items.
 * Owners see only their listings; Admins see all listings.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [pgs, setPgs] = useState([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_OWNER') {
      router.push('/');
      return;
    }
    setUserRole(user.role);
    setInitialized(true);
  }, [router]);

  const loadData = useCallback(async () => {
    if (!initialized) return;
    try {
      let data = [];
      if (userRole === 'ROLE_ADMIN') {
        const [allPgs, allInq] = await Promise.all([
          pgService.getAll(),
          inquiryService.getAll().catch(() => []),
        ]);
        data = allPgs;
        setInquiriesCount(allInq.length);
      } else if (userRole === 'ROLE_OWNER') {
        data = await pgService.getMyPGs();
      } else {
        router.push('/');
        return;
      }
      setPgs(data);
    } catch (err) {
      console.error('Failed to load PGs:', err);
    } finally {
      setLoading(false);
    }
  }, [initialized, userRole, router]);

  useEffect(() => {
    if (initialized) {
      loadData();
    }
  }, [initialized, loadData]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      if (userRole === 'ROLE_ADMIN') {
        await pgService.delete(id);
      } else if (userRole === 'ROLE_OWNER') {
        await pgService.deleteMyPG(id);
      }
      setPgs((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete PG:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };

  const isAdmin = userRole === 'ROLE_ADMIN';
  const ratedPgs = pgs.filter((p) => typeof p.rating === 'number' && p.rating > 0);
  const avgRatingDisplay =
    ratedPgs.length > 0
      ? `${(ratedPgs.reduce((acc, p) => acc + p.rating, 0) / ratedPgs.length).toFixed(1)} ★`
      : '—';

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title={isAdmin ? 'Dashboard Overview' : 'My Listings'}
        subtitle={
          isAdmin
            ? 'Manage and edit all Paying Guest accommodations.'
            : 'Manage your listed properties.'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Properties"
          value={pgs.length.toLocaleString('en-IN')}
          icon="Home"
          color="text-blue-600 bg-blue-50 dark:bg-slate-900"
        />
        <DashboardCard
          title="Inbox Inquiries"
          value={isAdmin ? inquiriesCount.toLocaleString('en-IN') : 'Direct'}
          icon="MessageSquare"
          color="text-primary-600 bg-primary-50 dark:bg-slate-900"
        />
        <DashboardCard
          title="Average Rating"
          value={avgRatingDisplay}
          icon="Star"
          color="text-amber-500 bg-amber-50 dark:bg-slate-900"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {isAdmin ? 'All Listings' : 'Your Listings'}
          </h2>
          <p className="text-[10px] text-slate-400">
            {isAdmin
              ? 'Add, edit, or remove properties from the portal.'
              : 'Add, edit, or remove your listed properties.'}
          </p>
        </div>

        <Link
          href="/admin/add-pg"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add PG Stay
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400 animate-pulse">
            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
            Fetching stays...
          </div>
        ) : pgs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 italic">
            {isAdmin
              ? 'No PG stays found in the system.'
              : 'No PG stays listed under your profile yet. Click "Add PG Stay" to get started!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 pl-6">Property Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Policy / Sharing</th>
                  <th className="p-4">Monthly Rent</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {pgs.map((pg) => (
                  <tr key={pg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-slate-200">
                      <Link href={`/property/${encodeURIComponent(pg.slug)}`} className="hover:underline">
                        {pg.title}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {pg.city}, {pg.state}
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{(pg.genderType || 'UNISEX').toLowerCase()}</span> /{' '}
                      <span className="lowercase">{pg.sharingType || 'SINGLE'}</span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-slate-100">
                      ₹{Number(pg.price || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 pr-6 text-right flex justify-end items-center space-x-2">
                      <Link
                        href={`/admin/edit-pg?id=${pg.id}`}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer"
                        title="Edit Stay"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pg.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Stay"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
