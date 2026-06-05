export async function callOpenRouter(messages: { role: string; content: string }[]): Promise<{
  success: boolean;
  provider: "openrouter";
  response: string;
  latencyMs: number;
  errorType?: string;
}> {
  const startTime = Date.now();
  const apiKey = process.env.VYLOS_PRODUCTION_OPENROUTER;

  if (!apiKey) {
    return {
      success: false,
      provider: "openrouter",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: "MISSING_API_KEY",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vylos.com",
        "X-Title": "Vylos",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
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
        provider: "openrouter",
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
        provider: "openrouter",
        response: "",
        latencyMs: Date.now() - startTime,
        errorType: "EMPTY_RESPONSE",
      };
    }

    return {
      success: true,
      provider: "openrouter",
      response: content,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      provider: "openrouter",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
    };
  }
}
