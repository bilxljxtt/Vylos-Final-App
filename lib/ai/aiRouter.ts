import { callGroq } from "./providers/groq";
import { callCerebras } from "./providers/cerebras";
import { callGemini } from "./providers/gemini";
import { callOpenRouter } from "./providers/openrouter";
import { RagContext } from "./ragContext";
import { AiLogger } from "./aiLogger";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class AiRouter {
  static async routeMessage(
    userId: string,
    userMessage: string
  ): Promise<{
    reply: string;
    source: string;
    layer: number;
  }> {
    const startTime = Date.now();
    const fallbackMessage = "I’m having trouble generating a full AI response right now. Your Vylos data is safe. Please try again in a moment.";

    // 1. Retrieve RAG context and history
    const { formattedContext, hasHistory } = await RagContext.getPromptContext(userId);

    // 2. Determine if user has zero financial records
    const isLimitedData = formattedContext.includes("Monthly Income: R0") && 
                          formattedContext.includes("Monthly Expenses: R0") &&
                          formattedContext.includes("No active savings goals.");

    // 3. Assemble system and user prompts
    let systemInstruction = `You are Vylos Advisor, a financial guidance assistant inside the Vylos app.
Answer in 3-5 short bullet points. Do not calculate anything. Use only the provided calculated data. If data is missing, say what is missing.

RULES FOR STATEMENTS / PDF / EXPORTS:
- If the user asks to download, export, print, or get a PDF of their statement, finances, transactions, or report, you MUST output a Markdown link: [Download PDF Statement](download-statement) in your response. Do not output any other link or invent a URL.

GENERAL RULES:
- Do NOT use emojis in your response under any circumstances. Keep the tone professional, direct, analytical, and written as if by a human financial analyst/advisor. Emojis make the response look automated/AI-generated, which is unacceptable for corporate presentation standards.
- You provide general financial information only. You are not a licensed financial advisor.
- Do not give regulated financial advice.
- Do not invent numbers. If data is missing, say so.
- Keep answers short, simple, practical, and supportive.
- Include a short disclaimer at the bottom of your response: "Disclaimer: This is AI-generated financial guidance and does not constitute formal professional financial advice."`;

    if (!hasHistory) {
      systemInstruction += `\n\nFIRST-TIME USER HANDLING:
- This is the user's first time interacting with you. Do not pretend to remember them or say "welcome back".
- Welcome them warmly to Vylos Advisor.`;
      if (isLimitedData) {
        systemInstruction += `\n- Since they have limited transaction/budget/goal data loaded in Vylos, explain that you need more data (transactions, goals, budgets) to give highly personalized advice, but offer help with what they want to set up first.`;
      }
    } else {
      systemInstruction += `\n\nRETURNING USER HANDLING:
- You have some recent conversation history below. Keep the context in mind. Do not greet them like a first-time user.`;
    }

    const fullPrompt = `${systemInstruction}

[USER FINANCIAL DATA CONTEXT]
${formattedContext}

User Message:
"${userMessage}"`;

    const messages = [{ role: "user" as const, content: fullPrompt }];

    // 4. Try Providers in Priority Order

    // Provider 1: Groq (Primary fast provider)
    try {
      console.log("[AI Router] Attempting Groq...");
      const groqRes = await callGroq(messages);
      if (groqRes.success) {
        await AiLogger.logTurn(userId, userMessage, groqRes.response, "groq", groqRes.latencyMs, true);
        return { reply: groqRes.response, source: "Groq (Primary)", layer: 1 };
      }
      console.warn(`[AI Router] Groq failed: ${groqRes.errorType}. Trying Cerebras fallback...`);
    } catch (err) {
      console.error("[AI Router] Groq execution crashed:", err);
    }

    // Provider 2: Cerebras (Secondary fallback)
    try {
      console.log("[AI Router] Attempting Cerebras...");
      const cerebrasRes = await callCerebras(messages);
      if (cerebrasRes.success) {
        await AiLogger.logTurn(userId, userMessage, cerebrasRes.response, "cerebras", cerebrasRes.latencyMs, true);
        return { reply: cerebrasRes.response, source: "Cerebras (Secondary)", layer: 2 };
      }
      console.warn(`[AI Router] Cerebras failed: ${cerebrasRes.errorType}. Trying Gemini fallback...`);
    } catch (err) {
      console.error("[AI Router] Cerebras execution crashed:", err);
    }

    // Provider 3: Gemini (Complex reasoning / fallback)
    try {
      console.log("[AI Router] Attempting Gemini...");
      const geminiRes = await callGemini(messages);
      if (geminiRes.success) {
        await AiLogger.logTurn(userId, userMessage, geminiRes.response, "gemini", geminiRes.latencyMs, true);
        return { reply: geminiRes.response, source: "Gemini (Tertiary)", layer: 3 };
      }
      console.warn(`[AI Router] Gemini failed: ${geminiRes.errorType}. Trying OpenRouter fallback...`);
    } catch (err) {
      console.error("[AI Router] Gemini execution crashed:", err);
    }

    // Provider 4: OpenRouter (Emergency fallback)
    try {
      console.log("[AI Router] Attempting OpenRouter...");
      const openrouterRes = await callOpenRouter(messages);
      if (openrouterRes.success) {
        await AiLogger.logTurn(userId, userMessage, openrouterRes.response, "openrouter", openrouterRes.latencyMs, true);
        return { reply: openrouterRes.response, source: "OpenRouter (Emergency)", layer: 4 };
      }
      console.warn(`[AI Router] OpenRouter failed: ${openrouterRes.errorType}.`);
    } catch (err) {
      console.error("[AI Router] OpenRouter execution crashed:", err);
    }

    // 5. Safe Fallback if all providers failed
    const totalLatency = Date.now() - startTime;
    console.error("[AI Router] All providers failed or timed out. Serving fallback response.");
    await AiLogger.logTurn(userId, userMessage, fallbackMessage, "fallback", totalLatency, false, "ALL_PROVIDERS_FAILED");

    return {
      reply: fallbackMessage,
      source: "System Fallback",
      layer: 5
    };
  }
}
