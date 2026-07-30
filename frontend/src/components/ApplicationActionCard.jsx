import React, { useState } from 'react';
import { acceptApplication, acceptOffer, rejectApplication, submitWork, completeAndPay } from '../services/api';

export default function ApplicationActionCard({ application, userRole, onUpdate }) {
  const [submissionLink, setSubmissionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 1. Brand Accepts Creator Application
  const handleAccept = async () => {
    setLoading(true);
    setMsg('');
    try {
      await acceptApplication(application.id);
      setMsg('Application accepted!');
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
      setMsg('Offer accepted! You are hired.');
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
      setMsg('Work submitted for review.');
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Brand Approves & Points Get Released
  const handleCompleteAndPay = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await completeAndPay(application.id);
      setMsg(res.data.message);
      if (onUpdate) onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Payout failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'offered': return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'pending': return 'bg-sky-950/60 text-sky-300 border-sky-500/40';
      case 'accepted': return 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40';
      case 'submitted': return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      case 'completed': return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'rejected': return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <h4 className="text-white font-bold text-base">{application.campaign_title}</h4>
        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${getStatusColor(application.status)}`}>
          {application.status === 'offered' ? 'BRAND OFFER' : application.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
        <p><strong>Creator:</strong> @{application.creator_username} {application.creator_name ? `(${application.creator_name})` : ''}</p>
        <p><strong>Brand:</strong> @{application.brand_username || 'Brand'}</p>
        <p><strong>Reward:</strong> <span className="text-emerald-400 font-bold">{application.points_reward} pts</span></p>
      </div>

      {application.pitch && (
        <p className="text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-slate-300">
          "{application.pitch}"
        </p>
      )}

      {application.submission_link && (
        <p className="text-xs">
          <strong>Deliverable:</strong>{' '}
          <a href={application.submission_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
            View Work Link
          </a>
        </p>
      )}

      {msg && (
        <div className="text-xs p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 font-medium">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60">
        {/* BRAND CONTROLS */}
        {userRole === 'brand' && (
          <>
            {application.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  Accept Creator
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white font-semibold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {application.status === 'submitted' && (
              <button
                onClick={handleCompleteAndPay}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                Approve Deliverable & Pay {application.points_reward} pts
              </button>
            )}
          </>
        )}

        {/* CREATOR CONTROLS */}
        {userRole === 'creator' && (
          <>
            {application.status === 'offered' && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAcceptOffer}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  Accept Direct Offer
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white font-semibold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  Decline Offer
                </button>
              </div>
            )}

            {application.status === 'accepted' && (
              <form onSubmit={handleSubmitWork} className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <input
                  type="url"
                  placeholder="Paste deliverable URL (e.g. https://youtube.com/watch?v=...)"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  required
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap w-full sm:w-auto"
                >
                  Submit Deliverable
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}