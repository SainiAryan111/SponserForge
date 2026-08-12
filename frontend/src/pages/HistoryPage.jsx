import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getApplications, getCampaigns } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import { ArrowLeft, History as HistoryIcon, Filter, Building2, Zap, Flame } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isBrand = user?.role === 'brand';

  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  const fetchData = async () => {
    try {
      const [appsRes, campaignsRes] = await Promise.all([
        getApplications(),
        getCampaigns(),
      ]);
      setApplications(appsRes.data || []);
      setCampaigns(campaignsRes.data || []);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const isExpired = app.status === 'expired' ||
      (app.status === 'accepted' && app.submission_deadline && new Date(app.submission_deadline) < new Date() && (!app.submission_link || !app.submission_link.trim())) ||
      (app.status === 'offered' && app.submission_deadline && new Date(app.submission_deadline) < new Date()) ||
      (app.status === 'rejected' && (!app.submission_link || !app.submission_link.trim()) && (app.work_description || app.submission_deadline));

    if (filterTab === 'all') return true;
    if (filterTab === 'offered') return app.status === 'offered' && !isExpired;
    if (filterTab === 'applied' || filterTab === 'requested') return app.status === 'pending';
    if (filterTab === 'accepted') return app.status === 'accepted' && !isExpired;
    if (filterTab === 'submitted') return app.status === 'submitted';
    if (filterTab === 'successful') return app.status === 'completed';
    if (filterTab === 'expired') return isExpired;
    if (filterTab === 'rejected') return app.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-black text-base ${
        isBrand ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-zinc-200'
      }`}>
        <span>Loading Campaign & Deal History...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 sm:p-8 space-y-6 ${
      isBrand ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center space-x-2 text-xs sm:text-sm font-black transition cursor-pointer ${
            isBrand ? 'text-slate-700 hover:text-slate-950' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* HEADER BAR */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/5'
            : 'bg-zinc-900/90 border-red-500/30 shadow-2xl shadow-red-950/50 animate-pulse-red-glow'
        }`}>
          <div className="space-y-2">
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              isBrand ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-red-950/80 text-red-200 border border-red-500/40'
            }`}>
              {isBrand ? <Building2 className="w-4 h-4" /> : <Flame className="w-4 h-4 text-red-500" />}
              <span>{isBrand ? 'Enterprise Campaign Log' : 'Creator Deal Ledger'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Campaign & Deal History
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
              Comprehensive history log of all {isBrand ? 'brand offers, payouts, and completed creator sponsorships' : 'applied, offered, and completed deliverable deals'}.
            </p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className={`rounded-2xl p-2 border flex flex-wrap items-center gap-2 text-xs sm:text-sm font-black ${
          isBrand ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <span className={`px-2 flex items-center space-x-1 uppercase text-xs ${
            isBrand ? 'text-slate-600' : 'text-zinc-400'
          }`}>
            <Filter className="w-4 h-4" />
            <span>Filter Stage:</span>
          </span>

          {[
            { key: 'all', label: 'All Deals' },
            { key: 'offered', label: 'Direct Offers' },
            { key: isBrand ? 'requested' : 'applied', label: isBrand ? 'Pending Requests' : 'My Applications' },
            { key: 'accepted', label: 'In Progress' },
            { key: 'submitted', label: 'In Review' },
            { key: 'successful', label: 'Completed' },
            { key: 'expired', label: 'Expired' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterTab === tab.key
                  ? isBrand ? 'bg-blue-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md'
                  : isBrand ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* APPLICATIONS LIST */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className={`rounded-3xl p-8 text-center text-xs sm:text-sm font-bold border ${
              isBrand ? 'bg-white border-blue-200 text-slate-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              No historical deals found in this category.
            </div>
          ) : (
            filteredApplications.map((app) => (
              <ApplicationActionCard
                key={app.id}
                application={app}
                userRole={isBrand ? 'brand' : 'creator'}
                onUpdate={fetchData}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
