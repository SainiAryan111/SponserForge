import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company_name: '',
    primary_platform: 'youtube',
    subscriber_count: 0,
    niche: '',
    bio: '',
    points_balance: 0,
  });

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
        primary_platform: data.primary_platform || 'youtube',
        subscriber_count: data.subscriber_count || 0,
        niche: data.niche || '',
        bio: data.bio || '',
        points_balance: data.points_balance || 0,
      });
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

  // Submit profile edits
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await updateUserProfile(formData);
      setUser(res.data); // Keep AuthContext updated
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-1">
            Manage your account credentials, preferences, and {isBrand ? 'brand identity' : 'creator bio'}.
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
          className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Niche</label>
                  <input
                    type="text"
                    name="niche"
                    value={formData.niche}
                    onChange={handleInputChange}
                    placeholder="e.g. SaaS, Gaming, Consumer Electronics"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              /* CREATOR SPECIFIC FIELDS */
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-md font-semibold text-indigo-400">Creator Channel Parameters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Primary Platform</label>
                    <select
                      name="primary_platform"
                      value={formData.primary_platform}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitch">Twitch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Audience / Subscriber Count</label>
                    <input
                      type="number"
                      name="subscriber_count"
                      value={formData.subscriber_count}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Content Niche</label>
                  <input
                    type="text"
                    name="niche"
                    value={formData.niche}
                    onChange={handleInputChange}
                    placeholder="e.g. Tech Reviews, Gaming Guides, Fitness"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Updating your niche helps our AI vector matcher recommend high-affinity campaigns.
                  </p>
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* SIDEBAR: POINTS MANAGEMENT / QUICK ACTIONS */}
        <div className="space-y-6">
          {isBrand ? (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Buy Escrow Points</h3>
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
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Processing...' : `Purchase +${topUpAmount} Points`}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Creator Perks & Payouts</h3>
              <p className="text-xs text-slate-400 mb-4">
                Completed campaigns credit points directly into your account balance.
              </p>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Available for Cashout</span>
                <span className="text-2xl font-bold text-emerald-400">{formData.points_balance} pts</span>
                <span className="text-xs text-slate-500 block mt-1">Est. Value: ${(formData.points_balance * 0.1).toFixed(2)} USD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}