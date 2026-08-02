"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Loader2, Workflow, GitBranch, BrainCircuit, BellRing, Settings2, Download } from "lucide-react";

interface NodeData {
  id: string;
  type: "trigger" | "process" | "action";
  label: string;
  icon: any;
  x: number;
  y: number;
  status: "pending" | "generating" | "complete";
}

interface EdgeData {
  id: string;
  from: string;
  to: string;
  status: "pending" | "active" | "complete";
}

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [saved, setSaved] = useState(false);

  // Simulated node generation sequence
  const generateWorkflow = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setSaved(false);
    setNodes([]);
    setEdges([]);

    // 1. Initial scanning state
    await new Promise((r) => setTimeout(r, 800));

    // 2. Spawn Trigger Node
    const triggerId = "node_1";
    setNodes([{
      id: triggerId, type: "trigger", label: "Webhook / Event Listener", icon: GitBranch, x: 50, y: 150, status: "generating"
    }]);
    await new Promise((r) => setTimeout(r, 1200));
    setNodes((n) => n.map(x => x.id === triggerId ? { ...x, status: "complete", label: "GitHub PR Opened" } : x));

    // 3. Spawn Process Node
    const processId = "node_2";
    setNodes((prev) => [...prev, {
      id: processId, type: "process", label: "Analyzing Context...", icon: BrainCircuit, x: 350, y: 150, status: "generating"
    }]);
    setEdges([{ id: "edge_1", from: triggerId, to: processId, status: "active" }]);
    await new Promise((r) => setTimeout(r, 1500));
    setNodes((n) => n.map(x => x.id === processId ? { ...x, status: "complete", label: "AI Code Review" } : x));
    setEdges((e) => e.map(x => x.id === "edge_1" ? { ...x, status: "complete" } : x));

    // 4. Spawn Action Node
    const actionId = "node_3";
    setNodes((prev) => [...prev, {
      id: actionId, type: "action", label: "Configuring Output...", icon: BellRing, x: 650, y: 150, status: "generating"
    }]);
    setEdges((prev) => [...prev, { id: "edge_2", from: processId, to: actionId, status: "active" }]);
    await new Promise((r) => setTimeout(r, 1200));
    setNodes((n) => n.map(x => x.id === actionId ? { ...x, status: "complete", label: "Send Slack Alert" } : x));
    setEdges((e) => e.map(x => x.id === "edge_2" ? { ...x, status: "complete" } : x));

    // 5. Finalize & Save
    await new Promise((r) => setTimeout(r, 500));
    setGenerating(false);

    // Automatically save to database as a Capsule
    try {
      const res = await fetch("http://localhost:3001/api/v1/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "default-workspace",
          name: prompt,
          description: "Visual AI Workflow",
          type: "TASK",
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save workflow", e);
    }
  };

  const exportToN8n = () => {
    // Generate a valid n8n workflow JSON structure
    const n8nNodes = nodes.map(node => ({
      parameters: {},
      id: node.id,
      name: node.label,
      type: node.type === "trigger" ? "n8n-nodes-base.webhook" : 
            node.type === "action" ? "n8n-nodes-base.slack" : "n8n-nodes-base.code",
      typeVersion: 1,
      position: [node.x, node.y]
    }));

    const n8nConnections: Record<string, any> = {};
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        if (!n8nConnections[fromNode.label]) {
          n8nConnections[fromNode.label] = { main: [[]] };
        }
        n8nConnections[fromNode.label].main[0].push({
          node: toNode.label,
          type: "main",
          index: 0
        });
      }
    });

    const workflowData = {
      name: prompt || "Generated AI Workflow",
      nodes: n8nNodes,
      connections: n8nConnections,
      active: false,
      settings: {},
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dock-orb-workflow.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-[#09090b] text-zinc-100">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6 bg-[#0c0c0e]">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Workflow size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Workflow Builder</h1>
            <p className="text-[10px] text-zinc-500">Node-based AI Automation</p>
          </div>
        </div>
        
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-md border border-emerald-500/20"
          >
            <CheckCircle2 size={14} /> Saved to Automations
          </motion.div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel (Prompt) */}
        <aside className="w-80 border-r border-zinc-800 bg-[#0c0c0e] p-6 flex flex-col gap-6 relative z-10">
          <div>
            <h2 className="text-sm font-medium mb-2 text-zinc-200">Describe Workflow</h2>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Tell Dock-Orb what you want to automate. It will visually break it down into an executable pipeline.
            </p>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                placeholder="e.g. When a PR is opened, review the code and send a Slack notification..."
                className="w-full h-32 resize-none rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              {generating && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 size={24} className="text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={generateWorkflow}
            disabled={!prompt.trim() || generating}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Graph
              </>
            )}
          </button>

          {nodes.length > 0 && !generating && (
            <button
              onClick={exportToN8n}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/50 bg-indigo-500/10 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
            >
              <Download size={16} /> Export for n8n
            </button>
          )}
        </aside>

        {/* Right Panel (Canvas) */}
        <main className="relative flex-1 bg-[#09090b] overflow-hidden">
          {/* Dot Grid Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} 
          />

          {/* Scanning Animation */}
          {generating && nodes.length === 0 && (
            <motion.div
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-indigo-500/20 to-indigo-500/5 blur-sm z-0 pointer-events-none"
            />
          )}

          {/* Canvas Area */}
          <div className="relative w-full h-full p-8 z-10 pointer-events-none">
            
            {/* Draw Edges (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <AnimatePresence>
                {edges.map((edge) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  const toNode = nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const startX = fromNode.x + 200;
                  const startY = fromNode.y + 40;
                  const endX = toNode.x;
                  const endY = toNode.y + 40;

                  const path = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`;

                  return (
                    <g key={edge.id}>
                      <path
                        d={path}
                        fill="none"
                        stroke={edge.status === "complete" ? "#6366f1" : "#3f3f46"}
                        strokeWidth="2"
                        strokeDasharray={edge.status === "active" ? "4,4" : "none"}
                      />
                      {edge.status === "active" && (
                        <motion.path
                          d={path}
                          fill="none"
                          stroke="#a5b4fc"
                          strokeWidth="3"
                          strokeDasharray="4, 1000"
                          initial={{ strokeDashoffset: 1000 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </g>
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Draw Nodes */}
            <AnimatePresence>
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`absolute w-[200px] rounded-xl border p-4 shadow-xl backdrop-blur-md pointer-events-auto ${
                    node.status === "generating" 
                      ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]" 
                      : "border-zinc-700 bg-[#121214]/90"
                  }`}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      node.type === "trigger" ? "bg-emerald-500/20 text-emerald-400" :
                      node.type === "action" ? "bg-rose-500/20 text-rose-400" :
                      "bg-indigo-500/20 text-indigo-400"
                    }`}>
                      {node.status === "generating" ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <node.icon size={18} />
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                        {node.type}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-zinc-200">
                        {node.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  {node.status === "generating" && (
                    <motion.div 
                      className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-800"
                    >
                      <motion.div 
                        className="h-full bg-indigo-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                  {node.status === "complete" && (
                    <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800 pt-3">
                      <span>Ready</span>
                      <Settings2 size={12} className="cursor-pointer hover:text-zinc-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
}
