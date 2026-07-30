import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Building2, UserCheck, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-8">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>The AI-Powered Marketplace for Brands & Creators</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
        Sponsor deals forged seamlessly.
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
        Connect top brands with high-engagement content creators. Launch targeted campaigns or match with sponsor briefs tailored to your niche.
      </p>

      {/* Primary CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
        <Link
          to="/signup"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/deck"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-indigo-400 font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>View Startup Deck</span>
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition-all duration-200"
        >
          Sign In
        </Link>
      </div>

      {/* Value Prop Cards */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl text-left">
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">For Brand Entities</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Post campaign briefs, target precise niches, set audience criteria, and connect directly with vetted creators.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit text-indigo-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">For Creator Nodes</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Showcase your audience metrics, submit pitches, and secure sponsorships with brands looking for your specific audience.
          </p>
        </div>
      </div>

    </div>
  );
}