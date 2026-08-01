import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, 
  Building2, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Mail, 
  Send, 
  CheckCircle2, 
  Globe, 
  Terminal, 
  Cpu,
  Flame,
  CheckCircle
} from 'lucide-react';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="relative bg-slate-950 text-white border-t border-slate-800/80 overflow-hidden mt-auto">
      
      {/* SEAMLESS BLENDED BACKGROUND GLOW ORBS */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. UNIFIED 4-COLUMN FOOTER GRID */}
      <div className="max-w-7xl mx-auto p-8 sm:p-14 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* COLUMN 1: PLATFORM OVERVIEW */}
        <div className="space-y-4">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:scale-105 transition inline-block">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white flex items-center justify-center font-black text-base shadow-lg">
              SF
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-purple-300 to-red-400 bg-clip-text text-transparent block">
                SponserForge
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-300 block">
                Sponsorship Marketplace
              </span>
            </div>
          </Link>

          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            The simple, modern marketplace connecting brands and content creators through smart AI matching, clear submission deadlines, and secure points payment protection.
          </p>

          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Points Escrow Protection</span>
          </div>
        </div>

        {/* COLUMN 2: FOR BRANDS */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-blue-400 font-black text-xs sm:text-sm uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>For Brands</span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm font-bold text-slate-200">
            <li>
              <Link to={user ? (user.role === 'brand' ? "/campaign/create" : "/dashboard") : "/signup?role=brand"} className="hover:text-blue-300 transition flex items-center space-x-1 text-blue-400">
                <span>Create Brand Campaign</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </li>
            <li>
              <Link to={user ? "/search" : "/login"} className="hover:text-blue-300 transition">Browse Creators</Link>
            </li>
            <li>
              <Link to={user ? "/dashboard" : "/login"} className="hover:text-blue-300 transition">Brand Sign In</Link>
            </li>
            <li className="text-slate-400 pt-1 text-xs font-semibold">
              Features: Smart AI Match • Clear Deadlines • Verified Ratings
            </li>
          </ul>
        </div>

        {/* COLUMN 3: FOR CREATORS */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-current" />
            <span>For Creators</span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm font-bold text-slate-200">
            <li>
              <Link to={user ? "/dashboard" : "/signup?role=creator"} className="hover:text-red-300 transition flex items-center space-x-1 text-red-400">
                <span>Join as Creator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </li>
            <li>
              <Link to={user ? "/portfolio" : "/login"} className="hover:text-red-300 transition">My Work Portfolio</Link>
            </li>
            <li>
              <Link to={user ? "/dashboard" : "/login"} className="hover:text-red-300 transition">Creator Sign In</Link>
            </li>
            <li className="text-slate-400 pt-1 text-xs font-semibold">
              Features: Fast Payouts • Direct Offers • 5-Star Reviews
            </li>
          </ul>
        </div>

        {/* COLUMN 4: PLATFORM FEATURES */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-purple-400 font-black text-xs sm:text-sm uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Platform Features</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs sm:text-sm font-bold">
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Matching:</span>
              <strong className="text-indigo-300 font-extrabold">Smart AI Matching</strong>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Security:</span>
              <strong className="text-emerald-400 font-extrabold">Points Protected</strong>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Deadlines:</span>
              <strong className="text-amber-300 font-extrabold">Real-Time Timers</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 2. NEWSLETTER SUBSCRIPTION STRIP */}
      <div className="bg-slate-900/90 border-t border-b border-slate-800/80 py-8 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center justify-center sm:justify-start space-x-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Subscribe for Instant Sponsorship Updates</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Get notified when new brand campaigns or top creators join.</p>
          </div>

          <form onSubmit={handleSubscribe} className="flex items-center w-full sm:w-auto space-x-2">
            {subscribed ? (
              <div className="bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl border border-emerald-500/40 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Subscribed Successfully!</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 font-medium"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:opacity-90 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/20 flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Subscribe</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* 3. BOTTOM BAR */}
      <div className="bg-slate-950 py-5 px-6 text-xs sm:text-sm text-slate-300 font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white">SponserForge</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6 text-xs font-bold">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>All Systems Active</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300">Secure Points Protection</span>
        </div>
      </div>

    </footer>
  );
}