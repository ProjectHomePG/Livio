"use client";

import { useEffect } from 'react';
import { trackPropertyView } from '@/lib/analytics';

export default function PropertyViewTracker({ pg }) {
  useEffect(() => {
    trackPropertyView(pg);
  }, [pg]);

  return null;
}
