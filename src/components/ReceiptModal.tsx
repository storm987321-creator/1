import React, { useRef } from 'react';
import { Printer, CheckCircle, X, Copy, Check } from 'lucide-react';
import { PSStation } from '../types';
import {
  calculateTotalBill,
  formatCurrency,
  formatTime,
  getElapsedSeconds,
} from '../utils/calculator';

interface ReceiptModalProps {
  station: PSStation | null;
  onClose: () => void;
  onConfirmPayment: (station: PSStation, receiptData: {
    durationSec: number;
    durationFormatted: string;
    sessionCost: number;
    purchasesTotal: number;
    totalAmount: number;
  }) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  station,
  onClose,
  onConfirmPayment,
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!station || !station.game) return null;

  // Calculate actual duration and pricing at this exact moment
  const elapsedSec = getElapsedSeconds(station);
  // For standard session, if elapsed > target, duration is target duration unless extended
  const finalDurationSec = station.isVip ? elapsedSec : Math.max(station.targetDurationSec, elapsedSec);
  const durationFormatted = formatTime(finalDurationSec);

  const { sessionCost, purchasesTotal, total } = calculateTotalBill(station);

  const receiptData = {
    durationSec: finalDurationSec,
    durationFormatted,
    sessionCost,
    purchasesTotal,
    totalAmount: total,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      '================================',
      '           GAME CLUB            ',
      '================================',
      `PS: ${station.id}`,
      `O‘yin: ${station.game}`,
      `Rejim: ${station.isVip ? 'VIP Sessiya' : 'Oddiy Sessiya'}`,
      `Sessiya davomiyligi: ${durationFormatted}`,
      `Sessiya: ${formatCurrency(sessionCost)}`,
    ];

    if (station.purchases.length > 0) {
      textLines.push('--------------------------------');
      textLines.push('Xaridlar:');
      station.purchases.forEach((p) => {
        textLines.push(`  • ${p.name} (${p.quantity}x) - ${formatCurrency(p.price * p.quantity)}`);
      });
      textLines.push(`Xaridlar jami: ${formatCurrency(purchasesTotal)}`);
    } else {
      textLines.push(`Xaridlar: 0 so'm`);
    }

    textLines.push('================================');
    textLines.push(`JAMI: ${formatCurrency(total)}`);
    textLines.push('================================');
    textLines.push(`Sana: ${new Date().toLocaleString('uz-UZ')}`);
    textLines.push('Xaridingiz uchun rahmat!');

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div>
            <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
              Sessiyani yakunlash va Chek
            </h3>
            <p className="text-xs text-zinc-400">To‘lov miqdorini tekshiring</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Paper Container (White thermal receipt look for realism & printability) */}
        <div className="my-4 overflow-y-auto pr-1 flex-1">
          <div
            ref={receiptRef}
            className="bg-white text-zinc-900 rounded-xl p-6 font-mono text-sm shadow-inner border border-zinc-300 relative print:m-0 print:p-0 print:border-none print:shadow-none"
          >
            {/* Top receipt zigzag decoration / logo */}
            <div className="text-center pb-4 border-b-2 border-dashed border-zinc-400">
              <h4 className="text-xl font-extrabold tracking-wider font-['Chakra_Petch',sans-serif] text-black">
                GAME CLUB
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">PlayStation Game Zone</p>
              <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 text-white font-bold text-sm rounded">
                {station.id}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-2 border-b-2 border-dashed border-zinc-400">
              <div className="flex justify-between items-center text-xs text-zinc-600">
                <span>Vaqt:</span>
                <span>{new Date().toLocaleTimeString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-600">
                <span>Sana:</span>
                <span>{new Date().toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-600 font-medium">O‘yin:</span>
                <span className="font-bold text-black">{station.game}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-medium">Rejim:</span>
                <span className="font-semibold text-zinc-800">
                  {station.isVip ? '👑 VIP Sessiya' : 'Oddiy Sessiya'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-medium">Sessiya davomiyligi:</span>
                <span className="font-bold text-black font-mono">
                  {durationFormatted}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-700 font-medium">Sessiya:</span>
                <span className="font-bold text-black">
                  {formatCurrency(sessionCost)}
                </span>
              </div>
            </div>

            {/* Purchases breakdown */}
            <div className="py-3 border-b-2 border-dashed border-zinc-400 space-y-1.5">
              <div className="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-zinc-700 mb-1">
                <span>Xaridlar:</span>
                <span>{station.purchases.length} ta</span>
              </div>

              {station.purchases.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Xaridlar mavjud emas</p>
              ) : (
                station.purchases.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-zinc-700">
                    <span className="truncate pr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              )}

              <div className="flex justify-between items-center pt-2 text-sm font-semibold border-t border-zinc-200">
                <span>Xaridlar jami:</span>
                <span className="font-bold text-black">
                  {formatCurrency(purchasesTotal)}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-4 pb-2">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-extrabold tracking-wider text-black">
                  JAMI:
                </span>
                <span className="text-2xl font-black text-black">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="text-center text-[11px] text-zinc-500 pt-3 border-t border-zinc-200">
              Tashrifingiz uchun rahmat! Yana kutib qolamiz.
            </div>
          </div>
        </div>

        {/* Quick Utility actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Nusxalandi!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                Chek matnini nusxalash
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            Chop etish
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl border border-zinc-800 transition cursor-pointer text-sm"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onConfirmPayment(station, receiptData)}
            className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <CheckCircle className="w-5 h-5" />
            To‘lov qabul qilindi & Yakunlash
          </button>
        </div>
      </div>
    </div>
  );
};
