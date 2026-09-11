import React, { useState } from 'react';
import { Play, X, Clock, CheckCircle2 } from 'lucide-react';
import { GameType, PSStation, GAME_CONFIGS } from '../types';
import { formatCurrency } from '../utils/calculator';

interface StartSessionModalProps {
  station: PSStation | null;
  onClose: () => void;
  onStart: (stationId: string, game: GameType, minutes: number) => void;
}

const PRESET_MINUTES = [15, 30, 45, 60, 90, 120, 180];

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  station,
  onClose,
  onStart,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('Football');
  const [minutes, setMinutes] = useState<number>(60);
  const [customInput, setCustomInput] = useState<string>('60');

  if (!station) return null;

  const activeConfig = GAME_CONFIGS[selectedGame];
  // Calculate price: e.g. 60 min -> 15 000 so'm, 30 min -> 7 500 so'm
  const estimatedCost = Math.round(minutes * (activeConfig.ratePerHour / 60));

  const handleSelectPreset = (m: number) => {
    setMinutes(m);
    setCustomInput(String(m));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setMinutes(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) return;
    onStart(station.id, selectedGame, minutes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 font-mono font-bold text-sm rounded-lg border border-blue-500/30">
              {station.id}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                Sessiya boshlash
              </h3>
              <p className="text-xs text-zinc-400">Oddiy sessiya (Orqaga sanovchi timer)</p>
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
          {/* Step 1: Game Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              1. O‘yinni tanlang
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
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{config.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
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

          {/* Step 2: Minute Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                2. Daqiqani kiritish
              </label>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> {minutes} daqiqa (
                {(minutes / 60).toFixed(1)} soat)
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectPreset(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    minutes === m
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {m} daqiqa
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1440"
                value={customInput}
                onChange={handleCustomChange}
                placeholder="Masalan: 60"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">
                daqiqa
              </span>
            </div>
          </div>

          {/* Price Calculation Preview Card */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Kutilayotgan narx</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedGame} • {minutes} daqiqa
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(estimatedCost)}
              </span>
            </div>
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
              disabled={minutes <= 0}
              className="flex-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-base disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              Sessiyani boshlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
