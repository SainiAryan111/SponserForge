import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Target, Briefcase, ExternalLink, CheckCircle, Edit3 } from 'lucide-react';

export default function CreatorHome() {
  const [profile, setProfile] = useState(null);
  const [matchedCampaigns, setMatchedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch creator profile and matched campaigns using stored JWT token
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access');
      if (!token) return;

      try {
        // 1. Fetch Creator Profile
        const profileRes = await fetch('http://127.0.0.1:8000/api/creator/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);

          // 2. Fetch Matched Campaigns for this creator ID
          if (profileData.id) {
            const campaignRes = await fetch(`http://127.0.0.1:8000/api/creator/match-campaigns/${profileData.id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (campaignRes.ok) {
              const campaignData = await campaignRes.json();
              setMatchedCampaigns(campaignData.matched_campaigns || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar / Profile Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
              {profile?.username ? profile.username[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">@{profile?.username || 'Creator'}</h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium uppercase">
                  {profile?.primary_platform || 'Platform'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{profile?.niche || 'Niche not set'} • {profile?.subscriber_count?.toLocaleString() || 0} Followers</p>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs font-medium">Engagement Rate</span>
            <div className="text-2xl font-bold text-white mt-1">{profile?.engagement_rate || 0}%</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs font-medium">Active Opportunities</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{matchedCampaigns.length}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs font-medium">AI Match Readiness</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-5 h-5" /> Active
            </div>
          </div>
        </div>

        {/* AI Campaign Matches Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Recommended Campaigns
            </h2>
            <span className="text-xs text-slate-500">Based on your vector profile & niche</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading AI matches...</div>
          ) : matchedCampaigns.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <p>No active campaign matches found for your profile niche yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchedCampaigns.map((camp) => (
                <div key={camp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">Brand: @{camp.brand_username}</span>
                        <h3 className="font-bold text-xl text-white mt-0.5">{camp.title}</h3>
                      </div>
                      {camp.similarity_score && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-mono">
                          {(camp.similarity_score * 100).toFixed(0)}% match
                        </div>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">{camp.description}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Est. Budget</span>
                      <span className="text-lg font-bold text-white">${Number(camp.budget).toLocaleString()}</span>
                    </div>

                    <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}