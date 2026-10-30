"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DIRECTORY_DATA = {
  popular: [
    { title: 'Koramangala', subtitle: 'PGs for Gents & Ladies', query: 'Koramangala' },
    { title: 'HSR Layout', subtitle: 'Techie & Startup Stays', query: 'HSR Layout' },
    { title: 'Indiranagar', subtitle: 'Metro Linked Premium PG', query: 'Indiranagar' },
    { title: 'Whitefield', subtitle: 'Walk to ITPL Tech Park', query: 'Whitefield' },
    { title: 'Electronic City', subtitle: 'Infosys & Wipro Phase 1', query: 'Electronic City' },
    { title: 'Bellandur', subtitle: 'Near RMZ Ecospace', query: 'Bellandur' },
    { title: 'Marathahalli', subtitle: 'Budget & Luxury Sharing', query: 'Marathahalli' },
    { title: 'BTM Layout', subtitle: 'Student & Job Hunter Stays', query: 'BTM Layout' },
    { title: 'Cyber City, Gurgaon', subtitle: 'DLF Phase 2 & 3', query: 'Gurugram' },
    { title: 'Sector 62, Noida', subtitle: 'Institutional Coliving', query: 'Noida' },
    { title: 'Powai, Mumbai', subtitle: 'Hiranandani & IIT', query: 'Powai' },
    { title: 'Hinjewadi, Pune', subtitle: 'Phase 1, 2 & 3 IT Hub', query: 'Hinjewadi' },
    { title: 'HITEC City, Hyderabad', subtitle: 'Madhapur & Kondapur', query: 'Hyderabad' },
    { title: 'Kharadi, Pune', subtitle: 'EON Free Zone Coliving', query: 'Kharadi' },
    { title: 'North Campus, Delhi', subtitle: 'DU Student Hostels', query: 'Delhi' },
    { title: 'South Campus, Delhi', subtitle: 'Satya Niketan Stays', query: 'Delhi' },
  ],
  techparks: [
    { title: 'Manyata Embassy Business Park', subtitle: 'Nagawara, Bengaluru', query: 'Manyata' },
    { title: 'Bagmane Tech Park', subtitle: 'CV Raman Nagar, Bengaluru', query: 'Bagmane' },
    { title: 'International Tech Park (ITPL)', subtitle: 'Whitefield, Bengaluru', query: 'ITPL' },
    { title: 'RMZ Ecospace & Ecoworld', subtitle: 'Outer Ring Road, Bengaluru', query: 'Bellandur' },
    { title: 'DLF Cyber City', subtitle: 'DLF Phase 2, Gurugram', query: 'Gurugram' },
    { title: 'Mindspace Madhapur', subtitle: 'HITEC City, Hyderabad', query: 'Hyderabad' },
    { title: 'EON Free Zone', subtitle: 'Kharadi, Pune', query: 'Kharadi' },
    { title: 'Prestige Tech Park', subtitle: 'Kadubeesanahalli, Bengaluru', query: 'Prestige' },
    { title: 'Embassy TechVillage', subtitle: 'Devarabisanahalli, Bengaluru', query: 'Outer Ring Road' },
    { title: 'Nesco IT Park', subtitle: 'Goregaon East, Mumbai', query: 'Mumbai' },
    { title: 'Magarpatta Cybercity', subtitle: 'Hadapsar, Pune', query: 'Pune' },
    { title: 'Tidel Park', subtitle: 'Tharamani, Chennai', query: 'Chennai' },
  ],
  colleges: [
    { title: 'Christ University', subtitle: 'Hosur Road & Bannerghatta', query: 'Bangalore' },
    { title: 'Delhi University North Campus', subtitle: 'Kamla Nagar & GTB Nagar', query: 'Delhi' },
    { title: 'IIT Bombay', subtitle: 'Powai Lake, Mumbai', query: 'Powai' },
    { title: 'IIT Delhi', subtitle: 'Hauz Khas, New Delhi', query: 'Delhi' },
    { title: 'RV College of Engineering', subtitle: 'Mysore Road, Bengaluru', query: 'Bengaluru' },
    { title: 'Symbiosis International', subtitle: 'Viman Nagar, Pune', query: 'Pune' },
    { title: 'Manipal Academy', subtitle: 'Manipal & Bengaluru', query: 'Bangalore' },
    { title: 'St. Joseph’s University', subtitle: 'Langford Road, Bengaluru', query: 'Bengaluru' },
  ],
  metro: [
    { title: 'Purple Line Bangalore', subtitle: 'Whitefield to Challaghatta', query: 'Bengaluru' },
    { title: 'Green Line Bangalore', subtitle: 'Nagasandra to Silk Institute', query: 'Bengaluru' },
    { title: 'Yellow Line Delhi Metro', subtitle: 'Samaypur Badli to Millennium City', query: 'Delhi' },
    { title: 'Blue Line Delhi Metro', subtitle: 'Dwarka to Noida Electronic City', query: 'Noida' },
    { title: 'Line 1 Mumbai Metro', subtitle: 'Versova-Andheri-Ghatkopar', query: 'Mumbai' },
    { title: 'Red Line Hyderabad Metro', subtitle: 'Miyapur to LB Nagar', query: 'Hyderabad' },
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
          Inspiration for future stays & coliving
        </h2>

        {/* Tab Strip */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar mb-6 text-sm">
          {[
            { id: 'popular', label: 'Popular Localities' },
            { id: 'techparks', label: 'Tech Parks & Hubs' },
            { id: 'colleges', label: 'Colleges & Universities' },
            { id: 'metro', label: 'Metro Corridors' },
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

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
          {displayedItems.map((item, index) => (
            <Link
              key={index}
              href={`/search?query=${encodeURIComponent(item.query)}`}
              className="group block"
            >
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors truncate">
                {item.title}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.subtitle}
              </div>
            </Link>
          ))}
        </div>

        {/* Show More / Show Less */}
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

