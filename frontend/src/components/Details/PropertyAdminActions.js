"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import authService from '@/services/authService';
import pgService from '@/services/pgService';

export default function PropertyAdminActions({ pgId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OWNER';
  if (!isAdmin) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await pgService.delete(pgId);
      router.push('/admin');
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex gap-3">
      <Link
        href={`/admin/edit-pg?id=${pgId}`}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}
