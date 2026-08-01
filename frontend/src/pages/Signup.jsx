import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext.jsx';
import { Building2, UserCheck, Sparkles, Plus, Zap, ShieldCheck, ArrowRight, Globe, MapPin, Image, Percent, Link as LinkIcon } from 'lucide-react';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];
const DEFAULT_INDUSTRIES = ['SaaS & AI Software', 'E-Commerce & Retail', 'Gaming & Hardware', 'Fitness & Supplements', 'Fashion & Apparel', 'Financial Tech & Crypto'];

export default function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'creator' ? 'creator' : 'brand';

  const [role, setRole] = useState(initialRole);
  
  // Base User Credentials
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Brand Profile Fields (All Schema Fields)
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [numericEmpCount, setNumericEmpCount] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandBio, setBrandBio] = useState('');
  const [brandLocation, setBrandLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Creator Profile Fields (All Schema Fields)
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedNiches, setSelectedNiches] = useState(['tech']);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube']);
  const [customPlatformInput, setCustomPlatformInput] = useState('');
  const [platformLink, setPlatformLink] = useState('');
  const [subscriberCount, setSubscriberCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('2.50');
  const [creatorLocation, setCreatorLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'creator' || roleParam === 'brand') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleNumericEmpCountChange = (val) => {
    setNumericEmpCount(val);
    const count = parseInt(val, 10);
    if (!isNaN(count)) {
      if (count <= 10) setCompanySize('1-10');
      else if (count <= 50) setCompanySize('10-50');
      else if (count <= 250) setCompanySize('50-250');
      else setCompanySize('250+');
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

  const handleAddCustomNiche = (e) => {
    e.preventDefault();
    if (!customNicheInput.trim()) return;
    const cleaned = customNicheInput.trim().toLowerCase();
    if (!selectedNiches.includes(cleaned)) {
      setSelectedNiches([...selectedNiches, cleaned]);
    }
    setCustomNicheInput('');
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

  const handleAddCustomPlatform = (e) => {
    e.preventDefault();
    if (!customPlatformInput.trim()) return;
    const cleaned = customPlatformInput.trim().toLowerCase();
    if (!selectedPlatforms.includes(cleaned)) {
      setSelectedPlatforms([...selectedPlatforms, cleaned]);
    }
    setCustomPlatformInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      return setError('Username, Email, and Password are required.');
    }

    setLoading(true);

    let finalIndustry = customIndustry.trim() ? customIndustry.trim() : industry;

    let finalNiches = [...selectedNiches];
    if (customNicheInput.trim()) {
      const cleaned = customNicheInput.trim().toLowerCase();
      if (!finalNiches.includes(cleaned)) finalNiches.push(cleaned);
    }

    let finalPlatforms = [...selectedPlatforms];
    if (customPlatformInput.trim()) {
      const cleaned = customPlatformInput.trim().toLowerCase();
      if (!finalPlatforms.includes(cleaned)) finalPlatforms.push(cleaned);
    }

    const payload = {
      username,
      email,
      password,
      role,
      // Brand Fields
      company_name: companyName,
      industry: finalIndustry,
      website,
      company_size: companySize,
      target_audience: targetAudience,
      bio: role === 'brand' ? brandBio : bio,
      location: role === 'brand' ? brandLocation : creatorLocation,
      logo_url: logoUrl,
      // Creator Fields
      name,
      niche: finalNiches.join(','),
      primary_platform: finalPlatforms.join(','),
      platform_link: platformLink,
      subscriber_count: subscriberCount ? parseInt(subscriberCount, 10) : 0,
      engagement_rate: engagementRate ? parseFloat(engagementRate) : 2.50,
      avatar_url: avatarUrl,
    };

    try {
      await api.post('auth/signup/', payload);
      await login(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      const errMsg = err.response?.data?.error || 'Registration failed. Username may already exist.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isBrand = role === 'brand';

  return (
    <div className={`min-h-screen transition-colors duration-700 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden ${
      isBrand ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>
      
      {/* BACKGROUND GRADIENT GLOW ORBS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-700"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl transition-all duration-700"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 font-black text-3xl tracking-tight transition hover:scale-105">
            <Sparkles className={`w-8 h-8 ${isBrand ? 'text-blue-600' : 'text-red-500'}`} />
            <span className={isBrand ? 'text-slate-900' : 'text-white'}>SponserForge</span>
          </Link>
          <p className={`text-xs sm:text-sm font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
            {isBrand ? 'Create an Enterprise Brand Account to Launch Campaigns' : 'Join the Creator Realm to Get Sponsored & Receive Direct Offers'}
          </p>
        </div>

        {/* CARD CONTAINER WITH DYNAMIC ROLE THEME */}
        <div className={`rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-500 space-y-6 ${
          isBrand
            ? 'bg-white border-blue-200 shadow-blue-500/10'
            : 'bg-zinc-900/90 border-red-500/30 shadow-red-950/50 animate-pulse-red-glow'
        }`}>

          {/* DUAL ROLE SWITCHER TABS */}
          <div className={`grid grid-cols-2 gap-2 p-2 rounded-2xl border transition ${
            isBrand ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                isBrand
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Brand Entity</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('creator')}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                !isBrand
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Creator Node</span>
            </button>
          </div>

          {/* Role Description Badge */}
          <div className={`text-xs sm:text-sm p-3.5 rounded-2xl font-extrabold flex items-center space-x-2 border transition ${
            isBrand
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-red-950/60 text-red-200 border-red-500/40'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isBrand
                ? 'Register your company profile to launch campaigns & match creators with AI vector precision.'
                : 'Join as a creator to feature in the search directory, build your portfolio & receive direct offers.'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-3.5 rounded-2xl text-xs sm:text-sm font-black text-center">
              {error}
            </div>
          )}

          {/* SIGNUP FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* BASE CREDENTIALS */}
            <div className="space-y-4 border-b border-slate-200/50 pb-6">
              <h3 className={`text-sm sm:text-base font-black uppercase tracking-wider ${
                isBrand ? 'text-blue-800' : 'text-red-400'
              }`}>
                1. Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 ${
                    isBrand ? 'text-slate-800' : 'text-zinc-200'
                  }`}>Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="Choose username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                      isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 ${
                    isBrand ? 'text-slate-800' : 'text-zinc-200'
                  }`}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                      isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 ${
                  isBrand ? 'text-slate-800' : 'text-zinc-200'
                }`}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                  }`}
                />
              </div>
            </div>

            {/* BRAND SPECIFIC FIELDS */}
            {isBrand ? (
              <div className="space-y-4 border-b border-slate-200/50 pb-6">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-800">
                  2. Brand Entity Profile (All Schema Fields)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Tech Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Website URL</label>
                    <input
                      type="url"
                      placeholder="https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* INDUSTRY SELECTOR + TYPED CUSTOM INDUSTRY */}
                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Industry Sector *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      {DEFAULT_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>

                    <input
                      type="text"
                      placeholder="Or type custom industry..."
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Employee Count (Numeric)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={numericEmpCount}
                      onChange={(e) => handleNumericEmpCountChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Size Scale</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Target Audience Demographic</label>
                    <input
                      type="text"
                      placeholder="e.g. Gen-Z Tech Enthusiasts & Gamers"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Headquarters Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA, USA"
                      value={brandLocation}
                      onChange={(e) => setBrandLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Brand Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Bio & Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your company mission, products, and sponsorship goals..."
                    value={brandBio}
                    onChange={(e) => setBrandBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              /* CREATOR SPECIFIC FIELDS */
              <div className="space-y-4 border-b border-zinc-800 pb-6">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-red-400">
                  2. Creator Node Profile (All Schema Fields)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Main Profile / Channel URL</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@alexrivera"
                      value={platformLink}
                      onChange={(e) => setPlatformLink(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Subscriber Count *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={subscriberCount}
                      onChange={(e) => setSubscriberCount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Engagement Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 3.85"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Los Angeles, CA, USA"
                      value={creatorLocation}
                      onChange={(e) => setCreatorLocation(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* CREATOR NICHES: SELECTION + TYPED INPUT */}
                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-2">Content Niches *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_NICHES.map(n => (
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
                      placeholder="Type custom niche tag..."
                      value={customNicheInput}
                      onChange={(e) => setCustomNicheInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomNiche}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shrink-0"
                    >
                      + Add Niche
                    </button>
                  </div>
                </div>

                {/* CREATOR PLATFORMS: SELECTION + TYPED INPUT */}
                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-2">Primary Platforms *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_PLATFORMS.map(p => (
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
                      placeholder="Type custom platform tag..."
                      value={customPlatformInput}
                      onChange={(e) => setCustomPlatformInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPlatform}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shrink-0"
                    >
                      + Add Platform
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Avatar Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Creator Bio & Content Style</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your audience demographics, video topics, and sponsorship style..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm font-medium text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                isBrand
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
              }`}
            >
              <span>{loading ? 'Creating Account...' : `Register & Launch ${isBrand ? 'Brand Hub' : 'Creator Node'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className={`text-xs sm:text-sm font-bold ${isBrand ? 'text-slate-600' : 'text-zinc-400'}`}>
              Already registered?{' '}
              <Link
                to="/login"
                className={`font-black underline transition ${
                  isBrand ? 'text-blue-600 hover:text-blue-800' : 'text-red-400 hover:text-white'
                }`}
              >
                Sign in to your account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}