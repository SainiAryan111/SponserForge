import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, getCampaignsForCreator, getApplications, applyToCampaign } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignCountdown from '../components/CampaignCountdown';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import { Star, Zap, Search, ShieldCheck, Sparkles, Send, Flame } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUtils';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matchedCampaigns, setMatchedCampaigns] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Pitch Apply State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedDetailCampaign, setSelectedDetailCampaign] = useState(null);
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const filteredApplications = myApplications.filter((app) => {
    const isExpired = app.status === 'expired' ||
      (app.status === 'accepted' && app.submission_deadline && new Date(app.submission_deadline) < new Date() && (!app.submission_link || !app.submission_link.trim())) ||
      (app.status === 'rejected' && (!app.submission_link || !app.submission_link.trim()) && (app.work_description || app.submission_deadline));

    if (activeTab === 'active') return app.status !== 'completed' && app.status !== 'rejected' && !isExpired;
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'offered') return app.status === 'offered' && !isExpired;
    if (activeTab === 'accepted') return app.status === 'accepted' && !isExpired;
    if (activeTab === 'submitted') return app.status === 'submitted';
    if (activeTab === 'completed') return app.status === 'completed';
    if (activeTab === 'rejected') return app.status === 'rejected';
    if (activeTab === 'expired') return isExpired;
    return true;
  });

  const fetchData = async () => {
    try {
      const profileRes = await getUserProfile();
      const userProfile = profileRes.data;
      setProfile(userProfile);

      const [campaignsRes, appsRes] = await Promise.all([
        getCampaignsForCreator(userProfile.id),
        getApplications(),
      ]);

      setMatchedCampaigns(campaignsRes.data.matched_campaigns || []);
      setMyApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load creator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setApplying(true);

    try {
      await applyToCampaign(selectedCampaign.id, pitch);
      setSelectedCampaign(null);
      setPitch('');
      fetchData(); // Refresh matches & application pipeline
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-bold">
        <div className="flex items-center space-x-3 bg-zinc-900 p-6 rounded-2xl border border-red-500/40 shadow-2xl shadow-red-950/50 animate-pulse">
          <Zap className="w-6 h-6 text-red-500 animate-spin" />
          <span>Loading Creator Realm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 space-y-8">

      {/* 1. CREATOR HEADER & BALANCE (Flashy Red & Black Theme) */}
      <header className="bg-zinc-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden animate-pulse-red-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-red-950/80 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Creator Dashboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center space-x-3">
            {resolveImageUrl(profile?.avatar_url) ? (
              <img
                src={resolveImageUrl(profile.avatar_url)}
                alt={profile?.name || profile?.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-red-500/40 shadow-md shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <span>Welcome back, @{profile?.username}</span>
          </h1>

          <p className="text-zinc-400 text-sm max-w-xl font-medium">
            {profile?.niche?.toUpperCase()} • {profile?.primary_platform} ({profile?.subscriber_count?.toLocaleString() || 0} subscribers)
          </p>
        </div>

        {/* Right Stats Strip */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">

          <Link
            to="/search"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-extrabold px-4 py-3 rounded-2xl border border-zinc-700 transition flex items-center space-x-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-red-400" />
            <span>Directory</span>
          </Link>

          {/* Rating Badge */}
          <div className="bg-zinc-950 border border-amber-500/40 px-4 py-2.5 rounded-2xl text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Rating Score</span>
            <div className="flex items-center justify-center space-x-1 font-black text-amber-300 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{(profile?.total_ratings_count > 0 && profile?.rating != null) ? Number(profile.rating).toFixed(1) : '0.0'}</span>
              <span className="text-[10px] text-zinc-500 font-normal">({profile?.total_ratings_count || 0})</span>
            </div>
          </div>

          {/* Points Balance */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white px-6 py-2.5 rounded-2xl shadow-lg shadow-red-600/40 text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-200 block">Earned Points</span>
            <div className="text-xl font-black">{profile?.points_balance ?? 0} <span className="text-xs font-semibold text-red-200">PTS</span></div>
          </div>

        </div>
      </header>

      {/* 2. RECOMMENDED AI MATCHED CAMPAIGNS FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Recommended Campaigns (AI Smart Match)</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedCampaigns.length === 0 ? (
            <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 space-y-1">
              <p className="font-semibold">No matching campaigns found at this moment.</p>
              <p className="text-xs">Update your profile niche or check back soon!</p>
            </div>
          ) : (
            matchedCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-zinc-900/90 border border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4 hover:border-red-500 transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl group-hover:scale-125 transition pointer-events-none"></div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="bg-red-950/80 text-red-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-red-500/40">
                        {campaign.target_niche} • {campaign.target_platform}
                      </span>
                      <CampaignCountdown
                        startDatetime={campaign.start_datetime}
                        endDatetime={campaign.end_datetime}
                        status={campaign.status}
                        variant="badge"
                        theme="creator"
                      />
                    </div>

                    <div className="text-xs font-bold text-red-400 pt-1">
                      🏢 Sponsor: <strong>{campaign.brand_name || campaign.brand_username}</strong>
                    </div>

                    <h3
                      className="font-black text-white text-base sm:text-lg hover:text-red-400 transition cursor-pointer line-clamp-1"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      {campaign.title}
                    </h3>
                  </div>

                  {/* PROMINENT SQUARE MATCH % BOX */}
                  <div className="bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 flex flex-col items-center justify-center text-center shadow-lg shadow-red-950/60 border-2 border-red-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 mb-0.5 animate-pulse" />
                    <span className="text-lg sm:text-xl font-black tracking-tight leading-none">
                      {Math.round((campaign.similarity_score || 0.85) * 100)}%
                    </span>
                    <span className="text-[8px] uppercase font-black tracking-widest text-amber-200 mt-1">
                      MATCH
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                  <span className="font-extrabold text-red-400 text-sm">{campaign.points_reward} PTS</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3.5 py-1.5 rounded-xl border border-zinc-700 transition cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-4 py-1.5 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer hover:scale-105"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. MY APPLICATIONS & DELIVERABLES PIPELINE */}
      <section className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">My Applications & Deliverables</h2>
        </div>

        {/* Pipeline Tab Bar */}
        <div className="flex flex-wrap gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          {[
            { key: 'active', label: 'All Active' },
            { key: 'pending', label: 'Pending Applications' },
            { key: 'offered', label: 'Direct Offers' },
            { key: 'accepted', label: 'In Progress' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'expired', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-semibold">
              No applications or deliverables found in this category.
            </div>
          ) : (
            filteredApplications.map((app) => (
              <ApplicationActionCard
                key={app.id}
                application={app}
                userRole="creator"
                onUpdate={fetchData}
              />
            ))
          )}
        </div>
      </section>

      {/* QUICK PITCH APPLY MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-pulse-red-glow">
            <h2 className="text-xl font-extrabold text-white">Pitch for "{selectedCampaign.title}"</h2>
            <p className="text-xs text-zinc-400">
              Sponsor: <strong className="text-red-400">{selectedCampaign.brand_name || selectedCampaign.brand_username}</strong> • Reward: <strong className="text-white font-bold">{selectedCampaign.points_reward} pts</strong>
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="Write a brief pitch detailing your content plan, audience demographics, and why you are a great fit..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-white focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-zinc-500 font-medium"
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  disabled={applying}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-red-600/40 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application Pitch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMPAIGN DETAILS MODAL */}
      {selectedDetailCampaign && (
        <CampaignDetailsModal
          campaign={selectedDetailCampaign}
          onClose={() => setSelectedDetailCampaign(null)}
          onApply={(camp) => {
            setSelectedDetailCampaign(null);
            setSelectedCampaign(camp);
          }}
          userRole="creator"
        />
      )}

    </div>
  );
}