import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext.jsx';
import { Building2, UserCheck, Sparkles, Plus } from 'lucide-react';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];
const DEFAULT_INDUSTRIES = ['Software / SaaS', 'E-Commerce & Retail', 'Gaming & Hardware', 'Health & Fitness', 'Fashion & Apparel', 'Financial Tech'];

export default function Signup() {
  const [role, setRole] = useState('brand');
  
  // Base User Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Brand Profile Fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [numericEmpCount, setNumericEmpCount] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  // Creator Profile Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedNiches, setSelectedNiches] = useState(['tech']);
  const [customNiche, setCustomNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube']);
  const [customPlatform, setCustomPlatform] = useState('');
  const [platformLink, setPlatformLink] = useState('');
  const [subscriberCount, setSubscriberCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Automatic Company Size Mapping from Numeric Input
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

  const handlePlatformCheckbox = (p) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!username.trim() || !email.trim() || !password) {
      return setError('Username, Email, and Password are required.');
    }

    setLoading(true);

    // Compute final niche list including custom option if provided
    let finalNiches = [...selectedNiches];
    if (customNiche.trim()) {
      finalNiches.push(customNiche.trim().toLowerCase());
    }

    let finalPlatforms = [...selectedPlatforms];
    if (customPlatform.trim()) {
      finalPlatforms.push(customPlatform.trim().toLowerCase());
    }

    let finalIndustry = industry;
    if (customIndustry.trim()) {
      finalIndustry = customIndustry.trim();
    }

    // Parse numeric values safely
    const parsedSubscribers = subscriberCount === '' ? 0 : parseInt(subscriberCount, 10);
    const parsedEngagement = engagementRate === '' ? null : parseFloat(engagementRate);

    const rolePayload = role === 'brand' 
      ? {
          company_name: companyName.trim(),
          industry: finalIndustry,
          website: website.trim() || null,
          company_size: companySize,
          target_audience: targetAudience.trim()
        } 
      : {
          name: name.trim(),
          bio: bio.trim(),
          niche: finalNiches.join(','),
          primary_platform: finalPlatforms.join(','),
          platform_link: platformLink.trim() || null,
          subscriber_count: isNaN(parsedSubscribers) ? 0 : parsedSubscribers,
          engagement_rate: isNaN(parsedEngagement) ? null : parsedEngagement,
          location: location.trim()
        };

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      ...rolePayload
    };

    try {
      await api.post('auth/signup/', payload);
      await login(username, password); 
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      const data = err.response?.data;
      let errMsg = 'Registration failed. Please check your inputs and try again.';

      if (typeof data === 'string') {
        errMsg = data;
      } else if (data?.error) {
        errMsg = data.error;
      } else if (data?.detail) {
        errMsg = data.detail;
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          errMsg = `${firstKey}: ${data[firstKey][0]}`;
        }
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 space-y-6 my-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-indigo-400 font-extrabold text-2xl">
            <Sparkles className="w-6 h-6" />
            <span>SponsorForge</span>
          </div>
          <p className="text-slate-400 text-sm">Create your {role === 'brand' ? 'Brand' : 'Creator'} account</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setRole('brand')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              role === 'brand'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Brand Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              role === 'creator'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Creator Account</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Account Credentials */}
          <div className="text-xs font-bold uppercase text-indigo-400 tracking-wider pt-2">
            Account Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder={role === 'brand' ? 'tech_corp' : 'code_master'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Dynamic Profile Fields */}
          <div className="text-xs font-bold uppercase text-indigo-400 tracking-wider pt-4 border-t border-slate-700/60">
            {role === 'brand' ? 'Brand Profile Setup' : 'Creator Profile Setup'}
          </div>

          {role === 'brand' ? (
            /* BRAND SPECIFIC FIELDS */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Acme AI Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Industry Options
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {DEFAULT_INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Industry Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  + Or Add Custom Industry Choice (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Type new industry name..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company Size Range
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                  >
                    <option value="1-10">1 - 10 employees</option>
                    <option value="10-50">10 - 50 employees</option>
                    <option value="50-250">50 - 250 employees</option>
                    <option value="250+">250+ employees</option>
                  </select>
                </div>
              </div>

              {/* Company Size Numeric Input Auto-Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Or Type Exact Employee Count (Auto-Selects Option):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={numericEmpCount}
                  onChange={(e) => handleNumericEmpCountChange(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Target Audience Description
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Developers, Tech Enthusiasts, 18-35 Males/Females"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
          ) : (
            /* CREATOR SPECIFIC FIELDS */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Creator Display Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Multi-Select Checkboxes: Niche */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Content Niche(s) - Select Multiple Checkboxes
                </label>
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

                {/* Add Custom Niche Choice */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="+ Add Custom Choice (e.g. AI & Robotics)"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Multi-Select Checkboxes: Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Platform(s) - Select Multiple Checkboxes
                </label>
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

                {/* Add Custom Platform Choice */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="+ Add Custom Choice (e.g. Substack / Podcast)"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Platform Channel / Profile URL
                  </label>
                  <input
                    type="url"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="https://youtube.com/@channel"
                    value={platformLink}
                    onChange={(e) => setPlatformLink(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Subscriber / Follower Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="15000"
                    value={subscriberCount}
                    onChange={(e) => setSubscriberCount(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Engagement Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="3.85"
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Bio / Creator Pitch (Used for AI Matching)
                </label>
                <textarea
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Tell brands what content you create, your audience demographic, and your sponsorship experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'brand' ? 'Brand Account' : 'Creator Account'}`}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-700/50">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}