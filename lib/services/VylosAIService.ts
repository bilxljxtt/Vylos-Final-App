import { createClient } from "@/utils/supabase/client";

export interface VylosAIResponse {
  answer: string;
  layer?: number;
  source?: string;
  raw_data?: any;
}

export class VylosAIService {
  static async askVylosAI(question: string): Promise<VylosAIResponse> {
    const supabase = createClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error("UNAUTHORIZED");
    }

    const token = session.access_token;
    const userId = session.user?.id;
    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    try {
      const response = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        } else if (response.status === 403) {
          throw new Error("FORBIDDEN");
        } else if (response.status === 429) {
          throw new Error("RATE_LIMITED");
        } else if (response.status >= 500) {
          throw new Error("BACKEND_ERROR");
        } else {
          throw new Error("CONN_FAILED");
        }
      }

      const data = await response.json();
      // Support both old and new response schemas
      const answer = data.answer || data.reply || "";
      const modelSource = data.model_source || data.source;
      const layer = data.layer;
      const rawData = data.raw_data;
      const responseData = data.data;
      return {
        answer,
        layer,
        source: modelSource,
        raw_data: rawData,
        // Preserve any additional data for future use
        ...(responseData ? { data: responseData } : {})
      };
    } catch (err: any) {
      if (["UNAUTHORIZED", "FORBIDDEN", "RATE_LIMITED", "BACKEND_ERROR", "CONN_FAILED"].includes(err.message)) {
        throw err;
      }
      console.error("[VylosAIService] Connection failed:", err);
      throw new Error("CONN_FAILED");
    }
  }

  static async downloadStatement(): Promise<Blob> {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error("UNAUTHORIZED");
    }
    const token = session.access_token;

    try {
      const response = await fetch("/api/ai/download-statement", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        } else if (response.status === 403) {
          throw new Error("FORBIDDEN");
        } else if (response.status === 429) {
          throw new Error("RATE_LIMITED");
        } else if (response.status >= 500) {
          throw new Error("BACKEND_ERROR");
        } else {
          throw new Error("CONN_FAILED");
        }
      }

      return await response.blob();
    } catch (err: any) {
      if (["UNAUTHORIZED", "FORBIDDEN", "RATE_LIMITED", "BACKEND_ERROR", "CONN_FAILED"].includes(err.message)) {
        throw err;
      }
      console.error("[VylosAIService] downloadStatement failed:", err);
      throw new Error("CONN_FAILED");
    }
  }
}
