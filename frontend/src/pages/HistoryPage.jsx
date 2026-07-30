import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getApplications, getCampaigns } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import { ArrowLeft, History as HistoryIcon, Filter } from 'lucide-react';

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

  // Creator tabs: all, offered, applied (pending), successful (completed), rejected
  // Brand tabs: all, offered, requested (pending), accepted, ready for payout (submitted)
  const filteredApplications = applications.filter((app) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'offered') return app.status === 'offered';
    if (filterTab === 'applied' || filterTab === 'requested') return app.status === 'pending';
    if (filterTab === 'accepted') return app.status === 'accepted';
    if (filterTab === 'submitted') return app.status === 'submitted';
    if (filterTab === 'successful') return app.status === 'completed';
    if (filterTab === 'rejected') return app.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 font-medium transition cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl border border-indigo-500/30">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Campaign & Deal History</h1>
            <p className="text-slate-400 text-sm">
              Comprehensive log of all {isBrand ? 'brand offers, requests, & payouts' : 'applied, offered, & completed deals'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <span className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mr-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          Filter:
        </span>

        {isBrand ? (
          <>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Records ({applications.length})
            </button>
            <button
              onClick={() => setFilterTab('offered')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'offered' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Offered ({applications.filter(a => a.status === 'offered').length})
            </button>
            <button
              onClick={() => setFilterTab('requested')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'requested' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Requested ({applications.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterTab('accepted')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'accepted' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Accepted ({applications.filter(a => a.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilterTab('submitted')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'submitted' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Ready for Payout ({applications.filter(a => a.status === 'submitted').length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Records ({applications.length})
            </button>
            <button
              onClick={() => setFilterTab('offered')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'offered' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Offered ({applications.filter(a => a.status === 'offered').length})
            </button>
            <button
              onClick={() => setFilterTab('applied')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'applied' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Applied ({applications.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterTab('successful')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'successful' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Successful ({applications.filter(a => a.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterTab('rejected')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTab === 'rejected' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </>
        )}
      </div>

      {/* Application Cards Feed */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-base">No campaign records found in this category.</p>
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
  );
}
