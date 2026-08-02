"use client";

import { useState } from "react";
import { Settings2, Cpu, DollarSign } from "lucide-react";

export function ChatHeader() {
  const [model, setModel] = useState("gpt-4o");
  
  return (
    <header className="h-14 border-b border-border/40 bg-background/95 backdrop-blur flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold">Setup NestJS Backend</h2>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent text-xs font-medium text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Project Capsule Active
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-md">
          <DollarSign size={14} className="text-green-500" />
          <span>$0.014</span>
        </div>
        
        <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors">
          <Cpu size={14} className="text-primary" />
          <select 
            className="bg-transparent border-none text-xs font-medium text-foreground outline-none cursor-pointer appearance-none"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude-sonnet">Claude 3.5 Sonnet</option>
            <option value="gemini-flash">Gemini 2.0 Flash</option>
            <option value="ollama-llama">Llama 3.2 (Local)</option>
          </select>
        </div>
        
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
}
