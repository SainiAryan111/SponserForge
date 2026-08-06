import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getApplicationDetail } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignCountdown from '../components/CampaignCountdown';
import {
  ArrowLeft,
  Building2,
  User,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Star,
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isBrand = user?.role === 'brand';

  const isExpired = application?.status === 'expired' ||
    (application?.status === 'accepted' && application?.submission_deadline && new Date(application.submission_deadline) < new Date() && (!application?.submission_link || !application?.submission_link.trim())) ||
    (application?.status === 'rejected' && (!application?.submission_link || !application?.submission_link.trim()) && (application?.work_description || application?.submission_deadline));

  const fetchDetail = async () => {
    try {
      const res = await getApplicationDetail(id);
      setApplication(res.data);
    } catch (err) {
      console.error('Failed to fetch application details:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Application / Deal details not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-extrabold text-base ${
        isBrand ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-zinc-200'
      }`}>
        <div className="flex items-center space-x-3 p-6 rounded-2xl border shadow-lg animate-pulse">
          <Sparkles className="w-6 h-6 text-blue-600 animate-spin" />
          <span>Loading Deal Details...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-300 text-red-800 p-6 rounded-2xl font-black text-sm space-y-3">
          <h2 className="text-xl font-black">Deal Error</h2>
          <p>{error || 'Application details could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          <span>Back</span>
        </button>

        {/* HEADER BANNER */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl border space-y-6 relative overflow-hidden ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/5'
            : 'bg-zinc-900/90 border-red-500/30 shadow-2xl shadow-red-950/50'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  isExpired ? 'bg-rose-100 text-rose-900 border-rose-300' : (isBrand ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-red-950 text-red-200 border-red-500/50')
                }`}>
                  Deal Status: {isExpired ? 'EXPIRED' : application.status.toUpperCase()}
                </span>
                {(application.campaign_end_datetime || application.campaign_start_datetime) && (
                  <CampaignCountdown
                    endDatetime={application.campaign_end_datetime}
                    startDatetime={application.campaign_start_datetime}
                    status={application.campaign_status || (application.status === 'completed' || application.status === 'rejected' ? 'completed' : 'active')}
                    variant="badge"
                    theme={isBrand ? 'brand' : 'creator'}
                  />
                )}
              </div>

              {/* Status Explanation Note */}
              <p className={`text-xs font-bold italic pt-1 ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
                Status Info: {
                  isExpired || application.status === 'expired'
                    ? (application.campaign_status === 'cancelled' || (application.work_description && (!application.submission_link || !application.submission_link.trim()) && (application.campaign_status === 'cancelled' || application.campaign_status === 'completed'))
                        ? "Brand ended campaign before deadline"
                        : "Creator didn't submit work within the allocated deadline")
                    : application.status === 'offered'
                    ? "Campaign offered from Brand to Creator"
                    : application.status === 'pending'
                    ? "Campaign application request from Creator to Brand"
                    : application.status === 'accepted'
                    ? (application.pitch?.toLowerCase().includes('offer') || application.work_description ? "Creator accepted Brand offer" : "Brand accepted Creator request")
                    : application.status === 'submitted'
                    ? "Creator submitted their work"
                    : application.status === 'completed'
                    ? "Campaign completed successfully"
                    : application.status === 'rejected'
                    ? (application.pitch?.toLowerCase().includes('offer') || application.work_description ? "Creator rejected Brand offer" : "Brand rejected Creator request")
                    : ""
                }
              </p>

              {/* 24-Hour Review Window Banner */}
              {application.status === 'submitted' && (
                <div className={`mt-2 p-3 rounded-2xl text-xs font-bold border flex items-center space-x-2 ${
                  isBrand
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-zinc-800 text-amber-300 border-amber-500/30'
                }`}>
                  <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>24-Hour Review Window:</strong> If the brand does not review this submitted work within 24 hours, escrow points ({application.points_reward} PTS) will be automatically credited to the creator profile without review.
                  </span>
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight pt-1">
                {application.campaign_title}
              </h1>

              <div className="flex items-center space-x-4 text-xs sm:text-sm font-extrabold flex-wrap gap-y-1">
                <div className="flex items-center space-x-1.5">
                  <User className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>Creator: @{application.creator_username} {application.creator_name ? `(${application.creator_name})` : ''}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building2 className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>Brand: {application.brand_name || application.brand_username}</span>
                </div>
              </div>
            </div>

            {/* Escrow Reward Display */}
            <div className={`p-4 sm:p-5 rounded-2xl border text-center min-w-[160px] shadow-md ${
              isBrand ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}>
              <span className="text-xs uppercase font-black block opacity-80">Escrow Reward</span>
              <span className="text-2xl sm:text-3xl font-black">{application.points_reward} PTS</span>
            </div>
          </div>

          {/* Campaign Brief Link */}
          {application.campaign && (
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <span className={isBrand ? 'text-slate-500' : 'text-zinc-400'}>
                Associated Campaign ID: #{application.campaign}
              </span>
              <Link
                to={`/campaign/${application.campaign}`}
                className={`flex items-center space-x-1 underline hover:no-underline font-extrabold ${
                  isBrand ? 'text-blue-600' : 'text-red-400'
                }`}
              >
                <span>View Full Campaign Brief</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* FULL DETAILS CONTENT */}
        <div className="space-y-6">
          
          {/* Creator Proposal Pitch */}
            {application.pitch && (
              <div className={`rounded-3xl p-6 space-y-3 border shadow-xl ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <h3 className="text-xl font-black flex items-center space-x-2">
                  <FileText className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>Creator Proposal Pitch</span>
                </h3>
                <div className={`p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed font-medium italic ${
                  isBrand ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                }`}>
                  "{application.pitch}"
                </div>
              </div>
            )}

            {/* Deliverables Guidelines & Instructions */}
            {application.work_description && (
              <div className={`rounded-3xl p-6 space-y-3 border shadow-xl ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <h3 className="text-xl font-black flex items-center space-x-2">
                  <Sparkles className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                  <span>Deliverables Guidelines & Instructions</span>
                </h3>
                <div className={`p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
                  isBrand ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-red-950/40 border-red-500/30 text-red-100'
                }`}>
                  {application.work_description}
                </div>
              </div>
            )}

            {/* Submission Deadline Clock */}
            {application.submission_deadline && application.status === 'accepted' && (
              <div className={`rounded-3xl p-6 space-y-3 border shadow-xl ${
                isBrand ? 'bg-white border-blue-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}>
                <h3 className="text-xl font-black flex items-center space-x-2">
                  <Clock className={`w-5 h-5 ${isBrand ? 'text-blue-600' : 'text-amber-400'}`} />
                  <span>Work Submission Countdown Clock</span>
                </h3>
                <CampaignCountdown
                  endDatetime={application.submission_deadline}
                  status="active"
                  variant="detailed"
                  theme={isBrand ? 'brand' : 'creator'}
                />
              </div>
            )}

            {/* Submitted Work Link */}
            {application.submission_link && (
              <div className={`rounded-3xl p-6 space-y-4 border shadow-xl ${
                isBrand ? 'bg-purple-50/80 border-purple-200 text-purple-950' : 'bg-purple-950/60 border-purple-500/40 text-purple-100'
              }`}>
                <h3 className="text-xl font-black flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <span>Submitted Work & Deliverable Link</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900 border border-purple-300 dark:border-purple-800">
                  <span className="font-extrabold text-xs sm:text-sm break-all text-slate-900 dark:text-zinc-100">
                    {application.submission_link}
                  </span>
                  <a
                    href={application.submission_link.startsWith('http') ? application.submission_link : `https://${application.submission_link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-md shrink-0 flex items-center space-x-1.5"
                  >
                    <span>View Work</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Completed Rating & Feedback */}
            {application.status === 'completed' && application.rating && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 shadow-xl text-emerald-950 space-y-3">
                <h3 className="text-xl font-black flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Brand Review & Rating</span>
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < application.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-base">{application.rating} / 5 Stars</span>
                </div>
                {application.feedback && (
                  <p className="italic font-medium text-slate-700 p-4 rounded-2xl bg-white/80 border border-emerald-200 text-xs sm:text-sm">
                    "{application.feedback}"
                  </p>
                )}
              </div>
            )}

            {/* Rejection Reason Display */}
            {application.rejection_reason && (
              <div className="bg-red-50 border border-red-300 dark:bg-red-950/60 dark:border-red-500/40 rounded-3xl p-6 shadow-xl text-red-950 dark:text-red-100 space-y-3">
                <h3 className="text-xl font-black flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Rejection Reason from Brand</span>
                </h3>
                <p className="italic font-semibold text-xs sm:text-sm p-4 rounded-2xl bg-white/80 dark:bg-zinc-900 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
                  "{application.rejection_reason}"
                </p>
              </div>
            )}

            {/* Action Card & Controls */}
            <ApplicationActionCard
              application={application}
              userRole={isBrand ? 'brand' : 'creator'}
              onUpdate={fetchDetail}
              actionsOnly={true}
            />

        </div>

      </div>
    </div>
  );
}
