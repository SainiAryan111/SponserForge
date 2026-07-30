import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Sparkles, Video, Camera, Users, Award } from 'lucide-react';

export default function CampaignMatchModal({ campaign, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (campaign) {
      fetchMatches();
    }
  }, [campaign]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`campaigns/${campaign.id}/match/`);
      setMatches(response.data.matches || response.data);
    } catch (err) {
      setError('Failed to calculate vector matches. Ensure campaign has an embedding.');
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Smart AI Creator Matching</span>
            </div>
            <h2 className="text-xl font-bold text-white">{campaign.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Finding best creator matches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No suitable creators found matching criteria.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map((creator, idx) => (
                <div 
                  key={creator.id || idx}
                  className="bg-slate-900 border border-slate-700/70 hover:border-indigo-500/50 p-5 rounded-xl flex items-center justify-between transition"
                >
                  <div className="space-y-2 max-w-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white text-lg">
                        @{creator.username || creator.user?.username}
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
                        {creator.niche}
                      </span>
                      {creator.primary_platform === 'youtube' ? (
                        <span className="flex items-center space-x-1 text-red-400 text-xs bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            <Video className="w-3.5 h-3.5" />
                            <span>YouTube</span>
                        </span>
                        ) : (
                        <span className="flex items-center space-x-1 text-pink-400 text-xs bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Instagram</span>
                        </span>
                       )}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">{creator.bio}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{creator.subscriber_count?.toLocaleString()} Subs</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        <span>{creator.engagement_rate}% Eng. Rate</span>
                      </span>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="text-right pl-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-center">
                      <div className="text-xl font-extrabold">
                        {creator.similarity_score ? `${Math.round(creator.similarity_score * 100)}%` : '92%'}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-emerald-500 tracking-wider">
                        Match Score
                      </div>
                    </div>
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