export type AdvisorTone = 'Collaborative' | 'Strict/Interventionist' | 'Neutral/Encouraging';

/**
 * Returns the Vylos AI Persona Tone based on user budget status and imminent external shocks.
 * @param budgetAdherence Percentage of budget spent (e.g. 96 for 96%)
 * @param isPetrolShockActive True if a petrol shock or huge inflation spike is actively applying tonight/very soon.
 */
export function getAdvisorTone(budgetAdherence: number, isPetrolShockActive: boolean): AdvisorTone {
  if (budgetAdherence > 95 || isPetrolShockActive) {
    return 'Strict/Interventionist';
  }
  if (budgetAdherence < 80) {
    return 'Collaborative';
  }
  return 'Neutral/Encouraging';
}

/**
 * Provides an investment analysis and suggestion based on the user's risk tolerance.
 * @param riskTolerance 1 (Conservative) to 5 (Aggressive)
 */
export function getInvestmentAnalystSuggestion(riskTolerance: number): string {
  if (riskTolerance >= 4) {
    return "High Risk Strategy: We strongly suggest broad JSE exposure via index trackers like Satrix 40 or Sygnia Itrix ETFs, to maximize long-term aggressive growth in the current South African market.";
  }
  if (riskTolerance <= 2) {
    return "Conservative Strategy: Prioritize wealth preservation. Given current repo rates, High-Yield savings accounts like TymeBank GoalSave or secure Fixed Deposits are recommended.";
  }
  return "Balanced Strategy: A mix of stable fixed-income instruments and moderate equity exposure (e.g., a balanced unit trust or ETF blend) fits your profile perfectly.";
}
