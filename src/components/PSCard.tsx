import React from 'react';
import {
  Play,
  Pause,
  Plus,
  ShoppingCart,
  Receipt,
  Crown,
  Gamepad2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { PSStation } from '../types';
import {
  calculateTotalBill,
  formatCurrency,
  formatTime,
  getElapsedSeconds,
  getRemainingSeconds,
} from '../utils/calculator';

interface PSCardProps {
  station: PSStation;
  now: number;
  onOpenStartModal: (station: PSStation) => void;
  onOpenVipModal: (station: PSStation) => void;
  onTogglePause: (station: PSStation) => void;
  onAddTime: (station: PSStation, minutes: number) => void;
  onOpenPurchases: (station: PSStation) => void;
  onOpenReceipt: (station: PSStation) => void;
}

export const PSCard: React.FC<PSCardProps> = ({
  station,
  now,
  onOpenStartModal,
  onOpenVipModal,
  onTogglePause,
  onAddTime,
  onOpenPurchases,
  onOpenReceipt,
}) => {
  const isIdle = station.status === 'idle';
  const isPaused = station.status === 'paused' || station.status === 'vip_paused';
  const isVip = station.isVip;

  // Compute live seconds
  const elapsedSec = getElapsedSeconds(station, now);
  const remainingSec = getRemainingSeconds(station, now);

  const isExpired = !isVip && !isIdle && remainingSec === 0;

  // Pricing calculations
  const { sessionCost, purchasesTotal, total } = calculateTotalBill(station, now);

  // Status badge config
  const getStatusBadge = () => {
    if (isIdle) {
      return {
        label: 'Bo‘sh',
        dotClass: 'bg-zinc-500',
        badgeClass: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
        symbol: '⚪',
      };
    }
    if (isExpired) {
      return {
        label: 'Vaqti tugadi',
        dotClass: 'bg-red-500 animate-ping',
        badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
        symbol: '⚠️',
      };
    }
    if (isPaused) {
      return {
        label: isVip ? 'VIP • Pauza' : 'Pauza',
        dotClass: 'bg-amber-400 animate-pulse',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        symbol: '🟡',
      };
    }
    if (isVip) {
      return {
        label: 'VIP Ishlayapti',
        dotClass: 'bg-amber-400 animate-pulse',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        symbol: '👑',
      };
    }
    return {
      label: 'Ishlayapti',
      dotClass: 'bg-emerald-400 animate-pulse',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      symbol: '🟢',
    };
  };

  const statusBadge = getStatusBadge();

  // Determine timer display
  const displayTime = isVip
    ? formatTime(elapsedSec)
    : formatTime(remainingSec);

  // Card border styling based on state
  const getBorderColor = () => {
    if (isIdle) return 'border-zinc-800/80 hover:border-zinc-700';
    if (isExpired) return 'border-red-500 shadow-lg shadow-red-500/20 ring-1 ring-red-500/50';
    if (isPaused) return 'border-amber-500/60 shadow-lg shadow-amber-500/10';
    if (isVip) return 'border-amber-500/70 shadow-lg shadow-amber-500/15';
    return 'border-blue-600/70 shadow-lg shadow-blue-600/15';
  };

  const purchasesCount = station.purchases.reduce((acc, p) => acc + p.quantity, 0);

  return (
    <div
      id={`ps-card-${station.id.toLowerCase()}`}
      className={`relative bg-zinc-900/90 rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden ${getBorderColor()}`}
    >
      {/* PlayStation Ambient Glow on top corner */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 blur-3xl pointer-events-none rounded-full opacity-20 ${
          isIdle
            ? 'bg-zinc-600'
            : isExpired
            ? 'bg-red-500'
            : isPaused
            ? 'bg-amber-500'
            : isVip
            ? 'bg-amber-400'
            : 'bg-blue-500'
        }`}
      />

      {/* Top Bar: PS-X Title & Status Badge */}
      <div className="p-5 pb-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-['Chakra_Petch',sans-serif] text-base border ${
              isIdle
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : isVip
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isExpired
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-blue-600/20 text-blue-400 border-blue-500/40'
            }`}
          >
            {station.id.replace('PS-', '')}
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wider font-['Chakra_Petch',sans-serif]">
              {station.id}
            </h2>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
              {station.game ? (
                <>
                  <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{station.game}</span>
                </>
              ) : (
                <span>PlayStation 5</span>
              )}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusBadge.badgeClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {/* Center Body: Massive Digital Timer & Price */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-center">
        {isIdle ? (
          <div className="text-center py-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-zinc-600 tracking-wider">
              00:00:00
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              PlayStation bo‘sh. Boshlash uchun o‘yin tanlang.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timer Display */}
            <div
              className={`text-center py-3 px-4 rounded-xl border ${
                isExpired
                  ? 'bg-red-950/40 border-red-500/50'
                  : isPaused
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-zinc-950/70 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock
                  className={`w-4 h-4 ${
                    isExpired
                      ? 'text-red-400 animate-spin'
                      : isPaused
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                />
                <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400">
                  {isVip
                    ? 'VIP Vaqt (Count-Up)'
                    : isExpired
                    ? 'Vaqt Tugadi'
                    : 'Qolgan Vaqt (Count-Down)'}
                </span>
              </div>

              <div
                className={`font-mono text-4xl sm:text-5xl font-black tracking-widest leading-tight ${
                  isExpired
                    ? 'text-red-400 animate-pulse'
                    : isPaused
                    ? 'text-amber-300'
                    : isVip
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {displayTime}
              </div>

              {isPaused && (
                <div className="mt-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  ⏸ Vaqt to‘xtatilgan
                </div>
              )}
            </div>

            {/* Live Financial Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 text-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">
                  Sessiya
                </span>
                <p className="font-mono text-xs sm:text-sm font-bold text-zinc-200 mt-0.5 truncate">
                  {formatCurrency(sessionCost)}
                </p>
              </div>

              <div className="border-x border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-medium">
                  Xaridlar
                </span>
                <p className="font-mono text-xs sm:text-sm font-bold text-zinc-200 mt-0.5 truncate">
                  {formatCurrency(purchasesTotal)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400/80 uppercase font-bold">
                  JAMI
                </span>
                <p className="font-mono text-xs sm:text-sm font-black text-emerald-400 mt-0.5 truncate">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Tactile Big Buttons */}
      <div className="p-4 pt-0 space-y-2.5">
        {isIdle ? (
          /* Idle Actions: Standard & VIP */
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenStartModal(station)}
              className="py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Sessiya boshlash
            </button>

            <button
              onClick={() => onOpenVipModal(station)}
              className="py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-zinc-950" />
              VIP Sessiya
            </button>
          </div>
        ) : (
          /* Active Actions */
          <div className="space-y-2">
            {/* Row 1: Pause / Resume + Quick Add Time */}
            <div className="flex gap-2">
              {/* Pause / Resume button */}
              <button
                onClick={() => onTogglePause(station)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-amber-500/30'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    ▶ Davom ettirish
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-amber-300" />
                    ⏸ Pauza
                  </>
                )}
              </button>

              {/* Quick Add Time (Only for standard session) */}
              {!isVip && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onAddTime(station, 15)}
                    className="px-2.5 py-2.5 bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-0.5"
                    title="+15 daqiqa qo‘shish"
                  >
                    <Plus className="w-3 h-3 text-blue-400" />
                    15m
                  </button>
                  <button
                    onClick={() => onAddTime(station, 30)}
                    className="px-2.5 py-2.5 bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-0.5"
                    title="+30 daqiqa qo‘shish"
                  >
                    <Plus className="w-3 h-3 text-blue-400" />
                    30m
                  </button>
                  <button
                    onClick={() => onAddTime(station, 60)}
                    className="px-2.5 py-2.5 bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-0.5"
                    title="+60 daqiqa qo‘shish"
                  >
                    <Plus className="w-3 h-3 text-blue-400" />
                    60m
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Purchases (Xaridlar) & Finish (Tugatish) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenPurchases(station)}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold rounded-xl border border-zinc-700 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer relative"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Xaridlar</span>
                {purchasesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-zinc-950 font-extrabold text-[10px] rounded-full">
                    {purchasesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onOpenReceipt(station)}
                className={`py-2.5 px-3 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-md ${
                  isExpired
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {isExpired ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                <span>PS ni tugatish</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
