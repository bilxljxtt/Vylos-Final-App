import { MarketContext, PrismaClient } from '@prisma/client';

export type UpdatableMarketData = Partial<Omit<MarketContext, 'id' | 'createdAt' | 'updatedAt'>>;

export interface MarketRateProvider {
  /**
   * Fetches latest market shifts. 
   * @param current The current market context row from the database (to calculate mock adjustments).
   */
  fetchLatestRates(current: MarketContext): Promise<UpdatableMarketData>;
}

/**
 * Mock Provider for MVP testing.
 * Implements random fluctuations (0.1% to 0.2% max change) per week.
 * Resolves the hardcoded April 1st R3.06 petrol hike logic immediately.
 */
export class MockMarketRateService implements MarketRateProvider {
  async fetchLatestRates(current: MarketContext): Promise<UpdatableMarketData> {
    // Generate a shift between -0.2 and 0.2 (ignoring rounding limits for MVP math simplicity)
    const generateShift = () => (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.1);
    
    // Calculate simulated fluctuations
    // Keeping basic SA bounds constraints so it doesn't get totally unrealistic
    const newRepoRate = Math.max(0, current.repoRate + generateShift());
    const newInflation = Math.max(-1, current.inflation + generateShift()); 
    let newPetrolPrice = current.petrolPrice;

    const today = new Date();
    let updatedUpcomingPetrolHike = current.upcomingPetrolHike;
    let updatedHikeEffectiveDate = current.hikeEffectiveDate;

    // Resolve Hardcoded Petrol Shock for April 1, 2026
    if (current.upcomingPetrolHike && current.hikeEffectiveDate) {
      if (today >= current.hikeEffectiveDate) {
        newPetrolPrice += current.upcomingPetrolHike;
        
        // Once applied, clear the imminent shock from the db so it doesn't apply again next cron run
        updatedUpcomingPetrolHike = null;
        updatedHikeEffectiveDate = null;
      }
    }

    return {
      repoRate: parseFloat(newRepoRate.toFixed(2)),
      inflation: parseFloat(newInflation.toFixed(2)),
      petrolPrice: parseFloat(newPetrolPrice.toFixed(2)),
      upcomingPetrolHike: updatedUpcomingPetrolHike,
      hikeEffectiveDate: updatedHikeEffectiveDate,
    };
  }
}

/**
 * Service Layer "Switch" wrapper. 
 * Enables easy swapping of MockMarketRateService for an official SARB / Fuel API provider later.
 */
export class MarketRateService {
  constructor(private provider: MarketRateProvider) {}
  
  async syncRates(currentContext: MarketContext) {
    return this.provider.fetchLatestRates(currentContext);
  }
}

// Export the singleton service instance initialized with the mock.
export const marketRateService = new MarketRateService(new MockMarketRateService());
