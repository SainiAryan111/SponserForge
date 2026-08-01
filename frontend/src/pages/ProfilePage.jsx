import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, getCampaigns, getApplications } from '../services/api';
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Award, 
  Sparkles, 
  Star, 
  Building2, 
  Zap, 
  Save, 
  Plus, 
  Globe, 
  MapPin, 
  Image, 
  Percent, 
  Users, 
  Link as LinkIcon 
} from 'lucide-react';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];
const DEFAULT_INDUSTRIES = ['SaaS & AI Software', 'E-Commerce & Retail', 'Gaming & Hardware', 'Fitness & Supplements', 'Fashion & Apparel', 'Financial Tech & Crypto'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // Brand Fields
    company_name: '',
    industry: DEFAULT_INDUSTRIES[0],
    website: '',
    company_size: '10-50',
    target_audience: '',
    logo_url: '',
    // Creator Fields
    name: '',
    platform_link: '',
    subscriber_count: 0,
    engagement_rate: 2.50,
    avatar_url: '',
    // Shared Fields
    bio: '',
    location: '',
    points_balance: 0,
    rating: 5.0,
    total_ratings_count: 0,
  });

  const [customIndustry, setCustomIndustry] = useState('');
  const [numericEmpCount, setNumericEmpCount] = useState('');

  const [selectedNiches, setSelectedNiches] = useState([]);
  const [customNiche, setCustomNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [customPlatform, setCustomPlatform] = useState('');

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
        industry: data.industry || DEFAULT_INDUSTRIES[0],
        website: data.website || '',
        company_size: data.company_size || '10-50',
        target_audience: data.target_audience || '',
        logo_url: data.logo_url || '',
        name: data.name || '',
        platform_link: data.platform_link || '',
        subscriber_count: data.subscriber_count || 0,
        engagement_rate: data.engagement_rate ? parseFloat(data.engagement_rate) : 2.50,
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        location: data.location || '',
        points_balance: data.points_balance || 0,
        rating: data.rating ? Number(data.rating) : 5.0,
        total_ratings_count: data.total_ratings_count || 0,
      });

      if (data.niche) {
        setSelectedNiches(data.niche.split(',').map(s => s.trim().toLowerCase()));
      }
      if (data.primary_platform) {
        setSelectedPlatforms(data.primary_platform.split(',').map(s => s.trim().toLowerCase()));
      }

      if (data.industry && !DEFAULT_INDUSTRIES.includes(data.industry)) {
        setCustomIndustry(data.industry);
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

  const handleNumericEmpCountChange = (val) => {
    setNumericEmpCount(val);
    const count = parseInt(val, 10);
    if (!isNaN(count)) {
      let sizeScale = '1-10';
      if (count <= 10) sizeScale = '1-10';
      else if (count <= 50) sizeScale = '10-50';
      else if (count <= 250) sizeScale = '50-250';
      else sizeScale = '250+';
      setFormData(prev => ({ ...prev, company_size: sizeScale }));
    }
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

  const handleAddCustomNiche = (e) => {
    e.preventDefault();
    if (!customNiche.trim()) return;
    const cleaned = customNiche.trim().toLowerCase();
    if (!selectedNiches.includes(cleaned)) {
      setSelectedNiches([...selectedNiches, cleaned]);
    }
    setCustomNiche('');
  };

  const handleAddCustomPlatform = (e) => {
    e.preventDefault();
    if (!customPlatform.trim()) return;
    const cleaned = customPlatform.trim().toLowerCase();
    if (!selectedPlatforms.includes(cleaned)) {
      setSelectedPlatforms([...selectedPlatforms, cleaned]);
    }
    setCustomPlatform('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const finalIndustry = customIndustry.trim() ? customIndustry.trim() : formData.industry;

    let finalNiches = [...selectedNiches];
    if (customNiche.trim()) {
      const cleaned = customNiche.trim().toLowerCase();
      if (!finalNiches.includes(cleaned)) finalNiches.push(cleaned);
    }

    let finalPlatforms = [...selectedPlatforms];
    if (customPlatform.trim()) {
      const cleaned = customPlatform.trim().toLowerCase();
      if (!finalPlatforms.includes(cleaned)) finalPlatforms.push(cleaned);
    }

    const updatedPayload = {
      ...formData,
      industry: finalIndustry,
      niche: finalNiches.join(','),
      primary_platform: finalPlatforms.join(','),
    };

    try {
      const res = await updateUserProfile(updatedPayload);
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setMessage({ type: 'success', text: 'Profile & credentials updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTopUpPoints = async (e) => {
    e.preventDefault();
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
        text: `Successfully purchased +${topUpAmount} Escrow Points!`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to process points purchase.' });
    } finally {
      setSaving(false);
    }
  };

  const isBrand = user?.role === 'brand';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-black text-base ${
        isBrand ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-zinc-200'
      }`}>
        <span>Loading Profile Data...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 sm:p-8 ${
      isBrand ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center space-x-2 text-xs sm:text-sm font-black transition cursor-pointer ${
            isBrand ? 'text-slate-700 hover:text-slate-950' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* HEADER BAR */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/5'
            : 'bg-zinc-900/90 border-red-500/30 shadow-2xl shadow-red-950/50 animate-pulse-red-glow'
        }`}>
          <div className="space-y-2">
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              isBrand ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-red-950/80 text-red-200 border border-red-500/40'
            }`}>
              {isBrand ? <Building2 className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
              <span>{isBrand ? 'Corporate Brand Identity Profile' : 'Creator Sponsorship Profile Node'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {isBrand ? formData.company_name || formData.username : formData.name || formData.username}
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
              Manage credentials, platform settings, company specs, & points balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isBrand && (
              <div className="bg-zinc-950 border border-amber-500/40 px-4 py-3 rounded-2xl text-center">
                <span className="text-xs uppercase font-black text-amber-400 block">Rating Score</span>
                <div className="flex items-center space-x-1 font-black text-amber-300 text-base sm:text-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{formData.rating.toFixed(1)}</span>
                  <span className="text-xs text-zinc-400 font-semibold">({formData.total_ratings_count})</span>
                </div>
              </div>
            )}

            <div className={`px-6 py-3 rounded-2xl text-center shadow-lg ${
              isBrand ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-600/40'
            }`}>
              <span className="text-xs uppercase tracking-wider font-black block opacity-90">Points Balance</span>
              <div className="text-2xl sm:text-3xl font-black">{formData.points_balance} PTS</div>
            </div>
          </div>
        </div>

        {/* FEEDBACK MESSAGE */}
        {message.text && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-black text-center border ${
            message.type === 'success'
              ? isBrand ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
              : 'bg-red-500/20 text-red-200 border-red-500/50'
          }`}>
            {message.text}
          </div>
        )}

        {/* MAIN EDIT FORM CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: EDIT FORM (ALL SCHEMA FIELDS) */}
          <form onSubmit={handleSubmit} className={`lg:col-span-2 rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
            isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <h2 className="text-xl font-black border-b pb-3">Edit Complete Profile (All DB Fields)</h2>

            {/* BASE USER CREDENTIALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1 ${
                  isBrand ? 'text-slate-800' : 'text-zinc-200'
                }`}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1 ${
                  isBrand ? 'text-slate-800' : 'text-zinc-200'
                }`}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                  }`}
                />
              </div>
            </div>

            {/* BRAND SCHEMA FIELDS */}
            {isBrand ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Website URL</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* INDUSTRY: DROPDOWN + TYPED CUSTOM INPUT */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Industry Sector</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      {DEFAULT_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>

                    <input
                      type="text"
                      placeholder="Or type custom industry..."
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Employee Count (Numeric)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={numericEmpCount}
                      onChange={(e) => handleNumericEmpCountChange(e.target.value)}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Size Scale</label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1-10">1-10 Employees (Startup)</option>
                      <option value="10-50">10-50 Employees (Growth)</option>
                      <option value="50-250">50-250 Employees (Mid-Market)</option>
                      <option value="250+">250+ Employees (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Target Audience Demographic</label>
                    <input
                      type="text"
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Headquarters Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Brand Logo Image URL</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Bio & Overview</label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl p-4 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              /* CREATOR SCHEMA FIELDS */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Creator Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Main Channel / Profile URL</label>
                    <input
                      type="url"
                      name="platform_link"
                      value={formData.platform_link}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Subscriber Count</label>
                    <input
                      type="number"
                      name="subscriber_count"
                      value={formData.subscriber_count}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Engagement Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="engagement_rate"
                      value={formData.engagement_rate}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* CREATOR NICHES: SELECTION + TYPED INPUT */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-2">Content Niches</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_NICHES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleNicheCheckbox(n)}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase transition cursor-pointer ${
                          selectedNiches.includes(n)
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add custom niche tag..."
                      value={customNiche}
                      onChange={(e) => setCustomNiche(e.target.value)}
                      className="flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomNiche}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shrink-0"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* CREATOR PLATFORMS: SELECTION + TYPED INPUT */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-2">Primary Platforms</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_PLATFORMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePlatformCheckbox(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase transition cursor-pointer ${
                          selectedPlatforms.includes(p)
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add custom platform tag..."
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      className="flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPlatform}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shrink-0"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Creator Bio & Content Style</label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl p-4 text-xs sm:text-sm font-medium bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                isBrand ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>

          {/* RIGHT COL: POINTS TOP-UP & PORTFOLIO ACTION */}
          <div className="space-y-6">
            
            {/* BRAND POINTS TOP UP CARD */}
            {isBrand && (
              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xl space-y-4 text-slate-900">
                <h3 className="text-lg font-black text-slate-900">Purchase Escrow Points</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Add points to your brand balance to launch new campaigns and escrow funds for creators.
                </p>

                <form onSubmit={handleTopUpPoints} className="space-y-3">
                  <select
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="500">+500 PTS (Basic)</option>
                    <option value="1000">+1,000 PTS (Standard)</option>
                    <option value="2500">+2,500 PTS (Pro)</option>
                    <option value="5000">+5,000 PTS (Enterprise)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    {saving ? 'Processing...' : `Add +${topUpAmount} Points`}
                  </button>
                </form>
              </div>
            )}

            {/* CREATOR DELIVERABLES PORTFOLIO DIRECT LINK */}
            {!isBrand && (
              <div className="bg-zinc-900 border border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4 text-white animate-pulse-red-glow">
                <h3 className="text-lg font-black text-white">Deliverables Portfolio</h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  Showcase your past video submissions and brand 5-star ratings to potential sponsors.
                </p>

                <button
                  onClick={() => navigate('/portfolio')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>View Public Portfolio</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}