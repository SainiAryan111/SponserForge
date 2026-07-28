import React from 'react';

export default function CreatorDashboard() {
  return (
    <div className="space-y-8">
      <div className="border-l-4 border-cyan-500 pl-4 py-1">
        <h2 className="text-2xl font-extrabold tracking-tight">Creator Metrics Console</h2>
        <p className="text-slate-400 text-sm">Audit your content tag profile clustering and pending offers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Your Mathematical Profile Placement</h3>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">K-Means Cluster Assignment</span>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono px-2 py-0.5 rounded">CLUSTER_NODE_03</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}