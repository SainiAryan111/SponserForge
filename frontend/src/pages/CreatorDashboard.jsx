import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, getCampaignsForCreator, getApplications, applyToCampaign } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';

export default function CreatorDashboard() {
  const [profile, setProfile] = useState(null);
  const [matchedCampaigns, setMatchedCampaigns] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Pitch Apply State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);

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

  if (loading) return <div className="loading-spinner">Loading Creator Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* HEADER & EARNINGS */}
      <header className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1>Welcome, @{profile?.username}</h1>
          <p className="subtitle">{profile?.niche?.toUpperCase()} Creator • {profile?.primary_platform}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/search" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20">
            <span>🔍 Explore Brands & Creators</span>
          </Link>
          <div className="balance-badge">
            <span>Earned Points</span>
            <strong>{profile?.points_balance ?? 0} pts</strong>
          </div>
        </div>
      </header>

      {/* AI MATCHED CAMPAIGNS FEED */}
      <section className="dashboard-section">
        <h2>Recommended Campaigns (Smart Match)</h2>
        <div className="campaign-grid">
          {matchedCampaigns.length === 0 ? (
            <p className="empty-state">No matching campaigns found at this moment.</p>
          ) : (
            matchedCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card match-card">
                <div className="card-top-row">
                  <span className="niche-tag">{campaign.target_niche} • {campaign.target_platform}</span>
                  <div className="match-score">
                    {Math.round((campaign.similarity_score || 0.5) * 100)}% Match
                  </div>
                </div>
                <h3>{campaign.title}</h3>
                <p className="desc">{campaign.description}</p>
                <div className="campaign-footer">
                  <span className="reward">{campaign.points_reward} pts</span>
                  <button className="apply-btn" onClick={() => setSelectedCampaign(campaign)}>
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MY APPLICATIONS TRACKER */}
      <section className="dashboard-section">
        <h2>My Applications & Active Deliverables</h2>
        <div className="applications-list">
          {myApplications.filter(app => app.status !== 'completed' && app.status !== 'rejected').length === 0 ? (
            <p className="empty-state">No active applications or deliverables at this moment.</p>
          ) : (
            myApplications
              .filter(app => app.status !== 'completed' && app.status !== 'rejected')
              .map((app) => (
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

      {/* APPLY PITCH MODAL */}
      {selectedCampaign && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Apply to "{selectedCampaign.title}"</h2>
            <p>Reward: <strong>{selectedCampaign.points_reward} pts</strong></p>
            <form onSubmit={handleApplySubmit}>
              <textarea
                placeholder="Write a brief pitch on why you're a good fit for this campaign..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedCampaign(null)} disabled={applying}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Pitch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}