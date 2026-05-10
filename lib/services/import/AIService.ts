import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedTransaction } from "./ParserService";
import { safeJsonParse } from "@/lib/utils";

export class AIService {
  private static getAPIKey() {
    // Strictly server-side
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  }

  private static getModelName() {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  }

  private static getFallbackModelName() {
    return process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
  }

  /**
   * Helper for simple prompt/response using the configured model
   */
  static async getSimpleAIResponse(prompt: string): Promise<string> {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
      // Try primary model (Flash-Lite)
      const model = genAI.getGenerativeModel({ 
        model: this.getModelName(),
        generationConfig: { maxOutputTokens: 500 } // Cost protection
      });
      const result = await model.generateContent(prompt);
      return (await result.response).text().trim();
    } catch (err) {
      console.error(`Primary AI Model (${this.getModelName()}) failed:`, err);
      
      try {
        // Try fallback model
        const fallbackModel = genAI.getGenerativeModel({ 
          model: this.getFallbackModelName(),
          generationConfig: { maxOutputTokens: 500 }
        });
        const result = await fallbackModel.generateContent(prompt);
        return (await result.response).text().trim();
      } catch (fallbackErr) {
        console.error(`Fallback AI Model (${this.getFallbackModelName()}) failed:`, fallbackErr);
        throw new Error("AI Advisor is temporarily unavailable. Please try again later.");
      }
    }
  }

  /**
   * Extract transactions from raw text (legacy support)
   */
  static async extractFromText(text: string): Promise<ExtractedTransaction[]> {
    const apiKey = this.getAPIKey();
    if (!apiKey) return [];

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract transaction data from the text. Return VALID JSON array. keys: date (YYYY-MM-DD), merchant, amount.\n\nText:\n${text.substring(0, 8000)}`;

    try {
      const result = await model.generateContent(prompt);
      const jsonText = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse<ExtractedTransaction[]>(jsonText, []);
    } catch (err) {
      console.error("AI Extraction Error:", err);
      return [];
    }
  }
}
