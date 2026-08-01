import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCampaignDetail,
  getUserProfile,
  getApplications,
  applyToCampaign,
  startCampaignInstantly,
  endCampaignInstantly
} from '../services/api';
import CampaignCountdown from '../components/CampaignCountdown';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignMatchModal from '../components/CampaignMatchModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Play,
  Square,
  Zap
} from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirm Modal States
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Creator apply form state
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');

  // Brand AI match modal state
  const [showMatchModal, setShowMatchModal] = useState(false);

  const fetchData = async () => {
    try {
      const [campaignRes, profileRes, appsRes] = await Promise.all([
        getCampaignDetail(id),
        getUserProfile(),
        getApplications(),
      ]);

      setCampaign(campaignRes.data);
      setProfile(profileRes.data);
      setApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load campaign detail:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Campaign not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!campaign || !pitch.trim()) return;
    setApplying(true);
    setApplyMsg('');

    try {
      await applyToCampaign(campaign.id, pitch);
      setApplyMsg('Application submitted successfully!');
      setPitch('');
      fetchData();
    } catch (err) {
      setApplyMsg(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleStartInstantly = async () => {
    if (!campaign) return;
    try {
      await startCampaignInstantly(campaign.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to launch campaign.');
    }
  };

  const handleEndInstantly = async () => {
    if (!campaign) return;
    try {
      await endCampaignInstantly(campaign.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to end campaign.');
    }
  };

  const isBrand = profile?.role === 'brand';
  const isBrandOwner = isBrand && campaign?.brand_user === profile?.id;
  const isCreator = profile?.role === 'creator';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-extrabold text-base ${
        isBrand ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-zinc-200'
      }`}>
        <div className="flex items-center space-x-3 p-6 rounded-2xl border shadow-lg animate-pulse">
          <Sparkles className="w-6 h-6 text-blue-600 animate-spin" />
          <span>Loading Campaign Brief...</span>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-300 text-red-800 p-6 rounded-2xl font-black text-sm space-y-3">
          <h2 className="text-xl font-black">Campaign Error</h2>
          <p>{error || 'Campaign not found or has been deleted.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Find existing application if current user is creator
  const myApplication = isCreator
    ? applications.find(app => app.campaign === campaign.id)
    : null;

  // Filter applications for this campaign if user is brand owner
  const campaignApplications = applications.filter(app => app.campaign === campaign.id);

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 sm:p-8 space-y-8 ${
      isBrand ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
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

        {/* HEADER BANNER */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl border space-y-4 relative overflow-hidden ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/5'
            : 'bg-zinc-900/90 border-red-500/30 shadow-2xl shadow-red-950/50 animate-pulse-red-glow'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  isBrand ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-red-950 text-red-200 border-red-500/50'
                }`}>
                  {campaign.target_niche} • {campaign.target_platform}
                </span>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  campaign.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : campaign.status === 'scheduled'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-700 text-slate-200 border-slate-600'
                }`}>
                  {campaign.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight pt-1">{campaign.title}</h1>
              
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-extrabold">
                <Building2 className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                <span className={isBrand ? 'text-slate-700' : 'text-zinc-300'}>
                  Brand: {campaign.brand_name || campaign.brand_username}
                </span>
                {campaign.brand_username && campaign.brand_name !== campaign.brand_username && (
                  <span className="opacity-70 font-medium">(@{campaign.brand_username})</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`p-4 rounded-2xl border text-center min-w-[140px] shadow-md ${
                isBrand ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-red-950/80 border-red-500/40 text-red-200'
              }`}>
                <span className="text-xs uppercase font-black block opacity-80">Escrow Reward</span>
                <span className="text-2xl sm:text-3xl font-black">{campaign.points_reward} PTS</span>
              </div>
            </div>
          </div>

          {/* PROMINENT LIVE COUNTDOWN TIMER */}
          <div className="pt-2">
            <span className={`text-xs font-black uppercase tracking-wider block mb-2 ${
              isBrand ? 'text-blue-700' : 'text-amber-400'
            }`}>
              Campaign Timeline Countdown
            </span>
            <CampaignCountdown
              endDatetime={campaign.end_datetime}
              startDatetime={campaign.start_datetime}
              status={campaign.status}
              variant="detailed"
              theme={isBrand ? 'brand' : 'creator'}
            />
          </div>
        </div>

        {/* SPECS & BRIEF GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT 2 COLUMNS: Brief Details & Requirements */}
          <div className="lg:col-span-2 space-y-6">

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <span className="text-xs text-slate-400 font-extrabold uppercase block">Creators Hired</span>
                <div className="flex items-center space-x-2 font-black text-lg sm:text-xl">
                  <Users className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>{campaign.accepted_count || 0} / {campaign.creators_needed || 1}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <span className="text-xs text-slate-400 font-extrabold uppercase block">Min. Subscribers</span>
                <div className="flex items-center space-x-2 font-black text-lg sm:text-xl">
                  <Award className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>{(campaign.min_subscribers_required || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <span className="text-xs text-slate-400 font-extrabold uppercase block">Total Duration</span>
                <div className="flex items-center space-x-2 font-black text-lg sm:text-xl">
                  <Clock className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>{campaign.duration_hours || 24} Hours</span>
                </div>
              </div>
            </div>

            {/* Campaign Brief Description */}
            <div className={`rounded-3xl p-6 space-y-3 border shadow-xl ${
              isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
            }`}>
              <h3 className="text-xl font-black flex items-center space-x-2">
                <Sparkles className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                <span>Campaign Brief & Deliverable Guidelines</span>
              </h3>
              <div className={`p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
                isBrand ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
              }`}>
                {campaign.description}
              </div>
            </div>

            {/* BRAND OWNER APPLICATIONS PIPELINE */}
            {isBrandOwner && (
              <div className="bg-white border border-blue-200 rounded-3xl p-6 space-y-4 shadow-xl text-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">Campaign Applications ({campaignApplications.length})</h3>
                  <button
                    onClick={() => setShowMatchModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>AI Creator Match</span>
                  </button>
                </div>

                {campaignApplications.length === 0 ? (
                  <p className="text-slate-600 text-xs sm:text-sm py-4 text-center font-bold">No applications received for this campaign yet.</p>
                ) : (
                  <div className="space-y-4">
                    {campaignApplications.map((app) => (
                      <ApplicationActionCard
                        key={app.id}
                        application={app}
                        userRole="brand"
                        onUpdate={fetchData}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ACTIONS & CREATOR APPLY PANEL */}
          <div className="space-y-6">

            {/* CREATOR APPLICATION SECTION */}
            {isCreator && (
              <div className="bg-zinc-900 border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-xl text-white">
                <h3 className="text-xl font-black text-white">Application Status</h3>

                {myApplication ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-300 space-y-2 font-bold">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">Application Status:</span>
                        <span className="font-black uppercase text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/40 text-xs">
                          {myApplication.status}
                        </span>
                      </div>
                      {myApplication.pitch && (
                        <p className="italic text-zinc-300 font-medium">"{myApplication.pitch}"</p>
                      )}
                    </div>

                    <ApplicationActionCard
                      application={myApplication}
                      userRole="creator"
                      onUpdate={fetchData}
                    />
                  </div>
                ) : campaign.status === 'completed' || campaign.status === 'cancelled' ? (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center text-xs sm:text-sm font-bold text-zinc-400">
                    This campaign has concluded and is no longer accepting applications.
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 block">
                      Why are you a good fit for this sponsor? (Pitch Proposal)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write a brief pitch detailing your content style, audience engagement, and campaign idea..."
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                    {applyMsg && (
                      <div className="text-xs sm:text-sm p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 font-black">
                        {applyMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={applying}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{applying ? 'Submitting Pitch...' : 'Submit Pitch Application'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* BRAND OWNER QUICK CONTROLS */}
            {isBrandOwner && (
              <div className="bg-white border border-blue-200 rounded-3xl p-6 space-y-4 shadow-xl text-slate-900">
                <h3 className="text-xl font-black text-slate-900">Campaign Management</h3>

                {campaign.status === 'scheduled' && (
                  <button
                    onClick={() => setShowLaunchConfirm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Launch Campaign Instantly</span>
                  </button>
                )}

                {campaign.status === 'active' && (
                  <button
                    onClick={() => setShowEndConfirm(true)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>End Campaign Instantly</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

        {/* BRAND MATCH MODAL */}
        {showMatchModal && (
          <CampaignMatchModal
            campaign={campaign}
            onClose={() => setShowMatchModal(false)}
          />
        )}

        {/* CONFIRM LAUNCH MODAL */}
        <ConfirmModal
          isOpen={showLaunchConfirm}
          title="Confirm Campaign Launch"
          message={`Are you sure you want to launch "${campaign?.title}" immediately?`}
          confirmText="Yes, Launch Now"
          cancelText="Cancel"
          variant="brand"
          onConfirm={() => {
            setShowLaunchConfirm(false);
            handleStartInstantly();
          }}
          onCancel={() => setShowLaunchConfirm(false)}
        />

        {/* CONFIRM END CAMPAIGN MODAL */}
        <ConfirmModal
          isOpen={showEndConfirm}
          title="Confirm End Campaign"
          message={`Are you sure you want to conclude "${campaign?.title}" immediately? Active applications will no longer accept new submissions.`}
          confirmText="Yes, End Campaign"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            setShowEndConfirm(false);
            handleEndInstantly();
          }}
          onCancel={() => setShowEndConfirm(false)}
        />

      </div>
    </div>
  );
}
