/**
 * Vylos XP and Gamification Service
 * Handles XP calculations, rank tracking, streaks, and multiplier logic.
 */

export const RANKS = [
  { id: 1, name: "Scout Analyst", minXp: 0, maxXp: 5000 },
  { id: 2, name: "Wealth Strategist", minXp: 5001, maxXp: 15000 },
  { id: 3, name: "Portfolio Manager", minXp: 15001, maxXp: 35000 },
  { id: 4, name: "Capital Tycoon", minXp: 35001, maxXp: 60000 },
  { id: 5, name: "Legacy Founder", minXp: 60001, maxXp: 100000 },
];

export const XP_CONFIG = {
  // Once-off
  ONBOARDING_COMPLETE: { xp: 250, label: "Onboarding Questionnaire" },
  TERMS_ACCEPTANCE: { xp: 50, label: "Accepting Terms" },
  PROFILE_SETUP: { xp: 100, label: "Profile Setup Complete" },
  
  // Daily
  DAILY_LOGIN: { xp: 10, label: "Daily Login", dailyLimit: 1 },
  DASHBOARD_REVIEW: { xp: 15, label: "Dashboard Review", dailyLimit: 1 },
  
  // Repeatable
  ADD_TRANSACTION: { xp: 20, label: "Adding Transaction", dailyLimit: 20 },
  IMPORT_TRANSACTIONS: { xp: 100, label: "Importing Data", dailyLimit: 5 },
  CATEGORIZE_TRANSACTION: { xp: 10, label: "Categorising Transaction", dailyLimit: 50 },
  
  // Planning
  CREATE_BUDGET: { xp: 75, label: "Creating Budget" },
  UPDATE_BUDGET: { xp: 25, label: "Updating Budget" },
  CREATE_GOAL: { xp: 75, label: "Creating Goal" },
  UPDATE_GOAL_PROGRESS: { xp: 30, label: "Updating Goal Progress" },
  
  // Milestones
  WEEKLY_REVIEW: { xp: 150, label: "Weekly Financial Review" },
  SAVINGS_MILESTONE: { xp: 1000, label: "Savings Milestone Reach" },
  
  // Streaks
  STREAK_3_DAY: { xp: 100, label: "3-Day Consistency Streak" },
  STREAK_30_DAY: { xp: 1000, label: "30-Day Consistency Streak" },
};

export const CONSISTENCY_WEIGHTS = {
  LOGIN: 20,
  TRANSACTION: 25,
  REVIEW: 15,
  BUDGET_UPDATE: 20,
  REPORT_CHECK: 20,
};

export const XPService = {
  calculateRank(totalXp: number) {
    const current = RANKS.find(r => totalXp >= r.minXp && totalXp <= r.maxXp) || RANKS[RANKS.length - 1];
    const nextIndex = RANKS.indexOf(current) + 1;
    const next = nextIndex < RANKS.length ? RANKS[nextIndex] : null;
    
    let progress = 100;
    let needed = 0;
    
    if (next) {
      const range = next.minXp - current.minXp;
      const currentProgress = totalXp - current.minXp;
      progress = Math.min(Math.round((currentProgress / range) * 100), 100);
      needed = next.minXp - totalXp;
    }
    
    return { current, next, progress, needed };
  },

  calculateFinalXp(baseXp: number, multiplier: number) {
    return Math.round(baseXp * multiplier);
  },

  shouldAwardDailyXp(lastXpDate: string | null) {
    if (!lastXpDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return lastXpDate !== today;
  },

  calculateNewMultiplier(currentMultiplier: number, currentStreak: number) {
    // Every 7 days, increase by 0.1
    // This logic might be better handled when the streak actually hits a multiple of 7
    return Math.min(currentMultiplier, 2.2); // Just a placeholder, actual logic in updateDailyStreak
  },

  getDailyConsistencyIncrement(actionType: keyof typeof CONSISTENCY_WEIGHTS): number {
    return CONSISTENCY_WEIGHTS[actionType] || 0;
  }
};
