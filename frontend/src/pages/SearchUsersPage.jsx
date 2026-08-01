import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { searchUsers, getCampaigns, offerCampaign } from '../services/api';
import { 
  Search, 
  ArrowLeft, 
  Building2, 
  UserCheck, 
  Filter, 
  Send, 
  Award, 
  Users, 
  CheckCircle2, 
  Star, 
  Zap, 
  ArrowUpDown, 
  TrendingUp, 
  Building 
} from 'lucide-react';

export default function SearchUsersPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isBrand = user?.role === 'brand';

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  // Three Separate Sorting States + General Sorting
  const [subSort, setSubSort] = useState('');
  const [engSort, setEngSort] = useState('');
  const [ratingSort, setRatingSort] = useState('');
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
    setRatingSort('');
    setSizeSort('');
    setActiveOrdering(val);
  };

  // Handle Engagement Rate Sort Change
  const handleEngSortChange = (val) => {
    setEngSort(val);
    setSubSort('');
    setRatingSort('');
    setSizeSort('');
    setActiveOrdering(val);
  };

  // Handle Rating Sort Change
  const handleRatingSortChange = (val) => {
    setRatingSort(val);
    setSubSort('');
    setEngSort('');
    setSizeSort('');
    setActiveOrdering(val);
  };

  // Handle Company Size Sort Change
  const handleSizeSortChange = (val) => {
    setSizeSort(val);
    setSubSort('');
    setEngSort('');
    setRatingSort('');
    setActiveOrdering(val);
  };

  // Reset all filters & sorting
  const handleResetFilters = () => {
    setRoleFilter('');
    setIndustryFilter('');
    setNicheFilter('');
    setPlatformFilter('');
    setSubSort('');
    setEngSort('');
    setRatingSort('');
    setSizeSort('');
    setActiveOrdering('');
  };

  const isCreatorControlDisabled = roleFilter === 'brand' || industryFilter !== '' || activeOrdering.includes('company_size');
  const isBrandControlDisabled = roleFilter === 'creator' || nicheFilter !== '' || platformFilter !== '' || activeOrdering.includes('subscriber') || activeOrdering.includes('engagement') || activeOrdering.includes('rating');

  let effectiveRole = roleFilter;
  if (!query.trim()) {
    if (nicheFilter !== '' || platformFilter !== '' || activeOrdering.includes('subscriber') || activeOrdering.includes('engagement') || activeOrdering.includes('rating')) {
      effectiveRole = 'creator';
    } else if (industryFilter !== '' || activeOrdering.includes('company_size')) {
      effectiveRole = 'brand';
    }
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

  useEffect(() => {
    if (isBrand) {
      getCampaigns().then(res => setBrandCampaigns(res.data || [])).catch(() => {});
    }
  }, [isBrand]);

  const handleOpenOfferModal = (creator) => {
    setSelectedCreator(creator);
    setOfferSuccess('');
    if (brandCampaigns.length > 0) {
      setSelectedCampaignId(brandCampaigns[0].id);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedCampaignId || !selectedCreator) return;
    setOffering(true);
    try {
      await offerCampaign(selectedCampaignId, selectedCreator.user_id);
      setOfferSuccess(`Direct campaign offer sent to @${selectedCreator.username}!`);
      setTimeout(() => {
        setSelectedCreator(null);
        setOfferSuccess('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send campaign offer.');
    } finally {
      setOffering(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 sm:p-8 space-y-6 ${
      isBrand ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center space-x-2 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
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
              <span>{isBrand ? 'Creator Search & Direct Hiring' : 'Brand Directory & Offers'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Directory & User Search
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${isBrand ? 'text-slate-600' : 'text-zinc-300'}`}>
              Search creators by subscribers, engagement rate, ratings, or explore partner brands.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className={`w-5 h-5 absolute left-4 top-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
          <input
            type="text"
            placeholder="Search by username, creator display name, or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full rounded-2xl pl-12 pr-4 py-4 text-xs sm:text-sm font-extrabold transition focus:outline-none focus:ring-2 shadow-lg ${
              isBrand
                ? 'bg-white border border-slate-300 text-slate-900 focus:ring-blue-500 placeholder-slate-400'
                : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-red-500 placeholder-zinc-500'
            }`}
          />
        </div>

        {/* FILTERING & SORTING CONTROLS PANEL */}
        <div className={`rounded-3xl p-6 sm:p-7 border shadow-xl space-y-6 ${
          isBrand ? 'bg-white border-blue-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs sm:text-sm uppercase tracking-wider font-black mr-1 ${isBrand ? 'text-slate-800' : 'text-zinc-200'}`}>Role:</span>
              <button
                onClick={() => setRoleFilter('')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  roleFilter === ''
                    ? isBrand ? 'bg-blue-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md'
                    : isBrand ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => { setRoleFilter('creator'); setIndustryFilter(''); setSizeSort(''); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  roleFilter === 'creator'
                    ? isBrand ? 'bg-blue-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md'
                    : isBrand ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Creators Only
              </button>
              <button
                onClick={() => { setRoleFilter('brand'); setNicheFilter(''); setPlatformFilter(''); setSubSort(''); setEngSort(''); setRatingSort(''); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  roleFilter === 'brand'
                    ? isBrand ? 'bg-blue-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md'
                    : isBrand ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Brands Only
              </button>
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className={`text-xs sm:text-sm font-black underline cursor-pointer transition ${
                isBrand ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Reset Filters & Sorting
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className={`block font-extrabold mb-1.5 ${isBrand ? 'text-slate-800' : 'text-zinc-200'}`}>Creator Niche</label>
              <select
                value={nicheFilter}
                disabled={isCreatorControlDisabled}
                onChange={(e) => setNicheFilter(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                  isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                }`}
              >
                <option value="">All Niches</option>
                <option value="tech">Technology & AI</option>
                <option value="gaming">Gaming & Esports</option>
                <option value="lifestyle">Lifestyle & Vlogs</option>
                <option value="fashion">Fashion & Beauty</option>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance & Investing</option>
                <option value="cooking">Cooking & Food</option>
                <option value="automotive">Automotive</option>
                <option value="music">Music & Art</option>
                <option value="diy">DIY & Crafts</option>
              </select>
            </div>

            <div>
              <label className={`block font-extrabold mb-1.5 ${isBrand ? 'text-slate-800' : 'text-zinc-200'}`}>Creator Platform</label>
              <select
                value={platformFilter}
                disabled={isCreatorControlDisabled}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                  isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                }`}
              >
                <option value="">All Platforms</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitch">Twitch</option>
              </select>
            </div>

            <div>
              <label className={`block font-extrabold mb-1.5 ${isBrand ? 'text-slate-800' : 'text-zinc-200'}`}>Brand Industry</label>
              <select
                value={industryFilter}
                disabled={isBrandControlDisabled}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                  isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                }`}
              >
                <option value="">All Industries</option>
                <option value="SaaS & AI Software">SaaS & AI Software</option>
                <option value="Gaming Peripherals">Gaming Peripherals</option>
                <option value="Fitness & Supplements">Fitness & Supplements</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Financial Tech & Crypto">Financial Tech & Crypto</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Travel & Hospitality">Travel & Hospitality</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="EdTech">EdTech</option>
              </select>
            </div>
          </div>

          {/* SORTING CONTROLS SECTION */}
          <div className={`pt-4 border-t space-y-3 ${isBrand ? 'border-slate-200' : 'border-zinc-800'}`}>
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-black uppercase tracking-wider">
              <ArrowUpDown className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
              <span className={isBrand ? 'text-slate-800' : 'text-zinc-200'}>Sorting Options:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              
              {/* 1. Sort by Subscriber Count */}
              <div>
                <label className={`block font-extrabold text-xs mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Subscribers Tier
                </label>
                <select
                  value={subSort}
                  disabled={isCreatorControlDisabled}
                  onChange={(e) => handleSubSortChange(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  <option value="">Default Order</option>
                  <option value="-subscriber_count">Highest Subscribers First ⬇</option>
                  <option value="subscriber_count">Lowest Subscribers First ⬆</option>
                </select>
              </div>

              {/* 2. Sort by Engagement Rate */}
              <div>
                <label className={`block font-extrabold text-xs mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Engagement Rate
                </label>
                <select
                  value={engSort}
                  disabled={isCreatorControlDisabled}
                  onChange={(e) => handleEngSortChange(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  <option value="">Default Order</option>
                  <option value="-engagement_rate">Highest Engagement First ⬇</option>
                  <option value="engagement_rate">Lowest Engagement First ⬆</option>
                </select>
              </div>

              {/* 3. Sort by Creator Rating */}
              <div>
                <label className={`block font-extrabold text-xs mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Star Rating Score
                </label>
                <select
                  value={ratingSort}
                  disabled={isCreatorControlDisabled}
                  onChange={(e) => handleRatingSortChange(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  <option value="">Default Order</option>
                  <option value="-rating">Top Rated Creators (5.0 ⭐) ⬇</option>
                  <option value="rating">Lowest Rated Creators ⬆</option>
                </select>
              </div>

              {/* 4. Sort by Brand Company Size */}
              <div>
                <label className={`block font-extrabold text-xs mb-1.5 ${isBrand ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Brand Scale
                </label>
                <select
                  value={sizeSort}
                  disabled={isBrandControlDisabled}
                  onChange={(e) => handleSizeSortChange(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold focus:outline-none ${
                    isBrand ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  <option value="">Default Order</option>
                  <option value="-company_size">Largest Brands First ⬇</option>
                  <option value="company_size">Startups & Small Brands ⬆</option>
                </select>
              </div>

            </div>
          </div>

        </div>

        {/* RESULTS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black">Results ({results.length})</h2>
            {activeOrdering && (
              <span className={`text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full border ${
                isBrand ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-red-950 text-red-200 border-red-500/50'
              }`}>
                Sorted by: {activeOrdering.replace('-', '').replace('_', ' ').toUpperCase()} ({activeOrdering.startsWith('-') ? 'Descending' : 'Ascending'})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 font-black text-sm">
                <span>Searching Directory...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="col-span-full text-center py-12 text-sm font-bold text-slate-400">
                No users found matching your search parameters.
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-3xl p-6 border shadow-xl space-y-4 transition hover:-translate-y-1 ${
                    isBrand
                      ? 'bg-white border-blue-200 hover:border-blue-400'
                      : 'bg-zinc-900 border-red-500/30 hover:border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border ${
                      item.role === 'creator'
                        ? isBrand ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-red-950 text-red-200 border-red-500/50'
                        : 'bg-purple-50 text-purple-900 border-purple-300'
                    }`}>
                      {item.role === 'creator' ? `${item.niche || 'Creator'} • ${item.primary_platform || 'YouTube'}` : `${item.industry || 'Brand'}`}
                    </span>

                    {item.role === 'creator' && (
                      <div className="flex items-center space-x-1 text-amber-400 text-xs sm:text-sm font-black">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{item.rating ? Number(item.rating).toFixed(1) : '5.0'} ({item.total_ratings_count || 0})</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-lg sm:text-xl flex items-center space-x-2">
                      <span>@{item.username}</span>
                      {item.name && <span className="text-xs sm:text-sm font-semibold text-slate-500">({item.name})</span>}
                    </h3>
                    {item.bio && (
                      <p className={`text-xs sm:text-sm font-medium line-clamp-2 ${isBrand ? 'text-slate-700' : 'text-zinc-300'}`}>
                        "{item.bio}"
                      </p>
                    )}
                  </div>

                  {/* METRICS & STATS */}
                  {item.role === 'creator' ? (
                    <div className={`grid grid-cols-2 gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold ${
                      isBrand ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-400 block">Subscribers</span>
                        <span className="font-black text-base">{item.subscriber_count?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-400 block">Engagement</span>
                        <span className="font-black text-base text-emerald-500">{item.engagement_rate || 0}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold space-y-1 ${
                      isBrand ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}>
                      <p><strong>Industry:</strong> {item.industry || 'N/A'}</p>
                      <p><strong>Company Size:</strong> {item.company_size || 'N/A'}</p>
                    </div>
                  )}

                  {/* DIRECT OFFER ACTION FOR BRANDS */}
                  {isBrand && item.role === 'creator' && (
                    <button
                      onClick={() => handleOpenOfferModal(item)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Direct Campaign Offer</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BRAND DIRECT OFFER MODAL */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-blue-300 text-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Send Direct Offer to @{selectedCreator.username}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Select one of your brand campaigns to offer directly to this creator.
            </p>

            {offerSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs sm:text-sm font-black text-center">
                {offerSuccess}
              </div>
            ) : brandCampaigns.length === 0 ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs sm:text-sm text-slate-600 font-bold">You don't have any active campaigns to offer right now.</p>
                <button
                  onClick={() => navigate('/campaign/create')}
                  className="bg-blue-600 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl"
                >
                  Create New Campaign First
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Select Campaign</label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {brandCampaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title} ({camp.points_reward} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCreator(null)}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOffer}
                    disabled={offering}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    {offering ? 'Sending...' : 'Send Direct Offer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
