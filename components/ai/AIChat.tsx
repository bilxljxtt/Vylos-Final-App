"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, MessageSquare, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { createClient } from "@/utils/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'ai';
  message: string;
  created_at: string;
}

export default function AIChat() {
  const { sessionUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (sessionUser) {
      loadHistory();
    }
  }, [sessionUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  async function loadHistory() {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', sessionUser.id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) setMessages(data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add optimistic user message
    const optimisticUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      message: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages })
      });

      const data = await res.json();
      if (data.message) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          message: data.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
      >
        <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 bg-card border border-border-main shadow-2xl rounded-[2rem] flex flex-col z-50 transition-all duration-300 overflow-hidden ${isMinimized ? 'w-72 h-16' : 'w-[400px] h-[600px]'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">Vylos AI Advisor</h3>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-border-subtle rounded-xl transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4 text-text-muted" /> : <Minimize2 className="w-4 h-4 text-text-muted" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors">
            <X className="w-4 h-4 text-text-muted transition-colors" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-sidebar/5">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <Bot className="w-12 h-12 mb-4 text-primary" />
                <p className="text-sm font-medium text-text-muted">Hello! I'm your Vylos AI advisor. Ask me anything about your spending, savings, or goals.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-sidebar border border-border-subtle text-primary'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card border border-border-subtle text-text-main rounded-tl-none'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sidebar border border-border-subtle flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border-subtle p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs font-medium text-text-muted">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border-subtle bg-bg">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Vylos AI..."
                className="w-full h-12 bg-sidebar border border-border-main rounded-xl pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all text-text-main"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-text-muted mt-3 font-medium">Vylos AI can make mistakes. Check important info.</p>
          </form>
        </>
      )}
    </div>
  );
}
