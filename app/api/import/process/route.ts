import { NextRequest, NextResponse } from "next/server";
import { ParserService, ExtractedTransaction } from "@/lib/services/import/ParserService";
import { AIService } from "@/lib/services/import/AIService";
import { CategorizationEngine } from "@/lib/services/import/CategorizationEngine";
import { createClient } from "@/utils/supabase/client"; // Note: This might need server-side auth check

// Note: Using a dynamic dynamic import for pdf-parse if needed, or assuming text extraction is passed
// For this implementation, we will expect the client to handle raw file reading for PDF/Word to text 
// or implement server-side extraction if environment allows.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let extracted: ExtractedTransaction[] = [];
    const extension = file.name.split(".").pop()?.toLowerCase();

    // 1. Extract Raw Transactions
    if (extension === "csv") {
      extracted = await ParserService.parseCSV(file);
    } else if (extension === "xlsx" || extension === "xls") {
      const buffer = await file.arrayBuffer();
      extracted = await ParserService.parseExcel(buffer);
    } else if (extension === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfModule = await import("pdf-parse");
      const pdfParse = (pdfModule as any).default || pdfModule;
      const pdfData = await pdfParse(buffer);
      extracted = await AIService.extractFromText(pdfData.text);
    } else {
      // DOCX, TXT -> AI Extraction
      const text = await file.text();
      extracted = await AIService.extractFromText(text);
    }

    if (extracted.length === 0) {
      return NextResponse.json({ error: "No transactions found in file" }, { status: 422 });
    }

    // 2. Add Smart Categorization & Confidence
    const supabase = createClient();
    
    // Fetch user rules and recent transactions for duplicate detection
    const [{ data: userRules }, { data: recentTxs }] = await Promise.all([
      supabase.from("merchant_category_rules").select("*").eq("user_id", userId),
      supabase.from("transactions").select("title, amount, date").eq("user_id", userId).order('date', { ascending: false }).limit(200)
    ]);

    const processed = await Promise.all(extracted.map(async (tx) => {
      const { category, confidence } = await CategorizationEngine.categorizeWithRules(
        tx.merchant, 
        tx.amount, 
        userRules || []
      );

      // Simple duplicate detection: exact amount and date, fuzzy merchant
      const isDuplicate = recentTxs?.some(rt => 
        rt.amount === tx.amount && 
        rt.date === tx.date && 
        (rt.title.toLowerCase().includes(tx.merchant.toLowerCase()) || tx.merchant.toLowerCase().includes(rt.title.toLowerCase()))
      );
      
      return {
        ...tx,
        category,
        confidence,
        id: Math.random().toString(36).substring(2, 11),
        isDuplicate: !!isDuplicate,
      };
    }));

    return NextResponse.json({ 
      transactions: processed,
      summary: {
        count: processed.length,
        avg_confidence: processed.reduce((a, b) => a + b.confidence, 0) / processed.length
      }
    });

  } catch (err: any) {
    console.error("Import Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
