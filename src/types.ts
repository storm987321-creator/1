export type PSId = 'PS-1' | 'PS-2' | 'PS-3' | 'PS-4';

export type PSStatus = 'idle' | 'running' | 'paused' | 'vip' | 'vip_paused' | 'expired';

export type GameType = 'Football' | 'Mortal Kombat';

export interface GameConfig {
  name: GameType;
  ratePerHour: number;
  ratePerMin: number; // 250 or 333.333...
  icon: string;
}

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  'Football': {
    name: 'Football',
    ratePerHour: 15000,
    ratePerMin: 250, // 15 000 / 60
    icon: '⚽',
  },
  'Mortal Kombat': {
    name: 'Mortal Kombat',
    ratePerHour: 20000,
    ratePerMin: 20000 / 60, // 333.333...
    icon: '🥊',
  },
};

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const DEFAULT_SNACKS: Omit<PurchaseItem, 'quantity'>[] = [
  { id: 'snack-cola', name: 'Cola', price: 5000 },
  { id: 'snack-choy', name: 'Choy', price: 3000 },
  { id: 'snack-chips', name: 'Chips', price: 2000 },
  { id: 'snack-suv', name: 'Suv', price: 2000 },
];

export interface PSStation {
  id: PSId;
  status: PSStatus;
  game: GameType | null;
  gameRatePerHour: number;
  isVip: boolean;
  startedAt: number | null; // Date.now() timestamp
  targetDurationSec: number; // For standard: minutes * 60. For VIP: 0
  totalPausedMs: number; // accumulated ms spent in pause
  pausedAt: number | null; // timestamp when paused
  purchases: PurchaseItem[];
  warningShown: boolean; // whether the time-up warning modal has triggered for this session
}

export interface ReceiptRecord {
  id: string;
  psId: PSId;
  game: GameType;
  isVip: boolean;
  durationSec: number;
  durationFormatted: string;
  sessionCost: number;
  purchases: PurchaseItem[];
  purchasesTotal: number;
  totalAmount: number;
  completedAt: number;
  dateFormatted: string;
}
