export async function callCerebras(messages: { role: string; content: string }[]): Promise<{
  success: boolean;
  provider: "cerebras";
  response: string;
  latencyMs: number;
  errorType?: string;
}> {
  const startTime = Date.now();
  const apiKey = process.env.VYLOS_PRODUCTION_CEREBRAS;

  if (!apiKey) {
    return {
      success: false,
      provider: "cerebras",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: "MISSING_API_KEY",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
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
        provider: "cerebras",
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
        provider: "cerebras",
        response: "",
        latencyMs: Date.now() - startTime,
        errorType: "EMPTY_RESPONSE",
      };
    }

    return {
      success: true,
      provider: "cerebras",
      response: content,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      provider: "cerebras",
      response: "",
      latencyMs: Date.now() - startTime,
      errorType: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
    };
  }
}
