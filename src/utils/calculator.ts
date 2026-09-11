import { PSStation, PurchaseItem } from '../types';

/**
 * Calculates effective elapsed time in seconds, strictly subtracting any paused duration.
 */
export function getElapsedSeconds(ps: PSStation, now: number = Date.now()): number {
  if (!ps.startedAt) return 0;

  let totalMs = 0;
  if (ps.status === 'paused' || ps.status === 'vip_paused') {
    const pausePoint = ps.pausedAt ?? now;
    totalMs = pausePoint - ps.startedAt - ps.totalPausedMs;
  } else {
    totalMs = now - ps.startedAt - ps.totalPausedMs;
  }

  const effectiveSec = Math.floor(Math.max(0, totalMs) / 1000);
  return effectiveSec;
}

/**
 * For standard countdown sessions: returns remaining seconds.
 */
export function getRemainingSeconds(ps: PSStation, now: number = Date.now()): number {
  if (!ps.startedAt) return ps.targetDurationSec;
  const elapsed = getElapsedSeconds(ps, now);
  return Math.max(0, ps.targetDurationSec - elapsed);
}

/**
 * Calculates session cost strictly according to prompt rules:
 * - Football: 15,000 / 60 = 250 so'm/min
 * - Mortal Kombat: 20,000 / 60 = 333.333... so'm/min
 */
export function calculateSessionCost(ps: PSStation, now: number = Date.now()): number {
  if (!ps.game || !ps.gameRatePerHour) return 0;

  const ratePerMin = ps.gameRatePerHour / 60;

  if (ps.isVip) {
    // VIP session: based on exact elapsed played time
    const elapsedSec = getElapsedSeconds(ps, now);
    const elapsedMinutes = elapsedSec / 60;
    return Math.round(elapsedMinutes * ratePerMin);
  } else {
    // Standard session: based on allocated duration
    const plannedMinutes = ps.targetDurationSec / 60;
    return Math.round(plannedMinutes * ratePerMin);
  }
}

/**
 * Sum of purchases strictly tied to this PS session
 */
export function calculatePurchasesTotal(purchases: PurchaseItem[]): number {
  return purchases.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Total amount (Session + Purchases)
 */
export function calculateTotalBill(ps: PSStation, now: number = Date.now()): {
  sessionCost: number;
  purchasesTotal: number;
  total: number;
} {
  const sessionCost = calculateSessionCost(ps, now);
  const purchasesTotal = calculatePurchasesTotal(ps.purchases);
  return {
    sessionCost,
    purchasesTotal,
    total: sessionCost + purchasesTotal,
  };
}

/**
 * Format currency in Uzbek so'm (e.g. 15 000 so'm)
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} so'm`;
}

/**
 * Format seconds into HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
