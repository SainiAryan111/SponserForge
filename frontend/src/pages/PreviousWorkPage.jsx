import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getUserProfile } from '../services/api';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  CheckCircle, 
  Award, 
  Briefcase, 
  Video, 
  FileText,
  Filter,
  Flame,
  Zap,
  Building2,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function PreviousWorkPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          getUserProfile(),
          getApplications(),
        ]);
        setProfile(profileRes.data);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Failed to load work portfolio.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-200 font-extrabold text-base">
        <div className="flex items-center space-x-3 bg-zinc-900 p-6 rounded-2xl border border-red-500/40 shadow-2xl animate-pulse">
          <Zap className="w-6 h-6 text-red-500 animate-spin" />
          <span>Loading Deliverables Portfolio...</span>
        </div>
      </div>
    );
  }

  const creatorWork = applications.filter(app => ['submitted', 'completed', 'accepted'].includes(app.status));

  const filteredWork = creatorWork.filter(app => {
    if (filterTab === 'completed') return app.status === 'completed';
    if (filterTab === 'submitted') return app.status === 'submitted';
    return true;
  });

  const completedCount = creatorWork.filter(app => app.status === 'completed').length;
  const totalEarnedPoints = creatorWork
    .filter(app => app.status === 'completed')
    .reduce((acc, curr) => acc + (curr.points_reward || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-zinc-300 hover:text-white font-black text-xs sm:text-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        {/* HEADER SECTION (Creator Red & Cyber Black Theme) */}
        <div className="bg-zinc-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 space-y-6 relative overflow-hidden animate-pulse-red-glow">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-950/80 text-red-200 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Creator Deliverables Portfolio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Previous Work & Deliverables</h1>
              <p className="text-zinc-300 text-xs sm:text-sm font-semibold mt-1">
                Submitted content links, brand ratings, guidelines, & reviews for @<strong>{profile?.username}</strong>.
              </p>
            </div>

            {/* Rating Banner */}
            <div className="bg-zinc-950 border border-amber-500/40 px-5 py-3 rounded-2xl text-center self-start sm:self-auto">
              <span className="text-xs uppercase font-black text-amber-400 block">Creator Rating</span>
              <div className="flex items-center space-x-1 text-amber-300 font-black text-lg sm:text-xl">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{(profile?.total_ratings_count > 0 && profile?.rating != null) ? Number(profile.rating).toFixed(1) : '0.0'}</span>
                <span className="text-xs text-zinc-400 font-semibold">({profile?.total_ratings_count || 0})</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10 text-xs sm:text-sm font-bold">
            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl">
              <span className="text-xs uppercase font-extrabold text-zinc-400 block">Completed Deals</span>
              <span className="text-xl sm:text-2xl font-black text-white">{completedCount} Sponsorships</span>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl">
              <span className="text-xs uppercase font-extrabold text-zinc-400 block">Total Earned Points</span>
              <span className="text-xl sm:text-2xl font-black text-red-400">{totalEarnedPoints.toLocaleString()} PTS</span>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl">
              <span className="text-xs uppercase font-extrabold text-zinc-400 block">Platform Niche</span>
              <span className="text-xl sm:text-2xl font-black text-white capitalize">{profile?.niche || 'General'}</span>
            </div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex flex-wrap items-center gap-2 text-xs sm:text-sm font-black">
          <span className="px-2 text-zinc-400 uppercase text-xs flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </span>

          {[
            { key: 'all', label: 'All Portfolio Items' },
            { key: 'completed', label: 'Completed & Paid' },
            { key: 'submitted', label: 'Submitted & Pending Review' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterTab === tab.key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PORTFOLIO ITEMS GRID (WITH ALL REQUIRED FIELDS) */}
        <div className="space-y-6">
          {filteredWork.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-2 font-bold text-sm">
              <p className="font-black text-lg text-zinc-200">No portfolio deliverables found matching this criteria.</p>
              <p className="text-xs sm:text-sm">Complete campaign assignments to showcase your work portfolio here!</p>
            </div>
          ) : (
            filteredWork.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-xl transition space-y-5"
              >
                {/* 1. Item Header (Campaign Title, Status, Brand Sponsor, Reward Points) */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-black uppercase text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/40">
                        {item.status.toUpperCase()}
                      </span>
                      {item.applied_at && (
                        <span className="text-xs text-zinc-400 font-bold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Date: {new Date(item.applied_at).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-white">{item.campaign_title}</h3>

                    {/* Brand Sponsor Field */}
                    <div className="flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-zinc-300">
                      <Building2 className="w-4 h-4 text-red-400" />
                      <span>Sponsor: <strong>{item.brand_name || item.brand_username || 'Brand'}</strong></span>
                      {item.brand_username && item.brand_name !== item.brand_username && (
                        <span className="text-zinc-500 font-normal">(@{item.brand_username})</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-red-500/30 px-5 py-3 rounded-2xl text-right shrink-0">
                    <span className="text-xs uppercase font-extrabold text-zinc-400 block">Earned Payout</span>
                    <span className="text-xl sm:text-2xl font-black text-red-400">{item.points_reward} PTS</span>
                  </div>
                </div>

                {/* 2. Creator Proposal Pitch Field */}
                {item.pitch && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1.5 font-black uppercase text-zinc-400 text-xs tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                      <span>My Submitted Proposal Pitch:</span>
                    </div>
                    <p className="italic text-zinc-300 font-medium">"{item.pitch}"</p>
                  </div>
                )}

                {/* 3. Deliverable Guidelines Field */}
                {item.work_description && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1.5 font-black uppercase text-zinc-400 text-xs tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      <span>Brand Deliverable Guidelines & Requirements:</span>
                    </div>
                    <p className="leading-relaxed text-zinc-300 font-medium whitespace-pre-line">{item.work_description}</p>
                  </div>
                )}

                {/* 4. Submission Link Field */}
                {item.submission_link && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-300 overflow-hidden font-bold">
                      <Video className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate">Deliverable URL: {item.submission_link}</span>
                    </div>
                    <a
                      href={item.submission_link.startsWith('http') ? item.submission_link : `https://${item.submission_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shrink-0"
                    >
                      <span>View Deliverable Content</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* 5. Brand Rating Score & Written Feedback Review */}
                {item.status === 'completed' && item.rating && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl space-y-2 text-emerald-200 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2 font-black text-emerald-400">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                          />
                        ))}
                      </div>
                      <span>Brand Review Rating: {item.rating}.0 / 5.0 Stars</span>
                    </div>
                    {item.feedback && (
                      <p className="italic font-semibold text-zinc-300 pt-1">"{item.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Card Footer Action: View Full Campaign Page */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs sm:text-sm font-black">
                  <span className="text-zinc-400">
                    Deal Status: <strong className="text-white capitalize">{item.status}</strong>
                  </span>
                  <button
                    onClick={() => navigate(`/campaign/${item.campaign}`)}
                    className="text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer underline"
                  >
                    <span>View Campaign Brief Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
