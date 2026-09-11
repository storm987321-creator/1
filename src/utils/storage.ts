import { PSId, PSStation, ReceiptRecord } from '../types';

const STORAGE_KEY_PS = 'gameclub_ps_stations_v1';
const STORAGE_KEY_REVENUE = 'gameclub_daily_revenue_v1';
const STORAGE_KEY_HISTORY = 'gameclub_receipts_history_v1';

export const INITIAL_STATIONS: PSStation[] = [
  {
    id: 'PS-1',
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
  },
  {
    id: 'PS-2',
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
  },
  {
    id: 'PS-3',
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
  },
  {
    id: 'PS-4',
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
  },
];

export function loadStations(): PSStation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PS);
    if (!raw) return INITIAL_STATIONS;
    const parsed = JSON.parse(raw) as PSStation[];
    if (Array.isArray(parsed) && parsed.length === 4) {
      // Ensure all 4 IDs exist and maintain structure
      const validIds: PSId[] = ['PS-1', 'PS-2', 'PS-3', 'PS-4'];
      return validIds.map((id) => {
        const found = parsed.find((p) => p.id === id);
        return found ?? INITIAL_STATIONS.find((p) => p.id === id)!;
      });
    }
    return INITIAL_STATIONS;
  } catch (e) {
    console.error('Failed to load stations from localStorage:', e);
    return INITIAL_STATIONS;
  }
}

export function saveStations(stations: PSStation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PS, JSON.stringify(stations));
  } catch (e) {
    console.error('Failed to save stations to localStorage:', e);
  }
}

export function loadDailyRevenue(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVENUE);
    if (!raw) return 0;
    const num = Number(raw);
    return isNaN(num) ? 0 : num;
  } catch (e) {
    return 0;
  }
}

export function saveDailyRevenue(revenue: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVENUE, String(revenue));
  } catch (e) {
    console.error('Failed to save daily revenue:', e);
  }
}

export function loadHistory(): ReceiptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(history: ReceiptRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage:', e);
  }
}
