import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGemini(messages: { role: string; content: string }[]): Promise<{
  success: boolean;
  provider: "gemini";
  response: string;
  latencyMs: number;
  errorType?: string;
}> {
  const startTime = Date.now();
  const apiKey = process.env.VYLOS_PRODUCTION_GEMINI;

  if (!apiKey) {
    return {
      success: false,
      provider: "gemini",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: "MISSING_API_KEY",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Since the history is serialized in the user prompt to prevent turn/role alternation errors
    // across different models, messages will contain a single user prompt.
    const prompt = messages[messages.length - 1]?.content || "";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      return {
        success: false,
        provider: "gemini",
        response: "",
        latencyMs: Date.now() - startTime,
        errorType: "EMPTY_RESPONSE",
      };
    }

    return {
      success: true,
      provider: "gemini",
      response: content,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      provider: "gemini",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: "API_ERROR",
    };
  }
}
