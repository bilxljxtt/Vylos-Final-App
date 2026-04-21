import { TransactionCategory } from "../../store";
import { AIService } from "./AIService";

export interface CategorizedMerchant {
  category: TransactionCategory;
  confidence: number; // 0 to 1
}

const CATEGORY_KEYWORDS: Record<string, TransactionCategory> = {
  // Groceries
  "woolworths": "Groceries",
  "checkers": "Groceries",
  "pick n pay": "Groceries",
  "spar": "Groceries",
  "shoprite": "Groceries",
  "food": "Groceries",
  "market": "Groceries",
  
  // Dining Out
  "mcdonalds": "Dining Out",
  "kfc": "Dining Out",
  "starbucks": "Dining Out",
  "ubereats": "Dining Out",
  "mr d": "Dining Out",
  "restaurant": "Dining Out",
  "cafe": "Dining Out",
  "coffee": "Dining Out",
  "pizza": "Dining Out",
  "burger": "Dining Out",
  
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
  
  // Subscriptions
  "netflix": "Subscriptions",
  "spotify": "Subscriptions",
  "youtube": "Subscriptions",
  "showmax": "Subscriptions",
  "icloud": "Subscriptions",
  "google storage": "Subscriptions",
  "microsoft": "Subscriptions",
  "prime": "Subscriptions",
  
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
  
  // Housing
  "rent": "Housing",
  "levy": "Housing",
  "property": "Housing",
  "builders": "Housing",
  "leroy merlin": "Housing",
  
  // Side Hustle (Income usually)
  "salary": "Side Hustle",
  "fiverr": "Side Hustle",
  "upwork": "Side Hustle",
  "stripe": "Side Hustle",
  "payment": "Side Hustle",
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
    if (amount > 0) return { category: "Side Hustle", confidence: 0.3 };
    
    return { category: "Other", confidence: 0.1 };
  }

  /**
   * AI-powered categorization fallback
   */
  static async categorizeWithAI(merchant: string, amount: number): Promise<CategorizedMerchant> {
    const prompt = `
      Categorize this transaction merchant and amount into one of these categories:
      "Utilities", "Emergency Fund", "Side Hustle", "Dining Out", "Subscriptions", "Groceries", "Transport", "Shopping", "Entertainment", "Housing", "Bills", "Other".
      
      Merchant: ${merchant}
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
