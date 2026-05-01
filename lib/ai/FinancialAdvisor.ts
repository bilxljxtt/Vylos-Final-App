import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppState, Transaction, Goal, BudgetCategory, formatMoney } from "../store";
import { safeJsonParse } from "../utils";
import { VylosEngine } from "../vylosEngine";

export interface AIRecommendation {
  type: 'spending' | 'savings' | 'budget' | 'goal';
  title: string;
  message: string;
  actionableStep?: string;
  impactScore: number; // 1-10
}

export class FinancialAdvisor {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * REFACTORED: Now uses VylosEngine for deterministic stats, Gemini for text generation only.
   */
  async getHealthOverview(state: AppState): Promise<{ summary: string; recommendations: AIRecommendation[] }> {
    if (!process.env.GOOGLE_AI_API_KEY) {
       return { 
         summary: "Vylos Intelligence is active, but AI summaries are offline. Check your .env file.", 
         recommendations: [] 
       };
    }

    const engineOutput = VylosEngine.run(state);
    
    // Provide DETERMINISTIC stats to Gemini to ensure it DOES NOT perform calculations
    const prompt = `
      You are Vylos AI Advisor. I will provide you with DETERMINISTIC financial metrics calculated by our engine.
      Your task is to explain these metrics to the user in a friendly, professional tone.
      DO NOT PERFORM ANY CALCULATIONS. Use the provided numbers as truth.

      Financial Metrics:
      - Health Score: ${engineOutput.healthScore}/100 (${engineOutput.healthCategory})
      - Monthly Budget: ${formatMoney(engineOutput.monthlyBudget, state.userProfile.country)}
      - Daily Spending Limit: ${formatMoney(engineOutput.dailySpendingLimit, state.userProfile.country)}
      - Survival Runway: ${engineOutput.burnRateMonths} months (${engineOutput.burnRateCategory})
      - Goal Status: ${engineOutput.goalFeasibilityStatus}
      - Engine Insight: ${engineOutput.insightSummary}

      User Profile:
      - Monthly Income: ${formatMoney(state.userProfile.monthlyIncome || 0, state.userProfile.country)}
      - Risk Tolerance: ${state.userProfile.riskTolerance}/100

      Return your response as a VALID JSON object:
      {
        "summary": "2-3 sentence human-readable summary of their situation based on the metrics.",
        "recommendations": [
          { "type": "spending", "title": "...", "message": "...", "actionableStep": "...", "impactScore": 8 }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse(text, { summary: engineOutput.insightSummary, recommendations: [] });
    } catch (err) {
      console.error("AI Advisor Error:", err);
      return { 
        summary: engineOutput.insightSummary, 
        recommendations: [] 
      };
    }
  }

  /**
   * REFACTORED: Uses VylosEngine for goal validation.
   */
  async validateGoal(state: AppState, goal: { title: string; targetAmount: number }) {
    const engineRes = VylosEngine.computeGoalFeasibility({ ...state, goals: [{ title: goal.title, targetAmount: goal.targetAmount, currentAmount: 0, id: 'temp', createdAt: new Date().toISOString(), deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), status: 'On Track', category: 'Savings', notes: '', icon: '🎯', color: '#00D8A5' }] });
    
    return {
      isRealistic: engineRes.score >= 1.0,
      suggestedTimelineMonths: 12,
      monthlyContribution: goal.targetAmount / 12,
      analysis: engineRes.recommendation
    };
  }

  /**
   * General analysis endpoint used by the API
   */
  async analyze(mode: string, data: any): Promise<any> {
    switch (mode) {
      case "health":
        return this.getHealthOverview(data as AppState);
      case "goal":
        return this.validateGoal(data.state as AppState, data.goal);
      default:
        return { error: "Unknown mode" };
    }
  }

  /**
   * Chat interaction
   */
  async chat(message: string, history: any[]): Promise<string> {
    const chat = this.model.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  }
}
