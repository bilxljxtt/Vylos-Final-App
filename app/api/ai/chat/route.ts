import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { withAiRateLimit } from "@/lib/ai/aiLimitHelper";

export async function POST(req: NextRequest) {
  return withAiRateLimit(req, async (request, user, profile, supabase) => {
    const { message, history } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format history for Gemini
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiMessage = response.text();

    // Log to Supabase
    await supabase.from('ai_conversations').insert([
      { user_id: user.id, content: message, role: 'user' },
      { user_id: user.id, content: aiMessage, role: 'ai' }
    ]);

    return NextResponse.json({ message: aiMessage });
  });
}
