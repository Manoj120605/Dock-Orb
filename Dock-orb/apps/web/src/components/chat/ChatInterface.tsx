"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileCode, Zap } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  cost?: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I have loaded the `Capsule Platform` project memory and the `NestJS Expert` skill. How can I help you build the backend today?",
      model: "system"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Based on the Capsule context, you want to build the API Gateway using NestJS. I recommend structuring the Monorepo with Turborepo and separating the `core` modules from `features`. Here is a basic `app.module.ts` configuration to get started...",
        model: "gpt-4o",
        cost: 0.002
      }]);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30">
                <Bot size={18} className="text-primary" />
              </div>
            )}
            
            <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : ''}`}>
              {msg.role !== 'user' && msg.model !== 'system' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                  <span className="font-medium text-foreground">{msg.model}</span>
                  <span>•</span>
                  <span className="text-green-500">${msg.cost}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-primary"><Zap size={10} /> Fast</span>
                </div>
              )}
              
              <div className={`p-4 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'glass-panel rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center border border-border">
                <User size={18} className="text-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30">
              <Bot size={18} className="text-primary" />
            </div>
            <div className="glass-panel rounded-lg rounded-tl-none p-4 flex items-center gap-1 w-16">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background/80 backdrop-blur border-t border-border/40">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <button type="button" className="absolute left-3 text-muted-foreground hover:text-primary transition-colors">
              <FileCode size={20} />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Capsule AI..."
              className="w-full bg-card border border-border/60 rounded-xl pl-12 pr-12 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-sm transition-all"
            />
            
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-3 p-1.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-muted-foreground">
            AI can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}
