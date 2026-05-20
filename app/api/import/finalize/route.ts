import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactions, updateRules } = await req.json();
    
    if (!transactions) {
      return NextResponse.json({ error: "Missing transactions data" }, { status: 400 });
    }

    const userId = user.id; // Discard client-supplied userId completely to prevent parameter spoofing!

    // 1. Prepare batch insert for transactions
    const pgTransactions = transactions.map((tx: any) => ({
      user_id: userId,
      title: tx.merchant,
      amount: tx.amount,
      date: tx.date,
      category: tx.category,
      type: tx.amount < 0 ? "expense" : "income",
    }));

    const { data: inserted, error: txError } = await supabase
      .from("transactions")
      .insert(pgTransactions)
      .select();

    if (txError) throw txError;

    // 2. Synchronize with Budgets Table (Update 'spent' values)
    // Aggregate by category
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx: any) => {
      if (tx.amount < 0) { // Only expenses affect budget spent
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
      }
    });

    for (const [cat, total] of Object.entries(categoryTotals)) {
      // We use a raw increment if possible, or fetch and add
      const { data: currentBudget } = await supabase
        .from("budgets")
        .select("spent")
        .eq("user_id", userId)
        .eq("category", cat)
        .single();

      const newSpent = (currentBudget?.spent || 0) + total;
      
      await supabase
        .from("budgets")
        .upsert({ 
          user_id: userId, 
          category: cat, 
          spent: newSpent,
          type: "limit" // Default type if creating new
        }, { onConflict: "user_id,category" });
    }

    // 3. Update Learning Rules (if requested)
    if (updateRules) {
      // Upsert rules based on the imported categories
      const uniqueMerchants = Array.from(new Set(transactions.map((t: any) => t.merchant.trim().toLowerCase())));
      
      for (const m of uniqueMerchants) {
        const txMatch = transactions.find((t: any) => t.merchant.trim().toLowerCase() === m);
        
        await supabase
          .from("merchant_category_rules")
          .upsert({
            user_id: userId,
            merchant_pattern: m,
            category: txMatch.category,
            confidence_score: 1.0,
            last_used: new Date().toISOString()
          }, { onConflict: "user_id,merchant_pattern" });
      }
    }

    // 3. Log the batch
    await supabase.from("import_batches").insert({
      user_id: userId,
      file_name: "Import",
      total_rows: transactions.length,
      processed_rows: transactions.length,
      status: "completed"
    });

    return NextResponse.json({ 
      success: true, 
      count: inserted?.length || 0 
    });

  } catch (err: any) {
    console.error("Finalize Error:", err);
    return NextResponse.json({ error: "An unexpected error occurred while finalizing and saving the transactions." }, { status: 500 });
  }
}
