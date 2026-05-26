import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate User
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = session.access_token;
    const userId = session.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
    if (!apiUrl) {
      return new NextResponse("Vylos AI URL is not configured", { status: 500 });
    }

    // 2. Fetch statement from Railway server (WITHOUT trailing slash at the end of the URL)
    console.log(`[API Proxy] Fetching statement for user ${userId} from ${apiUrl}/bot/download-statement/${userId}`);
    const response = await fetch(`${apiUrl}/bot/download-statement/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`[API Proxy] Railway download statement failed with status: ${response.status}`);
      return new NextResponse("Failed to download statement from backend", { status: response.status });
    }

    // 3. Return the PDF response as stream
    const pdfBlob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="vylos-statement-${userId}.pdf"`);

    return new NextResponse(pdfBlob, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error("[API Proxy] Download statement error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
