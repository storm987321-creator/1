import React, { useState } from 'react';
import { History, X, Search, Calendar, ChevronRight, Gamepad2, ShoppingBag } from 'lucide-react';
import { ReceiptRecord } from '../types';
import { formatCurrency } from '../utils/calculator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReceiptRecord[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.psId.toLowerCase().includes(q) ||
      item.game.toLowerCase().includes(q) ||
      item.dateFormatted.toLowerCase().includes(q)
    );
  });

  const totalHistoricalRevenue = history.reduce((sum, h) => sum + h.totalAmount, 0);
  const totalSessionsRevenue = history.reduce((sum, h) => sum + h.sessionCost, 0);
  const totalPurchasesRevenue = history.reduce((sum, h) => sum + h.purchasesTotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                Cheklar va Tushum Tarixi
              </h3>
              <p className="text-xs text-zinc-400">
                Jami: {history.length} ta tugatilgan sessiya
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

        {/* Quick Revenue Summary cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 uppercase font-medium">Jami Tushum</p>
            <p className="text-base sm:text-lg font-extrabold text-blue-400 font-mono mt-0.5">
              {formatCurrency(totalHistoricalRevenue)}
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 uppercase font-medium">O‘yinlardan</p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
              {formatCurrency(totalSessionsRevenue)}
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 uppercase font-medium">Xaridlardan</p>
            <p className="text-base sm:text-lg font-extrabold text-amber-400 font-mono mt-0.5">
              {formatCurrency(totalPurchasesRevenue)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PS yoki o‘yin bo‘yicha qidirish..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Receipts List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm">Hech qanday chek topilmadi.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setSelectedReceipt(selectedReceipt?.id === item.id ? null : item)
                }
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedReceipt?.id === item.id
                    ? 'bg-blue-950/30 border-blue-500/60'
                    : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-zinc-800 font-mono font-bold text-xs text-white rounded-lg border border-zinc-700">
                      {item.psId}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {item.game}
                        </span>
                        {item.isVip && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-bold rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {item.dateFormatted} • {item.durationFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-bold text-white font-mono text-sm">
                        {formatCurrency(item.totalAmount)}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {item.purchasesTotal > 0
                          ? `O‘yin: ${formatCurrency(item.sessionCost)} + Xarid: ${formatCurrency(
                              item.purchasesTotal
                            )}`
                          : 'Faqat o‘yin'}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        selectedReceipt?.id === item.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedReceipt?.id === item.id && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/80 text-xs space-y-2 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" /> Sessiya narxi:
                      </span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(item.sessionCost)}
                      </span>
                    </div>

                    {item.purchases.length > 0 && (
                      <div>
                        <span className="text-zinc-400 flex items-center gap-1.5 mb-1">
                          <ShoppingBag className="w-3.5 h-3.5" /> Xaridlar:
                        </span>
                        <div className="pl-4 space-y-1">
                          {item.purchases.map((p) => (
                            <div key={p.id} className="flex justify-between text-zinc-400">
                              <span>
                                {p.name} ({p.quantity} dona)
                              </span>
                              <span className="font-mono">
                                {formatCurrency(p.price * p.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-sm transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
