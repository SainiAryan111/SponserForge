import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 text-white font-black text-xl px-3 py-1 rounded-lg">
          SF
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">SponsorForge</h1>
          <p className="text-slate-400 text-xs">Vector Matcher Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-200 text-sm font-medium">{user.username}</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded capitalize">
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-red-400 text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}