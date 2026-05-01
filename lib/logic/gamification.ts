import { VylosEngine } from "../vylosEngine";

export const GAMIFICATION = {
  BASE_TRANSACTION_XP: 10,
  BASE_GOAL_XP: 100,
  STREAK_MULTIPLIER: 2,
};

/**
 * REFACTORED: Now uses VylosEngine tiers based on XP.
 */
export function getTier(xp: number): string {
  if (xp >= 60000) return "Elite";
  if (xp >= 20000) return "Achiever";
  if (xp >= 5000) return "Builder";
  return "Starter";
}

/**
 * Calculates the user's level based on total XP.
 * Keeping this for backward compatibility if needed, but Tiers are preferred now.
 */
export function calculateLevel(xp: number): number {
  return Math.floor(0.1 * Math.sqrt(xp));
}

export function calculateXPGain(baseXP: number, streak: number): number {
  return streak > 0 ? baseXP * GAMIFICATION.STREAK_MULTIPLIER : baseXP;
}

export function handleTransaction(streak: number): number {
  return calculateXPGain(GAMIFICATION.BASE_TRANSACTION_XP, streak);
}

export function handleGoalHit(streak: number): number {
  return calculateXPGain(GAMIFICATION.BASE_GOAL_XP, streak);
}
