"use client";

import { X, Code } from "lucide-react";

export interface ApiCall { method: "GET" | "POST"; path: string; body?: Record<string, unknown>; desc: string }
const BASE = process.env.NEXT_PUBLIC_B2B_API_URL || "http://localhost:8088";

function snippet(c: ApiCall): string {
  const auth = `-H "authorization: Bearer $SESSION"`;
  if (c.method === "GET") return `curl ${BASE}${c.path} \\\n  ${auth}`;
  return `curl -X ${c.method} ${BASE}${c.path} \\\n  ${auth} \\\n  -H "content-type: application/json" \\\n  -d '${JSON.stringify(c.body ?? {})}'`;
}

export default function DevDrawer({ open, onClose, title, calls }: { open: boolean; onClose: () => void; title: string; calls: ApiCall[] }) {
  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#0c0e17] border-l border-white/10 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2"><Code className="w-4 h-4 text-primary" /><span className="font-black text-sm">Built on Irion — the API</span></div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-3 border-b border-white/5 text-[11px] text-white/45 leading-relaxed shrink-0">
          <span className="text-white/70 font-semibold">{title}</span> is powered by these calls to <code className="text-primary/80">{BASE}</code>, authenticated by your passkey session.
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {calls.map((c, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                <span className={`text-[9px] font-black px-2 py-1 rounded ${c.method === "GET" ? "bg-sky-500/15 text-sky-300" : "bg-primary/15 text-primary"}`}>{c.method}</span>
                <code className="text-[11px] text-white/80 break-all">{c.path}</code>
              </div>
              <div className="px-4 py-2 text-[11px] text-white/40">{c.desc}</div>
              <pre className="px-4 pb-3 text-[10px] text-white/55 font-mono whitespace-pre-wrap break-all leading-relaxed">{snippet(c)}</pre>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 text-[10px] text-white/30 shrink-0">Full spec: <code className="text-primary/70">{BASE}/openapi.json</code></div>
      </aside>
    </>
  );
}
