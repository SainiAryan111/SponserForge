import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CampaignMatchModal from '../components/CampaignMatchModal';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, Building2, Plus, Edit3, Trash2, Search, 
  Filter, ExternalLink, X 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const isCreator = user?.role === 'creator';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {isCreator ? <CreatorDashboard user={user} /> : <BrandDashboard />}
      </main>
    </div>
  );
}

/* ============================================================================
   BRAND DASHBOARD
   ============================================================================ */
function BrandDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');

  // Modal states
  const [selectedMatchCampaign, setSelectedMatchCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('campaigns/');
      setCampaigns(response.data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.delete(`campaigns/${id}/`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      alert('Error deleting campaign.');
    }
  };

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch = 
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = 
      selectedNiche === 'All' || 
      camp.target_niche?.toLowerCase() === selectedNiche.toLowerCase();
    
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-800 to-slate-800 border border-slate-700 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Building2 className="w-5 h-5" />
            <span>Brand Command Center</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Active Campaigns</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your sponsorships and perform vector similarity matching with creators.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Niches</option>
            <option value="tech">Tech</option>
            <option value="gaming">Gaming</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="fitness">Fitness</option>
          </select>
        </div>
      </div>

      {/* Cards Display */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading active campaigns...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 p-12 text-center rounded-2xl">
          <p className="text-slate-400 mb-4">No active campaigns found matching your criteria.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-6 flex flex-col justify-between transition shadow-lg group relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-500/20 uppercase">
                    {camp.target_niche || 'General'}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${Number(camp.budget).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-1">{camp.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3">{camp.description}</p>
              </div>

              <div className="pt-6 border-t border-slate-700/50 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedMatchCampaign(camp)}
                    className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Creators</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCampaign(camp)}
                      className="p-2 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CampaignFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newCamp) => {
            setCampaigns((prev) => [newCamp, ...prev]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {editingCampaign && (
        <CampaignFormModal
          initialData={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={(updatedCamp) => {
            setCampaigns((prev) => prev.map((c) => (c.id === updatedCamp.id ? updatedCamp : c)));
            setEditingCampaign(null);
          }}
        />
      )}

      {selectedMatchCampaign && (
        <CampaignMatchModal
          campaign={selectedMatchCampaign}
          onClose={() => setSelectedMatchCampaign(null)}
        />
      )}
    </div>
  );
}

/* ============================================================================
   CREATOR DASHBOARD
   ============================================================================ */
function CreatorDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [matchedCampaigns, setMatchedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const profileRes = await api.get('auth/profile/');
      setProfile(profileRes.data);

      if (profileRes.data?.id) {
        const matchesRes = await api.get(`creator/match-campaigns/${profileRes.data.id}/`);
        setMatchedCampaigns(matchesRes.data?.matched_campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load creator data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {user?.username ? user.username[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">@{user?.username || 'Creator'}</h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-medium uppercase border border-indigo-500/20">
                {profile?.primary_platform || 'YouTube'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {profile?.niche || 'Tech'} • {profile?.subscriber_count?.toLocaleString() || 0} Followers
            </p>
          </div>
        </div>
      </div>

      {/* Matched Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Active Campaigns Matched For You
          </h2>
          <span className="text-xs text-slate-400">Ranked by vector embedding similarity</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading matched campaigns...</div>
        ) : matchedCampaigns.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-12 text-center rounded-2xl">
            <p className="text-slate-400">No active campaign matches found for your niche yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-6 flex flex-col justify-between transition shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
                      Brand: @{camp.brand_username}
                    </span>
                    {camp.similarity_score && (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono">
                        {(camp.similarity_score * 100).toFixed(0)}% match
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white line-clamp-1">{camp.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3">{camp.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-700/50 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Est. Budget</span>
                    <span className="text-base font-bold text-emerald-400">${Number(camp.budget).toLocaleString()}</span>
                  </div>

                  <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition">
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CAMPAIGN FORM MODAL
   ============================================================================ */
function CampaignFormModal({ initialData = null, onClose, onSuccess }) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    budget: initialData?.budget || '',
    target_platform: initialData?.target_platform || 'youtube',
    target_niche: initialData?.target_niche || 'tech',
    min_subscribers_required: initialData?.min_subscribers_required || 5000,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      budget: Number(formData.budget),
      min_subscribers_required: Number(formData.min_subscribers_required),
    };

    try {
      let res;
      if (isEditing) {
        res = await api.put(`campaigns/${initialData.id}/`, payload);
      } else {
        res = await api.post('campaigns/', payload);
      }
      onSuccess(res.data);
    } catch (err) {
      console.error('Full Error Response:', err.response?.data);
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const fieldErrors = Object.entries(serverData)
          .map(([key, val]) => `${key.toUpperCase()}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(fieldErrors || 'Failed to save campaign.');
      } else {
        setError('Server error or unauthorized. Check console.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-6">
        <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Campaign Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI SaaS Launch Campaign"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Budget ($ / ₹)</label>
              <input
                type="number"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                placeholder="50000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Niche</label>
              <select
                name="target_niche"
                value={formData.target_niche}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="tech">Tech</option>
                <option value="gaming">Gaming</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Platform</label>
              <select
                name="target_platform"
                value={formData.target_platform}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Min. Followers / Subs</label>
              <input
                type="number"
                name="min_subscribers_required"
                required
                value={formData.min_subscribers_required}
                onChange={handleChange}
                placeholder="5000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description & Deliverables</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe requirements, target audience, and expected video duration..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-lg transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition text-xs flex items-center gap-1.5"
            >
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Campaign' : 'Publish Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}