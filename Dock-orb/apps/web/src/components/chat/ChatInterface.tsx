"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, FileCode2, Loader2, Paperclip, Sparkles, User, AlertCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { ToolActivity } from "./ToolActivity";

const API = "http://localhost:3001/api/v1";
const SOCKET_URL = "http://localhost:3001";
const WORKSPACE_ID = "default-workspace";
const CONVERSATION_ID = "default-conversation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<"unchecked" | "ready" | "missing">("unchecked");
  const [activeTools, setActiveTools] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Setup Socket.io
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("tool_start", (data) => {
      setActiveTools((prev) => [
        ...prev,
        { id: `${data.toolName}-${Date.now()}`, toolName: data.toolName, args: data.args, status: "running" },
      ]);
    });

    socketRef.current.on("tool_end", (data) => {
      setActiveTools((prev) =>
        prev.map((t) =>
          t.toolName === data.toolName && t.status === "running"
            ? { ...t, status: data.result?.error ? "error" : "completed", result: data.result }
            : t
        )
      );
      // Remove completed tools after 3 seconds so the UI stays clean
      setTimeout(() => {
        setActiveTools((prev) => prev.filter((t) => t.toolName !== data.toolName || t.status === "running"));
      }, 3000);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Check if AI is configured on mount
  useEffect(() => {
    fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/config`)
      .then((r) => r.json())
      .then((d) => {
        if (d.aiApiKey && d.aiApiKey !== "") {
          setConfigStatus("ready");
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "I'm ready. I have access to your configured AI provider and GitHub MCP tools. Ask me anything — I can read code, list issues, and help you automate your workflows.",
          }]);
        } else {
          setConfigStatus("missing");
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "⚠️ No AI provider configured yet. Go to the **Automations** tab, enter your API key and optionally a base URL (for NVIDIA, Groq, etc.), then come back here.",
          }]);
        }
      })
      .catch(() => {
        setConfigStatus("missing");
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "⚠️ Cannot reach the API server at localhost:3001. Make sure the backend is running with `npm run dev`.",
        }]);
      });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          conversationId: CONVERSATION_ID,
          message: content,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.content) {
        setMessages((prev) => [
          ...prev,
          { id: data.data.id || `${Date.now()}-resp`, role: "assistant", content: data.data.content },
        ]);
      } else if (!data.success && data.message) {
        // API returned a structured error (e.g. wrong key, rate limit)
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-err`, role: "assistant", content: `⚠️ ${data.message}`, error: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-err`, role: "assistant", content: "The AI returned an empty response. Check your API key and base URL in the Automations tab.", error: true },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-err`, role: "assistant", content: "Network error. Make sure the backend API is running at localhost:3001.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e as any);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#09090b] text-zinc-100">
      {/* Tab bar */}
      <div className="flex h-11 shrink-0 items-center gap-5 border-b border-zinc-800 px-6">
        <button className="h-11 border-b-2 border-indigo-500 px-1 text-xs font-medium text-zinc-100">
          Conversation
        </button>
        <span className="ml-auto flex items-center gap-1.5 text-[10px]">
          {configStatus === "ready" ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI connected
            </span>
          ) : configStatus === "missing" ? (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle size={11} /> Configure API key
            </span>
          ) : (
            <span className="flex items-center gap-1 text-zinc-500">
              <Loader2 size={11} className="animate-spin" /> Checking...
            </span>
          )}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                  message.role === "assistant"
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "order-2 bg-zinc-800 text-zinc-300"
                }`}
              >
                {message.role === "assistant" ? <Bot size={15} /> : <User size={14} />}
              </div>
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "order-1 rounded-lg bg-zinc-800"
                    : message.error
                    ? "rounded-lg border border-red-500/20 bg-red-500/5"
                    : "workspace-card"
                } px-4 py-3 text-[13px] leading-6 text-zinc-300`}
              >
                {message.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                    <span>Dock-Orb AI</span>
                    {message.error && <span className="text-red-400">· Error</span>}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500/10 text-indigo-300">
                <Bot size={15} />
              </div>
              <div className="flex-1">
                <div className="workspace-card inline-flex items-center gap-2 px-4 py-3 text-xs text-zinc-500 mb-2">
                  <Loader2 size={13} className="animate-spin" /> Thinking...
                </div>
                <ToolActivity tools={activeTools} />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800 bg-[#0c0c0e] px-6 py-4">
        <form onSubmit={submit} className="mx-auto max-w-3xl">
          <div className="workspace-card flex items-end gap-2 p-2 focus-within:border-zinc-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder={configStatus === "missing" ? "Configure AI in Automations tab first..." : "Ask anything — uses your configured AI + GitHub MCP tools..."}
              disabled={configStatus === "missing"}
              className="max-h-28 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-5 text-zinc-200 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || configStatus === "missing"}
              className="grid h-8 w-8 place-items-center rounded-md bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <FileCode2 size={11} /> Enter to send · Shift+Enter for newline
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} /> Uses your API key + GitHub MCP
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
