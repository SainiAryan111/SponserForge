import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              BrandConnect
            </span>
            <span className="text-xs text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}