"use client";

import { Home, Send, Repeat, PiggyBank, Landmark, Users, Power, Code, Wallet } from "lucide-react";
import { useNeobank } from "@/components/neobank/auth";
import { short } from "@/components/neobank/ui";

export type View = "home" | "send" | "convert" | "earn" | "borrow" | "payroll";

const NAV: { id: View; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "send", label: "Send", icon: Send },
  { id: "convert", label: "Convert", icon: Repeat },
  { id: "earn", label: "Earn", icon: PiggyBank },
  { id: "borrow", label: "Borrow", icon: Landmark },
  { id: "payroll", label: "Pay team", icon: Users },
];

export default function Sidebar({ view, setView, onDev }: { view: View; setView: (v: View) => void; onDev: () => void }) {
  const { account, logout } = useNeobank();
  return (
    <aside className="w-60 shrink-0 min-h-screen bg-white/[0.02] border-r border-white/10 flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary" /></div>
        <span className="font-black tracking-tight">Meridian</span>
        <span className="text-[9px] text-white/30 uppercase tracking-widest ml-auto">on Irion</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors text-left ${view === id ? "bg-primary/10 text-primary" : "text-white/55 hover:text-white hover:bg-white/5"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <div className="my-2 border-t border-white/5" />
        <button onClick={onDev}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-white/55 hover:text-primary hover:bg-white/5 transition-colors text-left">
          <Code className="w-4 h-4" /> Developer
        </button>
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-white/60 font-mono uppercase truncate">Passkey · {account?.name}</span>
          </div>
          <code className="text-[10px] text-white/80 break-all" title={account?.party}>{short(account?.party)}</code>
          <button onClick={logout}
            className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors mt-1">
            <Power className="w-3 h-3" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
