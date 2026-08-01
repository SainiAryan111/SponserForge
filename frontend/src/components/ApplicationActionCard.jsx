import React, { useState } from 'react';
import { acceptApplication, acceptOffer, rejectApplication, submitWork, completeAndPay } from '../services/api';
import CampaignCountdown from './CampaignCountdown';
import ConfirmModal from './ConfirmModal';
import { Clock, FileText, CheckCircle, AlertTriangle, Star, Send, Award, Check, X } from 'lucide-react';

export default function ApplicationActionCard({ application, userRole, onUpdate }) {
  const isBrand = userRole === 'brand';

  const [submissionLink, setSubmissionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Confirmation Alert Modal States
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showSubmitWorkConfirm, setShowSubmitWorkConfirm] = useState(false);

  // Brand Accept Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [deadlineHours, setDeadlineHours] = useState('48');
  const [customDeadline, setCustomDeadline] = useState('');

  // Brand Payout & Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  // 1. Brand Accepts Creator Application with Work Description & Deadline
  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    let isoDeadline = null;
    if (customDeadline) {
      const parsedDt = new Date(customDeadline);
      if (!isNaN(parsedDt.getTime())) {
        isoDeadline = parsedDt.toISOString();
      }
    }

    try {
      await acceptApplication(application.id, {
        work_description: workDescription,
        deadline_hours: isoDeadline ? null : parseInt(deadlineHours, 10),
        submission_deadline: isoDeadline,
      });
      setMsg('Application accepted & deliverable deadline set!');
      setShowAcceptModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to accept application.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Creator Accepts Direct Brand Offer
  const handleAcceptOffer = async () => {
    setLoading(true);
    setMsg('');
    try {
      await acceptOffer(application.id);
      setMsg('Offer accepted! You are hired for this campaign.');
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to accept offer.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reject Application / Offer
  const handleReject = async () => {
    setLoading(true);
    setMsg('');
    try {
      await rejectApplication(application.id);
      setMsg('Application rejected.');
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Creator Submits Completed Work
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await submitWork(application.id, submissionLink);
      setMsg('Work submitted for brand review.');
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Brand Approves Work, Provides Rating, & Releases Payout
  const handleCompleteAndPaySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await completeAndPay(application.id, {
        rating: parseInt(rating, 10),
        feedback: feedback,
      });
      setMsg(res.data.message);
      setShowRatingModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Payout failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'offered': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'pending': return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'accepted': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'submitted': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'completed': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'rejected': return 'bg-rose-100 text-rose-900 border-rose-300';
      default: return 'bg-slate-200 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className={`rounded-2xl p-5 border shadow-lg space-y-3 transition ${
      isBrand
        ? 'bg-white border-blue-200 text-slate-900 shadow-blue-500/5'
        : 'bg-zinc-900 border-zinc-800 text-white shadow-md'
    }`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center space-x-3 flex-wrap">
          <h4 className="font-black text-base sm:text-lg">{application.campaign_title}</h4>
          {(application.campaign_end_datetime || application.campaign_start_datetime) && (
            <CampaignCountdown
              endDatetime={application.campaign_end_datetime}
              startDatetime={application.campaign_start_datetime}
              status={application.status === 'completed' || application.status === 'rejected' ? 'completed' : 'active'}
              variant="badge"
              theme={isBrand ? 'brand' : 'creator'}
            />
          )}
        </div>

        <span className={`text-xs uppercase tracking-wider font-black px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
          {application.status === 'offered' ? 'BRAND OFFER' : application.status.toUpperCase()}
        </span>
      </div>

      {/* Overview Info */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-extrabold ${
        isBrand ? 'text-slate-800' : 'text-zinc-200'
      }`}>
        <p><strong>Creator:</strong> @{application.creator_username} {application.creator_name ? `(${application.creator_name})` : ''}</p>
        <p><strong>Brand:</strong> {application.brand_name || application.brand_username || 'Brand'} {application.brand_username && application.brand_name !== application.brand_username ? `(@${application.brand_username})` : ''}</p>
        <p><strong>Escrow Reward:</strong> <span className={isBrand ? 'text-blue-600 font-black' : 'text-red-400 font-black'}>{application.points_reward} PTS</span></p>
      </div>

      {/* Pitch */}
      {application.pitch && (
        <div className={`text-xs sm:text-sm p-3.5 rounded-xl border space-y-1 ${
          isBrand ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
        }`}>
          <span className="font-black uppercase tracking-wider text-xs opacity-70 block">Creator Proposal Pitch:</span>
          <p className="italic font-medium">"{application.pitch}"</p>
        </div>
      )}

      {/* Work Description & Instructions set by Brand */}
      {application.work_description && (
        <div className={`text-xs sm:text-sm p-3.5 rounded-xl border space-y-1 ${
          isBrand ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-red-950/60 border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center space-x-1.5 font-black uppercase text-xs">
            <FileText className="w-4 h-4" />
            <span>Deliverables Guidelines & Instructions:</span>
          </div>
          <p className="leading-relaxed whitespace-pre-line font-medium">{application.work_description}</p>
        </div>
      )}

      {/* LIVE WORK SUBMISSION DEADLINE COUNTDOWN */}
      {application.submission_deadline && application.status === 'accepted' && (
        <div className="space-y-1">
          <span className={`text-xs font-black uppercase tracking-wider block ${
            isBrand ? 'text-blue-700' : 'text-amber-400'
          }`}>
            ⏳ Work Submission Deadline:
          </span>
          <CampaignCountdown
            endDatetime={application.submission_deadline}
            status="active"
            variant="card"
            theme={isBrand ? 'brand' : 'creator'}
          />
        </div>
      )}

      {/* Submission Link */}
      {application.submission_link && (
        <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center justify-between ${
          isBrand ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-950/60 border-purple-500/40 text-purple-200'
        }`}>
          <span>Submitted Link: <strong>{application.submission_link}</strong></span>
          <a 
            href={application.submission_link.startsWith('http') ? application.submission_link : `https://${application.submission_link}`} 
            target="_blank" 
            rel="noreferrer" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-1.5 rounded-lg transition"
          >
            View Work
          </a>
        </div>
      )}

      {/* Completed Deal Rating & Review Feedback */}
      {application.status === 'completed' && application.rating && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center space-x-2 font-black">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < application.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <span>Brand Review Rating: {application.rating}/5 Stars</span>
          </div>
          {application.feedback && (
            <p className="italic font-semibold text-slate-700 pt-1">"{application.feedback}"</p>
          )}
        </div>
      )}

      {/* Feedback / Status Messages */}
      {msg && (
        <div className={`p-3 rounded-xl text-xs sm:text-sm font-black text-center border ${
          msg.includes('accepted') || msg.includes('submitted') || msg.includes('released') || msg.includes('success')
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          {msg}
        </div>
      )}

      {/* ACTION BUTTONS BASED ON WORKFLOW STAGE & ROLE */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        
        {/* BRAND ACTIONS FOR PENDING APPLICATIONS */}
        {isBrand && application.status === 'pending' && (
          <>
            <button
              onClick={() => {
                setWorkDescription(`Campaign Deliverables: Create 1 sponsored video integration for ${application.campaign_title}`);
                setShowAcceptModal(true);
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Creator & Set Deadline</span>
            </button>
            <button
              onClick={() => setShowRejectConfirm(true)}
              disabled={loading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Reject Proposal
            </button>
          </>
        )}

        {/* CREATOR ACTIONS FOR DIRECT BRAND OFFERS */}
        {!isBrand && application.status === 'offered' && (
          <>
            <button
              onClick={handleAcceptOffer}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Direct Campaign Offer</span>
            </button>
            <button
              onClick={() => setShowDeclineConfirm(true)}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Decline Offer
            </button>
          </>
        )}

        {/* CREATOR ACTION FOR ACCEPTED DEALS (SUBMIT WORK) */}
        {!isBrand && application.status === 'accepted' && (
          <form onSubmit={handleSubmitWork} className="w-full flex items-center space-x-2 pt-1">
            <input
              type="url"
              required
              placeholder="Paste deliverable link (e.g. YouTube video URL)..."
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer shrink-0 flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Deliverable'}</span>
            </button>
          </form>
        )}

        {/* BRAND ACTION FOR SUBMITTED WORK (RATING & RELEASE PAYOUT) */}
        {isBrand && application.status === 'submitted' && (
          <button
            onClick={() => setShowRatingModal(true)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Award className="w-4 h-4" />
            <span>Rate Creator & Send {application.points_reward} Points</span>
          </button>
        )}

      </div>

      {/* BRAND ACCEPTANCE MODAL */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-blue-300 text-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Accept Creator & Set Deadline</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Provide instructions and set a submission countdown clock for @{application.creator_username}.
            </p>

            <form onSubmit={handleAcceptSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Deliverable Guidelines</label>
                <textarea
                  rows={3}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Submission Deadline Clock</label>
                <select
                  value={deadlineHours}
                  onChange={(e) => setDeadlineHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">7 Days (1 Week)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  {loading ? 'Accepting...' : 'Confirm Acceptance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND RATING & PAYOUT MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-blue-300 text-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Release Escrow Payout</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Provide a 5-star review for @{application.creator_username} and disburse {application.points_reward} points.
            </p>

            <form onSubmit={handleCompleteAndPaySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Star Rating (1 to 5 Stars)</label>
                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Brand Feedback & Review</label>
                <textarea
                  rows={3}
                  placeholder="Excellent work, fast delivery and high quality video integration..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  {loading ? 'Releasing Payout...' : `Approve & Release ${application.points_reward} PTS`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT PROPOSAL CONFIRMATION ALERT BOX */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        title="Confirm Proposal Rejection"
        message={`Are you sure you want to reject the application proposal from @${application.creator_username || 'creator'} for "${application.campaign_title}"?`}
        confirmText="Yes, Reject Proposal"
        cancelText="Keep Proposal"
        variant="danger"
        loading={loading}
        onConfirm={() => {
          setShowRejectConfirm(false);
          handleReject();
        }}
        onCancel={() => setShowRejectConfirm(false)}
      />

      {/* DECLINE OFFER CONFIRMATION ALERT BOX */}
      <ConfirmModal
        isOpen={showDeclineConfirm}
        title="Confirm Decline Offer"
        message={`Are you sure you want to decline the direct campaign offer from ${application.brand_name || application.brand_username} for "${application.campaign_title}"?`}
        confirmText="Yes, Decline Offer"
        cancelText="Keep Offer"
        variant="danger"
        loading={loading}
        onConfirm={() => {
          setShowDeclineConfirm(false);
          handleReject();
        }}
        onCancel={() => setShowDeclineConfirm(false)}
      />

    </div>
  );
}