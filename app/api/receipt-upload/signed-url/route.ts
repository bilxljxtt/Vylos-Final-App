import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 });
    }

    // 1. Verify ownership of the file path in the receipts table
    const { data: receipt, error: receiptError } = await supabase
      .from("receipts")
      .select("id")
      .eq("file_path", filePath)
      .eq("user_id", user.id)
      .single();

    if (receiptError || !receipt) {
      return NextResponse.json({ error: "Access Denied: You do not own this receipt." }, { status: 403 });
    }

    // 2. Generate a secure, temporary signed URL valid for 5 minutes (300 seconds)
    const { data, error: signedError } = await supabase
      .storage
      .from("receipts")
      .createSignedUrl(filePath, 300);

    if (signedError || !data) {
      console.error("Failed to create signed URL:", signedError);
      return NextResponse.json({ error: "Failed to create secure access link for this file." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl
    });

  } catch (error: any) {
    console.error("Signed URL API Error:", error);
    return NextResponse.json({ error: "Failed to generate secure URL due to an unexpected internal error." }, { status: 500 });
  }
}
