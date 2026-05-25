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

    const apiUrl = process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
    if (!apiUrl) {
      throw new Error("MISSING_API_URL");
    }

    try {
      const response = await fetch(`${apiUrl}/bot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question,
          user_id: userId
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
      return {
        answer: data.answer || "",
        layer: data.layer,
        source: data.source,
        raw_data: data.raw_data
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

    const apiUrl = process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
    if (!apiUrl) {
      throw new Error("MISSING_API_URL");
    }

    try {
      const response = await fetch(`${apiUrl}/bot/download-statement/${userId}`, {
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
