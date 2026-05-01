import { TransactionCategory, TRANSACTION_CATEGORIES } from "../store";

export interface MerchantRule {
  id?: string;
  user_id?: string;
  merchant_keyword: string;
  category: TransactionCategory;
}

const DEFAULT_MERCHANT_RULES: Record<TransactionCategory, string[]> = {
  "Groceries": [
    "checkers", "shoprite", "pick n pay", "pnp", "woolworths food", 
    "spar", "boxer", "food lovers", "makro groceries", "supermarket", "grocery"
  ],
  "Eating Out": [
    "mcdonalds", "kfc", "nandos", "steers", "debonairs", "roman's pizza", 
    "uber eats", "mr d", "restaurant", "cafe", "takeout", "coffee", "starbucks", "pizza", "burger"
  ],
  "Transport": [
    "shell", "bp", "engen", "totalenergies", "sasol", "uber", "bolt", 
    "petrol", "fuel", "gautrain", "caltex", "taxi"
  ],
  "Bills": [
    "electricity", "water", "rates", "municipal", "fibre", "wifi", 
    "telkom", "vodacom", "mtn", "rain", "insurance", "discovery", "momentum", "sanlam", "old mutual"
  ],
  "Subscriptions": [
    "netflix", "spotify", "apple", "google", "youtube", "microsoft", "adobe", "showmax", "icloud", "disney", "dstv"
  ],
  "Shopping": [
    "takealot", "amazon", "pep", "mr price", "clicks", "dischem", 
    "game", "clothing", "fashion", "zara", "h&m", "nike", "adidas", "shein", "superbalist"
  ],
  "Health": [
    "pharmacy", "doctor", "clinic", "medical", "hospital", 
    "dischem pharmacy", "clicks pharmacy", "dentist"
  ],
  "Education": [
    "school", "university", "college", "course", "tuition", "books"
  ],
  "Debt Payments": [
    "loan", "credit card", "repayment", "finance", "installment"
  ],
  "Savings": [
    "savings", "investment", "transfer to savings"
  ],
  "Salary": [
    "salary", "payroll", "wages", "payment received", "income"
  ],
  "Rent / Housing": ["rent", "levy", "bond", "mortgage", "property"],
  "Business Income": [],
  "Refund": [],
  "Other Income": [],
  "Entertainment": ["ster kinekor", "nu metro", "steam", "playstation", "xbox", "gaming", "ticket"],
  "Other": []
};

export function normalizeTransactionCategory(value?: string | null): TransactionCategory {
  const normalized = (value || "").trim().toLowerCase();
  
  // Direct match check
  const direct = TRANSACTION_CATEGORIES.find((cat) => cat.toLowerCase() === normalized);
  if (direct) return direct;

  // Manual mappings for legacy or external categories
  if (["food & dining", "food", "dining"].includes(normalized)) return "Eating Out";
  if (["groceries", "grocery"].includes(normalized)) return "Groceries";
  if (["transportation", "fuel", "petrol"].includes(normalized)) return "Transport";
  if (["utilities", "utility", "housing"].includes(normalized)) return "Bills";
  if (["medical", "healthcare", "pharmacy"].includes(normalized)) return "Health";
  if (["salary", "deposit", "credit", "income"].includes(normalized)) return "Salary";
  if (["rent", "mortgage", "bond"].includes(normalized)) return "Rent / Housing";

  return "Other";
}

export class CategorizationEngine {
  /**
   * Categorizes a transaction based on description and type.
   * Priority:
   * 1. User merchant rule match
   * 2. Default merchant keyword rule match
   * 3. Type fallback (income -> Salary, expense -> Other)
   */
  static categorize(
    description: string, 
    type: "income" | "expense", 
    userRules: MerchantRule[] = []
  ): TransactionCategory {
    if (!description) return type === "income" ? "Other Income" : "Other";

    const normalizedDesc = description.toLowerCase().trim();

    // 1. User rules (Priority 1)
    for (const rule of userRules) {
      if (normalizedDesc.includes(rule.merchant_keyword.toLowerCase())) {
        return rule.category;
      }
    }

    // 2. Default rules (Priority 2)
    for (const [category, keywords] of Object.entries(DEFAULT_MERCHANT_RULES)) {
      for (const keyword of keywords) {
        if (normalizedDesc.includes(keyword)) {
          return category as TransactionCategory;
        }
      }
    }

    // 3. Type fallback (Priority 3)
    return type === "income" ? "Salary" : "Other";
  }
}
