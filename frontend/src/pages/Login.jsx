import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCheck, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('brand'); // 'brand' or 'creator'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error || 'Invalid username or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isBrand = role === 'brand';

  return (
    <div className={`min-h-screen transition-colors duration-700 flex items-center justify-center p-4 relative overflow-hidden ${isBrand ? 'bg-slate-100 text-slate-900' : 'bg-zinc-950 text-white'
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
          <p className={isBrand ? 'text-slate-500 text-xs' : 'text-zinc-400 text-xs'}>
            {isBrand ? 'Corporate Sponsorship Portal for Enterprise Brands' : 'Flashy Sponsorship Realm for Content Creators'}
          </p>
        </div>

        {/* CARD CONTAINER WITH DYNAMIC ROLE THEME */}
        <div className={`rounded-3xl p-8 shadow-2xl border transition-all duration-500 space-y-6 ${isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/10'
            : 'bg-zinc-900/90 border-red-500/30 shadow-red-950/50 animate-pulse-red-glow'
          }`}>

          {/* DUAL ROLE SWITCHER TABS */}
          <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border transition ${isBrand ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${isBrand
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
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${!isBrand
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Creator Node</span>
            </button>
          </div>

          {/* Role Description Badge */}
          <div className={`text-xs p-3 rounded-xl font-medium flex items-center space-x-2 border transition ${isBrand
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-red-950/40 text-red-300 border-red-500/30'
            }`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {isBrand
                ? 'Sign in to launch campaigns & review creator applications.'
                : 'Sign in to view direct offers & submit deliverable work.'}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs rounded-xl p-3 text-center font-semibold">
              {error}
            </div>
          )}

          {/* FORM FIELDS */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'
                }`}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-xs transition focus:outline-none focus:ring-2 ${isBrand
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500 placeholder-slate-400'
                    : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500 placeholder-zinc-500'
                  }`}
                placeholder={isBrand ? 'global_brand_agency' : 'tech_visionary_alex'}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'
                }`}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-xs transition focus:outline-none focus:ring-2 ${isBrand
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500 placeholder-slate-400'
                    : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500 placeholder-zinc-500'
                  }`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-95 ${isBrand
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
                }`}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${isBrand ? 'Brand' : 'Creator'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs">
            <span className={isBrand ? 'text-slate-500' : 'text-zinc-400'}>
              Don't have an account?{' '}
            </span>
            <Link
              to={`/signup?role=${role}`}
              className={`font-bold hover:underline ${isBrand ? 'text-blue-600' : 'text-red-400'
                }`}
            >
              Create Account →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}