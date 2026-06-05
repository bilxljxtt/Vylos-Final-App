import { createClient } from "@/utils/supabase/server";

export class AiLogger {
  static async logTurn(
    userId: string,
    userMessage: string,
    aiResponse: string,
    provider: string,
    latencyMs: number,
    success: boolean,
    errorType?: string
  ): Promise<void> {
    try {
      const supabase = await createClient();
      
      // 1. Log the user's message (core schema)
      await supabase.from("ai_conversations").insert({
        user_id: userId,
        role: "user",
        content: userMessage
      });

      // 2. Log the AI's response with performance metadata
      const { error } = await supabase.from("ai_conversations").insert({
        user_id: userId,
        role: "ai",
        content: aiResponse,
        provider,
        latency_ms: latencyMs,
        success,
        error_type: errorType || null
      });

      // 3. Fallback: If metadata insert failed (e.g. columns don't exist yet), insert with core columns only
      if (error) {
        console.warn("[AiLogger] Metadata columns missing or error occurred, falling back to core columns:", error.message);
        await supabase.from("ai_conversations").insert({
          user_id: userId,
          role: "ai",
          content: aiResponse
        });
      }
    } catch (error) {
      // Never block the user response if logging fails
      console.error("[AiLogger] Failed to log conversation:", error);
    }
  }
}
