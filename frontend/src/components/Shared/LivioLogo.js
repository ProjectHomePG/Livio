"use client";

import React, { useId } from 'react';

export default function LivioLogo({
  className = "w-8 h-8 sm:w-9 sm:h-9",
  showWordmark = true,
  showTagline = true,
}) {
  const id = useId();
  const gradientId = `livio-logo-grad-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 select-none group">
      {/* Livio Icon Symbol */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF385C" />
            <stop offset="50%" stopColor="#E00B41" />
            <stop offset="100%" stopColor="#D70466" />
          </linearGradient>
        </defs>

        {/* House / Pin / Heart Interlocking Glyph */}
        <path
          d="M20 4.5L6.5 15.5C5.5 16.3 5 17.5 5 18.8V31C5 33.2 6.8 35 9 35H31C33.2 35 35 33.2 35 31V18.8C35 17.5 34.5 16.3 33.5 15.5L20 4.5Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 14C17.2 14 15 16.2 15 19C15 22.8 20 27 20 27C20 27 25 22.8 25 19C25 16.2 22.8 14 20 14Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="20" cy="19" r="2" fill="#ffffff" />
      </svg>

      {/* Brand Name & Tagline */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-heading leading-none">
              Livio
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 ml-0.5 inline-block" />
          </div>
          {showTagline && (
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.22em] text-primary-500 dark:text-rose-400 mt-0.5 sm:mt-1 leading-none font-sans whitespace-nowrap">
              PG Near Me
            </span>
          )}
        </div>
      )}
    </div>
  );
}
