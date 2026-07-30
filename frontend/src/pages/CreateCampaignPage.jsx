import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/api';
import { ArrowLeft, Sparkles, Calendar, DollarSign, Users, Award } from 'lucide-react';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 500,
    target_platform: 'youtube',
    target_niche: 'tech',
    min_subscribers_required: 1000,
    creators_needed: 1,
    start_date: '',
    end_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) {
      return setError('Campaign Title is required.');
    }
    if (!formData.description.trim() || formData.description.length < 15) {
      return setError('Description must be at least 15 characters long.');
    }
    if (formData.points_reward <= 0) {
      return setError('Points reward must be greater than 0.');
    }
    if (formData.creators_needed < 1) {
      return setError('At least 1 creator is required for the campaign.');
    }
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      return setError('End date must be after or equal to the start date.');
    }

    setLoading(true);
    try {
      await createCampaign({
        ...formData,
        points_reward: parseInt(formData.points_reward, 10),
        min_subscribers_required: parseInt(formData.min_subscribers_required || 0, 10),
        creators_needed: parseInt(formData.creators_needed, 10),
      });
      navigate('/brand/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to create campaign. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 font-medium transition cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Header */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-700 pb-4">
          <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Campaign</h1>
            <p className="text-slate-400 text-sm">Launch a targeted sponsorship offer for top creators</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Campaign Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Next-Gen Gaming Headset Launch"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Detailed Description & Guidelines <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe deliverables, required video integrations, topic focus, and guidelines..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Niche and Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Target Niche <span className="text-rose-400">*</span>
              </label>
              <select
                name="target_niche"
                value={formData.target_niche}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="tech">Technology & AI</option>
                <option value="gaming">Gaming & Esports</option>
                <option value="lifestyle">Lifestyle & Vlogs</option>
                <option value="fashion">Fashion & Beauty</option>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance & Investing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Target Platform <span className="text-rose-400">*</span>
              </label>
              <select
                name="target_platform"
                value={formData.target_platform}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitch">Twitch</option>
              </select>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Numeric Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Points Reward <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="number"
                name="points_reward"
                min="1"
                value={formData.points_reward}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Min Subscribers</span>
              </label>
              <input
                type="number"
                name="min_subscribers_required"
                min="0"
                value={formData.min_subscribers_required}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Creators Needed <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="number"
                name="creators_needed"
                min="1"
                value={formData.creators_needed}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Publishing Campaign...' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
