import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ExtractedTransaction {
  date: string;
  merchant: string;
  amount: number;
  originalDescription?: string;
}

export class ParserService {
  /**
   * Parse CSV File
   */
  static async parseCSV(file: File): Promise<ExtractedTransaction[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const txs: ExtractedTransaction[] = results.data.map((row: any) => {
            const dateStr = this.findValue(row, ["date", "posting", "timestamp", "time"]);
            const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail", "vendor"]);
            const amountStr = this.findValue(row, ["amount", "value", "total", "price", "debit", "credit"]) || "0";
            
            return {
              date: this.standardizeDate(dateStr),
              merchant: merchantStr || "Unknown Merchant",
              amount: parseFloat(amountStr.toString().replace(/[^\d.-]/g, "")),
              originalDescription: merchantStr
            };
          }).filter(tx => !isNaN(tx.amount) && tx.date);
          
          resolve(txs);
        },
        error: (err) => reject(err)
      });
    });
  }

  /**
   * Parse Excel File (.xlsx, .xls)
   */
  static async parseExcel(buffer: ArrayBuffer): Promise<ExtractedTransaction[]> {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data.map((row: any) => {
       const dateStr = this.findValue(row, ["date", "posting", "timestamp"]);
       const merchantStr = this.findValue(row, ["merchant", "description", "payee", "detail"]);
       const amountStr = this.findValue(row, ["amount", "value", "debit"]) || "0";
       
       return {
         date: this.standardizeDate(dateStr),
         merchant: merchantStr || "Unknown Merchant",
         amount: parseFloat(amountStr.toString().replace(/[^\d.-]/g, "")),
         originalDescription: merchantStr
       };
    }).filter(tx => !isNaN(tx.amount) && tx.date);
  }

  /**
   * Fuzzy find a value by key patterns
   */
  private static findValue(row: any, searchKeys: string[]): any {
    const rowKeys = Object.keys(row);
    for (const sKey of searchKeys) {
      const match = rowKeys.find(rKey => 
        rKey.toLowerCase().replace(/[^a-z0-9]/g, "").includes(sKey.toLowerCase())
      );
      if (match !== undefined) return row[match];
    }
    return "";
  }

  /**
   * Convert various date formats to ISO YYYY-MM-DD
   */
  private static standardizeDate(dateStr: string | number): string {
    if (typeof dateStr === "number") {
       // Handle Excel serial date
       const date = new Date((dateStr - 25569) * 86400 * 1000);
       return date.toISOString().split("T")[0];
    }

    if (!dateStr) return "";

    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    } catch (e) {}
    
    return "";
  }
}
