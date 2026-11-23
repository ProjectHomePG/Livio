"use client";

import React from 'react';

/**
 * MapView component.
 * Renders a real, interactive Google Map using the free Google Maps URL Embed API.
 * Prefers listing latitude/longitude (centering on a single pin or the centroid of
 * all nearby pins) and falls back to a text address/city query when no coords exist.
 */
export default function MapView({ pgs = [], height = "h-[450px]" }) {
  const zoomForSpan = (span) => {
    if (span > 20) return 6;
    if (span > 5) return 8;
    if (span > 1) return 10;
    if (span > 0.25) return 12;
    if (span > 0.08) return 13;
    return 14;
  };

  const getMapTarget = () => {
    const withCoords = (pgs || []).filter(
      (pg) => typeof pg.latitude === 'number' && typeof pg.longitude === 'number'
    );

    if (withCoords.length === 1) {
      const { latitude, longitude } = withCoords[0];
      return { query: `${latitude},${longitude}`, zoom: 15 };
    }

    if (withCoords.length > 1) {
      const lats = withCoords.map((p) => p.latitude);
      const lngs = withCoords.map((p) => p.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const span = Math.max(maxLat - minLat, maxLng - minLng);
      return {
        query: `${centerLat},${centerLng}`,
        zoom: zoomForSpan(span),
      };
    }

    // No coordinates — fall back to text search
    if (pgs && pgs.length === 1) {
      const pg = pgs[0];
      return {
        query: `${pg.address || ""}, ${pg.city || ""}, ${pg.state || ""}`,
        zoom: 14,
      };
    }
    if (pgs && pgs.length > 0) {
      return { query: pgs[0].city || "Bangalore", zoom: 12 };
    }
    return { query: "Bangalore", zoom: 12 };
  };

  const { query, zoom } = getMapTarget();
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`relative w-full ${height} bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm`}>
      <iframe
        title="Google Map Location"
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        src={embedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
