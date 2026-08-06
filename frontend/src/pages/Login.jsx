import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

export default function Login() {
  const [role, setRole] = useState('brand'); // 'brand' or 'creator'
  const isBrand = role === 'brand';

  return (
    <div className={`min-h-screen transition-colors duration-700 flex items-center justify-center p-4 relative overflow-hidden ${
      isBrand ? 'bg-slate-100 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>

      {/* BACKGROUND DUAL SEAM SPLIT OVERLAY */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-700"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl transition-all duration-700"></div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-6">

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 font-black text-2xl tracking-tight transition hover:scale-105">
            <Sparkles className={`w-7 h-7 ${isBrand ? 'text-blue-600' : 'text-red-500'}`} />
            <span className={isBrand ? 'text-slate-900' : 'text-white'}>SponserForge</span>
          </Link>
          <p className={isBrand ? 'text-slate-500 text-xs font-medium' : 'text-zinc-400 text-xs font-medium'}>
            {isBrand ? 'Corporate Sponsorship Portal for Enterprise Brands' : 'Flashy Sponsorship Realm for Content Creators'}
          </p>
        </div>

        {/* CARD CONTAINER WITH DYNAMIC ROLE THEME */}
        <div className={`rounded-3xl p-8 shadow-2xl border transition-all duration-500 space-y-6 ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/10'
            : 'bg-zinc-900/90 border-red-500/30 shadow-red-950/50 animate-pulse-red-glow'
        }`}>

          {/* DUAL ROLE SWITCHER TABS */}
          <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border transition ${
            isBrand ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                isBrand
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Brand Entity</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('creator')}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                !isBrand
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Creator Node</span>
            </button>
          </div>

          {/* Role Description Badge */}
          <div className={`text-xs p-3.5 rounded-2xl font-semibold flex items-center space-x-2.5 border transition ${
            isBrand
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-red-950/40 text-red-300 border-red-500/30'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isBrand
                ? 'Sign in with Google to launch campaigns & review creator applications.'
                : 'Sign in with Google to view direct offers & submit deliverable work.'}
            </span>
          </div>

          {/* PRIMARY GOOGLE AUTHENTICATION ACTION */}
          <div className="pt-2">
            <GoogleAuthButton
              role={role}
              buttonText={`Sign in as ${isBrand ? 'Brand' : 'Creator'} with Google`}
              isBrand={isBrand}
            />
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs">
            <span className={isBrand ? 'text-slate-500 font-medium' : 'text-zinc-400 font-medium'}>
              Don't have an account?{' '}
            </span>
            <Link
              to={`/signup?role=${role}`}
              className={`font-black hover:underline ${
                isBrand ? 'text-blue-600' : 'text-red-400'
              }`}
            >
              Create Account with Google →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}