import React, { useState, useEffect } from 'react';
import { Gamepad2, Coins, MonitorPlay, PowerOff, History, RotateCcw } from 'lucide-react';
import { PSStation } from '../types';
import { formatCurrency } from '../utils/calculator';

interface HeaderProps {
  stations: PSStation[];
  dailyRevenue: number;
  onOpenHistory: () => void;
  onResetShift: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stations,
  dailyRevenue,
  onOpenHistory,
  onResetShift,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const emptyCount = stations.filter((s) => s.status === 'idle').length;
  const activeCount = stations.filter((s) => s.status !== 'idle').length;

  return (
    <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-['Chakra_Petch',sans-serif]">
                  GAME CLUB
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  PS TIMER
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PlayStation Boshqaruv Markazi
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2 text-right">
            <div className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/50">
              {currentTime}
            </div>
          </div>
        </div>

        {/* Real-time Stats row (Requirement #10) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto flex-1 max-w-2xl">
          {/* Bo'sh PS */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
              <PowerOff className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Bo‘sh PS
              </p>
              <p className="text-lg font-bold text-white font-mono leading-none mt-0.5">
                {emptyCount}{' '}
                <span className="text-xs text-zinc-500 font-normal">/ 4</span>
              </p>
            </div>
          </div>

          {/* Faol sessiyalar */}
          <div className="bg-zinc-950/80 border border-emerald-950/60 rounded-xl px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <MonitorPlay className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider">
                Faol PS
              </p>
              <p className="text-lg font-bold text-emerald-400 font-mono leading-none mt-0.5">
                {activeCount}{' '}
                <span className="text-xs text-emerald-600 font-normal">/ 4</span>
              </p>
            </div>
          </div>

          {/* Bugungi tushum (Requirement #9 & #10) */}
          <div className="bg-zinc-950/80 border border-blue-950/60 rounded-xl px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Coins className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-medium text-blue-400/90 uppercase tracking-wider truncate">
                Bugungi tushum
              </p>
              <p className="text-base sm:text-lg font-extrabold text-blue-400 font-mono leading-none mt-0.5 truncate">
                {formatCurrency(dailyRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Clock */}
        <div className="hidden md:flex items-center gap-3">
          <div className="font-mono text-sm font-semibold text-zinc-300 bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            {currentTime}
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
            title="Cheklar tarixi va tushum tafsilotlari"
          >
            <History className="w-4 h-4 text-zinc-400" />
            <span>Tarix</span>
          </button>

          <button
            onClick={onResetShift}
            className="p-2 bg-zinc-800/60 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-xl border border-zinc-700/60 transition cursor-pointer"
            title="Smenani yangilash (Tushumni tozalash)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
