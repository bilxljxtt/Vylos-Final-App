import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/services/import/AIService";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `
      You are Vylos AI Advisor, a friendly and highly knowledgeable personal finance assistant for South African users.
      
      User's Financial Context:
      ${context}
      
      Instructions:
      - Give concise, practical, and actionable advice.
      - Use South African Rand (R) for all currency references.
      - Keep responses under 150 words.
      - Be encouraging, empathetic, but brutally honest about financial health.
      - Focus on South African context (banks, shops, economic conditions).
    `;

    // Construct the full prompt for Gemini
    const lastMessage = messages[messages.length - 1];
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${lastMessage.content}\n\nAI Advisor Response:`;

    const reply = await AIService.getSimpleAIResponse(fullPrompt);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI Advisor Route Error:", err);
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 });
  }
}
