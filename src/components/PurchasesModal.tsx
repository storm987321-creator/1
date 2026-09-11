import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Check, UtensilsCrossed } from 'lucide-react';
import { DEFAULT_SNACKS, PSStation, PurchaseItem } from '../types';
import { formatCurrency } from '../utils/calculator';

interface PurchasesModalProps {
  station: PSStation | null;
  onClose: () => void;
  onSavePurchases: (stationId: string, purchases: PurchaseItem[]) => void;
}

export const PurchasesModal: React.FC<PurchasesModalProps> = ({
  station,
  onClose,
  onSavePurchases,
}) => {
  if (!station) return null;

  // Local draft of purchases so user can edit and save
  const [items, setItems] = useState<PurchaseItem[]>(() => {
    return station.purchases.map((p) => ({ ...p }));
  });

  // Custom item state
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const handleAddPreset = (preset: (typeof DEFAULT_SNACKS)[0]) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === preset.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...preset, quantity: 1 }];
      }
    });
  };

  const handleIncrement = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const handleDecrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(customPrice, 10);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const newItem: PurchaseItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      price: priceNum,
      quantity: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setCustomName('');
    setCustomPrice('');
    setShowCustom(false);
  };

  const purchasesTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSave = () => {
    onSavePurchases(station.id, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm rounded-lg border border-emerald-500/30">
              {station.id}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                Xaridlar
              </h3>
              <p className="text-xs text-zinc-400">Ichimlik va yeguliklar buyurtmasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Quick presets (Requirement #7) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              Tezkor mahsulotlar (+ qo‘shish):
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {DEFAULT_SNACKS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-emerald-400 transition">
                      {preset.name}
                    </p>
                    <p className="text-xs font-mono text-zinc-400">
                      {formatCurrency(preset.price)}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-zinc-950 text-zinc-300 flex items-center justify-center transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current purchases list */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Ushbu PS dagi xaridlar ({items.length})
              </label>
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {showCustom ? 'Yopish' : 'Boshqa mahsulot'}
              </button>
            </div>

            {/* Custom Item Form */}
            {showCustom && (
              <form
                onSubmit={handleAddCustom}
                className="p-3 bg-zinc-900 border border-zinc-700/80 rounded-xl mb-3 space-y-2.5"
              >
                <p className="text-xs text-zinc-300 font-semibold">
                  Yangi mahsulot kiritish:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nomi (masalan: Red Bull)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Narxi (masalan: 12000)"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Qo‘shish
                </button>
              </form>
            )}

            {items.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500">
                <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                <p className="text-xs">Hozircha hech qanday xarid qo‘shilmagan.</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Yuqoridagi tezkor tugmalar orqali qo‘shing.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-400 font-mono">
                          {formatCurrency(item.price)} × {item.quantity} ={' '}
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(lineTotal)}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.id)}
                          className="w-6 h-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id)}
                          className="w-6 h-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer & Total */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Xaridlar jami:
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(purchasesTotal)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl border border-zinc-800 transition cursor-pointer text-sm"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <Check className="w-4 h-4" />
              Saqlash ({formatCurrency(purchasesTotal)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
