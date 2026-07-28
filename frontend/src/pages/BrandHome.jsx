import React, { useState } from 'react';
import api from '../services/api';
import { Search, PlusCircle, Users, Sparkles, Building2 } from 'lucide-react';

export default function BrandHome() {
  const [query, setQuery] = useState('');
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    platform: '',
    niche: '',
    min_subscribers: 0,
  });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Using configured axios instance to include Bearer token automatically
      const response = await api.post('match-creators/', {
        query,
        platform: filters.platform || null,
        niche: filters.niche || null,
        min_subscribers: parseInt(filters.min_subscribers, 10) || 0,
      });

      setCreators(response.data);
    } catch (err) {
      console.error('Error matching creators:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header / Hero */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <Building2 className="w-5 h-5" />
              <span>Brand Command Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Discover & Match Creators</h1>
            <p className="text-slate-400 mt-1">AI-powered semantic matching to connect your campaign with perfect voices.</p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-medium transition shadow-lg shadow-indigo-600/20">
            <PlusCircle className="w-5 h-5" />
            Create Campaign
          </button>
        </div>

        {/* AI Vector Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                placeholder="Describe your target creator (e.g., 'Tech reviewers making short videos about AI productivity tools')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-28 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Platforms</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Niche</label>
                <input
                  type="text"
                  placeholder="e.g. tech, fitness, gaming"
                  value={filters.niche}
                  onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Min. Subscribers</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_subscribers}
                  onChange={(e) => setFilters({ ...filters, min_subscribers: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results / Matched Creators Feed */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-400" />
            Matched Creators ({creators.length})
          </h2>

          {creators.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <p>No creators matched yet. Try typing a prompt like <i>"Developers reviewing dev tools"</i> above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <div key={creator.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-white">@{creator.username}</h3>
                        <span className="inline-block bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-medium mt-1 uppercase tracking-wider">
                          {creator.primary_platform}
                        </span>
                      </div>
                      {creator.similarity_score !== undefined && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-lg font-mono">
                          {(creator.similarity_score * 100).toFixed(0)}% match
                        </div>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">{creator.bio || 'No bio provided.'}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 mt-2 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="block font-semibold text-slate-200 text-sm">
                        {Number(creator.subscriber_count || 0).toLocaleString()}
                      </span>
                      <span>Subscribers</span>
                    </div>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}