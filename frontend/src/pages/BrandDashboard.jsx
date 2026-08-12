import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaigns, getApplications, getUserProfile, startCampaignInstantly, endCampaignInstantly } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignMatchModal from '../components/CampaignMatchModal';
import CampaignCountdown from '../components/CampaignCountdown';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
import { Building2, Plus, Sparkles, Clock, CheckCircle2, Award, Zap, ShieldCheck, Square } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUtils';

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedMatchCampaign, setSelectedMatchCampaign] = useState(null);
  const [selectedDetailCampaign, setSelectedDetailCampaign] = useState(null);
  const [campaignToLaunch, setCampaignToLaunch] = useState(null);
  const [campaignToEnd, setCampaignToEnd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    try {
      const [profileRes, campaignsRes, appsRes] = await Promise.all([
        getUserProfile(),
        getCampaigns(),
        getApplications(),
      ]);
      setProfile(profileRes.data);
      setCampaigns(campaignsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const handleStartInstantly = async (campaignId) => {
    try {
      await startCampaignInstantly(campaignId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start campaign.');
    }
  };

  const handleEndInstantly = async (campaignId) => {
    try {
      await endCampaignInstantly(campaignId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to end campaign.');
    }
  };

  const checkAppExpired = (app) => {
    return app.status === 'expired' ||
      (app.status === 'accepted' && app.submission_deadline && new Date(app.submission_deadline) < new Date() && (!app.submission_link || !app.submission_link.trim())) ||
      (app.status === 'offered' && app.submission_deadline && new Date(app.submission_deadline) < new Date()) ||
      (app.status === 'rejected' && (!app.submission_link || !app.submission_link.trim()) && (app.work_description || app.submission_deadline));
  };

  const getTabCount = (tabKey) => {
    return applications.filter((app) => {
      const isExpired = checkAppExpired(app);
      if (tabKey === 'pending') return app.status === 'pending';
      if (tabKey === 'offered') return app.status === 'offered' && !isExpired;
      if (tabKey === 'accepted') return app.status === 'accepted' && !isExpired;
      if (tabKey === 'submitted') return app.status === 'submitted';
      if (tabKey === 'completed') return app.status === 'completed';
      if (tabKey === 'rejected') return app.status === 'rejected';
      if (tabKey === 'expired') return isExpired;
      return true;
    }).length;
  };

  const filteredApplications = applications.filter((app) => {
    const isExpired = checkAppExpired(app);
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'offered') return app.status === 'offered' && !isExpired;
    if (activeTab === 'accepted') return app.status === 'accepted' && !isExpired;
    if (activeTab === 'submitted') return app.status === 'submitted';
    if (activeTab === 'completed') return app.status === 'completed';
    if (activeTab === 'rejected') return app.status === 'rejected';
    if (activeTab === 'expired') return isExpired;
    return true;
  });

  const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled');
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const successfulCampaigns = campaigns.filter(c => c.status === 'completed' || c.status === 'cancelled' || applications.some(a => a.campaign === c.id && a.status === 'completed'));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-bold">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl border border-blue-200 shadow-lg animate-pulse">
          <Building2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span>Loading Brand Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 space-y-8">

      {/* 1. BRAND HEADER & ESCROW BALANCE (Blue & White Theme) */}
      <header className="bg-white border border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 border border-blue-300/60 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Brand Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            {resolveImageUrl(profile?.logo_url) ? (
              <img
                src={resolveImageUrl(profile.logo_url)}
                alt={profile?.company_name || profile?.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-blue-200 shadow-md shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <span>{profile?.company_name || profile?.username}'s Dashboard</span>
          </h1>

          <p className="text-slate-500 text-sm max-w-xl font-medium">
            Review creator applications, find AI matched creators, track submission deadlines, and release point rewards safely.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-2xl shadow-lg shadow-blue-600/30 space-y-1 relative z-10 w-full sm:w-auto text-center sm:text-right">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-200 block">Available Points Balance</span>
          <div className="text-3xl font-black">{profile?.points_balance ?? 0} <span className="text-sm font-semibold text-blue-200">PTS</span></div>
        </div>
      </header>

      {/* 2. SCHEDULED CAMPAIGNS SECTION */}
      {scheduledCampaigns.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Scheduled Launches ({scheduledCampaigns.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white border border-amber-300 rounded-3xl p-6 shadow-md hover:shadow-lg transition space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-amber-300">
                    {campaign.target_niche} • {campaign.target_platform}
                  </span>
                  <CampaignCountdown
                    startDatetime={campaign.start_datetime}
                    endDatetime={campaign.end_datetime}
                    status={campaign.status}
                    variant="badge"
                    theme="brand"
                  />
                </div>

                <h3
                  className="font-extrabold text-slate-900 text-base hover:text-blue-600 transition cursor-pointer line-clamp-1"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  {campaign.title}
                </h3>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-black">
                  <span className="font-extrabold text-blue-600 text-sm">{campaign.points_reward} pts</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setCampaignToLaunch(campaign)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1"
                    >
                      <span>🚀 Launch Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ACTIVE CAMPAIGNS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Active Campaigns ({activeCampaigns.length})</h2>
          </div>

          <button
            onClick={() => navigate('/campaign/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Launch New Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 space-y-2">
              <p className="font-semibold">No active campaigns running currently.</p>
              <p className="text-xs">Click above to launch a new campaign and find creators!</p>
            </div>
          ) : (
            activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xl shadow-blue-500/5 space-y-4 hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-blue-200">
                    {campaign.target_niche} • {campaign.target_platform}
                  </span>
                  <CampaignCountdown
                    startDatetime={campaign.start_datetime}
                    endDatetime={campaign.end_datetime}
                    status={campaign.status}
                    variant="badge"
                    theme="brand"
                  />
                </div>

                <h3
                  className="font-extrabold text-slate-900 text-base hover:text-blue-600 transition cursor-pointer line-clamp-1"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  {campaign.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 font-extrabold pt-2">
                  <span>Reward: <strong className="text-blue-600 font-black">{campaign.points_reward} pts</strong></span>
                  <span>Hired: <strong className="text-slate-900 font-black">{campaign.accepted_count || 0}/{campaign.creators_needed || 1}</strong></span>
                </div>

                {/* CARD ACTION BUTTONS (Details, AI Match, & End Campaign) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs gap-2">
                  <button
                    onClick={() => setSelectedDetailCampaign(campaign)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setSelectedMatchCampaign(campaign)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-md transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>AI Match</span>
                  </button>
                  <button
                    onClick={() => setCampaignToEnd(campaign)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-3 py-1.5 rounded-xl border border-rose-300 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-rose-600 fill-current" />
                    <span>End</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. WORKFLOW PIPELINE TABS */}
      <section className="bg-white border border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">Applications & Workflow Pipeline</h2>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { key: 'pending', label: 'Pending Review' },
            { key: 'offered', label: 'Direct Offers' },
            { key: 'accepted', label: 'In Progress' },
            { key: 'submitted', label: 'Ready for Payout' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'expired', label: 'Expired' }
          ].map((tab) => {
            const count = getTabCount(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-1.5 ${activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.key ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No applications currently in this stage.
            </div>
          ) : (
            filteredApplications.map((app) => (
              <ApplicationActionCard
                key={app.id}
                application={app}
                userRole="brand"
                onUpdate={fetchData}
              />
            ))
          )}
        </div>
      </section>

      {/* MODALS */}
      {selectedMatchCampaign && (
        <CampaignMatchModal
          campaign={selectedMatchCampaign}
          onClose={() => setSelectedMatchCampaign(null)}
          onUpdate={fetchData}
        />
      )}

      {selectedDetailCampaign && (
        <CampaignDetailsModal
          campaign={selectedDetailCampaign}
          onClose={() => setSelectedDetailCampaign(null)}
          onEndCampaign={(camp) => {
            setSelectedDetailCampaign(null);
            setCampaignToEnd(camp);
          }}
          userRole="brand"
        />
      )}

      {/* CONFIRM LAUNCH CAMPAIGN ALERT BOX */}
      <ConfirmModal
        isOpen={Boolean(campaignToLaunch)}
        title="Confirm Instant Campaign Launch"
        message={`Are you sure you want to launch "${campaignToLaunch?.title}" immediately? This will make it active and open for creator applications immediately.`}
        confirmText="Yes, Launch Now"
        cancelText="Cancel"
        variant="brand"
        onConfirm={() => {
          if (campaignToLaunch) {
            handleStartInstantly(campaignToLaunch.id);
            setCampaignToLaunch(null);
          }
        }}
        onCancel={() => setCampaignToLaunch(null)}
      />

      {/* CONFIRM END CAMPAIGN ALERT BOX */}
      {(() => {
        const workingApps = campaignToEnd
          ? applications.filter(a => a.campaign === campaignToEnd.id && (a.status === 'accepted' || a.status === 'submitted'))
          : [];
        const names = workingApps.map(a => `@${a.creator_username || a.creator_name}`).filter(Boolean);
        const abcCreators = names.join(', ');
        const totalPoints = workingApps.length * (campaignToEnd?.points_reward || 0);

        const endMsg = workingApps.length > 0
          ? `${abcCreators} creator(s) are currently working on this "${campaignToEnd?.title}" campaign. If you end the campaign now, you will lose ${totalPoints} points (creators will receive their ${totalPoints} points immediately without review). Are you sure you want to end this campaign?`
          : `Are you sure you want to end "${campaignToEnd?.title}" immediately? It will no longer accept new submissions.`;

        return (
          <ConfirmModal
            isOpen={Boolean(campaignToEnd)}
            title="Confirm End Campaign"
            message={endMsg}
            confirmText="Yes, End Campaign & Payout"
            cancelText="Cancel"
            variant="danger"
            onConfirm={() => {
              if (campaignToEnd) {
                handleEndInstantly(campaignToEnd.id);
                setCampaignToEnd(null);
              }
            }}
            onCancel={() => setCampaignToEnd(null)}
          />
        );
      })()}

    </div>
  );
}