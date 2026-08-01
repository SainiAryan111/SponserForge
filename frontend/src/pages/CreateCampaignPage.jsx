import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/api';
import { ArrowLeft, Sparkles, Calendar, DollarSign, Users, Award, Building2, Plus } from 'lucide-react';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [startMode, setStartMode] = useState('instant'); // 'instant' | 'scheduled'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 500,
    target_platform: 'youtube',
    target_niche: 'tech',
    min_subscribers_required: 1000,
    creators_needed: 1,
    start_datetime: '',
    duration_hours: 24,
  });

  const [customNiche, setCustomNiche] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const extractErrorMessage = (err) => {
    if (!err.response) return err.message || 'Network error. Please check backend connection.';
    const data = err.response.data;
    if (!data) return 'Failed to create campaign. Please check inputs.';
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (typeof data === 'object') {
      const messages = Object.entries(data).map(([field, errs]) => {
        const msgStr = Array.isArray(errs) ? errs.join(', ') : String(errs);
        return `${field}: ${msgStr}`;
      });
      return messages.join(' | ');
    }
    return 'Failed to create campaign. Please check inputs.';
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
    if (startMode === 'scheduled' && !formData.start_datetime) {
      return setError('Please specify an exact starting date and time for scheduled launch.');
    }
    if (!formData.duration_hours || parseInt(formData.duration_hours, 10) < 1) {
      return setError('Campaign duration must be at least 1 hour.');
    }

    let isoStartDt = null;
    if (startMode === 'scheduled' && formData.start_datetime) {
      const parsedDt = new Date(formData.start_datetime);
      if (isNaN(parsedDt.getTime())) {
        return setError('Invalid start date & time specified.');
      }
      isoStartDt = parsedDt.toISOString();
    }

    const finalNiche = customNiche.trim() ? customNiche.trim().toLowerCase() : formData.target_niche;
    const finalPlatform = customPlatform.trim() ? customPlatform.trim().toLowerCase() : formData.target_platform;

    setLoading(true);
    try {
      await createCampaign({
        title: formData.title,
        description: formData.description,
        target_platform: finalPlatform,
        target_niche: finalNiche,
        points_reward: parseInt(formData.points_reward, 10),
        min_subscribers_required: parseInt(formData.min_subscribers_required || 0, 10),
        creators_needed: parseInt(formData.creators_needed, 10),
        duration_hours: parseInt(formData.duration_hours, 10),
        start_instantly: startMode === 'instant',
        start_datetime: isoStartDt,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs sm:text-sm font-black text-slate-700 hover:text-slate-950 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Brand Dashboard</span>
        </button>

        {/* MAIN FORM CARD (Corporate Blue & White Theme) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-blue-200 shadow-xl shadow-blue-500/5 space-y-6">
          
          {/* Header */}
          <div className="flex items-center space-x-4 border-b border-slate-200 pb-6">
            <div className="bg-blue-100 text-blue-900 p-3.5 rounded-2xl border border-blue-300 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-blue-600 tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Create Sponsorship Campaign</h1>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-2xl text-xs sm:text-sm font-black">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campaign Title */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Campaign Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Next-Gen AI Software Sponsorship Brief"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Detailed Brief & Deliverable Guidelines <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe required video integrations, topic focus, brand key messages, and submission guidelines..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Target Niche (Select + Custom Typed Input) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Target Niche <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    name="target_niche"
                    value={formData.target_niche}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {DEFAULT_NICHES.map(n => <option key={n} value={n}>{n.toUpperCase()}</option>)}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type custom niche..."
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Target Platform (Select + Custom Typed Input) */}
              <div>
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Target Platform <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    name="target_platform"
                    value={formData.target_platform}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {DEFAULT_PLATFORMS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type custom platform..."
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Launch Mode Option */}
            <div className="bg-slate-50 border border-slate-300 p-5 rounded-2xl space-y-3">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                Launch Timing Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStartMode('instant')}
                  className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                    startMode === 'instant'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-xs sm:text-sm">Start Instantly</div>
                    <div className="text-xs opacity-90 mt-0.5">Campaign goes active immediately upon creation</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStartMode('scheduled')}
                  className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                    startMode === 'scheduled'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-xs sm:text-sm">Schedule Starting Time</div>
                    <div className="text-xs opacity-90 mt-0.5">Specify exact date & time to launch automatically</div>
                  </div>
                </button>
              </div>

              {/* Scheduled Datetime Input */}
              {startMode === 'scheduled' && (
                <div className="pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                    Exact Launch Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="start_datetime"
                    value={formData.start_datetime}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Campaign Duration in Hours */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Campaign Duration (in Hours) <span className="text-red-500">*</span></span>
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  name="duration_hours"
                  min="1"
                  placeholder="e.g. 24"
                  value={formData.duration_hours}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-2 text-xs font-black">
                  {[12, 24, 48, 72, 168].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, duration_hours: hrs }))}
                      className={`px-3.5 py-2 rounded-xl transition border cursor-pointer ${
                        formData.duration_hours === hrs
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {hrs === 24 ? '24h (1 Day)' : hrs === 48 ? '48h (2 Days)' : hrs === 72 ? '72h (3 Days)' : hrs === 168 ? '168h (1 Wk)' : `${hrs}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Numeric Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center space-x-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Escrow Points Reward <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="number"
                  name="points_reward"
                  min="1"
                  value={formData.points_reward}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Min Subscribers</span>
                </label>
                <input
                  type="number"
                  name="min_subscribers_required"
                  min="0"
                  value={formData.min_subscribers_required}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Creators Needed <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="number"
                  name="creators_needed"
                  min="1"
                  value={formData.creators_needed}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition font-black text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Publishing Campaign...' : 'Publish Campaign'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
