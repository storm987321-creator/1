import React, { useState } from 'react';
import { Crown, X, CheckCircle2, Timer } from 'lucide-react';
import { GameType, PSStation, GAME_CONFIGS } from '../types';
import { formatCurrency } from '../utils/calculator';

interface StartVipModalProps {
  station: PSStation | null;
  onClose: () => void;
  onStart: (stationId: string, game: GameType) => void;
}

export const StartVipModal: React.FC<StartVipModalProps> = ({
  station,
  onClose,
  onStart,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('Football');

  if (!station) return null;

  const activeConfig = GAME_CONFIGS[selectedGame];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(station.id, selectedGame);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-mono font-bold text-sm rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              {station.id}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                VIP Sessiya boshlash
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">
                Erkin vaqt (Oldinga sanovchi timer)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Game Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              O‘yinni tanlang
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(GAME_CONFIGS) as GameType[]).map((gameKey) => {
                const config = GAME_CONFIGS[gameKey];
                const isSelected = selectedGame === gameKey;
                return (
                  <button
                    key={gameKey}
                    type="button"
                    onClick={() => setSelectedGame(gameKey)}
                    className={`relative p-4 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{config.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-bold text-white text-base leading-tight">
                        {config.name}
                      </h4>
                      <p className="text-xs font-mono text-zinc-300 font-semibold mt-1">
                        {formatCurrency(config.ratePerHour)}{' '}
                        <span className="text-zinc-500 font-normal">/ soat</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIP Rules Information Card (No minute inputs as per rules) */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Timer className="w-4 h-4" />
              <span>VIP rejimida ishlash tartibi:</span>
            </div>
            <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
              <li>
                Oldindan daqiqa kiritilmaydi, vaqt erkin o‘tadi (Count-Up).
              </li>
              <li>
                Sessiya yakunlanganda haqiqiy o‘ynalgan daqiqalar asosida narx hisoblanadi.
              </li>
              <li>
                Pauza vaqtlari to‘xtatiladi va hisob-kitobga kiritilmaydi.
              </li>
              <li className="font-mono text-amber-300/90 font-medium">
                Masalan: {activeConfig.name} — 30 daqiqa ={' '}
                {formatCurrency(Math.round(30 * (activeConfig.ratePerHour / 60)))}.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl border border-zinc-800 transition cursor-pointer text-sm"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <Crown className="w-4 h-4 fill-zinc-950" />
              VIP Sessiyani boshlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
