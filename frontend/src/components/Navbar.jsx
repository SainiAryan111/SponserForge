import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-slate-850/80 backdrop-blur-md border-b border-slate-700/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition">
        <div className="bg-indigo-600 text-white font-black text-xl px-2.5 py-0.5 rounded-lg shadow-md shadow-indigo-600/20">
          SF
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">SponsorForge</h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Vector Matcher Engine</p>
        </div>
      </Link>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white text-sm font-medium transition"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition duration-200 group"
              title="View Profile"
            >
              <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-200 text-sm font-semibold group-hover:text-white">
                {user.username}
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded capitalize">
                {user.role}
              </span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-red-400 text-sm font-medium transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-semibold transition px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}