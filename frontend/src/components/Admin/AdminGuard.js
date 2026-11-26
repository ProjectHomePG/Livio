"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, ShieldAlert } from 'lucide-react';
import authService from '../../services/authService';
import AdminSidebar from './AdminSidebar';

/**
 * Client-side auth guard for the Admin/Owner console.
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_OWNER')) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="w-full text-center py-20 text-slate-500 animate-pulse text-sm font-semibold">
        <Compass className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
        Checking permission rules...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Access Restricted</h2>
        <p className="text-xs text-slate-400">You must be logged in as an Owner or Admin to view this console.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      <AdminSidebar />
      <div className="flex-grow w-full bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
