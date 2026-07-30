import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, getCampaigns, getApplications } from '../services/api';
import { ArrowLeft, History as HistoryIcon, Award, Sparkles } from 'lucide-react';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company_name: '',
    name: '',
    primary_platform: 'youtube',
    subscriber_count: 0,
    niche: '',
    bio: '',
    points_balance: 0,
  });

  const [selectedNiches, setSelectedNiches] = useState([]);
  const [customNiche, setCustomNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [customPlatform, setCustomPlatform] = useState('');

  const [pastCampaigns, setPastCampaigns] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      const data = res.data;
      setFormData({
        username: data.username || '',
        email: data.email || '',
        company_name: data.company_name || '',
        name: data.name || '',
        primary_platform: data.primary_platform || 'youtube',
        subscriber_count: data.subscriber_count || 0,
        niche: data.niche || '',
        bio: data.bio || '',
        points_balance: data.points_balance || 0,
      });

      // Parse niches & platforms
      if (data.niche) {
        setSelectedNiches(data.niche.split(',').map(s => s.trim().toLowerCase()));
      }
      if (data.primary_platform) {
        setSelectedPlatforms(data.primary_platform.split(',').map(s => s.trim().toLowerCase()));
      }

      // Fetch Previous Campaigns
      if (user?.role === 'brand') {
        const campaignsRes = await getCampaigns();
        setPastCampaigns(campaignsRes.data || []);
      } else {
        const appsRes = await getApplications();
        setPastCampaigns(appsRes.data || []);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNicheCheckbox = (n) => {
    if (selectedNiches.includes(n)) {
      if (selectedNiches.length > 1) {
        setSelectedNiches(selectedNiches.filter(item => item !== n));
      }
    } else {
      setSelectedNiches([...selectedNiches, n]);
    }
  };

  const handlePlatformCheckbox = (p) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // Submit profile edits
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    let finalNiches = [...selectedNiches];
    if (customNiche.trim()) {
      finalNiches.push(customNiche.trim().toLowerCase());
    }

    let finalPlatforms = [...selectedPlatforms];
    if (customPlatform.trim()) {
      finalPlatforms.push(customPlatform.trim().toLowerCase());
    }

    const payload = {
      ...formData,
      niche: finalNiches.join(','),
      primary_platform: finalPlatforms.join(','),
    };

    try {
      const res = await updateUserProfile(payload);
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Quick Points Top-Up for Brand Accounts
  const handleTopUpPoints = async () => {
    if (topUpAmount <= 0) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    const newBalance = (formData.points_balance || 0) + parseInt(topUpAmount, 10);
    const updatedPayload = { ...formData, points_balance: newBalance };

    try {
      const res = await updateUserProfile(updatedPayload);
      setFormData((prev) => ({ ...prev, points_balance: res.data.points_balance }));
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setMessage({
        type: 'success',
        text: `Successfully added ${topUpAmount} points to your balance!`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to process points purchase.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isBrand = user?.role === 'brand';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 font-medium transition cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* HEADER */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile & Credentials</h1>
          <p className="text-slate-400 mt-1">
            Manage your credentials, content niches, platforms, and {isBrand ? 'brand identity' : 'creator profile'}.
          </p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-5 py-3 flex items-center gap-4 self-start md:self-auto">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
              Account Role
            </span>
            <span className="text-indigo-400 font-bold capitalize">{user?.role || 'User'}</span>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
              Points Balance
            </span>
            <span className="text-emerald-400 font-bold">{formData.points_balance} pts</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK NOTIFICATION */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN PROFILE FORM */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">General Information</h2>

            {/* Readonly & Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* BRAND SPECIFIC FIELDS */}
            {isBrand ? (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-md font-semibold text-indigo-400">Brand Parameters</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              /* CREATOR SPECIFIC FIELDS */
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-md font-semibold text-indigo-400">Creator Channel Parameters</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Creator Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Multi-Select Niche Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Niche(s) - Multi-Select</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                    {DEFAULT_NICHES.map(n => (
                      <label key={n} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNiches.includes(n)}
                          onChange={() => handleNicheCheckbox(n)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="capitalize">{n}</span>
                      </label>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="+ Add Custom Choice (e.g. AI & Robotics)"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white text-xs mt-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Multi-Select Platform Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Platform(s) - Multi-Select</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                    {DEFAULT_PLATFORMS.map(p => (
                      <label key={p} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(p)}
                          onChange={() => handlePlatformCheckbox(p)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="capitalize">{p}</span>
                      </label>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="+ Add Custom Choice (e.g. Substack / Podcast)"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white text-xs mt-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Subscriber Count</label>
                  <input
                    type="number"
                    name="subscriber_count"
                    value={formData.subscriber_count}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Creator Pitch Bio</label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief description of your content style, average view count, and audience demographics..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* SIDEBAR: POINTS & PREVIOUS CAMPAIGNS */}
        <div className="space-y-6">
          {isBrand ? (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Buy Campaign Points</h3>
              <p className="text-xs text-slate-400 mb-4">
                Top up points to fund reward pools for your upcoming sponsor campaigns.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount to Add</label>
                  <select
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={500}>500 Points ($50)</option>
                    <option value={1000}>1,000 Points ($100)</option>
                    <option value={2500}>2,500 Points ($250)</option>
                    <option value={5000}>5,000 Points ($500)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleTopUpPoints}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Processing...' : `Purchase +${topUpAmount} Points`}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Creator Balance</h3>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Available Balance</span>
                <span className="text-2xl font-bold text-emerald-400">{formData.points_balance} pts</span>
              </div>
            </div>
          )}

          {/* PREVIOUS CAMPAIGNS SECTION */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-indigo-400" />
              <span>Previous Campaigns</span>
            </h3>

            {pastCampaigns.length === 0 ? (
              <p className="text-xs text-slate-400">No previous campaign history found.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-none">
                {pastCampaigns.slice(0, 5).map((item) => (
                  <div key={item.id} className="bg-slate-900 p-3 rounded-xl border border-slate-700/60 text-xs">
                    <h4 className="text-white font-semibold">{item.title || item.campaign_title}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Status: <span className="text-indigo-400 capitalize">{item.status}</span> • Reward: {item.points_reward} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}