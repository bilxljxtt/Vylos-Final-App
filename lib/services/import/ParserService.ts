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
            // Find columns by common names (case insensitive)
            const dateStr = row.Date || row.date || row.PostingDate || row.Timestamp || "";
            const merchantStr = row.Merchant || row.merchant || row.Description || row.description || row.Payee || "";
            const amountStr = row.Amount || row.amount || row.Value || row.TransactionAmount || "0";
            
            return {
              date: this.standardizeDate(dateStr),
              merchant: merchantStr,
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
       const dateStr = row.Date || row.date || row.PostingDate || "";
       const merchantStr = row.Merchant || row.merchant || row.Description || row.Payee || "";
       const amountStr = row.Amount || row.amount || "0";
       
       return {
         date: this.standardizeDate(dateStr),
         merchant: merchantStr,
         amount: parseFloat(amountStr.toString().replace(/[^\d.-]/g, "")),
         originalDescription: merchantStr
       };
    }).filter(tx => !isNaN(tx.amount) && tx.date);
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

    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    } catch (e) {
      // Logic for DD/MM/YYYY or MM/DD/YYYY can be added if native fails
    }
    return "";
  }
}
