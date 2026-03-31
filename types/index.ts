/**
 * Global and shared types for the Vylos Application.
 */

// Re-export budget engine types for convenience
export * from './budget-engine';

/**
 * AI Advisor Tone constraints.
 * 
 * STRICT: Provides direct, unyielding financial advice (e.g., cut spending immediately).
 * SUGGESTIVE: Offers softer, guiding recommendations (e.g., consider reducing discretionary spending).
 */
export type AIAvisorTone = 'STRICT' | 'SUGGESTIVE';

export interface VylosGlobalConfig {
  defaultTone: AIAvisorTone;
  // future global settings can go here
}
