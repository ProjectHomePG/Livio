"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import pgService from '../../../services/pgService';
import authService from '../../../services/authService';
import AdminHeader from '../../../components/Admin/AdminHeader';
import PGForm from '../../../components/Admin/PGForm';
import { Suspense } from 'react';

function EditPGContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    console.log('Edit page - current user:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_OWNER') {
      console.log('Invalid role for edit page:', user.role);
      router.push('/admin');
      return;
    }
    
    setUserRole(user.role);
    setInitialized(true);

    (async () => {
      try {
        const data = await pgService.getById(id);
        // Check if owner is trying to edit someone else's PG
        if (user.role === 'ROLE_OWNER' && data.owner?.id !== user.id) {
          console.log('Owner trying to edit another owner\'s PG');
          router.push('/admin');
          return;
        }
        setPg(data);
      } catch (err) {
        console.error("Failed to load PG:", err);
        setError(err.message || "Failed to fetch PG stay details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      if (userRole === 'ROLE_ADMIN') {
        await pgService.update(id, formData);
      } else if (userRole === 'ROLE_OWNER') {
        await pgService.updateMyPG(id, formData);
      }
      router.push('/admin');
    } catch (err) {
      setError(err.message || "Failed to update PG stay listing.");
      setSubmitting(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">Loading listing configurations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader
        title="Edit PG Stay"
        subtitle={`Update details and configuration for: ${pg ? pg.title : 'Stay'}`}
      />

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl flex items-center space-x-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {pg && (
        <PGForm
          initialData={pg}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default function AdminEditPGPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <EditPGContent />
    </Suspense>
  );
}