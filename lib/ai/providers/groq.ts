export async function callGroq(messages: { role: string; content: string }[]): Promise<{
  success: boolean;
  provider: "groq";
  response: string;
  latencyMs: number;
  errorType?: string;
}> {
  const startTime = Date.now();
  const apiKey = process.env.VYLOS_PRODUCTION_GROQ;

  if (!apiKey) {
    return {
      success: false,
      provider: "groq",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: "MISSING_API_KEY",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        provider: "groq",
        response: "",
        latencyMs: Date.now() - startTime,
        errorType: `HTTP_${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        provider: "groq",
        response: "",
        latencyMs: Date.now() - startTime,
        errorType: "EMPTY_RESPONSE",
      };
    }

    return {
      success: true,
      provider: "groq",
      response: content,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      provider: "groq",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
    };
  }
}
