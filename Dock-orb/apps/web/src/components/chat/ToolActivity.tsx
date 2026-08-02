"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Code, CheckCircle2, Loader2, GitCommit } from "lucide-react";
import { useEffect, useState } from "react";

interface ToolEvent {
  id: string;
  toolName: string;
  args: any;
  status: "running" | "completed" | "error";
  result?: any;
}

export function ToolActivity({ tools }: { tools: ToolEvent[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 my-2">
      <AnimatePresence>
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="overflow-hidden rounded-md border border-indigo-500/30 bg-black/40 shadow-[0_0_15px_rgba(99,102,241,0.1)] backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5">
              {tool.status === "running" ? (
                <Loader2 size={12} className="animate-spin text-indigo-400" />
              ) : tool.status === "completed" ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <CheckCircle2 size={12} className="text-red-400" />
              )}
              <span className="font-mono text-[11px] font-medium tracking-wider text-indigo-300 uppercase">
                {tool.toolName.replace(/_/g, " ")}
              </span>
            </div>

            {/* Content (The Crazy Tech part) */}
            <div className="p-3">
              <ToolContent tool={tool} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToolContent({ tool }: { tool: ToolEvent }) {
  // Matrix / Typing effect state
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (tool.toolName === "write_file" || tool.toolName === "edit_file") {
      const fullText = (tool.args?.content || tool.args?.file_contents || "Writing data stream...").slice(0, 300);
      let currentIndex = 0;
      const interval = setInterval(() => {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex += 3;
        if (currentIndex > fullText.length) clearInterval(interval);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [tool]);

  if (tool.toolName === "write_file" || tool.toolName === "edit_file") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
          <Code size={12} className="text-emerald-500" />
          <span>{tool.args?.path || tool.args?.file_path || "unknown_file"}</span>
        </div>
        <div className="relative overflow-hidden rounded bg-black/60 p-2 font-mono text-[10px] leading-relaxed text-emerald-400/80">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
          <pre className="whitespace-pre-wrap opacity-80">{displayText}<span className="animate-pulse">_</span></pre>
        </div>
      </div>
    );
  }

  if (tool.toolName === "push" || tool.toolName === "create_pull_request" || tool.toolName === "commit") {
    return (
      <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-300">
        <GitCommit size={14} className="text-indigo-400" />
        <span className="animate-pulse">Synchronizing with origin...</span>
      </div>
    );
  }

  // Default terminal output
  return (
    <div className="flex items-start gap-2 font-mono text-[10px] text-zinc-400">
      <Terminal size={12} className="mt-0.5 shrink-0 text-indigo-500/50" />
      <div className="break-all">
        {JSON.stringify(tool.args).slice(0, 150)}
        {JSON.stringify(tool.args).length > 150 ? "..." : ""}
      </div>
    </div>
  );
}
