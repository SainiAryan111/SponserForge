import React from 'react';
import { Target, Users, Cpu } from 'lucide-react';

export default function BrandDashboard() {
  return (
    <div className="space-y-8">
      <div className="border-l-4 border-indigo-500 pl-4 py-1">
        <h2 className="text-2xl font-extrabold tracking-tight">Brand Campaign Manager</h2>
        <p className="text-slate-400 text-sm">Deploy sponsorship targets and search the K-Means matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit rounded-lg"><Target size={22} /></div>
          <h3 className="font-bold text-lg">Active Allocations</h3>
          <p className="text-3xl font-black text-white">$45,200</p>
        </div>
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 w-fit rounded-lg"><Users size={22} /></div>
          <h3 className="font-bold text-lg">Target Influencers Checked</h3>
          <p className="text-3xl font-black text-white">142</p>
        </div>
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
          <div className="p-3 bg-purple-500/10 text-purple-400 w-fit rounded-lg"><Cpu size={22} /></div>
          <h3 className="font-bold text-lg">KNN Lookalikes Retrieved</h3>
          <p className="text-3xl font-black text-white">18 Profiles</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-indigo-400 flex items-center gap-2">🛒 Launch Targeted Scikit-Learn Query</h3>
        <div className="flex gap-4">
          <input type="text" placeholder="Enter ideal tags for clustering analysis (e.g., #tech, #lifestyle)..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          <button className="bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-xl text-sm transition">Execute Pipeline Match</button>
        </div>
      </div>
    </div>
  );
}