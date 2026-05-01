import { TransactionCategory } from "../../store";
import { AIService } from "./AIService";
import { sanitizeString } from "@/lib/utils";

export interface CategorizedMerchant {
  category: TransactionCategory;
  confidence: number; // 0 to 1
}

const CATEGORY_KEYWORDS: Record<string, TransactionCategory> = {
  // Food & Dining
  "woolworths": "Food & Dining",
  "checkers": "Food & Dining",
  "pick n pay": "Food & Dining",
  "spar": "Food & Dining",
  "shoprite": "Food & Dining",
  "food": "Food & Dining",
  "market": "Food & Dining",
  "mcdonalds": "Food & Dining",
  "kfc": "Food & Dining",
  "starbucks": "Food & Dining",
  "ubereats": "Food & Dining",
  "mr d": "Food & Dining",
  "restaurant": "Food & Dining",
  "cafe": "Food & Dining",
  "coffee": "Food & Dining",
  "pizza": "Food & Dining",
  "burger": "Food & Dining",
  
  // Transport
  "uber": "Transport",
  "bolt": "Transport",
  "shell": "Transport",
  "sasol": "Transport",
  "engen": "Transport",
  "fuel": "Transport",
  "petrol": "Transport",
  "caltex": "Transport",
  "total": "Transport",
  
  // Entertainment (includes subscriptions)
  "netflix": "Entertainment",
  "spotify": "Entertainment",
  "youtube": "Entertainment",
  "showmax": "Entertainment",
  "icloud": "Entertainment",
  "google storage": "Entertainment",
  "microsoft": "Entertainment",
  "prime": "Entertainment",
  
  // Utilities & Bills
  "eskom": "Bills",
  "telkom": "Bills",
  "municipality": "Bills",
  "water": "Bills",
  "electricity": "Bills",
  "insurance": "Bills",
  "sanlam": "Bills",
  "old mutual": "Bills",
  "discovery": "Bills",
  "liberty": "Bills",
  
  // Shopping
  "takealot": "Shopping",
  "amazon": "Shopping",
  "shein": "Shopping",
  "zara": "Shopping",
  "h&m": "Shopping",
  "cotton on": "Shopping",
  "nike": "Shopping",
  "adidas": "Shopping",
  "superbalist": "Shopping",
  
  // Entertainment
  "ster kinekor": "Entertainment",
  "nu metro": "Entertainment",
  "steam": "Entertainment",
  "playstation": "Entertainment",
  "xbox": "Entertainment",
  "gaming": "Entertainment",
  "ticket": "Entertainment",
  
  // Bills (includes housing)
  "rent": "Bills",
  "levy": "Bills",
  "property": "Bills",
  "builders": "Bills",
  "leroy merlin": "Bills",
  
  // Income
  "salary": "Income",
  "fiverr": "Income",
  "upwork": "Income",
  "stripe": "Income",
  "payment": "Income",
};

export class CategorizationEngine {
  /**
   * Determine the best category for a merchant based on keywords
   */
  static categorize(merchant: string, amount: number): CategorizedMerchant {
    const lowerMerchant = merchant.toLowerCase();
    
    // Check for exact and partial matches
    for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lowerMerchant.includes(keyword)) {
        return { category, confidence: 0.85 };
      }
    }
    
    // Fallback logic by amount/type
    if (amount > 0) return { category: "Income", confidence: 0.3 };
    
    return { category: "Other", confidence: 0.1 };
  }

  /**
   * AI-powered categorization fallback
   */
  static async categorizeWithAI(merchant: string, amount: number): Promise<CategorizedMerchant> {
    const safeMerchant = sanitizeString(merchant);
    const prompt = `
      Categorize this transaction merchant and amount into one of these categories:
      "Food & Dining", "Transport", "Bills", "Shopping", "Income", "Entertainment", "Health", "Other".
      
      Merchant: ${safeMerchant}
      Amount: ${amount}
      
      Return ONLY the category name.
    `;
    
    try {
       const category = await AIService.getSimpleAIResponse(prompt);
       return { category: category as TransactionCategory, confidence: 0.9 };
    } catch {
       return this.categorize(merchant, amount);
    }
  }

  /**
   * Merge with user-specific rules (learned behavior)
   */
  static async categorizeWithRules(
    merchant: string, 
    amount: number, 
    userRules: { merchant_pattern: string; category: string }[]
  ): Promise<CategorizedMerchant> {
    const lowerMerchant = merchant.toLowerCase();

    // 1. Check user rules first (Highest Priority)
    for (const rule of userRules) {
      if (lowerMerchant.includes(rule.merchant_pattern.toLowerCase())) {
        return { category: rule.category as TransactionCategory, confidence: 1.0 };
      }
    }

    // 2. Default to general categories
    return this.categorize(merchant, amount);
  }
}
