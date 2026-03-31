/**
 * TypeScript Interfaces for the Service-Based Architecture.
 * These types establish the contracts between UI components and backend services.
 */

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  income?: number;
  householdSize?: number;
  riskTolerance?: number; // 1-5
  xp: number;
  streak: number;
}

export interface MarketContextContract {
  inflationRate: number;      // e.g. 3.0
  repoRate: number;           // e.g. 6.75
  petrolPrice: number;        // e.g. 20.30
  imminentShocks?: {
    type: 'FUEL_SHOCK' | 'INFLATION_SPIKE' | 'RATE_HIKE';
    magnitude: number;
    effectiveDate: string; // ISO String
    description: string;
  }[];
}

export interface AdvisorRequest {
  user: UserProfile;
  marketContext: MarketContextContract;
  currentDiscretionaryIncome: number;
}

export interface AdvisorIntervention {
  title: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  actionableSteps: string[];
  flags?: string[];
}

export interface AdvisorResponse {
  primaryIntervention: AdvisorIntervention; 
  secondarySuggestions?: AdvisorIntervention[];
  updatedBudgetProjections: {
    necessitiesTarget: number;
    savingsTarget: number;
    discretionaryTarget: number;
  };
}

// System prompt addition for the AI Advisor inside the service layer
export const aiAdvisorSystemInstructions = `
You are the Vylos AI Advisor.
Assess the user's budget against the provided MarketContext.
CRITICAL: If the MarketContext indicates a 'FUEL_SHOCK' (like the upcoming April 1st hike of R3.06), 
your first intervention MUST prioritize adjusting the user's transportation budget to absorb this immediate cost increase.
`;
