"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Database, 
  Settings, 
  BarChart, 
  Zap,
  PlusCircle
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Chat", path: "/workspace/chat", icon: MessageSquare },
    { name: "Capsules", path: "/workspace/capsules", icon: Database },
    { name: "Skills", path: "/workspace/skills", icon: Zap },
    { name: "Dashboard", path: "/workspace/dashboard", icon: BarChart },
    { name: "Settings", path: "/workspace/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/40 bg-card flex flex-col h-screen">
      <div className="h-14 flex items-center px-4 border-b border-border/40">
        <div className="flex items-center gap-2 font-bold text-md">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-background rounded-full" />
          </div>
          Capsule AI
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md py-2 px-4 mb-6 transition-colors text-sm font-medium">
          <PlusCircle size={16} />
          New Chat
        </button>
        
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Recent Conversations
          </h3>
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md cursor-pointer truncate">
              Setup NestJS Backend
            </div>
            <div className="px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md cursor-pointer truncate">
              Debug FEA Simulation
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">gsgmk</span>
            <span className="text-xs text-muted-foreground mt-1">Personal Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
