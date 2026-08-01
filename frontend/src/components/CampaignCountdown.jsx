import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react';

/**
 * CampaignCountdown Component
 * Renders a live real-time ticking countdown for campaign end time or start launch time.
 * 
 * Props:
 * - endDatetime: ISO string or Date for campaign conclusion
 * - startDatetime: ISO string or Date for campaign launch (if scheduled)
 * - status: 'active' | 'scheduled' | 'completed' | 'cancelled'
 * - variant: 'badge' | 'card' | 'detailed' | 'minimal'
 * - theme: 'brand' | 'creator' (Controls color palette)
 * - onExpire: optional callback function when timer hits 0
 */
export default function CampaignCountdown({
  endDatetime,
  startDatetime,
  status = 'active',
  variant = 'badge',
  theme = 'creator',
  className = '',
  onExpire,
}) {
  const isBrandTheme = theme === 'brand';

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
    isScheduled: false,
    label: '',
  });

  useEffect(() => {
    let timerId = null;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let targetTime = null;
      let isScheduledTarget = false;
      let label = 'Ends in';

      // Determine target date & label
      if (status === 'scheduled' && startDatetime) {
        const startMs = new Date(startDatetime).getTime();
        if (!isNaN(startMs) && startMs > now) {
          targetTime = startMs;
          isScheduledTarget = true;
          label = 'Starts in';
        }
      }

      if (!targetTime && endDatetime) {
        const endMs = new Date(endDatetime).getTime();
        if (!isNaN(endMs)) {
          targetTime = endMs;
          label = 'Ends in';
        }
      }

      if (!targetTime) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
          isScheduled: false,
          label: 'No End Time Set',
        });
        return;
      }

      const diff = Math.floor((targetTime - now) / 1000);

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
          isScheduled: isScheduledTarget,
          label: isScheduledTarget ? 'Starting Now' : 'Campaign Ended',
        });
        if (onExpire && typeof onExpire === 'function') {
          onExpire();
        }
      } else {
        const days = Math.floor(diff / (24 * 3600));
        const hours = Math.floor((diff % (24 * 3600)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds: diff,
          isExpired: false,
          isScheduled: isScheduledTarget,
          label,
        });
      }
    };

    calculateTimeLeft();
    timerId = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [endDatetime, startDatetime, status]);

  // Format helpers
  const pad = (n) => String(n).padStart(2, '0');
  const isUrgent = !timeLeft.isExpired && !timeLeft.isScheduled && timeLeft.totalSeconds > 0 && timeLeft.totalSeconds < 3600;
  const isCompletedOrCancelled = status === 'completed' || status === 'cancelled';

  // 1. MINIMAL VARIANT
  if (variant === 'minimal') {
    if (isCompletedOrCancelled || timeLeft.isExpired) {
      return <span className={`font-black text-xs ${isBrandTheme ? 'text-slate-400' : 'text-zinc-500'} ${className}`}>Ended</span>;
    }
    return (
      <span className={`font-mono font-black text-xs ${
        isUrgent ? 'text-red-500 animate-pulse' : isBrandTheme ? 'text-blue-600' : 'text-amber-400'
      } ${className}`}>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  // 2. BADGE VARIANT (Inline pill badge)
  if (variant === 'badge') {
    if (isCompletedOrCancelled || (timeLeft.isExpired && !timeLeft.isScheduled)) {
      return (
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border ${
          isBrandTheme ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
        } ${className}`}>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{status === 'completed' ? 'Campaign Ended' : 'Ended'}</span>
        </span>
      );
    }

    if (timeLeft.isScheduled) {
      return (
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border ${
          isBrandTheme ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-amber-950/80 text-amber-200 border-amber-500/40'
        } ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>{timeLeft.label}: </span>
          <strong className="font-mono">{timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</strong>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black transition border ${
          isUrgent
            ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
            : isBrandTheme
            ? 'bg-blue-100 text-blue-900 border-blue-300'
            : 'bg-red-950/80 text-red-200 border-red-500/40'
        } ${className}`}
      >
        {isUrgent ? (
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
        ) : (
          <Timer className={`w-3.5 h-3.5 ${isBrandTheme ? 'text-blue-600' : 'text-red-400'}`} />
        )}
        <span>{timeLeft.label}: </span>
        <strong className="font-mono">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </strong>
      </span>
    );
  }

  // 3. CARD VARIANT (For campaign list cards)
  if (variant === 'card') {
    if (isCompletedOrCancelled || (timeLeft.isExpired && !timeLeft.isScheduled)) {
      return (
        <div className={`flex items-center space-x-2 text-xs font-extrabold p-3 rounded-2xl border ${
          isBrandTheme ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
        } ${className}`}>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Status: {status === 'completed' ? 'Completed' : 'Ended'}</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-between gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-black transition ${
          isUrgent
            ? 'bg-red-500/20 border-red-500/50 text-red-200'
            : timeLeft.isScheduled
            ? isBrandTheme ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
            : isBrandTheme ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-zinc-950 border-zinc-800 text-white'
        } ${className}`}
      >
        <div className="flex items-center space-x-2">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
          ) : timeLeft.isScheduled ? (
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Timer className={`w-4 h-4 shrink-0 ${isBrandTheme ? 'text-blue-600' : 'text-red-400'}`} />
          )}
          <span className="font-extrabold">{timeLeft.label}</span>
        </div>

        <div className="flex items-center space-x-1 font-mono font-black">
          {timeLeft.days > 0 && (
            <span className={`px-2 py-0.5 rounded-lg border ${
              isBrandTheme ? 'bg-white border-blue-300 text-blue-900' : 'bg-zinc-900 border-zinc-700 text-white'
            }`}>
              {timeLeft.days}<span className="text-[10px] font-bold opacity-70 ml-0.5">d</span>
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-lg border ${
            isBrandTheme ? 'bg-white border-blue-300 text-blue-900' : 'bg-zinc-900 border-zinc-700 text-white'
          }`}>
            {pad(timeLeft.hours)}<span className="text-[10px] font-bold opacity-70 ml-0.5">h</span>
          </span>
          <span>:</span>
          <span className={`px-2 py-0.5 rounded-lg border ${
            isBrandTheme ? 'bg-white border-blue-300 text-blue-900' : 'bg-zinc-900 border-zinc-700 text-white'
          }`}>
            {pad(timeLeft.minutes)}<span className="text-[10px] font-bold opacity-70 ml-0.5">m</span>
          </span>
          <span>:</span>
          <span className={`px-2 py-0.5 rounded-lg border ${
            isUrgent ? 'bg-red-600 text-white border-red-500' : isBrandTheme ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-950 text-red-300 border-red-500/50'
          }`}>
            {pad(timeLeft.seconds)}<span className="text-[10px] font-bold opacity-70 ml-0.5">s</span>
          </span>
        </div>
      </div>
    );
  }

  // 4. DETAILED VARIANT (For Campaign Details page & modals)
  return (
    <div
      className={`p-5 rounded-3xl border shadow-xl transition space-y-4 ${
        isUrgent
          ? 'bg-red-950/80 border-red-500/50 text-white shadow-red-950/50'
          : timeLeft.isScheduled
          ? isBrandTheme ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          : isBrandTheme ? 'bg-white border-blue-200 text-slate-900 shadow-blue-500/5' : 'bg-zinc-900 border-zinc-800 text-white shadow-md'
      } ${className}`}
    >
      <div className="flex items-center justify-between border-b pb-3 opacity-90">
        <div className="flex items-center space-x-2">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
          ) : timeLeft.isScheduled ? (
            <Clock className="w-5 h-5 text-amber-500 animate-spin-slow" />
          ) : (
            <Timer className={`w-5 h-5 ${isBrandTheme ? 'text-blue-600' : 'text-red-400'}`} />
          )}
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
            {timeLeft.label}
          </span>
        </div>
        {isUrgent && (
          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-black border border-red-400 animate-pulse">
            Ending Soon!
          </span>
        )}
      </div>

      {isCompletedOrCancelled || (timeLeft.isExpired && !timeLeft.isScheduled) ? (
        <div className="text-center py-4 space-y-1">
          <div className="font-black text-lg">Campaign Concluded</div>
          <p className="text-xs font-semibold opacity-70">This campaign has reached its duration deadline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className={`p-3 rounded-2xl border font-black ${
            isBrandTheme ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
          }`}>
            <div className="text-2xl sm:text-3xl font-mono">{pad(timeLeft.days)}</div>
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mt-1">Days</div>
          </div>
          <div className={`p-3 rounded-2xl border font-black ${
            isBrandTheme ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
          }`}>
            <div className="text-2xl sm:text-3xl font-mono">{pad(timeLeft.hours)}</div>
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mt-1">Hours</div>
          </div>
          <div className={`p-3 rounded-2xl border font-black ${
            isBrandTheme ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
          }`}>
            <div className="text-2xl sm:text-3xl font-mono">{pad(timeLeft.minutes)}</div>
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mt-1">Mins</div>
          </div>
          <div className={`p-3 rounded-2xl border font-black ${
            isUrgent ? 'bg-red-600 text-white border-red-500' : isBrandTheme ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-950 border-red-500/50 text-red-300'
          }`}>
            <div className="text-2xl sm:text-3xl font-mono">{pad(timeLeft.seconds)}</div>
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mt-1">Secs</div>
          </div>
        </div>
      )}
    </div>
  );
}
