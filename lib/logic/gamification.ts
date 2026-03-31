export const GAMIFICATION = {
  BASE_TRANSACTION_XP: 10,
  BASE_GOAL_XP: 100,
  STREAK_MULTIPLIER: 2,
};

/**
 * Calculates the user's level based on total XP.
 * Level = floor(0.1 * sqrt(XP))
 */
export function calculateLevel(xp: number): number {
  return Math.floor(0.1 * Math.sqrt(xp));
}

/**
 * Applies modifiers such as the '2x Streak Multiplier'.
 * If the user has any active streak (>0), they get double the XP for actions.
 */
export function calculateXPGain(baseXP: number, streak: number): number {
  return streak > 0 ? baseXP * GAMIFICATION.STREAK_MULTIPLIER : baseXP;
}

/**
 * Returns the XP to add for making a budget transaction
 */
export function handleTransaction(streak: number): number {
  return calculateXPGain(GAMIFICATION.BASE_TRANSACTION_XP, streak);
}

/**
 * Returns the XP to add for hitting a savings or budget goal
 */
export function handleGoalHit(streak: number): number {
  return calculateXPGain(GAMIFICATION.BASE_GOAL_XP, streak);
}
