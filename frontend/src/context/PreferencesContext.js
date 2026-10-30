"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', rateToInr: 1, region: 'India', isDefault: true },
  { code: 'USD', symbol: '$', label: 'United States Dollar', rateToInr: 86.5, region: 'North America' },
  { code: 'EUR', symbol: '€', label: 'Euro', rateToInr: 93.0, region: 'Europe' },
  { code: 'GBP', symbol: '£', label: 'British Pound', rateToInr: 110.0, region: 'United Kingdom' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham', rateToInr: 23.5, region: 'Middle East' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar', rateToInr: 61.5, region: 'North America' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rateToInr: 56.0, region: 'Oceania' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', rateToInr: 64.5, region: 'Asia' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal', rateToInr: 23.0, region: 'Middle East' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', rateToInr: 0.56, region: 'Asia' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc', rateToInr: 97.0, region: 'Europe' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar', rateToInr: 51.0, region: 'Oceania' },
  { code: 'THB', symbol: '฿', label: 'Thai Baht', rateToInr: 2.45, region: 'Asia' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit', rateToInr: 19.5, region: 'Asia' },
  { code: 'QAR', symbol: 'QAR', label: 'Qatari Riyal', rateToInr: 23.7, region: 'Middle East' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won', rateToInr: 0.062, region: 'Asia' },
  { code: 'KWD', symbol: 'KWD', label: 'Kuwaiti Dinar', rateToInr: 280.0, region: 'Middle East' },
  { code: 'OMR', symbol: 'OMR', label: 'Omani Rial', rateToInr: 224.0, region: 'Middle East' },
  { code: 'BHD', symbol: 'BHD', label: 'Bahraini Dinar', rateToInr: 228.0, region: 'Middle East' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar', rateToInr: 11.1, region: 'Asia' },
];

const PreferencesContext = createContext(undefined);

export function PreferencesProvider({ children }) {
  const [showTotalBeforeTax, setShowTotalBeforeTax] = useState(false);
  // Default currency is Indian Rupee (INR - ₹)
  const [currency, setCurrency] = useState('INR');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('stays'); // 'stays' | 'experiences'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [userCoords, setUserCoords] = useState(null);
  const [isMapView, setIsMapView] = useState(false);

  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    sharing: 'ALL',
    gender: 'ALL',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    amenities: [],
  });

  // Load preferences from localStorage on mount (Default to INR)
  useEffect(() => {
    try {
      const savedTaxPref = localStorage.getItem('livio_show_total_tax');
      if (savedTaxPref !== null) {
        setShowTotalBeforeTax(savedTaxPref === 'true');
      }
      const savedCurrency = localStorage.getItem('livio_currency');
      if (savedCurrency && CURRENCIES.some((c) => c.code === savedCurrency)) {
        setCurrency(savedCurrency);
      } else {
        setCurrency('INR');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleShowTotalBeforeTax = () => {
    setShowTotalBeforeTax((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('livio_show_total_tax', String(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleMapView = () => {
    setIsMapView((prev) => !prev);
  };

  const changeCurrency = (curr) => {
    if (CURRENCIES.some((c) => c.code === curr)) {
      setCurrency(curr);
      try {
        localStorage.setItem('livio_currency', curr);
      } catch (e) {}
    }
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatPrice = (amountInInr) => {
    if (!amountInInr) return '0';
    let numeric = Number(amountInInr);
    if (showTotalBeforeTax) {
      // Standard total with 12% GST / maintenance included
      numeric = Math.round(numeric * 1.12);
    }

    const currObj = currentCurrency;
    if (currObj.code === 'INR') {
      return `₹${Math.round(numeric).toLocaleString('en-IN')}`;
    }

    const converted = Math.round(numeric / currObj.rateToInr);
    const prefix = currObj.symbol.length > 2 ? `${currObj.symbol} ` : currObj.symbol;
    return `${prefix}${converted.toLocaleString('en-US')}`;
  };

  return (
    <PreferencesContext.Provider
      value={{
        showTotalBeforeTax,
        toggleShowTotalBeforeTax,
        currency,
        currentCurrency,
        currencies: CURRENCIES,
        changeCurrency,
        isCurrencyModalOpen,
        setIsCurrencyModalOpen,
        formatPrice,
        activeNavTab,
        setActiveNavTab,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        selectedLocation,
        setSelectedLocation,
        userCoords,
        setUserCoords,
        searchParams,
        setSearchParams,
        isMapView,
        setIsMapView,
        toggleMapView,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    return {
      showTotalBeforeTax: false,
      toggleShowTotalBeforeTax: () => {},
      currency: 'INR',
      currentCurrency: CURRENCIES[0],
      currencies: CURRENCIES,
      changeCurrency: () => {},
      isCurrencyModalOpen: false,
      setIsCurrencyModalOpen: () => {},
      formatPrice: (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`,
      activeNavTab: 'stays',
      setActiveNavTab: () => {},
      isFilterModalOpen: false,
      setIsFilterModalOpen: () => {},
      isSearchModalOpen: false,
      setIsSearchModalOpen: () => {},
      selectedLocation: 'all',
      setSelectedLocation: () => {},
      userCoords: null,
      setUserCoords: () => {},
      searchParams: {},
      setSearchParams: () => {},
      isMapView: false,
      setIsMapView: () => {},
      toggleMapView: () => {},
    };
  }
  return ctx;
}
