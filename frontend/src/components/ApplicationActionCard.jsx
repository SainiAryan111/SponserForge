import React, { useState } from 'react';
import { acceptApplication, submitWork, completeAndPay } from '../services/api';

export default function ApplicationActionCard({ application, userRole, onUpdate }) {
  const [submissionLink, setSubmissionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 1. Brand Accepts Creator Application
  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptApplication(application.id);
      setMsg('Application accepted!');
      onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to accept.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Creator Submits Completed Work
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitWork(application.id, submissionLink);
      setMsg('Work submitted for review.');
      onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Brand Approves & Points Get Released
  const handleCompleteAndPay = async () => {
    setLoading(true);
    try {
      const res = await completeAndPay(application.id);
      setMsg(res.data.message);
      onUpdate();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Payout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-card">
      <div className="card-header">
        <h4>{application.campaign_title}</h4>
        <span className={`status-badge status-${application.status}`}>
          {application.status.toUpperCase()}
        </span>
      </div>

      <p><strong>Creator:</strong> @{application.creator_username}</p>
      <p><strong>Reward:</strong> {application.points_reward} pts</p>
      {application.pitch && <p className="pitch-text">"{application.pitch}"</p>}
      {application.submission_link && (
        <p><strong>Deliverable:</strong> <a href={application.submission_link} target="_blank" rel="noreferrer">View Work</a></p>
      )}

      {msg && <p className="info-msg">{msg}</p>}

      {((userRole === 'brand' && (application.status === 'pending' || application.status === 'submitted')) ||
        (userRole === 'creator' && application.status === 'accepted')) && (
        <div className="card-actions">
          {/* BRAND CONTROLS */}
          {userRole === 'brand' && (
            <>
              {application.status === 'pending' && (
                <button onClick={handleAccept} disabled={loading} className="btn-accept">
                  Accept Application
                </button>
              )}
              {application.status === 'submitted' && (
                <button onClick={handleCompleteAndPay} disabled={loading} className="btn-pay">
                  Approve & Pay ({application.points_reward} pts)
                </button>
              )}
            </>
          )}

          {/* CREATOR CONTROLS */}
          {userRole === 'creator' && (
            <>
              {application.status === 'accepted' && (
                <form onSubmit={handleSubmitWork} className="submit-work-form">
                  <input 
                    type="url" 
                    placeholder="Paste deliverable URL (e.g. YouTube video link)" 
                    value={submissionLink} 
                    onChange={(e) => setSubmissionLink(e.target.value)} 
                    required 
                  />
                  <button type="submit" disabled={loading} className="btn-submit">
                    Submit Work
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}