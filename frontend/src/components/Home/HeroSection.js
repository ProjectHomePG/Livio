import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';

/**
 * HeroSection component.
 * Premium, vibrant hero with dynamic gradients and a stunning glassmorphism search area.
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40 rounded-[2.5rem] bg-slate-950 text-white shadow-2xl">
      {/* Background Gradients and Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_-10%,rgba(99,102,241,0.25),rgba(2,6,23,1))]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[160px] opacity-20 animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-purple-600 rounded-full blur-[140px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-10 flex flex-col items-center">
        
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 lg:mb-8 leading-tight">
          Find Your Perfect<br/>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
            Paying Guest
          </span>{" "}
          Stay
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Search from thousands of fully-managed co-living spaces, hostels, and rooms near your college, office, metro station, or hospital.
        </p>

        {/* Embedded Search Component - Glassmorphism Wrapper */}
        <div className="w-full max-w-4xl glass-effect p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl">
          <SearchBar />
        </div>

        {/* Quick Suggestion Categories */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-3 text-xs font-bold text-slate-400">
          <span className="mr-2 uppercase tracking-widest text-[10px] text-slate-500">Popular:</span>
          <Link href="/pg-in-bangalore" className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-all shadow-sm">Bangalore</Link>
          <Link href="/pg-in-bangalore/whitefield" className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-all shadow-sm">Whitefield</Link>
          <Link href="/pg-in-hyderabad/gachibowli" className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-all shadow-sm">Gachibowli</Link>
        </div>
      </div>
    </section>
  );
}
