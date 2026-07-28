import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  User, 
  Building2, 
  Globe, 
  Link as LinkIcon, 
  Users, 
  Percent, 
  MapPin, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [initialProfile, setInitialProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // Adjust path if your Django endpoint is 'profile/' or 'auth/profile/'
      const response = await api.get('auth/profile/');
      setProfile(response.data);
      setInitialProfile(response.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile details. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const response = await api.put('auth/profile/', profile);
      setProfile(response.data);
      setInitialProfile(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Profile update error:', err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update profile. Please check your entries.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading profile information...</span>
        </div>
      </div>
    );
  }

  const userRole = (profile.role || profile.user_type || profile.user?.role || '').toLowerCase();
  const isCreator = userRole === 'creator';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 md:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-700">
          <div>
            <div className="flex items-center space-x-3">
              {isCreator ? (
                <User className="w-8 h-8 text-indigo-400" />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-400" />
              )}
              <h1 className="text-2xl font-bold text-white">
                {isCreator ? 'Creator Profile' : 'Brand Profile'}
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as <span className="font-semibold text-indigo-300">@{profile.username || 'user'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              isEditing
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            }`}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Read-Only Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={profile.username || ''}
                disabled
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {/* Creator Specific Fields */}
          {isCreator && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Niche
                </label>
                <input
                  type="text"
                  name="niche"
                  value={profile.niche || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. Tech, Gaming, Fitness"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Platform
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="primary_platform"
                    value={profile.primary_platform || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. YouTube, Instagram"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Platform Link
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    name="platform_link"
                    value={profile.platform_link || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Follower / Subscriber Count
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="subscriber_count"
                    value={profile.subscriber_count || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 50000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Engagement Rate (%)
                </label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    name="engagement_rate"
                    value={profile.engagement_rate || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 4.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="location"
                    value={profile.location || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Bio / Overview
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself or your company..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Brand Specific Fields */}
            {!isCreator && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="company_name"
                        value={profile.company_name || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. TechCorp Inc."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={profile.industry || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. Software, E-Commerce"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Website URL
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        name="website"
                        value={profile.website || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="https://company.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Company Size
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        name="company_size"
                        value={profile.company_size || '1-10'}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="1-10">1 - 10 employees</option>
                        <option value="10-50">10 - 50 employees</option>
                        <option value="50-250">50 - 250 employees</option>
                        <option value="250+">250+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="target_audience"
                      value={profile.target_audience || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. Tech Enthusiasts, 18-35 Males/Females"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      name="logo_url"
                      value={profile.logo_url || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://company.com/logo.png"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}