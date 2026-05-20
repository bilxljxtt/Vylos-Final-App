import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ExtractedTransaction {
  date: string;
  merchant: string;
  amount: number;
  category?: string;
  originalDescription?: string;
}

export interface RawParsedData {
  headers: string[];
  rows: any[];
}

type ImportRow = Record<string, unknown>;

export class ParserService {
  /**
   * Get Raw Data for Mapping
   */
  static async getRawData(file: File): Promise<RawParsedData> {
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    
    if (isExcel) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length === 0) return { headers: [], rows: [] };
      
      const headers = data[0].map(h => String(h || ""));
      const rows = data.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      
      return { headers, rows };
    } else {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve({
              headers: results.meta.fields || [],
              rows: results.data
            });
          },
          error: (err) => reject(err)
        });
      });
    }
  }

  /**
   * Parse Raw Data with Mappings
   */
  static async parseWithMapping(rows: any[], mapping: { date: string; merchant: string; amount: string; category?: string; debit?: string; credit?: string }): Promise<ExtractedTransaction[]> {
    return rows.map(row => {
      const dateVal = row[mapping.date];
      const merchantVal = row[mapping.merchant];
      const catVal = mapping.category ? row[mapping.category] : undefined;
      
      let amount = 0;
      if (mapping.debit && mapping.credit) {
        const d = this.parseAmount(row[mapping.debit]);
        const c = this.parseAmount(row[mapping.credit]);
        if (!isNaN(d) && d !== 0) amount = -Math.abs(d);
        else if (!isNaN(c) && c !== 0) amount = Math.abs(c);
      } else {
        amount = this.parseAmount(row[mapping.amount]);
      }

      return {
        date: this.standardizeDate(dateVal),
        merchant: String(merchantVal || "Unknown"),
        amount: amount,
        category: catVal ? String(catVal) : undefined,
        originalDescription: String(merchantVal || "")
      };
    }).filter(tx => !isNaN(tx.amount) && tx.date);
  }
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
            const dateStr = this.findValue(row, ["date", "posting", "timestamp", "time", "day", "trans", "effective", "valuta"]);
            const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail", "vendor", "narrative", "memo", "info", "beneficiary", "reference"]);
            const categoryStr = this.findValue(row, ["category", "type", "tag", "label", "classification"]);
            
            // Amount can be in one column or split (debit/credit)
            let amount = 0;
            const debit = this.findValue(row, ["debit", "out", "expense", "withdrawal", "paid out", "payment", "spend"]);
            const credit = this.findValue(row, ["credit", "in", "income", "deposit", "paid in", "receipt"]);
            const genericAmount = this.findValue(row, ["amount", "value", "total", "price", "sum", "movement", "balance movement", "zar", "rand", "zar amount"]);

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
       const dateStr = this.findValue(row, ["date", "posting", "timestamp", "trans", "effective"]);
       const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail", "vendor", "narrative", "reference"]);
       const categoryStr = this.findValue(row, ["category", "type", "tag"]);
       
       let amount = 0;
       const debit = this.findValue(row, ["debit", "out", "expense", "withdrawal"]);
       const credit = this.findValue(row, ["credit", "in", "income", "deposit"]);
       const genericAmount = this.findValue(row, ["amount", "value", "total", "sum"]);

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
      const parts = dateStr.split(sep).map(p => p.trim());
      if (parts.length === 3) {
        let y, m, d_val;
        
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          y = Number(parts[0]);
          m = Number(parts[1]) - 1;
          d_val = Number(parts[2]);
        } else {
          // Could be DD-MM-YYYY or MM-DD-YYYY
          const p0 = Number(parts[0]);
          const p1 = Number(parts[1]);
          const p2 = Number(parts[2]);
          
          if (p1 > 12) {
            // Must be MM-DD-YYYY
            y = p2;
            m = p0 - 1;
            d_val = p1;
          } else {
            // Default to DD-MM-YYYY (International/SA standard)
            y = p2;
            m = p1 - 1;
            d_val = p0;
          }
        }
        
        const dateObj = new Date(y, m, d_val);
        if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() === y && dateObj.getMonth() === m) {
          return this.formatDate(dateObj);
        }
      }
    }

    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return this.formatDate(d);
    } catch {}
    
    return "";
  }
}
