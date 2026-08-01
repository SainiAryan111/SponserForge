import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert, LogOut } from 'lucide-react';

/**
 * ConfirmModal Component
 * Renders a sleek, modern confirmation alert modal for critical actions.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'danger' | 'warning' | 'info' | 'success' | 'brand' | 'creator'
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
          btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40',
          borderColor: 'border-red-500/40',
        };
      case 'brand':
        return {
          icon: ShieldAlert,
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-100 border-blue-300 text-blue-900',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
          borderColor: 'border-blue-300',
        };
      case 'creator':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-400',
          badgeBg: 'bg-red-950 border-red-500/40 text-red-300',
          btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40',
          borderColor: 'border-red-500/40',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
          borderColor: 'border-emerald-500/40',
        };
      default: // warning
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
          borderColor: 'border-amber-500/40',
        };
    }
  };

  const style = getVariantStyles();
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-zinc-900 border ${style.borderColor} text-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-pulse-glow`}>
        
        {/* Top Header & Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl border ${style.badgeBg}`}>
              <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">CONFIRMATION REQUIRED</span>
              <h3 className="text-xl font-black text-white">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 ${style.btnBg} rounded-xl text-xs sm:text-sm font-black shadow-lg transition cursor-pointer flex items-center space-x-1.5`}
          >
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
