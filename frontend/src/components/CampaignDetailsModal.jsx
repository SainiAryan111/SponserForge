import React from 'react';
import { X, Sparkles, Building2, Users, Award, Calendar, ExternalLink, Zap, Square } from 'lucide-react';
import CampaignCountdown from './CampaignCountdown';

export default function CampaignDetailsModal({ campaign, onClose, onApply, onEndCampaign, userRole }) {
  if (!campaign) return null;

  const isBrand = userRole === 'brand';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition ${
        isBrand
          ? 'bg-white border-blue-200 text-slate-900 shadow-blue-500/10'
          : 'bg-zinc-900/95 border-red-500/30 text-white shadow-red-950/50 animate-pulse-red-glow'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/90 border-zinc-800'
        }`}>
          <div>
            <div className={`flex items-center space-x-2 text-xs font-black uppercase tracking-wider mb-1 ${
              isBrand ? 'text-blue-600' : 'text-red-400'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>Campaign Brief & Specifications</span>
            </div>
            <h2 className="text-2xl font-black">{campaign.title}</h2>
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold mt-1">
              <Building2 className={`w-4 h-4 ${isBrand ? 'text-blue-600' : 'text-red-400'}`} />
              <span className={isBrand ? 'text-slate-700' : 'text-zinc-300'}>
                Sponsor: {campaign.brand_name || campaign.brand_username || 'Brand'}
              </span>
              {campaign.brand_username && campaign.brand_name !== campaign.brand_username && (
                <span className="opacity-70 font-normal">(@{campaign.brand_username})</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isBrand ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* LIVE CAMPAIGN END TIME COUNTDOWN */}
          <div className="space-y-1">
            <span className={`text-xs font-black uppercase tracking-wider block mb-1 ${
              isBrand ? 'text-blue-600' : 'text-amber-400'
            }`}>
              Campaign Timeline Countdown
            </span>
            <CampaignCountdown
              endDatetime={campaign.end_datetime}
              startDatetime={campaign.start_datetime}
              status={campaign.status}
              variant="detailed"
              theme={isBrand ? 'brand' : 'creator'}
            />
          </div>

          {/* Key Campaign Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Target Niche</span>
              <span className="text-xs sm:text-sm font-black capitalize mt-0.5 block">{campaign.target_niche}</span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Platform</span>
              <span className={`text-xs sm:text-sm font-black capitalize mt-0.5 block ${isBrand ? 'text-blue-600' : 'text-red-400'}`}>
                {campaign.target_platform}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Escrow Reward</span>
              <span className={`text-xs sm:text-sm font-black mt-0.5 block ${isBrand ? 'text-blue-600' : 'text-red-400'}`}>
                {campaign.points_reward} pts
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Min. Subscribers</span>
              <span className="text-xs sm:text-sm font-black mt-0.5 block">
                {(campaign.min_subscribers_required || 0).toLocaleString()}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Creators Needed</span>
              <span className="text-xs sm:text-sm font-black mt-0.5 block">
                {campaign.accepted_count || 0} / {campaign.creators_needed || 1} Hired
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-xs uppercase font-extrabold tracking-wider block opacity-70">Duration</span>
              <span className="text-xs sm:text-sm font-black mt-0.5 block">{campaign.duration_hours || 24} Hours</span>
            </div>
          </div>

          {/* Deliverables & Brief Description */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Campaign Brief & Deliverables</h4>
            <div className={`p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
              isBrand ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
            }`}>
              {campaign.description}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={`p-5 border-t flex items-center justify-between ${
          isBrand ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition border cursor-pointer ${
              isBrand ? 'border-slate-300 text-slate-700 hover:bg-slate-200' : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Close Details
          </button>

          {isBrand && campaign.status === 'active' && onEndCampaign && (
            <button
              onClick={() => {
                onClose();
                onEndCampaign(campaign);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End Campaign</span>
            </button>
          )}

          {!isBrand && campaign.status === 'active' && onApply && (
            <button
              onClick={() => {
                onClose();
                onApply(campaign);
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-600/40 cursor-pointer flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Apply to Campaign</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
