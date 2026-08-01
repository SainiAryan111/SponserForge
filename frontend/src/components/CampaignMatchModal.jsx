import React, { useState, useEffect } from 'react';
import api, { offerCampaign } from '../services/api';
import { X, Sparkles, Video, Camera, Users, Award, Send, Check, Star } from 'lucide-react';
import CampaignCountdown from './CampaignCountdown';

export default function CampaignMatchModal({ campaign, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offeredState, setOfferedState] = useState({});

  // Offer Modal State
  const [targetCreator, setTargetCreator] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [deadlineHours, setDeadlineHours] = useState('48');
  const [submittingOffer, setSubmittingOffer] = useState(false);

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
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to calculate AI matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOfferModal = (creator) => {
    setTargetCreator(creator);
    setWorkDescription(`Campaign Brief: ${campaign.description}`);
    setDeadlineHours('48');
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!campaign || !targetCreator) return;
    const creatorId = targetCreator.id;

    setSubmittingOffer(true);
    try {
      await offerCampaign(campaign.id, creatorId, {
        work_description: workDescription,
        deadline_hours: parseInt(deadlineHours, 10),
      });
      setOfferedState((prev) => ({ ...prev, [creatorId]: 'sent' }));
      setTargetCreator(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send campaign offer.');
      setOfferedState((prev) => ({ ...prev, [creatorId]: 'error' }));
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-blue-200 text-slate-900 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-3 text-blue-600 text-xs font-black uppercase tracking-wider mb-1">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Smart AI Creator Matching</span>
              </span>
              <CampaignCountdown
                endDatetime={campaign.end_datetime}
                startDatetime={campaign.start_datetime}
                status={campaign.status}
                variant="badge"
                theme="brand"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{campaign.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 text-xs sm:text-sm font-bold">Calculating smart AI creator match scores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-2xl text-center text-xs sm:text-sm font-black">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <p className="text-slate-600 text-center py-8 text-xs sm:text-sm font-bold">No suitable creators found matching criteria.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map((creator, idx) => {
                const matchVal = creator.match_percentage || Math.round((creator.similarity_score || 0.95) * 100) || 95;
                return (
                  <div
                    key={creator.id || idx}
                    className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition shadow-sm"
                  >
                    <div className="flex items-start sm:items-center space-x-4 flex-1">
                      
                      {/* BIGGER SQUARE BOX FOR MATCH % */}
                      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-500/20 border-2 border-blue-400 shrink-0">
                        <Sparkles className="w-4 h-4 text-blue-200 mb-0.5 animate-pulse" />
                        <span className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                          {matchVal}%
                        </span>
                        <span className="text-[9px] uppercase font-black tracking-widest text-blue-200 mt-1">
                          MATCH
                        </span>
                      </div>

                      {/* Creator Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                          <span className="font-black text-slate-900 text-base sm:text-lg">
                            @{creator.username || creator.user?.username}
                          </span>
                          <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full border border-blue-200 uppercase">
                            {creator.niche}
                          </span>
                          <span className="flex items-center space-x-1 text-slate-700 text-xs font-extrabold bg-slate-200 px-2.5 py-1 rounded-full">
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                            <span className="capitalize">{creator.primary_platform || 'youtube'}</span>
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs sm:text-sm font-medium line-clamp-2">"{creator.bio}"</p>

                        <div className="flex items-center space-x-4 text-xs font-bold text-slate-700 pt-1 flex-wrap">
                          <span className="flex items-center space-x-1 text-amber-500 font-black">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{creator.rating ? Number(creator.rating).toFixed(1) : '5.0'} ({creator.total_ratings_count || 0})</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{creator.subscriber_count?.toLocaleString()} Subs</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Award className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-emerald-600 font-extrabold">{creator.engagement_rate}% Eng. Rate</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Offer Action Button */}
                    <div className="w-full sm:w-auto shrink-0 flex justify-end">
                      {offeredState[creator.id] === 'sent' ? (
                        <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-5 py-3 rounded-xl border border-emerald-300 flex items-center space-x-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Offer Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenOfferModal(creator)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send Direct Offer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black border border-slate-300 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* DIRECT OFFER FORM MODAL */}
      {targetCreator && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-blue-300 text-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Offer Campaign to @{targetCreator.username || targetCreator.user?.username}</h3>
            <p className="text-xs text-slate-600 font-semibold">
              Campaign: <strong className="text-blue-600">{campaign.title}</strong> • Reward: <strong className="text-slate-900">{campaign.points_reward} PTS</strong>
            </p>

            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Work Guidelines & Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Submission Deadline Clock</label>
                <select
                  value={deadlineHours}
                  onChange={(e) => setDeadlineHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">7 Days (1 Week)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetCreator(null)}
                  disabled={submittingOffer}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingOffer ? 'Sending...' : 'Send Direct Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}