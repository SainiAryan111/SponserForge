import React, { useState, useEffect } from 'react';
import { getCampaigns, getApplications, getUserProfile } from '../services/api';
import CreateCampaignModal from '../components/CreateCampaignModal';
import ApplicationActionCard from '../components/ApplicationActionCard';
import CampaignMatchModal from '../components/CampaignMatchModal';

export default function BrandDashboard() {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (activeTab === 'accepted') return app.status === 'accepted';
    if (activeTab === 'submitted') return app.status === 'submitted';
    if (activeTab === 'completed') return app.status === 'completed';
    return true;
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  if (loading) return <div className="loading-spinner">Loading Brand Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* HEADER & BALANCE */}
      <header className="dashboard-header">
        <div>
          <h1>{profile?.company_name || profile?.username}'s Portal</h1>
          <p className="subtitle">Manage campaigns, evaluate applications, and release payouts</p>
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
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
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
                <div className="campaign-footer">
                  <span className="reward">{campaign.points_reward} pts</span>
                  <button 
                    className="match-btn" 
                    onClick={() => setSelectedMatchCampaign(campaign)}
                  >
                    AI Match
                  </button>
                  <span className="subs">Min {campaign.min_subscribers_required} subs • {campaign.creators_needed || 1} creators needed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* COMPLETED CAMPAIGNS SECTION */}
      {completedCampaigns.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Completed Campaigns ({completedCampaigns.length})</h2>
          </div>

          <div className="campaign-grid">
            {completedCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card completed-campaign">
                <h3>{campaign.title}</h3>
                <p className="niche-tag">{campaign.target_niche} • {campaign.target_platform}</p>
                <p className="desc">{campaign.description}</p>
                <div className="campaign-footer">
                  <span className="reward">{campaign.points_reward} pts</span>
                  <span className="subs">Min {campaign.min_subscribers_required} subs • {campaign.creators_needed || 1} creators</span>
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

      {/* CREATE CAMPAIGN MODAL */}
      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCampaignCreated={() => fetchData()}
      />

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