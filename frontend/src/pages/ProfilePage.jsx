import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/api';
import { 
  ArrowLeft, 
  Award, 
  Sparkles, 
  Star, 
  Building2, 
  Zap, 
  Save, 
  Edit3, 
  X, 
  Globe, 
  MapPin, 
  Image, 
  Percent, 
  Users, 
  Link as LinkIcon, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUtils';

const DEFAULT_NICHES = ['tech', 'gaming', 'lifestyle', 'fashion', 'fitness', 'finance'];
const DEFAULT_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch'];
const DEFAULT_INDUSTRIES = ['SaaS & AI Software', 'E-Commerce & Retail', 'Gaming & Hardware', 'Fitness & Supplements', 'Fashion & Apparel', 'Financial Tech & Crypto'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username: paramUsername } = useParams();
  const { user, setUser } = useContext(AuthContext);

  // View Mode by default (isEditing = false)
  const [isEditing, setIsEditing] = useState(false);

  // Committed Profile State (Read-only for View Mode & Headers)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    role: '',
    company_name: '',
    industry: '',
    website: '',
    company_size: '',
    target_audience: '',
    logo_url: '',
    name: '',
    platform_link: '',
    subscriber_count: 0,
    engagement_rate: 2.50,
    avatar_url: '',
    bio: '',
    location: '',
    points_balance: 0,
    rating: 0.0,
    total_ratings_count: 0,
    niche: '',
    primary_platform: '',
  });

  // Draft Form State (Active ONLY during Edit Mode)
  const [editFormData, setEditFormData] = useState({ ...profileData });

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

  const isOwnProfile = !paramUsername || paramUsername.toLowerCase() === user?.username?.toLowerCase();

  useEffect(() => {
    fetchProfile(paramUsername);
  }, [paramUsername]);

  const fetchProfile = async (targetUser) => {
    setLoading(true);
    try {
      const res = await getUserProfile(targetUser);
      const data = res.data;
      const loaded = {
        username: data.username || '',
        email: data.email || '',
        role: data.role || 'creator',
        company_name: data.company_name || '',
        industry: data.industry || '',
        website: data.website || '',
        company_size: data.company_size || '',
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
        rating: (data.total_ratings_count > 0 && data.rating != null) ? Number(data.rating) : 0.0,
        total_ratings_count: data.total_ratings_count || 0,
        niche: data.niche || '',
        primary_platform: data.primary_platform || '',
      };

      setProfileData(loaded);
      setEditFormData(loaded);

      if (loaded.company_size) {
        const match = loaded.company_size.match(/\d+/);
        if (match) setNumericEmpCount(match[0]);
      }

      if (loaded.niche) {
        setSelectedNiches(loaded.niche.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
      }
      if (loaded.primary_platform) {
        setSelectedPlatforms(loaded.primary_platform.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Unable to load specified user profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = () => {
    if (!isOwnProfile) return;
    setEditFormData({ ...profileData });
    if (profileData.company_size) {
      const match = profileData.company_size.match(/\d+/);
      if (match) setNumericEmpCount(match[0]);
    }
    if (profileData.niche) {
      setSelectedNiches(profileData.niche.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
    }
    if (profileData.primary_platform) {
      setSelectedPlatforms(profileData.primary_platform.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
    }
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericEmpCountChange = (val) => {
    setNumericEmpCount(val);
    setEditFormData((prev) => ({
      ...prev,
      company_size: val ? `${val} employees` : '',
    }));
  };

  const handleNicheCheckbox = (n) => {
    if (selectedNiches.includes(n)) {
      if (selectedNiches.length > 1) {
        setSelectedNiches(selectedNiches.filter((item) => item !== n));
      }
    } else {
      setSelectedNiches([...selectedNiches, n]);
    }
  };

  const handlePlatformCheckbox = (p) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
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
    if (!isOwnProfile) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const finalIndustry = (customIndustry || '').trim() ? customIndustry.trim() : editFormData.industry;

      let finalNiches = [...selectedNiches];
      if (customNiche && customNiche.trim()) {
        const cleaned = customNiche.trim().toLowerCase();
        if (!finalNiches.includes(cleaned)) finalNiches.push(cleaned);
      }

      let finalPlatforms = [...selectedPlatforms];
      if (customPlatform && customPlatform.trim()) {
        const cleaned = customPlatform.trim().toLowerCase();
        if (!finalPlatforms.includes(cleaned)) finalPlatforms.push(cleaned);
      }

      const updatedPayload = {
        ...editFormData,
        industry: finalIndustry,
        logo_url: resolveImageUrl(editFormData.logo_url),
        avatar_url: resolveImageUrl(editFormData.avatar_url),
        niche: finalNiches.join(','),
        primary_platform: finalPlatforms.join(','),
      };

      const res = await updateUserProfile(updatedPayload);

      const committed = {
        ...profileData,
        ...res.data,
        username: res.data.username || editFormData.username,
        email: res.data.email || editFormData.email,
        company_name: res.data.company_name || editFormData.company_name,
        name: res.data.name || editFormData.name,
        industry: res.data.industry || finalIndustry,
        website: res.data.website || editFormData.website,
        company_size: res.data.company_size || editFormData.company_size,
        logo_url: resolveImageUrl(res.data.logo_url || editFormData.logo_url),
        avatar_url: resolveImageUrl(res.data.avatar_url || editFormData.avatar_url),
        platform_link: res.data.platform_link || editFormData.platform_link,
        subscriber_count: res.data.subscriber_count ?? editFormData.subscriber_count,
        engagement_rate: res.data.engagement_rate ?? editFormData.engagement_rate,
        bio: res.data.bio || editFormData.bio,
        location: res.data.location || editFormData.location,
        niche: finalNiches.join(','),
        primary_platform: finalPlatforms.join(','),
      };

      setProfileData(committed);
      setUser(committed);
      localStorage.setItem('user_data', JSON.stringify(committed));
      setMessage({ type: 'success', text: 'Profile & credentials updated successfully!' });
      setIsEditing(false); // Revert to View Mode ONLY on successful save!
    } catch (err) {
      console.error('Profile update error:', err);
      let errMsg = 'Failed to update profile.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.error === 'string') errMsg = data.error;
        else if (typeof data.detail === 'string') errMsg = data.detail;
        else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const val = data[keys[0]];
            errMsg = `${keys[0]}: ${Array.isArray(val) ? val[0] : val}`;
          }
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleTopUpPoints = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    const newBalance = (profileData.points_balance || 0) + parseInt(topUpAmount, 10);
    const updatedPayload = { ...profileData, points_balance: newBalance };

    try {
      const res = await updateUserProfile(updatedPayload);
      const updated = { ...profileData, points_balance: res.data.points_balance };
      setProfileData(updated);
      setUser(updated);
      localStorage.setItem('user_data', JSON.stringify(updated));
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

  const isBrand = isOwnProfile ? user?.role === 'brand' : profileData.role === 'brand';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-black text-base ${
        isBrand ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-zinc-200'
      }`}>
        <span>Loading Profile Data...</span>
      </div>
    );
  }

  const activeImage = resolveImageUrl(isBrand ? profileData.logo_url : profileData.avatar_url);
  const activeName = isBrand ? profileData.company_name || profileData.username : profileData.name || profileData.username;

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
          <span>Back</span>
        </button>

        {/* HEADER BAR WITH COMMITTED PROFILE DATA */}
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

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center space-x-3">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={activeName}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border shadow-md shrink-0 ${
                    isBrand ? 'border-blue-200' : 'border-red-500/40'
                  }`}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              <span>{activeName}</span>
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
              {isOwnProfile
                ? 'Manage credentials, platform settings, company specs, & points balance.'
                : `Public view profile card for @${profileData.username}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isBrand && (
              <div className="bg-zinc-950 border border-amber-500/40 px-4 py-3 rounded-2xl text-center">
                <span className="text-xs uppercase font-black text-amber-400 block">Rating Score</span>
                <div className="flex items-center space-x-1 font-black text-amber-300 text-base sm:text-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{profileData.total_ratings_count > 0 ? profileData.rating.toFixed(1) : '0.0'}</span>
                  <span className="text-xs text-zinc-400 font-semibold">({profileData.total_ratings_count})</span>
                </div>
              </div>
            )}

            {isOwnProfile && (
              <div className={`px-6 py-3 rounded-2xl text-center shadow-lg ${
                isBrand ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-600/40'
              }`}>
                <span className="text-xs uppercase tracking-wider font-black block opacity-90">Points Balance</span>
                <div className="text-2xl sm:text-3xl font-black">{profileData.points_balance} PTS</div>
              </div>
            )}
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

        {/* MAIN CONTAINER (VIEW MODE vs EDIT MODE) */}
        <div className={`grid grid-cols-1 ${isOwnProfile ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          
          {/* LEFT COLS: VIEW MODE OR EDIT FORM */}
          <div className={isOwnProfile ? 'lg:col-span-2' : 'col-span-full'}>
            {!isEditing ? (
              /* ==========================================
                 1. VIEW MODE (READS FROM COMMITTED profileData ONLY)
                 ========================================== */
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
                isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-xl font-black">Profile Details Overview</h2>
                    <p className={`text-xs font-semibold ${isBrand ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {isOwnProfile
                        ? 'Read-only profile card. Click "Edit Profile" at top to make changes.'
                        : `Viewing user profile card for @${profileData.username}.`}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 cursor-pointer ${
                        isBrand ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-red-950 text-red-200 hover:bg-red-900'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* USER IDENTITY CREDENTIALS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Username Handle</span>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <UserIcon className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
                      <span>@{profileData.username}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Verified Email</span>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>
                </div>

                {/* ROLE SPECIFIC OVERVIEW */}
                {isBrand ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Company Name</span>
                        <strong className="text-sm font-black">{profileData.company_name || 'Not specified'}</strong>
                      </div>

                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Industry Type</span>
                        <strong className="text-sm font-black text-blue-700">{profileData.industry || 'Not specified'}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Employee Count</span>
                        <strong className="text-sm font-black">{profileData.company_size || 'Not specified'}</strong>
                      </div>

                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">HQ Location</span>
                        <strong className="text-sm font-black">{profileData.location || 'Not specified'}</strong>
                      </div>
                    </div>

                    {profileData.website && (
                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Official Website</span>
                        <a
                          href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-black text-blue-600 hover:underline flex items-center space-x-1.5"
                        >
                          <Globe className="w-4 h-4" />
                          <span>{profileData.website}</span>
                        </a>
                      </div>
                    )}

                    {profileData.bio && (
                      <div className={`p-4 rounded-2xl border ${isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Brand Mission & Bio</span>
                        <p className="text-xs sm:text-sm font-medium text-slate-700">{profileData.bio}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CREATOR VIEW MODE */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Full Creator Name</span>
                        <strong className="text-sm font-black text-white">{profileData.name || 'Not specified'}</strong>
                      </div>

                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Subscribers / Audience</span>
                        <strong className="text-sm font-black text-red-400">{profileData.subscriber_count ? profileData.subscriber_count.toLocaleString() : '1,000+'}</strong>
                      </div>
                    </div>

                    {/* Engagement Rate & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Engagement Rate</span>
                        <div className="flex items-center space-x-1.5 text-sm font-black text-emerald-400">
                          <Percent className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>{profileData.engagement_rate}%</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Creator Location</span>
                        <div className="flex items-center space-x-1.5 text-sm font-black text-white">
                          <MapPin className="w-4 h-4 shrink-0 text-red-400" />
                          <span>{profileData.location || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Niches */}
                    <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800 space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Content Niches</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.niche ? (
                          profileData.niche.split(',').map((n) => (
                            <span key={n} className="bg-red-600 text-white px-3 py-1 rounded-xl text-xs font-black uppercase">
                              {n.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">None selected</span>
                        )}
                      </div>
                    </div>

                    {/* Primary Platforms */}
                    <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800 space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Primary Platforms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.primary_platform ? (
                          profileData.primary_platform.split(',').map((p) => (
                            <span key={p} className="bg-zinc-800 text-red-400 border border-zinc-700 px-3 py-1 rounded-xl text-xs font-black uppercase">
                              {p.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">None selected</span>
                        )}
                      </div>
                    </div>

                    {profileData.platform_link && (
                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Main Channel Link</span>
                        <a
                          href={profileData.platform_link.startsWith('http') ? profileData.platform_link : `https://${profileData.platform_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-black text-red-400 hover:underline flex items-center space-x-1.5"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>{profileData.platform_link}</span>
                        </a>
                      </div>
                    )}

                    {profileData.bio && (
                      <div className="p-4 rounded-2xl border bg-zinc-950 border-zinc-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block mb-1">Creator Bio & Content Style</span>
                        <p className="text-xs sm:text-sm font-medium text-zinc-300">{profileData.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ==========================================
                 2. EDIT MODE (USES UNCOMMITTED editFormData ONLY)
                 ========================================== */
              <form onSubmit={handleSubmit} className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
                isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="border-b pb-4">
                  <h2 className="text-xl font-black">Edit Profile Details</h2>
                </div>

                {/* BASE USER CREDENTIALS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1 ${
                      isBrand ? 'text-slate-800' : 'text-zinc-200'
                    }`}>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={editFormData.username}
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
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 ${
                        isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-blue-500' : 'bg-zinc-950 border border-zinc-800 text-white focus:ring-red-500'
                      }`}
                    />
                  </div>
                </div>

                {/* BRAND SCHEMA EDIT FIELDS */}
                {isBrand ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Name</label>
                        <input
                          type="text"
                          name="company_name"
                          value={editFormData.company_name}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Company Website URL</label>
                        <input
                          type="url"
                          name="website"
                          value={editFormData.website}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Industry Type</label>
                      <input
                        type="text"
                        name="industry"
                        placeholder="e.g. SaaS & AI Software, E-Commerce, Gaming..."
                        value={editFormData.industry}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Employee Count</label>
                        <input
                          type="number"
                          placeholder="e.g. 25"
                          value={numericEmpCount}
                          onChange={(e) => handleNumericEmpCountChange(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">HQ Location</label>
                        <input
                          type="text"
                          name="location"
                          value={editFormData.location}
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
                        placeholder="https://example.com/logo.png"
                        value={editFormData.logo_url}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-1">Brand Bio & Mission</label>
                      <textarea
                        rows={3}
                        name="bio"
                        value={editFormData.bio}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl p-4 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* CREATOR SCHEMA EDIT FIELDS */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Full Creator Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Main Channel / Profile URL</label>
                        <input
                          type="url"
                          name="platform_link"
                          value={editFormData.platform_link}
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
                          value={editFormData.subscriber_count}
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
                          value={editFormData.engagement_rate}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={editFormData.location}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    {/* CREATOR NICHES */}
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
                          placeholder="Add custom niche..."
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

                    {/* CREATOR PLATFORMS */}
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
                          placeholder="Add custom platform..."
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
                      <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Profile Image URL</label>
                      <input
                        type="url"
                        name="avatar_url"
                        value={editFormData.avatar_url}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 mb-1">Creator Bio & Content Style</label>
                      <textarea
                        rows={3}
                        name="bio"
                        value={editFormData.bio}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl p-4 text-xs sm:text-sm font-medium bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`py-3.5 px-8 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center space-x-2 cursor-pointer ${
                      isBrand ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COL: POINTS WALLET & TOP UP (OWN PROFILE ONLY) */}
          {isOwnProfile && (
            <div className="space-y-6">
              <div className={`rounded-3xl p-6 border shadow-xl space-y-4 ${
                isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="flex items-center space-x-2 text-amber-500">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-base font-black">Escrow Points Wallet</h3>
                </div>

                <p className={`text-xs font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Points are held safely in Escrow during active campaigns and released to creators upon deliverable verification.
                </p>

                <form onSubmit={handleTopUpPoints} className="space-y-3 pt-2">
                  <label className={`block text-xs font-black uppercase tracking-wider ${
                    isBrand ? 'text-slate-800' : 'text-zinc-200'
                  }`}>Top-Up Amount (PTS)</label>
                  <select
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-extrabold cursor-pointer ${
                      isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                    }`}
                  >
                    <option value={500}>500 PTS ($50.00)</option>
                    <option value={1000}>1,000 PTS ($100.00)</option>
                    <option value={2500}>2,500 PTS ($250.00)</option>
                    <option value={5000}>5,000 PTS ($500.00)</option>
                    <option value={10000}>10,000 PTS ($1,000.00)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                      isBrand ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{saving ? 'Processing...' : 'Instant Points Top-Up'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}