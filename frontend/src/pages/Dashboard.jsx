import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CampaignMatchModal from '../components/CampaignMatchModal';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Plus, Target, DollarSign, Globe } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('campaigns/');
      setCampaigns(response.data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900/50 via-slate-800 to-slate-800 border border-slate-700 p-8 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Active Campaigns</h2>
            <p className="text-slate-400 text-sm mt-1">
              Run vector similarity matching to connect campaigns with optimal creators.
            </p>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-12 text-center rounded-2xl">
            <p className="text-slate-400">No active campaigns found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div 
                key={camp.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-6 flex flex-col justify-between transition shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-500/20">
                      {camp.target_niche}
                    </span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      ${camp.budget?.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-1">{camp.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3">{camp.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-700/50 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 capitalize">
                    Platform: {camp.target_platform}
                  </span>
                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Creator Matches</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Matching Modal */}
      {selectedCampaign && (
        <CampaignMatchModal 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)} 
        />
      )}
    </div>
  );
}