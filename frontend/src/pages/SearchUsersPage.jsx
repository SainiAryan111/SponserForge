import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { searchUsers, getCampaigns, offerCampaign } from '../services/api';
import { Search, ArrowLeft, Building2, UserCheck, Filter, Send, Award, Users, CheckCircle2 } from 'lucide-react';

export default function SearchUsersPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isBrand = user?.role === 'brand';

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  // Three Separate Sorting States
  const [subSort, setSubSort] = useState('');
  const [engSort, setEngSort] = useState('');
  const [sizeSort, setSizeSort] = useState('');
  const [activeOrdering, setActiveOrdering] = useState('');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Brand Offer Modal state
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [offering, setOffering] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState('');

  // Handle Subscriber Sort Change
  const handleSubSortChange = (val) => {
    setSubSort(val);
    setEngSort('');
    setSizeSort('');
    setActiveOrdering(val);
  };

  // Handle Engagement Rate Sort Change
  const handleEngSortChange = (val) => {
    setEngSort(val);
    setSubSort('');
    setSizeSort('');
    setActiveOrdering(val);
  };

  // Handle Company Size Sort Change
  const handleSizeSortChange = (val) => {
    setSizeSort(val);
    setSubSort('');
    setEngSort('');
    setActiveOrdering(val);
  };

  // Mutual Exclusivity Rules for Filters and Sorting when All Roles is selected
  const isCreatorControlDisabled = roleFilter === 'brand' || industryFilter !== '' || activeOrdering.includes('company_size');
  const isBrandControlDisabled = roleFilter === 'creator' || nicheFilter !== '' || platformFilter !== '' || activeOrdering.includes('subscriber') || activeOrdering.includes('engagement');

  // Determine effective role logically:
  // If creator filter OR creator sorting is active -> scope search to creator
  // If brand filter OR brand sorting is active -> scope search to brand
  let effectiveRole = roleFilter;
  if (nicheFilter !== '' || platformFilter !== '' || activeOrdering.includes('subscriber') || activeOrdering.includes('engagement')) {
    effectiveRole = 'creator';
  } else if (industryFilter !== '' || activeOrdering.includes('company_size')) {
    effectiveRole = 'brand';
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        role: effectiveRole,
        industry: isBrandControlDisabled ? '' : industryFilter,
        niche: isCreatorControlDisabled ? '' : nicheFilter,
        platform: isCreatorControlDisabled ? '' : platformFilter,
        ordering: activeOrdering,
      };
      const res = await searchUsers(params);
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [query, roleFilter, industryFilter, nicheFilter, platformFilter, activeOrdering]);

  // Load Brand Campaigns if logged in user is a brand
  useEffect(() => {
    if (isBrand) {
      getCampaigns().then((res) => {
        setBrandCampaigns(res.data.filter(c => c.status === 'active'));
      }).catch(err => console.error(err));
    }
  }, [isBrand]);

  const handleOpenOfferModal = (creator) => {
    setSelectedCreator(creator);
    setOfferSuccess('');
    if (brandCampaigns.length > 0) {
      setSelectedCampaignId(brandCampaigns[0].id);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedCreator) return;
    setOffering(true);

    try {
      await offerCampaign(selectedCampaignId, selectedCreator.id);
      setOfferSuccess(`Direct offer successfully sent to @${selectedCreator.username}!`);
      setTimeout(() => {
        setSelectedCreator(null);
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send campaign offer.');
    } finally {
      setOffering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 font-medium transition cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Search className="w-7 h-7 text-indigo-400" />
          <span>Global User Directory & Search</span>
        </h1>
        <p className="text-slate-400 mt-1">
          Search users directly by typing or filter & sort by subscriber count, engagement rate, & company size
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Direct Typing: Search by username, creator name, company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xl transition"
        />
      </div>

      {/* Filtering & Sorting Controls Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-8 space-y-5 shadow-xl">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mr-1">Role:</span>
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                roleFilter === '' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => { setRoleFilter('creator'); setIndustryFilter(''); setSizeSort(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                roleFilter === 'creator' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Creators Only
            </button>
            <button
              onClick={() => { setRoleFilter('brand'); setNicheFilter(''); setPlatformFilter(''); setSubSort(''); setEngSort(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                roleFilter === 'brand' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Brands Only
            </button>
          </div>
        </div>

        {/* 1. FILTER DROPDOWNS SECTION */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
            1. Filtering Options (Matching Signup/Profile)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Creator Niche */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Creator Niche</label>
              <select
                value={nicheFilter}
                disabled={isCreatorControlDisabled}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Niches</option>
                <option value="tech">Technology & AI</option>
                <option value="gaming">Gaming & Esports</option>
                <option value="lifestyle">Lifestyle & Vlogs</option>
                <option value="fashion">Fashion & Beauty</option>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance & Investing</option>
              </select>
            </div>

            {/* Creator Platform */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Creator Platform</label>
              <select
                value={platformFilter}
                disabled={isCreatorControlDisabled}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Platforms</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitch">Twitch</option>
              </select>
            </div>

            {/* Brand Industry */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Brand Industry</label>
              <select
                value={industryFilter}
                disabled={isBrandControlDisabled}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Industries</option>
                <option value="Software / SaaS">Software / SaaS</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Gaming & Hardware">Gaming & Hardware</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Financial Tech">Financial Tech</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. THREE SEPARATE SORTING DROPDOWNS SECTION */}
        <div className="pt-3 border-t border-slate-700/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
            2. Three Separate Sorting Controls
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Sort 1: Subscribers / Followers */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">📊 Sort by Subscribers</label>
              <select
                value={subSort}
                disabled={isCreatorControlDisabled}
                onChange={(e) => handleSubSortChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Subscribers: Default</option>
                <option value="-subscriber_count">Subscribers: High to Low</option>
                <option value="subscriber_count">Subscribers: Low to High</option>
              </select>
            </div>

            {/* Sort 2: Engagement Rate */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">🔥 Sort by Engagement Rate</label>
              <select
                value={engSort}
                disabled={isCreatorControlDisabled}
                onChange={(e) => handleEngSortChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Engagement: Default</option>
                <option value="-engagement_rate">Engagement: High to Low</option>
                <option value="engagement_rate">Engagement: Low to High</option>
              </select>
            </div>

            {/* Sort 3: Company Size */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">🏢 Sort by Company Size</label>
              <select
                value={sizeSort}
                disabled={isBrandControlDisabled}
                onChange={(e) => handleSizeSortChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Company Size: Default</option>
                <option value="company_size_desc">Company Size: Large to Small</option>
                <option value="company_size_asc">Company Size: Small to Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading Directory...</div>
      ) : results.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
          No users matching the search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((u) => (
            <div
              key={`${u.role}-${u.id}`}
              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 hover:border-indigo-500/50 transition duration-200 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* User Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    {u.avatar_url || u.logo_url ? (
                      <img
                        src={u.avatar_url || u.logo_url}
                        alt={u.username}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                        {u.username[0]?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h3 className="text-white font-bold text-base leading-snug">
                        {u.name || u.company_name || u.username}
                      </h3>
                      <p className="text-slate-400 text-xs">@{u.username}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                      u.role === 'brand'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {u.role === 'brand' ? 'Brand' : 'Creator'}
                  </span>
                </div>

                {/* Creator details */}
                {u.role === 'creator' && (
                  <div className="space-y-2 text-xs text-slate-300 my-3">
                    <p className="line-clamp-2 text-slate-400">{u.bio || 'No bio provided.'}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-indigo-300">
                        Niche: {u.niche}
                      </span>
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-indigo-300">
                        Platform: {u.primary_platform}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Subscribers</span>
                        <strong className="text-white text-sm">{(u.subscriber_count || 0).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Engagement Rate</span>
                        <strong className="text-emerald-400 text-sm">{u.engagement_rate}%</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand details */}
                {u.role === 'brand' && (
                  <div className="space-y-2 text-xs text-slate-300 my-3">
                    <p className="text-slate-400">Industry: <strong className="text-slate-200">{u.industry || 'General'}</strong></p>
                    <p className="text-slate-400">Company Size: <strong className="text-slate-200">{u.company_size || 'N/A'}</strong></p>
                    {u.website && (
                      <a
                        href={u.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline block truncate"
                      >
                        {u.website}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button for Brands viewing Creators */}
              {isBrand && u.role === 'creator' && (
                <div className="pt-3 border-t border-slate-700/60 mt-3">
                  <button
                    onClick={() => handleOpenOfferModal(u)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Direct Campaign Offer</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* OFFER CAMPAIGN MODAL */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              <span>Offer Campaign to @{selectedCreator.username}</span>
            </h2>

            {offerSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{offerSuccess}</span>
              </div>
            ) : brandCampaigns.length === 0 ? (
              <p className="text-slate-400 text-sm">
                You have no active campaigns. Please create an active campaign first before sending direct offers.
              </p>
            ) : (
              <form onSubmit={handleSendOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Select Active Campaign
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {brandCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.points_reward} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCreator(null)}
                    className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offering}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50"
                  >
                    {offering ? 'Sending Offer...' : 'Send Offer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
