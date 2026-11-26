"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DIRECTORY_DATA = {
  popular: [
    { title: 'Whitefield', subtitle: 'ITPL & EPIP Zone, Bangalore', href: '/pg-in-bangalore/whitefield' },
    { title: 'Koramangala', subtitle: 'Startups & Christ University', href: '/pg-in-bangalore/koramangala' },
    { title: 'Indiranagar', subtitle: 'Purple Line Metro, Bangalore', href: '/pg-in-bangalore/indiranagar' },
    { title: 'Electronic City', subtitle: 'Phase 1 & 2, Bangalore', href: '/pg-in-bangalore/electronic-city' },
    { title: 'Bellandur', subtitle: 'Outer Ring Road, Bangalore', href: '/pg-in-bangalore/bellandur' },
    { title: 'Gachibowli', subtitle: 'Financial District, Hyderabad', href: '/pg-in-hyderabad/gachibowli' },
    { title: 'Madhapur', subtitle: 'Mindspace & Ayyappa Society', href: '/pg-in-hyderabad/madhapur' },
    { title: 'HITEC City', subtitle: 'Cyberabad Tech Hub', href: '/pg-in-hyderabad/hitec-city' },
    { title: 'Kharadi', subtitle: 'EON Free Zone, Pune', href: '/pg-in-pune/kharadi' },
    { title: 'Hinjewadi', subtitle: 'IT Park Phases 1-3, Pune', href: '/pg-in-pune/hinjewadi' },
    { title: 'Powai', subtitle: 'IIT Bombay & Hiranandani', href: '/pg-in-mumbai/powai' },
    { title: 'Andheri', subtitle: 'MIDC & Metro Line 1, Mumbai', href: '/pg-in-mumbai/andheri' },
    { title: 'Sector 62', subtitle: 'IT & Institutional Hub, Noida', href: '/pg-in-noida/sector-62' },
    { title: 'Golf Course Road', subtitle: 'Rapid Metro, Gurgaon', href: '/pg-in-gurgaon/golf-course-road' },
    { title: 'Perungudi', subtitle: 'OMR IT Corridor, Chennai', href: '/pg-in-chennai/perungudi' },
    { title: 'New Town', subtitle: 'IT & Coliving Hub, Kolkata', href: '/pg-in-kolkata/new-town' },
  ],
  cities: [
    { title: 'PG in Bangalore', subtitle: 'Whitefield, Koramangala, Indiranagar', href: '/pg-in-bangalore' },
    { title: 'PG in Hyderabad', subtitle: 'Gachibowli, Madhapur, HITEC City', href: '/pg-in-hyderabad' },
    { title: 'PG in Pune', subtitle: 'Kharadi, Wakad, Hinjewadi, Pimpri', href: '/pg-in-pune' },
    { title: 'PG in Mumbai', subtitle: 'Andheri, Powai, Bandra, Thane', href: '/pg-in-mumbai' },
    { title: 'PG in Delhi', subtitle: 'Rohini, Dwarka, Lajpat Nagar, Karol Bagh', href: '/pg-in-delhi' },
    { title: 'PG in Noida', subtitle: 'Sector 62, Sector 63, Sector 126', href: '/pg-in-noida' },
    { title: 'PG in Gurgaon', subtitle: 'DLF Phase 1-3, Golf Course Road', href: '/pg-in-gurgaon' },
    { title: 'PG in Chennai', subtitle: 'OMR, Perungudi, Velachery, Guindy', href: '/pg-in-chennai' },
    { title: 'PG in Kolkata', subtitle: 'New Town, Salt Lake Sector V', href: '/pg-in-kolkata' },
    { title: 'PG in Jaipur', subtitle: 'Mansarovar, Malviya Nagar, Jagatpura', href: '/pg-in-jaipur' },
    { title: 'PG in Ahmedabad', subtitle: 'Prahlad Nagar, Navrangpura, Vastrapur', href: '/pg-in-ahmedabad' },
    { title: 'PG in Indore', subtitle: 'Vijay Nagar, Bhawarkua, Rau', href: '/pg-in-indore' },
    { title: 'PG in Kochi', subtitle: 'Kakkanad, Edappally, Ernakulam', href: '/pg-in-kochi' },
    { title: 'PG in Nagpur', subtitle: 'Dharampeth & Central Nagpur', href: '/pg-in-nagpur' },
  ],
  categories: [
    { title: 'Boys PG Near Me', subtitle: 'Gents hostels & shared rooms', href: '/boys-pg' },
    { title: 'Girls PG Near Me', subtitle: 'Ladies hostels & women PGs', href: '/girls-pg' },
    { title: 'Coliving PG', subtitle: 'Managed unisex co-living spaces', href: '/coliving-pg' },
    { title: 'Student PG', subtitle: 'Near campuses & coaching hubs', href: '/student-pg' },
    { title: 'Working Professionals PG', subtitle: 'Near IT parks & metro lines', href: '/working-professionals-pg' },
    { title: 'Single Sharing PG', subtitle: 'Private occupancy PG rooms', href: '/single-sharing-pg' },
    { title: 'PG Under ₹8,000', subtitle: 'Budget sharing accommodations', href: '/pg-under-8000' },
    { title: 'PG Under ₹10,000', subtitle: 'Affordable stays across India', href: '/pg-under-10000' },
    { title: 'PG Under ₹15,000', subtitle: 'Single, double & coliving rooms', href: '/pg-under-15000' },
    { title: 'All India PG Directory', subtitle: 'Compare 1,600+ stays nationwide', href: '/pg-in-india' },
  ],
  guides: [
    { title: 'Find Affordable PG in India', subtitle: 'Zero-brokerage search tips', href: '/blog/how-to-find-affordable-pg-in-india' },
    { title: 'PG vs Hostel vs Coliving', subtitle: 'Cost & privacy comparison', href: '/blog/pg-vs-hostel-vs-coliving' },
    { title: 'Best PG Areas in Bangalore', subtitle: 'Tech park & metro commute guide', href: '/blog/best-pg-areas-in-bangalore' },
    { title: 'Hyderabad PG Rent Guide', subtitle: 'Gachibowli & Madhapur insights', href: '/blog/pg-rent-guide-in-hyderabad' },
    { title: 'Safe Girls PG Checklist', subtitle: '10-point safety evaluation', href: '/blog/how-to-choose-safe-girls-pg' },
    { title: 'Before Booking a PG', subtitle: '12 things to inspect in person', href: '/blog/things-to-check-before-booking-pg' },
  ],
};

export default function InspirationFooter() {
  const [activeTab, setActiveTab] = useState('popular');
  const [isExpanded, setIsExpanded] = useState(false);

  const currentItems = DIRECTORY_DATA[activeTab] || DIRECTORY_DATA.popular;
  const displayedItems = isExpanded ? currentItems : currentItems.slice(0, 12);

  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Explore PG Stays by Locality, City &amp; Category
        </h2>

        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar mb-6 text-sm">
          {[
            { id: 'popular', label: 'Popular Localities' },
            { id: 'cities', label: 'Top Cities' },
            { id: 'categories', label: 'Categories & Budgets' },
            { id: 'guides', label: 'Accommodation Guides' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setIsExpanded(false);
              }}
              className={`pb-3 font-semibold transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
          {displayedItems.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors truncate">
                {item.title}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.subtitle}
              </div>
            </Link>
          ))}
        </div>

        {currentItems.length > 12 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white underline hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>{isExpanded ? 'Show less' : 'Show more'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
