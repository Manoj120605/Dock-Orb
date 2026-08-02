"use client";

import { useState } from "react";
import { Database, X, ChevronRight, CheckCircle2 } from "lucide-react";

export function CapsulePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('project');

  return (
    <div className={`fixed top-0 right-0 h-screen w-96 glass-panel border-l border-border/40 transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-14 border-b border-border/40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Database size={18} className="text-primary" />
          Active Capsule
        </div>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded-md text-muted-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-border/40 bg-card/50">
        <button 
          className={`flex-1 py-3 text-xs font-medium text-center border-b-2 transition-colors ${activeTab === 'project' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('project')}
        >
          Project Context
        </button>
        <button 
          className={`flex-1 py-3 text-xs font-medium text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('history')}
        >
          History & Specs
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'project' && (
          <>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Info</h3>
              <div className="bg-card border border-border/40 rounded-lg p-3">
                <div className="font-medium text-sm mb-1">Capsule Platform</div>
                <div className="text-xs text-muted-foreground mb-3">Domain-agnostic AI workspace with Next.js and NestJS</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-accent rounded text-[10px] font-medium">TypeScript</span>
                  <span className="px-2 py-1 bg-accent rounded text-[10px] font-medium">NestJS</span>
                  <span className="px-2 py-1 bg-accent rounded text-[10px] font-medium">React</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Architecture</h3>
              <div className="bg-card border border-border/40 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-primary mt-0.5" />
                  <span className="text-sm text-foreground">Turborepo Monorepo</span>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-primary mt-0.5" />
                  <span className="text-sm text-foreground">Next.js App Router (Frontend)</span>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-primary mt-0.5" />
                  <span className="text-sm text-foreground">NestJS API Gateway</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coding Standards</h3>
              <div className="bg-card border border-border/40 rounded-lg p-3 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Use DTOs for all API endpoints</li>
                  <li>Prisma for database access</li>
                  <li>Vanilla CSS / Glassmorphism UI</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Tasks</h3>
            
            <div className="relative border-l border-border ml-2 pl-4 space-y-4">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-background">
                  <CheckCircle2 size={12} className="text-green-500 bg-background rounded-full" />
                </div>
                <div className="text-xs font-medium text-foreground">Setup Turborepo</div>
                <div className="text-[10px] text-muted-foreground">August 1, 2026</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-background">
                  <CheckCircle2 size={12} className="text-green-500 bg-background rounded-full" />
                </div>
                <div className="text-xs font-medium text-foreground">Configure Prisma Schema</div>
                <div className="text-[10px] text-muted-foreground">August 1, 2026</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border/40 bg-card/50">
        <button className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Edit Capsule
        </button>
      </div>
    </div>
  );
}
