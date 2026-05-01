import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ExtractedTransaction {
  date: string;
  merchant: string;
  amount: number;
  category?: string;
  originalDescription?: string;
}

type ImportRow = Record<string, unknown>;

export class ParserService {
  /**
   * Parse CSV File
   */
  static async parseCSV(file: File): Promise<ExtractedTransaction[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const txs: ExtractedTransaction[] = (results.data as ImportRow[]).map((row) => {
            const dateStr = this.findValue(row, ["date", "posting", "timestamp", "time", "day", "trans"]);
            const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail", "vendor", "narrative", "memo", "info"]);
            const categoryStr = this.findValue(row, ["category", "type"]);
            
            // Amount can be in one column or split (debit/credit)
            let amount = 0;
            const debit = this.findValue(row, ["debit", "out", "expense", "withdrawal"]);
            const credit = this.findValue(row, ["credit", "in", "income", "deposit"]);
            const genericAmount = this.findValue(row, ["amount", "value", "total", "price", "sum"]);

            if (debit) amount = -Math.abs(this.parseAmount(debit));
            else if (credit) amount = Math.abs(this.parseAmount(credit));
            else amount = this.parseAmount(genericAmount);
            
            return {
              date: this.standardizeDate(dateStr),
              merchant: merchantStr || "Unknown Merchant",
              amount: amount,
              category: categoryStr || undefined,
              originalDescription: merchantStr
            };
          }).filter(tx => !isNaN(tx.amount) && tx.date);
          
          resolve(txs);
        },
        error: (err) => reject(err)
      });
    });
  }

  static async parseExcel(buffer: ArrayBuffer): Promise<ExtractedTransaction[]> {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return (data as ImportRow[]).map((row) => {
       const dateStr = this.findValue(row, ["date", "posting", "timestamp", "trans"]);
       const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail", "vendor"]);
       const categoryStr = this.findValue(row, ["category", "type"]);
       
       let amount = 0;
       const debit = this.findValue(row, ["debit", "out", "expense"]);
       const credit = this.findValue(row, ["credit", "in", "income"]);
       const genericAmount = this.findValue(row, ["amount", "value", "total"]);

       if (debit) amount = -Math.abs(this.parseAmount(debit));
       else if (credit) amount = Math.abs(this.parseAmount(credit));
       else amount = this.parseAmount(genericAmount);
       
       return {
         date: this.standardizeDate(dateStr),
         merchant: merchantStr || "Unknown Merchant",
         amount: amount,
         category: categoryStr || undefined,
         originalDescription: merchantStr
       };
    }).filter(tx => !isNaN(tx.amount) && tx.date);
  }

  private static findValue(row: ImportRow, searchKeys: string[]): string {
    const rowKeys = Object.keys(row);
    for (const sKey of searchKeys) {
      const match = rowKeys.find(rKey => {
        const normalized = rKey.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalized === sKey.toLowerCase() || normalized.includes(sKey.toLowerCase());
      });
      if (match !== undefined && row[match] !== null && row[match] !== "") return String(row[match]);
    }
    return "";
  }

  private static parseAmount(value: unknown): number {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;

    const raw = String(value).trim();
    const isParenthesizedNegative = /^\(.*\)$/.test(raw);
    const cleaned = raw.replace(/[(),\s]/g, "").replace(/[^\d.-]/g, "");
    const parsed = Number.parseFloat(cleaned);
    if (Number.isNaN(parsed)) return Number.NaN;
    return isParenthesizedNegative ? -Math.abs(parsed) : parsed;
  }

  private static formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private static standardizeDate(dateVal: unknown): string {
    if (!dateVal) return "";

    // If it's already a Date object (from XLSX cellDates: true)
    if (dateVal instanceof Date) {
      return this.formatDate(dateVal);
    }

    if (typeof dateVal === "number") {
       // Handle Excel serial date manually if cellDates was false
       const date = new Date((dateVal - 25569) * 86400 * 1000);
       return this.formatDate(date);
    }

    const dateStr = String(dateVal).trim();
    if (!dateStr) return "";

    // Try common separators
    const separators = ["-", "/", ".", " "];
    for (const sep of separators) {
      const parts = dateStr.split(sep);
      if (parts.length === 3) {
        // Try DD-MM-YYYY or YYYY-MM-DD
        let d: Date;
        if (parts[0].length === 4) d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        else d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        
        if (!isNaN(d.getTime())) return this.formatDate(d);
      }
    }

    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return this.formatDate(d);
    } catch {}
    
    return "";
  }
}
