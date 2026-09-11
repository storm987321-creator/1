import React from 'react';
import { AlertTriangle, Plus, Receipt, X } from 'lucide-react';
import { PSStation } from '../types';

interface WarningModalProps {
  station: PSStation | null;
  onClose: () => void;
  onFinish: (station: PSStation) => void;
  onAddTime: (station: PSStation, minutes: number) => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  station,
  onClose,
  onFinish,
  onAddTime,
}) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-500/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-500/20 text-center">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon with pulsating ring */}
        <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Big Alert Typography */}
        <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold tracking-widest uppercase mb-2">
          Vaqt chegarasi
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Chakra_Petch',sans-serif]">
          ⚠️ WARNING
        </h2>
        <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-400 font-['Chakra_Petch',sans-serif]">
          {station.id} vaqti tugadi!
        </p>

        <p className="mt-3 text-sm text-zinc-400 max-w-sm mx-auto">
          Mijozning belgilangan o‘yin vaqti to‘liq yakunlandi. Sessiyani tugatib chek chiqarishingiz yoki qo‘shimcha vaqt belgilashingiz mumkin.
        </p>

        {/* Quick Extend Options */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">
            Vaqt qo‘shish:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAddTime(station, 15)}
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl text-white font-semibold text-sm transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" /> +15 min
            </button>
            <button
              onClick={() => onAddTime(station, 30)}
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl text-white font-semibold text-sm transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" /> +30 min
            </button>
            <button
              onClick={() => onAddTime(station, 60)}
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl text-white font-semibold text-sm transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" /> +60 min
            </button>
          </div>
        </div>

        {/* Primary Action: Finish & Print Receipt */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onFinish(station)}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Receipt className="w-5 h-5" />
            PS ni tugatish (Chek)
          </button>
          <button
            onClick={onClose}
            className="py-3.5 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl border border-zinc-700 transition cursor-pointer text-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
