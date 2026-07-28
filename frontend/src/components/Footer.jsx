import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Copyright */}
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="font-extrabold text-lg text-white">SponsorForge</span>
          <span className="text-xs text-slate-500 pl-2">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}