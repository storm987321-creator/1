import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PSCard } from './components/PSCard';
import { StartSessionModal } from './components/StartSessionModal';
import { StartVipModal } from './components/StartVipModal';
import { WarningModal } from './components/WarningModal';
import { PurchasesModal } from './components/PurchasesModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HistoryModal } from './components/HistoryModal';
import { GameType, PSStation, PurchaseItem, ReceiptRecord, GAME_CONFIGS } from './types';
import {
  loadStations,
  saveStations,
  loadDailyRevenue,
  saveDailyRevenue,
  loadHistory,
  saveHistory,
} from './utils/storage';
import { getRemainingSeconds } from './utils/calculator';

export default function App() {
  const [stations, setStations] = useState<PSStation[]>(loadStations);
  const [dailyRevenue, setDailyRevenue] = useState<number>(loadDailyRevenue);
  const [history, setHistory] = useState<ReceiptRecord[]>(loadHistory);
  const [now, setNow] = useState<number>(Date.now());

  // Modals state
  const [startModalStation, setStartModalStation] = useState<PSStation | null>(null);
  const [vipModalStation, setVipModalStation] = useState<PSStation | null>(null);
  const [purchasesModalStation, setPurchasesModalStation] = useState<PSStation | null>(null);
  const [receiptModalStation, setReceiptModalStation] = useState<PSStation | null>(null);
  const [warningStation, setWarningStation] = useState<PSStation | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Auto-tick every 1000ms and check for expired sessions
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      setStations((prevStations) => {
        let updated = false;
        const newStations = prevStations.map((station) => {
          if (
            !station.isVip &&
            station.startedAt &&
            station.status !== 'idle' &&
            !station.warningShown
          ) {
            const remSec = getRemainingSeconds(station, currentNow);
            if (remSec === 0) {
              updated = true;
              // Open warning modal only once when time expires
              setWarningStation(station);
              return {
                ...station,
                status: 'expired' as const,
                warningShown: true,
              };
            }
          }
          return station;
        });

        if (updated) {
          saveStations(newStations);
          return newStations;
        }
        return prevStations;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save changes to localStorage whenever stations change
  const updateStationState = useCallback((updater: (prev: PSStation[]) => PSStation[]) => {
    setStations((prev) => {
      const next = updater(prev);
      saveStations(next);
      return next;
    });
  }, []);

  // 1. Start Standard Session
  const handleStartStandardSession = (stationId: string, game: GameType, minutes: number) => {
    const config = GAME_CONFIGS[game];
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          return {
            ...s,
            status: 'running',
            game,
            gameRatePerHour: config.ratePerHour,
            isVip: false,
            startedAt: Date.now(),
            targetDurationSec: minutes * 60,
            totalPausedMs: 0,
            pausedAt: null,
            purchases: [],
            warningShown: false,
          };
        }
        return s;
      })
    );
    setStartModalStation(null);
  };

  // 2. Start VIP Session (NO minute input)
  const handleStartVipSession = (stationId: string, game: GameType) => {
    const config = GAME_CONFIGS[game];
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          return {
            ...s,
            status: 'vip',
            game,
            gameRatePerHour: config.ratePerHour,
            isVip: true,
            startedAt: Date.now(),
            targetDurationSec: 0,
            totalPausedMs: 0,
            pausedAt: null,
            purchases: [],
            warningShown: false,
          };
        }
        return s;
      })
    );
    setVipModalStation(null);
  };

  // 3. Toggle Pause / Resume
  const handleTogglePause = (station: PSStation) => {
    const currentTime = Date.now();
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === station.id) {
          if (s.status === 'running') {
            return {
              ...s,
              status: 'paused',
              pausedAt: currentTime,
            };
          } else if (s.status === 'vip') {
            return {
              ...s,
              status: 'vip_paused',
              pausedAt: currentTime,
            };
          } else if (s.status === 'paused') {
            const addedPauseMs = s.pausedAt ? currentTime - s.pausedAt : 0;
            return {
              ...s,
              status: 'running',
              totalPausedMs: s.totalPausedMs + addedPauseMs,
              pausedAt: null,
            };
          } else if (s.status === 'vip_paused') {
            const addedPauseMs = s.pausedAt ? currentTime - s.pausedAt : 0;
            return {
              ...s,
              status: 'vip',
              totalPausedMs: s.totalPausedMs + addedPauseMs,
              pausedAt: null,
            };
          }
        }
        return s;
      })
    );
  };

  // 4. Add Time (+15, +30, +60 min)
  const handleAddTime = (station: PSStation, extraMinutes: number) => {
    const extraSec = extraMinutes * 60;
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === station.id) {
          const nextTarget = s.targetDurationSec + extraSec;
          const wasExpired = s.status === 'expired';
          return {
            ...s,
            targetDurationSec: nextTarget,
            // If it was expired, return it to running (or paused if paused)
            status: wasExpired ? 'running' : s.status,
            warningShown: false, // allow re-triggering when new time expires
          };
        }
        return s;
      })
    );

    // If warning modal was open for this station, close it
    if (warningStation?.id === station.id) {
      setWarningStation(null);
    }
  };

  // 5. Save Purchases for specific PS
  const handleSavePurchases = (stationId: string, purchases: PurchaseItem[]) => {
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          return { ...s, purchases };
        }
        return s;
      })
    );
    // Keep modal station updated if open
    if (purchasesModalStation?.id === stationId) {
      setPurchasesModalStation((prev) => (prev ? { ...prev, purchases } : null));
    }
  };

  // 6. Finish Session & Finalize Receipt
  const handleConfirmPayment = (
    station: PSStation,
    receiptData: {
      durationSec: number;
      durationFormatted: string;
      sessionCost: number;
      purchasesTotal: number;
      totalAmount: number;
    }
  ) => {
    if (!station.game) return;

    // Create receipt record
    const newReceipt: ReceiptRecord = {
      id: `rcpt-${Date.now()}-${station.id}`,
      psId: station.id,
      game: station.game,
      isVip: station.isVip,
      durationSec: receiptData.durationSec,
      durationFormatted: receiptData.durationFormatted,
      sessionCost: receiptData.sessionCost,
      purchases: [...station.purchases],
      purchasesTotal: receiptData.purchasesTotal,
      totalAmount: receiptData.totalAmount,
      completedAt: Date.now(),
      dateFormatted: new Date().toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Update history
    const updatedHistory = [newReceipt, ...history];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);

    // Update daily revenue
    const newRevenue = dailyRevenue + receiptData.totalAmount;
    setDailyRevenue(newRevenue);
    saveDailyRevenue(newRevenue);

    // Reset station back to idle
    updateStationState((prev) =>
      prev.map((s) => {
        if (s.id === station.id) {
          return {
            id: s.id,
            status: 'idle',
            game: null,
            gameRatePerHour: 0,
            isVip: false,
            startedAt: null,
            targetDurationSec: 0,
            totalPausedMs: 0,
            pausedAt: null,
            purchases: [],
            warningShown: false,
          };
        }
        return s;
      })
    );

    setReceiptModalStation(null);
    if (warningStation?.id === station.id) {
      setWarningStation(null);
    }
  };

  // 7. Reset shift revenue
  const handleResetShift = () => {
    if (window.confirm('Bugungi tushumni 0 so‘m qilib yangi smena boshlamoqchimisiz?')) {
      setDailyRevenue(0);
      saveDailyRevenue(0);
    }
  };

  // Get active station for modals in case state updated
  const currentPurchasesStation = purchasesModalStation
    ? stations.find((s) => s.id === purchasesModalStation.id) ?? null
    : null;

  const currentReceiptStation = receiptModalStation
    ? stations.find((s) => s.id === receiptModalStation.id) ?? null
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header with Brand & Live Stats Bar */}
      <Header
        stations={stations}
        dailyRevenue={dailyRevenue}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onResetShift={handleResetShift}
      />

      {/* Main PS Cards Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Chakra_Petch',sans-serif] flex items-center gap-2">
              <span>PLAYSTATION ZONASI</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono font-normal">
                4 ta PS
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Har bir PlayStation uchun alohida vaqt va xaridlar boshqaruvi
            </p>
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Tariflar:</span>
            <span>⚽ Football: 15 000 so‘m/soat</span>
            <span className="text-zinc-600">•</span>
            <span>🥊 MK: 20 000 so‘m/soat</span>
          </div>
        </div>

        {/* 4 PlayStation Cards Grid (Exact PS-1, PS-2, PS-3, PS-4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {stations.map((station) => (
            <PSCard
              key={station.id}
              station={station}
              now={now}
              onOpenStartModal={(s) => setStartModalStation(s)}
              onOpenVipModal={(s) => setVipModalStation(s)}
              onTogglePause={handleTogglePause}
              onAddTime={handleAddTime}
              onOpenPurchases={(s) => setPurchasesModalStation(s)}
              onOpenReceipt={(s) => setReceiptModalStation(s)}
            />
          ))}
        </div>

        {/* Quick Instructions & Shortcut Help */}
        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong className="text-zinc-200">Avtomatik saqlash:</strong> Brauzer yopilsa ham barcha sessiyalar va tushumlar saqlanadi.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Oddiy: orqaga sanash
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> VIP: erkin vaqt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Vaqt tugaganda: ogohlantirish
            </span>
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* 1. Start Standard Session Modal */}
      <StartSessionModal
        station={startModalStation}
        onClose={() => setStartModalStation(null)}
        onStart={handleStartStandardSession}
      />

      {/* 2. Start VIP Session Modal (No minute input) */}
      <StartVipModal
        station={vipModalStation}
        onClose={() => setVipModalStation(null)}
        onStart={handleStartVipSession}
      />

      {/* 3. Time Expired Warning Modal (Requirement #6) */}
      <WarningModal
        station={warningStation}
        onClose={() => setWarningStation(null)}
        onFinish={(station) => {
          setWarningStation(null);
          setReceiptModalStation(station);
        }}
        onAddTime={handleAddTime}
      />

      {/* 4. Purchases Modal (Requirement #7) */}
      <PurchasesModal
        station={currentPurchasesStation}
        onClose={() => setPurchasesModalStation(null)}
        onSavePurchases={handleSavePurchases}
      />

      {/* 5. Finish Session & Receipt Modal (Requirement #8) */}
      <ReceiptModal
        station={currentReceiptStation}
        onClose={() => setReceiptModalStation(null)}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* 6. Shift History & Receipts Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
      />
    </div>
  );
}
