import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Building2, Sparkles, Plus, Zap, ShieldCheck, ArrowRight, CheckCircle2, User, Globe, MapPin, Image, Percent, Link as LinkIcon, AlertCircle } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { resolveImageUrl } from '../utils/imageUtils.js';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];
const DEFAULT_INDUSTRIES = ['SaaS & AI Software', 'E-Commerce & Retail', 'Gaming & Hardware', 'Fitness & Supplements', 'Fashion & Apparel', 'Financial Tech & Crypto'];

const SUBSCRIBER_RANGE_OPTIONS = [
  { label: '0-1K', value: 500 },
  { label: '1K-10K', value: 5000 },
  { label: '10K-100K', value: 50000 },
  { label: '100K-1M', value: 500000 },
  { label: '1M-10M', value: 5000000 },
  { label: '10M-100M', value: 50000000 },
  { label: '100M+', value: 100000000 },
];

// Helper URL Validator
const isValidUrl = (urlStr) => {
  if (!urlStr || !urlStr.trim()) return true;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'creator' ? 'creator' : 'brand';

  const [role, setRole] = useState(initialRole);
  
  // Step State: 1 = Google Auth, 2 = Username Account Details, 3 = Profile Setup
  const [step, setStep] = useState(1);
  const [googleAuthData, setGoogleAuthData] = useState(null);

  // Username Handle
  const [username, setUsername] = useState('');

  // Brand Profile Fields (Employee Size as Numeric Value)
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [numericEmpCount, setNumericEmpCount] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandBio, setBrandBio] = useState('');
  const [brandLocation, setBrandLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Creator Profile Fields (Subscriber Count as Range Selection Options)
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedNiches, setSelectedNiches] = useState(['tech']);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube']);
  const [customPlatformInput, setCustomPlatformInput] = useState('');
  const [platformLink, setPlatformLink] = useState('');
  const [subscriberRange, setSubscriberRange] = useState('1K-10K');
  const [engagementRate, setEngagementRate] = useState('2.50');
  const [creatorLocation, setCreatorLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Error States
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'creator' || roleParam === 'brand') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Real-time Field Validation helper
  const validateSingleField = (fieldName, value) => {
    let err = '';
    if (fieldName === 'username') {
      if (!value || !value.trim()) err = 'Username handle is required.';
      else if (value.trim().length < 3) err = 'Username must be at least 3 characters long.';
      else if (value.trim().length > 30) err = 'Username cannot exceed 30 characters.';
      else if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) err = 'Username can only contain letters, numbers, underscores (_), and hyphens (-).';
    } else if (fieldName === 'companyName') {
      if (!value || !value.trim()) err = 'Company Name is required.';
      else if (value.trim().length < 2) err = 'Company Name must be at least 2 characters long.';
    } else if (fieldName === 'name') {
      if (!value || !value.trim()) err = 'Full Display Name is required.';
      else if (value.trim().length < 2) err = 'Display Name must be at least 2 characters long.';
    } else if (fieldName === 'website' || fieldName === 'logoUrl' || fieldName === 'platformLink' || fieldName === 'avatarUrl') {
      if (value && value.trim() && !isValidUrl(value)) err = 'Please enter a valid URL starting with http:// or https://';
    } else if (fieldName === 'numericEmpCount') {
      if (!value || !value.toString().trim()) {
        err = 'Numeric employee count is required.';
      } else {
        const count = parseInt(value, 10);
        if (isNaN(count) || count <= 0) err = 'Employee count must be a positive number (> 0).';
      }
    } else if (fieldName === 'engagementRate') {
      if (value && value.toString().trim()) {
        const eng = parseFloat(value);
        if (isNaN(eng) || eng < 0 || eng > 100) err = 'Engagement rate must be between 0.0% and 100.0%';
      }
    } else if (fieldName === 'brandBio' || fieldName === 'bio') {
      if (value && value.trim() && value.trim().length < 10) err = 'Bio overview must be at least 10 characters long if provided.';
    }

    setFieldErrors(prev => ({ ...prev, [fieldName]: err }));
  };

  // Step 1 Handler: Google Authentication Success Callback
  const handleGoogleAuthSuccess = (data) => {
    const verifiedEmail = data.email || 'verified_google_user@gmail.com';
    const verifiedName = data.name || '';
    
    setGoogleAuthData({
      access_token: data.access_token,
      credential: data.credential,
      email: verifiedEmail,
      name: verifiedName
    });
    
    const suggestedUsername = verifiedEmail ? verifiedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : '';
    setUsername(suggestedUsername);
    if (verifiedName) {
      setName(verifiedName);
      setCompanyName(verifiedName);
    }
    setError('');
    setFieldErrors({});
    setStep(2);
  };

  const handleNicheCheckbox = (n) => {
    let updated;
    if (selectedNiches.includes(n)) {
      if (selectedNiches.length > 1) {
        updated = selectedNiches.filter(item => item !== n);
      } else {
        updated = selectedNiches;
      }
    } else {
      updated = [...selectedNiches, n];
    }
    setSelectedNiches(updated);
    setFieldErrors(prev => ({ ...prev, selectedNiches: updated.length === 0 ? 'Please select at least one content niche.' : '' }));
  };

  const handleAddCustomNiche = (e) => {
    e.preventDefault();
    if (!customNicheInput.trim()) return;
    const cleaned = customNicheInput.trim().toLowerCase();
    if (!selectedNiches.includes(cleaned)) {
      const updated = [...selectedNiches, cleaned];
      setSelectedNiches(updated);
      setFieldErrors(prev => ({ ...prev, selectedNiches: '' }));
    }
    setCustomNicheInput('');
  };

  const handlePlatformCheckbox = (p) => {
    let updated;
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        updated = selectedPlatforms.filter(item => item !== p);
      } else {
        updated = selectedPlatforms;
      }
    } else {
      updated = [...selectedPlatforms, p];
    }
    setSelectedPlatforms(updated);
    setFieldErrors(prev => ({ ...prev, selectedPlatforms: updated.length === 0 ? 'Please select at least one primary platform.' : '' }));
  };

  const handleAddCustomPlatform = (e) => {
    e.preventDefault();
    if (!customPlatformInput.trim()) return;
    const cleaned = customPlatformInput.trim().toLowerCase();
    if (!selectedPlatforms.includes(cleaned)) {
      const updated = [...selectedPlatforms, cleaned];
      setSelectedPlatforms(updated);
      setFieldErrors(prev => ({ ...prev, selectedPlatforms: '' }));
    }
    setCustomPlatformInput('');
  };

  // Step 2 -> Step 3 Validation
  const handleProceedToProfile = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !username.trim()) {
      setFieldErrors(prev => ({ ...prev, username: 'Username handle is required.' }));
      return setError('Please choose a valid username handle.');
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
      setFieldErrors(prev => ({ ...prev, username: 'Username handle must be between 3 and 30 characters.' }));
      return setError('Username handle must be between 3 and 30 characters.');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setFieldErrors(prev => ({ ...prev, username: 'Username handle can only contain letters, numbers, underscores (_), and hyphens (-).' }));
      return setError('Username handle can only contain letters, numbers, underscores (_), and hyphens (-).');
    }

    setFieldErrors({});
    setStep(3);
  };

  // Final Registration Submission with Comprehensive Validation
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!googleAuthData || !googleAuthData.email) {
      return setError('Google Authentication is required to complete registration.');
    }

    const errors = {};

    // Validate Username
    if (!username || !username.trim()) {
      errors.username = 'Username handle is required.';
    } else if (username.trim().length < 3 || username.trim().length > 30) {
      errors.username = 'Username handle must be 3-30 characters long.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      errors.username = 'Username can only contain letters, numbers, _ and -';
    }

    // Role-based validations
    if (role === 'brand') {
      if (!companyName || !companyName.trim()) {
        errors.companyName = 'Company Name is required.';
      } else if (companyName.trim().length < 2) {
        errors.companyName = 'Company Name must be at least 2 characters long.';
      }

      if (!numericEmpCount || !numericEmpCount.toString().trim()) {
        errors.numericEmpCount = 'Company employee numeric count is required.';
      } else {
        const count = parseInt(numericEmpCount, 10);
        if (isNaN(count) || count <= 0) {
          errors.numericEmpCount = 'Employee count must be a positive numeric value greater than 0.';
        }
      }

      if (website && website.trim() && !isValidUrl(website)) {
        errors.website = 'Please enter a valid website URL starting with http:// or https://';
      }

      if (logoUrl && logoUrl.trim() && !isValidUrl(logoUrl)) {
        errors.logoUrl = 'Please enter a valid logo image URL starting with http:// or https://';
      }

      if (brandBio && brandBio.trim() && brandBio.trim().length < 10) {
        errors.brandBio = 'Brand overview bio must be at least 10 characters long if provided.';
      }
    } else {
      // Creator validations
      if (!name || !name.trim()) {
        errors.name = 'Full Creator Display Name is required.';
      } else if (name.trim().length < 2) {
        errors.name = 'Display Name must be at least 2 characters long.';
      }

      if (!subscriberRange) {
        errors.subscriberRange = 'Subscriber range selection is required.';
      }

      if (!selectedNiches || selectedNiches.length === 0) {
        errors.selectedNiches = 'Please select at least one content niche.';
      }

      if (!selectedPlatforms || selectedPlatforms.length === 0) {
        errors.selectedPlatforms = 'Please select at least one primary platform.';
      }

      if (platformLink && platformLink.trim() && !isValidUrl(platformLink)) {
        errors.platformLink = 'Please enter a valid platform URL starting with http:// or https://';
      }

      if (engagementRate && engagementRate.toString().trim()) {
        const eng = parseFloat(engagementRate);
        if (isNaN(eng) || eng < 0 || eng > 100) {
          errors.engagementRate = 'Engagement rate must be between 0.0% and 100.0%';
        }
      }

      if (avatarUrl && avatarUrl.trim() && !isValidUrl(avatarUrl)) {
        errors.avatarUrl = 'Please enter a valid avatar image URL starting with http:// or https://';
      }

      if (bio && bio.trim() && bio.trim().length < 10) {
        errors.bio = 'Creator bio must be at least 10 characters long if provided.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return setError('Please fix the highlighted errors before completing registration.');
    }

    setLoading(true);

    let finalIndustry = industry.trim();

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

    // Convert Creator selected subscriber range to numeric count value
    const selectedSubObj = SUBSCRIBER_RANGE_OPTIONS.find(opt => opt.label === subscriberRange);
    const subCountNumericValue = selectedSubObj ? selectedSubObj.value : 5000;

    const payload = {
      credential: googleAuthData.credential,
      email: googleAuthData.email,
      name: googleAuthData.name,
      username: username.trim(),
      role,
      // Brand Profile Fields
      company_name: companyName || googleAuthData.name || username,
      industry: finalIndustry,
      website,
      company_size: numericEmpCount ? `${numericEmpCount} employees` : '10-50',
      target_audience: targetAudience,
      bio: role === 'brand' ? brandBio : bio,
      location: role === 'brand' ? brandLocation : creatorLocation,
      logo_url: resolveImageUrl(logoUrl),
      // Creator Profile Fields
      name: name || googleAuthData.name || username,
      niche: finalNiches,
      primary_platform: finalPlatforms,
      platform_link: platformLink,
      subscriber_count: subCountNumericValue,
      engagement_rate: engagementRate ? parseFloat(engagementRate) : 2.50,
      avatar_url: resolveImageUrl(avatarUrl),
    };

    try {
      await loginWithGoogle(googleAuthData.credential, role, payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please review your fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBrand = role === 'brand';

  return (
    <div className={`min-h-screen transition-colors duration-700 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden ${
      isBrand ? 'bg-slate-100 text-slate-900' : 'bg-zinc-950 text-white'
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

        {/* STEP PROGRESS INDICATOR BAR */}
        <div className={`rounded-2xl p-3 border flex items-center justify-around text-xs font-black ${
          isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className={`flex items-center space-x-1.5 ${step >= 1 ? (isBrand ? 'text-blue-600' : 'text-red-400') : 'text-zinc-500'}`}>
            <span className="w-5 h-5 rounded-full bg-current text-zinc-950 flex items-center justify-center text-[10px] font-black">1</span>
            <span>Google Auth</span>
          </div>
          <span className="text-zinc-600">→</span>
          <div className={`flex items-center space-x-1.5 ${step >= 2 ? (isBrand ? 'text-blue-600' : 'text-red-400') : 'text-zinc-500'}`}>
            <span className="w-5 h-5 rounded-full bg-current text-zinc-950 flex items-center justify-center text-[10px] font-black">2</span>
            <span>Username Handle</span>
          </div>
          <span className="text-zinc-600">→</span>
          <div className={`flex items-center space-x-1.5 ${step >= 3 ? (isBrand ? 'text-blue-600' : 'text-red-400') : 'text-zinc-500'}`}>
            <span className="w-5 h-5 rounded-full bg-current text-zinc-950 flex items-center justify-center text-[10px] font-black">3</span>
            <span>{isBrand ? 'Brand Profile' : 'Creator Profile'}</span>
          </div>
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
              onClick={() => { setRole('brand'); setStep(1); setFieldErrors({}); }}
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
              onClick={() => { setRole('creator'); setStep(1); setFieldErrors({}); }}
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

          {/* Error Message Alert Banner */}
          {error && (
            <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: GOOGLE AUTHENTICATION FIRST */}
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="space-y-2">
                <h3 className={`text-lg sm:text-xl font-black uppercase tracking-wider ${
                  isBrand ? 'text-blue-800' : 'text-red-400'
                }`}>
                  Step 1: Authenticate with Google First
                </h3>
                <p className={`text-xs sm:text-sm ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
                  Sign in with your Google account to verify your identity before setting up your handle & profile.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <GoogleAuthButton
                  role={role}
                  onAuthSuccess={handleGoogleAuthSuccess}
                  buttonText={`Sign in as ${isBrand ? 'Brand' : 'Creator'} with Google`}
                  isBrand={isBrand}
                />
              </div>
            </div>
          )}

          {/* STEP 2: ACCOUNT DETAILS (USERNAME ONLY) */}
          {step === 2 && (
            <form onSubmit={handleProceedToProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm sm:text-base font-black uppercase tracking-wider ${
                    isBrand ? 'text-blue-800' : 'text-red-400'
                  }`}>
                    Step 2: Account Details
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Email Verified</span>
                  </span>
                </div>

                {/* Verified Google Email Display */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isBrand ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Verified Google Email</span>
                    <strong className="text-sm">{googleAuthData?.email}</strong>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                {/* ONLY USERNAME FIELD WITH VALIDATION */}
                <div>
                  <label className={`block text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 ${
                    isBrand ? 'text-slate-800' : 'text-zinc-200'
                  }`}>Choose Username Handle *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aryan_saini"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      validateSingleField('username', e.target.value);
                    }}
                    className={`w-full rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                      fieldErrors.username
                        ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                        : isBrand
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                          : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                    }`}
                  />
                  {fieldErrors.username ? (
                    <p className="text-xs font-bold text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.username}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">3-30 characters (letters, numbers, _ and - allowed).</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-zinc-500 hover:text-white cursor-pointer"
                >
                  ← Back to Google Auth
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center space-x-2 cursor-pointer ${
                    isBrand ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  <span>Continue to Profile Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CREATOR NODE / BRAND PROFILE SETUP WITH COMPREHENSIVE VALIDATION */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              {/* BRAND SPECIFIC PROFILE FIELDS */}
              {isBrand ? (
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-800">
                    Step 3: Brand Entity Profile Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Innovations Corp"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          validateSingleField('companyName', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.companyName
                            ? 'bg-red-50 border border-red-500 text-slate-900 focus:ring-red-500'
                            : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                        }`}
                      />
                      {fieldErrors.companyName && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Industry Type</label>
                      <input
                        type="text"
                        placeholder="e.g. SaaS & AI Software, E-Commerce, Gaming..."
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Official Website URL</label>
                      <input
                        type="url"
                        placeholder="https://company.com"
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value);
                          validateSingleField('website', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.website
                            ? 'bg-red-50 border border-red-500 text-slate-900 focus:ring-red-500'
                            : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                        }`}
                      />
                      {fieldErrors.website && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.website}</p>
                      )}
                    </div>

                    {/* BRAND EMPLOYEE SIZE (NUMERIC VALUE INPUT) */}
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Company Employee Count</label>
                      <input
                        type="number"
                        required
                        placeholder="Total employees e.g. 50"
                        value={numericEmpCount}
                        onChange={(e) => {
                          setNumericEmpCount(e.target.value);
                          validateSingleField('numericEmpCount', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.numericEmpCount
                            ? 'bg-red-50 border border-red-500 text-slate-900 focus:ring-red-500'
                            : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                        }`}
                      />
                      {fieldErrors.numericEmpCount && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.numericEmpCount}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">HQ Location (City, Country)</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={brandLocation}
                        onChange={(e) => setBrandLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Brand Logo Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value);
                          validateSingleField('logoUrl', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.logoUrl
                            ? 'bg-red-50 border border-red-500 text-slate-900 focus:ring-red-500'
                            : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                        }`}
                      />
                      {fieldErrors.logoUrl ? (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.logoUrl}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Supports direct image URLs or YouTube channel links (e.g. youtube.com/@channel).</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Target Audience Demographics</label>
                    <input
                      type="text"
                      placeholder="e.g. Tech enthusiasts aged 18-35 in North America..."
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-1.5">Brand Bio & Mission</label>
                    <textarea
                      rows={3}
                      placeholder="Tell creators about your company mission and sponsorship goals..."
                      value={brandBio}
                      onChange={(e) => {
                        setBrandBio(e.target.value);
                        validateSingleField('brandBio', e.target.value);
                      }}
                      className={`w-full rounded-2xl p-4 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                        fieldErrors.brandBio
                          ? 'bg-red-50 border border-red-500 text-slate-900 focus:ring-red-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.brandBio && (
                      <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.brandBio}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* CREATOR NODE PROFILE FIELDS (SUBSCRIBER COUNT SELECTION OF OPTIONS) */
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-red-400">
                    Step 3: Creator Node Profile Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Full Creator Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your display name..."
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          validateSingleField('name', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.name
                            ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                            : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.name}</p>
                      )}
                    </div>

                    {/* CREATOR SUBSCRIBER COUNT SELECTION OF OPTIONS */}
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Subscriber / Follower Range *</label>
                      <select
                        value={subscriberRange}
                        onChange={(e) => setSubscriberRange(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500 cursor-pointer"
                      >
                        {SUBSCRIBER_RANGE_OPTIONS.map(opt => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} Subscribers
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-zinc-400 mt-1 font-medium">Select your estimated total audience range across platforms.</p>
                    </div>
                  </div>

                  {/* Niche Categories */}
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-2">Content Niches *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {DEFAULT_NICHES.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleNicheCheckbox(n)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                            selectedNiches.includes(n)
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                              : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.selectedNiches && (
                      <p className="text-xs font-bold text-red-500 mb-2">{fieldErrors.selectedNiches}</p>
                    )}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add custom niche..."
                        value={customNicheInput}
                        onChange={(e) => setCustomNicheInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomNiche}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black rounded-xl cursor-pointer"
                      >
                        + Add Niche
                      </button>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-2">Primary Platforms *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {DEFAULT_PLATFORMS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePlatformCheckbox(p)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                            selectedPlatforms.includes(p)
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                              : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.selectedPlatforms && (
                      <p className="text-xs font-bold text-red-500 mb-2">{fieldErrors.selectedPlatforms}</p>
                    )}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add custom platform..."
                        value={customPlatformInput}
                        onChange={(e) => setCustomPlatformInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomPlatform}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black rounded-xl cursor-pointer"
                      >
                        + Add Platform
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Main Platform Link</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@channel"
                        value={platformLink}
                        onChange={(e) => {
                          setPlatformLink(e.target.value);
                          validateSingleField('platformLink', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.platformLink
                            ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                            : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                        }`}
                      />
                      {fieldErrors.platformLink && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.platformLink}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Engagement Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        value={engagementRate}
                        onChange={(e) => {
                          setEngagementRate(e.target.value);
                          validateSingleField('engagementRate', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.engagementRate
                            ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                            : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                        }`}
                      />
                      {fieldErrors.engagementRate && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.engagementRate}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Creator Location (City, Country)</label>
                      <input
                        type="text"
                        placeholder="e.g. Los Angeles, CA"
                        value={creatorLocation}
                        onChange={(e) => setCreatorLocation(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Profile Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/profile.jpg"
                        value={avatarUrl}
                        onChange={(e) => {
                          setAvatarUrl(e.target.value);
                          validateSingleField('avatarUrl', e.target.value);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                          fieldErrors.avatarUrl
                            ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                            : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                        }`}
                      />
                      {fieldErrors.avatarUrl ? (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.avatarUrl}</p>
                      ) : (
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium">Supports direct image URLs or YouTube channel links (e.g. youtube.com/@TechnicalGuruji).</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 mb-1.5">Creator Bio & Content Style</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your audience demographics, video topics, and sponsorship style..."
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        validateSingleField('bio', e.target.value);
                      }}
                      className={`w-full rounded-2xl p-4 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                        fieldErrors.bio
                          ? 'bg-red-500/10 border border-red-500 text-red-200 focus:ring-red-500'
                          : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                      }`}
                    />
                    {fieldErrors.bio && (
                      <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.bio}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-zinc-500 hover:text-white cursor-pointer"
                >
                  ← Back to Handle
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-4 px-8 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center space-x-2 cursor-pointer ${
                    isBrand
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
                  }`}
                >
                  <span>{loading ? 'Creating Account...' : `Complete Registration & Launch ${isBrand ? 'Brand Hub' : 'Creator Node'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

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