import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaigns, getApplications, getUserProfile } from '../services/api';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignMatchModal from '../components/CampaignMatchModal';

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedMatchCampaign, setSelectedMatchCampaign] = useState(null);
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
    fetchData();
  }, []);

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'offered') return app.status === 'offered';
    if (activeTab === 'accepted') return app.status === 'accepted';
    if (activeTab === 'submitted') return app.status === 'submitted';
    if (activeTab === 'completed') return app.status === 'completed';
    return true;
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const successfulCampaigns = campaigns.filter(c => c.status === 'completed' || applications.some(a => a.campaign === c.id && a.status === 'completed'));

  if (loading) return <div className="loading-spinner">Loading Brand Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* HEADER & BALANCE */}
      <header className="dashboard-header">
        <div>
          <h1>{profile?.company_name || profile?.username}'s Portal</h1>
          <p className="subtitle">Manage campaigns, evaluate applications, send direct offers, and release payouts</p>
        </div>
        <div className="balance-badge">
          <span>Points Balance</span>
          <strong>{profile?.points_balance ?? 0} pts</strong>
        </div>
      </header>

      {/* ACTIVE CAMPAIGNS SECTION */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active Campaigns ({activeCampaigns.length})</h2>
          <button className="primary-btn" onClick={() => navigate('/campaign/create')}>
            + Create New Campaign
          </button>
        </div>

        <div className="campaign-grid">
          {activeCampaigns.length === 0 ? (
            <p className="empty-state">No active campaigns yet. Click above to create one!</p>
          ) : (
            activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <h3>{campaign.title}</h3>
                <p className="niche-tag">{campaign.target_niche} • {campaign.target_platform}</p>
                <p className="desc">{campaign.description}</p>
                
                {(campaign.start_date || campaign.end_date) && (
                  <p className="text-xs text-slate-400 my-2">
                    📅 Timeline: {campaign.start_date || 'N/A'} to {campaign.end_date || 'N/A'}
                  </p>
                )}

                <div className="campaign-footer">
                  <span className="reward">{campaign.points_reward} pts</span>
                  <button 
                    className="match-btn" 
                    onClick={() => setSelectedMatchCampaign(campaign)}
                  >
                    AI Match
                  </button>
                  <span className="subs">
                    Min {campaign.min_subscribers_required} subs • {campaign.accepted_count || 0}/{campaign.creators_needed || 1} Hired
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SUCCESSFUL CAMPAIGNS SECTION */}
      {successfulCampaigns.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Successful Campaigns ({successfulCampaigns.length})</h2>
          </div>

          <div className="campaign-grid">
            {successfulCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card completed-campaign">
                <h3>{campaign.title}</h3>
                <p className="niche-tag">{campaign.target_niche} • {campaign.target_platform}</p>
                <p className="desc">{campaign.description}</p>
                <div className="campaign-footer">
                  <span className="reward">{campaign.points_reward} pts</span>
                  <span className="subs font-semibold text-emerald-400">✓ Successful & Paid</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* APPLICATIONS & ESCROW SECTION */}
      <section className="dashboard-section">
        <h2>Applications & Workflow Pipeline</h2>
        <div className="tab-bar">
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
            Pending Review
          </button>
          <button className={activeTab === 'offered' ? 'active' : ''} onClick={() => setActiveTab('offered')}>
            Direct Offers
          </button>
          <button className={activeTab === 'accepted' ? 'active' : ''} onClick={() => setActiveTab('accepted')}>
            In Progress
          </button>
          <button className={activeTab === 'submitted' ? 'active' : ''} onClick={() => setActiveTab('submitted')}>
            Ready for Payout
          </button>
          <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>
            Completed
          </button>
        </div>

        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <p className="empty-state">No applications in this stage.</p>
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

      {/* CAMPAIGN MATCH MODAL */}
      {selectedMatchCampaign && (
        <CampaignMatchModal
          campaign={selectedMatchCampaign}
          onClose={() => setSelectedMatchCampaign(null)}
        />
      )}
    </div>
  );
}