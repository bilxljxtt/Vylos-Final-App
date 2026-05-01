import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedTransaction } from "./ParserService";
import { safeJsonParse } from "@/lib/utils";

export class AIService {
  private static genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  private static model = AIService.genAI.getGenerativeModel({ model: "gemini-pro" });

  /**
   * Extract transactions from raw text using Gemini
   */
  static async extractFromText(text: string): Promise<ExtractedTransaction[]> {
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn("GOOGLE_AI_API_KEY not found. AI Extraction skipped.");
      return [];
    }

    const prompt = `
      You are a professional financial data extractor. 
      Extract transaction data from the following bank statement text.
      Return a VALID JSON array of objects with the following keys:
      - date (formatted as YYYY-MM-DD)
      - merchant (the name of the store or payee)
      - amount (numeric value, use negative for expenses/debits and positive for income/credits)
      
      If you cannot determine the year, assume 2026.
      Exclude any balance summaries or internal transfers if possible.
      
      Text to process:
      """
      ${text.substring(0, 10000)} 
      """
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return safeJsonParse<ExtractedTransaction[]>(jsonText, []);
    } catch (err) {
      console.error("AI Extraction Error:", err);
      return [];
    }
  }

  static async extractFromUnstructured(text: string): Promise<ExtractedTransaction[]> {
    return this.extractFromText(text);
  }

  /**
   * Helper for simple prompt/response
   */
  static async getSimpleAIResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Simple AI Error:", err);
      return "Other";
    }
  }
}
