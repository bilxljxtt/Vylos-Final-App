import { TransactionCategory } from "../../store";
import { ParserService, ExtractedTransaction } from "./ParserService";
import { CategorizationEngine, normalizeTransactionCategory } from "../CategorizationEngine";

export interface ImportSummary {
  total: number;
  income: number;
  expense: number;
  categorized: number;
  duplicates: number;
}

export interface ImportPreviewTransaction {
  id: string;
  date: string;
  desc: string;
  merchant: string;
  amount: number;
  cat: TransactionCategory;
  category: TransactionCategory;
  confidence: number;
  isDuplicate: boolean;
  _preview: true;
}

export class ImportService {
  static autocat(desc: string, type: "income" | "expense" = "expense"): TransactionCategory {
    return CategorizationEngine.categorize(desc, type, []);
  }

  static async processFile(file: File): Promise<ImportPreviewTransaction[]> {
    let extracted: ExtractedTransaction[] = [];
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    
    if (isExcel) {
      const buffer = await file.arrayBuffer();
      extracted = await ParserService.parseExcel(buffer);
    } else {
      extracted = await ParserService.parseCSV(file);
    }

    return extracted.map(tx => {
      const type = tx.amount > 0 ? "income" : "expense";
      const inferredCat = tx.category ? normalizeTransactionCategory(tx.category) : this.autocat(tx.merchant || "", type);
      const cat = inferredCat;
      let amt = tx.amount;
      
      // Smart type detection
      if (cat === "Salary" || cat === "Business Income" || cat === "Other Income" || cat === "Refund") {
        amt = Math.abs(amt);
      } else if (amt > 0) {
        // If it's a positive amount but not income, it might be a refund or just bad data
        // But usually in bank statements, expenses are negative or in a 'debit' column.
        // We'll keep it positive if the parser found it positive, unless we're sure it's an expense.
        // For now, follow the existing logic: non-income should be negative.
        amt = -amt;
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        date: tx.date,
        desc: tx.merchant,
        merchant: tx.merchant,
        amount: amt,
        cat: cat,
        category: cat,
        confidence: cat === "Other" ? 0.1 : 0.85,
        isDuplicate: false,
        _preview: true
      };
    });
  }

  static getSummary(txs: ImportPreviewTransaction[]): ImportSummary {
    return {
      total: txs.length,
      income: txs.filter(t => t.amount > 0).length,
      expense: txs.filter(t => t.amount < 0).length,
      categorized: txs.filter(t => t.cat !== "Other").length,
      duplicates: 0, // Placeholder for duplicate detection logic if added later
    };
  }
}
