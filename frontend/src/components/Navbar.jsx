import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Search, History, Sparkles, Building2, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { resolveImageUrl } from '../utils/imageUtils';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const isBrand = user?.role === 'brand';
  const isCreator = user?.role === 'creator';

  return (
    <>
      <nav className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between backdrop-blur-md transition-colors duration-500 border-b ${
        isBrand
          ? 'bg-white/95 border-blue-200 text-slate-900 shadow-sm'
          : isCreator
          ? 'bg-zinc-950/95 border-red-500/30 text-white shadow-lg shadow-red-950/20'
          : 'bg-slate-950/95 border-slate-800 text-white'
      }`}>
        {/* Brand / Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:scale-105 transition">
          <div className={`font-black text-xl px-3 py-1 rounded-xl shadow-md flex items-center justify-center ${
            isBrand
              ? 'bg-blue-600 text-white shadow-blue-600/30'
              : isCreator
              ? 'bg-red-600 text-white shadow-red-600/40 animate-pulse-red-glow'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white'
          }`}>
            SF
          </div>
          <div>
            <h1 className={`font-black text-lg leading-tight ${
              isBrand ? 'text-slate-900' : 'text-white'
            }`}>
              SponserForge
            </h1>
            <p className={`text-xs uppercase tracking-wider font-black ${
              isBrand ? 'text-blue-700' : isCreator ? 'text-red-400' : 'text-purple-300'
            }`}>
              {isBrand ? 'Brand Hub' : isCreator ? 'Creator Hub' : 'Sponsorship Marketplace'}
            </p>
          </div>
        </Link>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <>
              <Link
                to="/search"
                className={`flex items-center space-x-1.5 text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl transition border ${
                  isBrand
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-800'
                }`}
                title="Search Directory"
              >
                <Search className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                <span className="hidden md:inline">Directory</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center space-x-1.5 text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl transition ${
                  isBrand
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
                title="History"
              >
                <History className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                <span className="hidden sm:inline">History</span>
              </Link>

              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl transition ${
                  isBrand
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border transition ${
                  isBrand
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-slate-950'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-red-500/40 text-white'
                }`}
              >
                {resolveImageUrl(user?.logo_url || user?.avatar_url) ? (
                  <img
                    src={resolveImageUrl(user?.logo_url || user?.avatar_url)}
                    alt={user.username}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                )}
                <span className="text-xs sm:text-sm font-black hidden md:inline">{isCreator ? (user.name || user.username) : (isBrand ? (user.company_name || user.username) : user.username)}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  isBrand ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-red-950 text-red-200 border-red-500/40'
                }`}>
                  {user.role}
                </span>
              </Link>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isBrand
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-black text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:opacity-90 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* CONFIRM LOGOUT ALERT BOX */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Sign Out"
        message={`Are you sure you want to sign out of your account (@${user?.username})?`}
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}