import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate User
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = session.access_token;
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prefer server-only env var, fallback to NEXT_PUBLIC_ if needed
    const apiUrl = process.env.VYLOS_AI_API_URL || process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
    if (!apiUrl) {
      console.error("[API Proxy] VYLOS_AI_API_URL is not configured");
      return NextResponse.json({ error: "PDF statement service is not configured" }, { status: 500 });
    }

    // 2. Fetch statement from backend server
    const targetUrl = `${apiUrl}/bot/download-statement/${userId}`;
    console.log(`[API Proxy] Fetching statement for user from backend`);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`[API Proxy] Backend download statement failed with status: ${response.status}`);
      return NextResponse.json(
        { error: "PDF statement is currently unavailable. Please try again later." },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    // 3. Return the PDF response as stream
    const pdfBlob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="vylos-statement.pdf"`);

    return new NextResponse(pdfBlob, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error("[API Proxy] Download statement error:", err?.message);
    return NextResponse.json(
      { error: "PDF statement is currently unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
