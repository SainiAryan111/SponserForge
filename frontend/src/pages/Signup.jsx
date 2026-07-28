import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext.jsx';
import { Building2, UserCheck, Sparkles } from 'lucide-react';

export default function Signup() {
  const [role, setRole] = useState('brand');
  
  // Base User Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Brand Profile Fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [targetAudience, setTargetAudience] = useState('');

  // Creator Profile Fields
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('tech');
  const [primaryPlatform, setPrimaryPlatform] = useState('youtube');
  const [platformLink, setPlatformLink] = useState('');
  const [subscriberCount, setSubscriberCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Parse numeric values safely
    const parsedSubscribers = subscriberCount === '' ? 0 : parseInt(subscriberCount, 10);
    const parsedEngagement = engagementRate === '' ? null : parseFloat(engagementRate);

    const rolePayload = role === 'brand' 
      ? {
          company_name: companyName.trim(),
          industry: industry.trim(),
          website: website.trim() || null,
          company_size: companySize,
          target_audience: targetAudience.trim()
        } 
      : {
          bio: bio.trim(),
          niche,
          primary_platform: primaryPlatform,
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
      // Ensure login parameter list matches AuthContext implementation
      await login(username, password); 
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      // Parse DRF validation object errors (e.g., { username: ["This field is required."] })
      const data = err.response?.data;
      let errMsg = 'Registration failed. Please check your inputs and try again.';

      if (typeof data === 'string') {
        errMsg = data;
      } else if (data?.error) {
        errMsg = data.error;
      } else if (data?.detail) {
        errMsg = data.detail;
      } else if (data && typeof data === 'object') {
        // Extract first field error from Django Rest Framework serializer error response
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
          <p className="text-slate-400 text-sm">Create your {role === 'brand' ? 'Brand Entity' : 'Creator Node'} account</p>
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
            <span>Brand Entity</span>
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
            <span>Creator Node</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section: Account Credentials */}
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

          {/* Section: Dynamic Profile Fields */}
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
                    Industry
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="SaaS / Artificial Intelligence"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
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
                    Company Size
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Niche
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Primary Platform
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={primaryPlatform}
                    onChange={(e) => setPrimaryPlatform(e.target.value)}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitch">Twitch</option>
                  </select>
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'brand' ? 'Brand Entity' : 'Creator Node'}`}
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