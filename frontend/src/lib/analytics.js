"use client";

/**
 * Push structured conversion & engagement events to GTM dataLayer / gtag.
 * Tracks traffic acquisition hints (organic vs referral vs direct) without storing PII.
 */
function getTrafficContext() {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';
    const isOrganicSearch = /google\.|bing\.|duckduckgo\.|yahoo\./i.test(referrer) && !params.get('gclid');
    return {
      page_path: window.location.pathname,
      utm_source: params.get('utm_source') || (isOrganicSearch ? 'organic' : 'direct'),
      utm_medium: params.get('utm_medium') || (isOrganicSearch ? 'organic' : 'none'),
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

export function trackEvent(eventName, payload = {}) {
  if (typeof window === 'undefined') return;
  const eventPayload = {
    event: eventName,
    ...getTrafficContext(),
    ...payload,
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventPayload);
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  } catch {
    // Analytics should never break UX
  }
}

export function trackPropertyView(pg) {
  if (!pg) return;
  trackEvent('view_item', {
    item_id: String(pg.id || pg.slug || ''),
    item_name: pg.title,
    item_category: pg.genderType || 'PG',
    item_category2: pg.city || '',
    price: Number(pg.priceTriple || pg.priceDouble || pg.priceSingle || pg.price || 0),
    currency: 'INR',
  });
}

export function trackSearch(query, filters = {}) {
  trackEvent('search', {
    search_term: query || 'all',
    gender_filter: filters.gender || 'ALL',
    sharing_filter: filters.sharing || 'ALL',
    max_price: filters.maxPrice || '',
  });
}

export function trackLeadSubmission({ pgId, pgTitle, city, source = 'property_inquiry' }) {
  trackEvent('generate_lead', {
    lead_source: source,
    pg_id: pgId ? String(pgId) : undefined,
    pg_title: pgTitle || undefined,
    city: city || undefined,
    currency: 'INR',
  });
}

export function trackContactClick(channel, pg = null) {
  trackEvent('contact_click', {
    contact_channel: channel,
    pg_id: pg?.id ? String(pg.id) : undefined,
    pg_title: pg?.title || undefined,
    city: pg?.city || undefined,
  });
}
