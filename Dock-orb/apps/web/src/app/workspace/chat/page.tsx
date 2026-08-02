"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { CapsulePanel } from "@/components/capsule/CapsulePanel";
import { Database } from "lucide-react";

export default function ChatPage() {
  const [capsuleOpen, setCapsuleOpen] = useState(false);

  return (
    <div className="h-full flex relative">
      <div className="flex-1">
        <ChatInterface />
      </div>
      
      {/* Floating button to open capsule panel */}
      <button 
        onClick={() => setCapsuleOpen(true)}
        className={`absolute right-6 top-6 bg-card border border-border/40 shadow-lg p-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-accent transition-all z-40 ${capsuleOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <Database size={16} className="text-primary" />
        Context
      </button>

      <CapsulePanel isOpen={capsuleOpen} onClose={() => setCapsuleOpen(false)} />
    </div>
  );
}
