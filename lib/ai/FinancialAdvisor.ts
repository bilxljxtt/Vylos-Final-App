import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppState, Transaction, Goal, BudgetCategory, formatMoney } from "../store";
import { safeJsonParse } from "../utils";

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
   * Generic analysis method for various app features
   */
  async analyze(mode: 'budget' | 'progress' | 'personality', data: any): Promise<any> {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY not found.");
    }

    let prompt = "";
    if (mode === 'budget') {
      prompt = `
        As a Vylos Financial Strategist, analyze this budget data:
        ${JSON.stringify(data)}
        Provide:
        1. A high-level strategic evaluation (2 sentences).
        2. One specific "Tactical Reallocation" suggestion.
        3. A "Discipline Score" out of 100.
        
        Return VALID JSON:
        { "evaluation": "...", "suggestion": "...", "score": 85 }
      `;
    } else if (mode === 'progress') {
      prompt = `
        Analyze this user's progress and rank:
        ${JSON.stringify(data)}
        Provide a short, punchy "Operative Directive" (1 sentence) to help them improve their financial efficiency.
        Return VALID JSON:
        { "directive": "..." }
      `;
    } else if (mode === 'personality') {
      prompt = `
        Based on these traits: ${JSON.stringify(data)}, 
        define this user's "Financial Persona" (e.g., The Aggressive Architect, The Cautious Guardian).
        Provide a 1-sentence description.
        Return VALID JSON:
        { "persona": "...", "description": "..." }
      `;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse(text, { evaluation: "Analysis failed", suggestion: "Analysis failed", score: 0 });
    } catch (err) {
      console.error(`AI Analyze (${mode}) Error:`, err);
      return { error: "Analysis failed" };
    }
  }

  /**
   * Generates a comprehensive financial health summary and recommendations
   */
  async getHealthOverview(state: AppState): Promise<{ summary: string; recommendations: AIRecommendation[] }> {
    if (!process.env.GOOGLE_AI_API_KEY) {
       return { 
         summary: "AI services are currently offline. Please provide an API key in .env.local.", 
         recommendations: [] 
       };
    }

    const { transactions, budgets, goals, userProfile } = state;
    const recentTx = transactions.slice(0, 20);
    
    // Prepare a structured prompt
    const prompt = `
      You are Vylos AI, a premium personal financial advisor. 
      Analyze the following user data and provide:
      1. A concise (2-3 sentence) summary of their current financial status.
      2. Exactly 3 distinct, high-impact recommendations for improvement.

      User Profile:
      - Monthly Income: ${formatMoney(userProfile.monthlyIncome || 0, userProfile.country)}
      - Risk Tolerance: ${userProfile.riskTolerance}/100
      - Age: ${userProfile.age}
      
      Budgets:
      ${JSON.stringify(budgets)}

      Goals:
      ${goals.map(g => `${g.title}: ${g.currentAmount}/${g.targetAmount}`).join(", ")}

      Recent Transactions:
      ${recentTx.map(t => `${t.date} | ${t.merchant} | ${t.amount} | ${t.category}`).join("\n")}

      Return your response as a VALID JSON object with the following structure:
      {
        "summary": "...",
        "recommendations": [
          { "type": "spending", "title": "Reduce Eating Out", "message": "You spent 15% more on dining this month.", "actionableStep": "Try meal prepping 2 days a week.", "impactScore": 8 }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse(text, { summary: "Analysis failed", recommendations: [] });
    } catch (err) {
      console.error("AI Advisor Error:", err);
      return { 
        summary: "Unable to generate AI analysis at this time. Our systems are experiencing high traffic.", 
        recommendations: [] 
      };
    }
  }

  /**
   * Validates a goal and suggests a realistic timeline
   */
  async validateGoal(state: AppState, goal: { title: string; targetAmount: number }): Promise<{ 
    isRealistic: boolean; 
    suggestedTimelineMonths: number; 
    monthlyContribution: number;
    analysis: string;
  }> {
    const income = state.userProfile.monthlyIncome || 0;
    const totalExpenses = Object.values(state.budgets).reduce((acc, b) => acc + b.spent, 0);
    const freeCash = income - totalExpenses;
    const target = goal.targetAmount || 0;

    const prompt = `
      As a financial advisor, analyze if this goal is realistic given the surplus cash.
      Target Amount: ${target}
      User's Monthly Surplus Cash: ${freeCash}
      Goal Description: ${goal.title}

      Return JSON:
      {
        "isRealistic": true,
        "suggestedTimelineMonths": 12,
        "monthlyContribution": 2500,
        "analysis": "This goal is very realistic..."
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse(text, { isRealistic: false, suggestedTimelineMonths: 0, monthlyContribution: 0, analysis: "Analysis failed" });
    } catch (err) {
      console.error("AI Goal Validation Error:", err);
      return { isRealistic: true, suggestedTimelineMonths: 12, monthlyContribution: target / 12, analysis: "AI validation failed. Using default linear estimate." };
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
