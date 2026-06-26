"use client";

import { useEffect, useState } from "react";
import { Send, Repeat, PiggyBank, Landmark, Users, Loader2 } from "lucide-react";
import * as nb from "@/lib/neobank";
import { fmt, short } from "@/components/neobank/ui";
import DevDrawer, { type ApiCall } from "@/components/DevDrawer";
import Sidebar, { type View } from "@/components/Sidebar";

const input = "bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors w-full";
const label = "text-[10px] text-white/40 uppercase tracking-widest";
const btn = "bg-primary text-black px-4 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100";
const ghost = "bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-50";

export default function Dashboard() {
  const [t, setT] = useState<any>(null);
  const [credit, setCredit] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>("home");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dev, setDev] = useState(false);

  const [to, setTo] = useState(""); const [sendAmt, setSendAmt] = useState(""); const [sendCur, setSendCur] = useState("USDC");
  const [fxFrom, setFxFrom] = useState("USDC"); const [fxTo, setFxTo] = useState("EURC"); const [fxAmt, setFxAmt] = useState("");
  const [earnAmt, setEarnAmt] = useState("");
  const [borrowAmt, setBorrowAmt] = useState("");
  const [empName, setEmpName] = useState(""); const [empSalary, setEmpSalary] = useState(""); const [sel, setSel] = useState<Record<string, boolean>>({});

  async function load() {
    const [tt, c, e, em, ln, r] = await Promise.all([
      nb.getTreasury(),
      nb.getCredit().catch(() => ({ credit: null })),
      nb.getEvents().catch(() => ({ events: [] })),
      nb.getEmployees().catch(() => ({ employees: [] })),
      nb.getLoans().catch(() => ({ loans: [] })),
      nb.getRates().catch(() => ({ rates: {} })),
    ]);
    setT(tt); setCredit(c.credit); setEvents(e.events || []); setEmployees(em.employees || []); setLoans(ln.loans || []); setRates(r.rates || {});
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function run(fn: () => Promise<any>, okText: string) {
    setBusy(true); setMsg(null);
    try { await fn(); await load(); setMsg({ kind: "ok", text: okText }); }
    catch (e: any) { setMsg({ kind: "err", text: e?.message || "failed" }); }
    finally { setBusy(false); }
  }

  const balances: Record<string, number> = t?.balances || {};
  const fxRate = rates[`${fxFrom}:${fxTo}`];

  const callsFor: Record<View, ApiCall[]> = {
    home: [
      { method: "GET", path: "/v1/account/treasury", desc: "Multi-currency balances + yield + total." },
      { method: "GET", path: "/v1/account/credit", desc: "Credit profile." },
      { method: "GET", path: "/v1/account/events", desc: "Recent activity." },
    ],
    send: [{ method: "POST", path: "/v1/account/transfers", body: { to: "party::…", amount: 100, currency: "USDC" }, desc: "Atomic settlement to any Canton party." }],
    convert: [
      { method: "GET", path: "/v1/account/treasury/rates", desc: "Current FX rates." },
      { method: "POST", path: "/v1/account/treasury/rebalance", body: { from: "USDC", to: "EURC", amount: 1000 }, desc: "Real on-ledger currency swap." },
    ],
    earn: [
      { method: "POST", path: "/v1/account/treasury/sweep", body: { amount: 1000 }, desc: "Move idle cash into the yield pool." },
      { method: "POST", path: "/v1/account/treasury/redeem", desc: "Redeem the yield position back to cash." },
    ],
    borrow: [
      { method: "POST", path: "/v1/account/credit/underwrite", desc: "Score + limit from on-ledger signals." },
      { method: "POST", path: "/v1/account/loans", body: { amount: 1000, termDays: 30 }, desc: "Draw working capital." },
      { method: "POST", path: "/v1/account/loans/{id}/repay", body: { amount: 500 }, desc: "Repay a loan." },
    ],
    payroll: [
      { method: "POST", path: "/v1/account/employees", body: { name: "Alice", salary: 4000 }, desc: "Add an employee (a Canton payee party)." },
      { method: "POST", path: "/v1/account/payroll/runs", body: { entries: [{ employeeId: "emp_…" }] }, desc: "Run payroll — each salary a private contract." },
    ],
  };
  const TITLES: Record<View, string> = { home: "Home", send: "Send money", convert: "Convert currency", earn: "Earn yield", borrow: "Borrow", payroll: "Pay your team" };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen flex bg-background text-foreground font-display">
      <Sidebar view={view} setView={(v) => { setView(v); setMsg(null); }} onDev={() => setDev(true)} />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8">
          <h1 className="text-2xl font-black tracking-tight mb-6">{TITLES[view]}</h1>

          {msg && <div className={`mb-5 text-xs rounded-xl px-4 py-3 border ${msg.kind === "ok" ? "text-primary border-primary/30 bg-primary/5" : "text-red-400 border-red-500/30 bg-red-500/5"}`}>{msg.text}</div>}

          {/* HOME */}
          {view === "home" && (
            <>
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-white/10 rounded-3xl p-7 mb-6">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total balance</div>
                <div className="text-4xl font-black tracking-tight">${fmt(t?.total)}</div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {Object.entries(balances).map(([cur, amt]) => (
                    <div key={cur} className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest">{cur}</div>
                      <div className="text-sm font-bold">{fmt(amt)}</div>
                    </div>
                  ))}
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">Yield</div>
                    <div className="text-sm font-bold text-primary">${fmt(t?.yieldValue)}</div>
                  </div>
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">Credit</div>
                    <div className="text-sm font-bold">{credit ? `$${fmt(credit.available)}` : "—"}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Recent activity</div>
                {events.length === 0 ? <p className="text-xs text-white/30 py-3 text-center">No activity yet.</p> : (
                  <div className="flex flex-col divide-y divide-white/5">
                    {events.slice(0, 10).map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2.5 text-xs">
                        <span className="font-mono text-primary/80">{e.type}</span>
                        <span className="text-white/30">{new Date(e.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SEND */}
          {view === "send" && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-md flex flex-col gap-3">
              <label className="flex flex-col gap-1"><span className={label}>Recipient — Canton party id</span><input className={input} value={to} onChange={(e) => setTo(e.target.value)} placeholder="party::1220…" /></label>
              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 flex flex-col gap-1"><span className={label}>Amount</span><input className={input} type="number" value={sendAmt} onChange={(e) => setSendAmt(e.target.value)} placeholder="100" /></label>
                <label className="flex flex-col gap-1"><span className={label}>Currency</span><select className={input} value={sendCur} onChange={(e) => setSendCur(e.target.value)}><option>USDC</option><option>EURC</option><option>GBPC</option></select></label>
              </div>
              <button className={btn} disabled={busy || !to || !sendAmt} onClick={() => run(async () => { await nb.transfer(to.trim(), Number(sendAmt), sendCur); setTo(""); setSendAmt(""); }, `Sent ${sendAmt} ${sendCur}`)}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send</button>
            </div>
          )}

          {/* CONVERT */}
          {view === "convert" && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-md flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1"><span className={label}>From</span><select className={input} value={fxFrom} onChange={(e) => setFxFrom(e.target.value)}><option>USDC</option><option>EURC</option><option>GBPC</option></select></label>
                <label className="flex flex-col gap-1"><span className={label}>To</span><select className={input} value={fxTo} onChange={(e) => setFxTo(e.target.value)}><option>EURC</option><option>USDC</option><option>GBPC</option></select></label>
              </div>
              <label className="flex flex-col gap-1"><span className={label}>Amount</span><input className={input} type="number" value={fxAmt} onChange={(e) => setFxAmt(e.target.value)} placeholder="1000" /></label>
              <p className="text-[11px] text-white/40">{fxRate ? `Rate 1 ${fxFrom} = ${fxRate} ${fxTo} · you receive ≈ ${fmt((Number(fxAmt) || 0) * fxRate)} ${fxTo}` : "Select a valid currency pair"}</p>
              <button className={btn} disabled={busy || !fxAmt || !fxRate || fxFrom === fxTo} onClick={() => run(async () => { await nb.rebalance(fxFrom, fxTo, Number(fxAmt)); setFxAmt(""); }, `Converted ${fxAmt} ${fxFrom} → ${fxTo}`)}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />} Convert</button>
            </div>
          )}

          {/* EARN */}
          {view === "earn" && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-md flex flex-col gap-3">
              <p className="text-[11px] text-white/40">In savings: <span className="text-primary font-bold">${fmt(t?.yieldValue)}</span> · idle cash: ${fmt(t?.cash)} USDC</p>
              <label className="flex flex-col gap-1"><span className={label}>Move to savings (USDC)</span><input className={input} type="number" value={earnAmt} onChange={(e) => setEarnAmt(e.target.value)} placeholder="1000" /></label>
              <div className="flex gap-2">
                <button className={btn + " flex-1"} disabled={busy || !earnAmt} onClick={() => run(async () => { await nb.sweep(Number(earnAmt)); setEarnAmt(""); }, `Moved ${earnAmt} to savings`)}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PiggyBank className="w-4 h-4" />} Move to savings</button>
                <button className={ghost} disabled={busy || !(t?.yieldValue > 0)} onClick={() => run(() => nb.redeem(), "Redeemed savings to cash")}>Withdraw all</button>
              </div>
            </div>
          )}

          {/* BORROW */}
          {view === "borrow" && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-md flex flex-col gap-3">
              {credit ? <p className="text-[11px] text-white/40">Credit line <span className="text-white/80 font-bold">${fmt(credit.available)}</span> available · score {credit.score}</p> : <p className="text-[11px] text-white/40">No credit line yet — get assessed first.</p>}
              <button className={ghost + " self-start"} disabled={busy} onClick={() => run(() => nb.underwrite(), "Credit line assessed")}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {credit ? "Re-assess" : "Get a credit line"}</button>
              <label className="flex flex-col gap-1"><span className={label}>Draw amount (USDC)</span><input className={input} type="number" value={borrowAmt} onChange={(e) => setBorrowAmt(e.target.value)} placeholder="1000" /></label>
              <button className={btn} disabled={busy || !borrowAmt || !(credit?.available > 0)} onClick={() => run(async () => { await nb.drawLoan(Number(borrowAmt)); setBorrowAmt(""); }, `Drew ${borrowAmt} USDC`)}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />} Draw</button>
              {loans.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <span className={label}>Active loans</span>
                  {loans.map((l) => (
                    <div key={l.id} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <span>outstanding <b>${fmt(l.outstanding)}</b> <span className="text-white/30">· {l.status}</span></span>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50" disabled={busy} onClick={() => run(() => nb.repayLoan(l.id, l.outstanding), "Loan repaid")}>Repay</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAYROLL */}
          {view === "payroll" && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-lg flex flex-col gap-4">
              <p className="text-[11px] text-white/40">Each salary settles as its own Canton contract, visible only to you and that employee.</p>
              {employees.length > 0 && (
                <div className="flex flex-col gap-2">
                  {employees.map((e) => (
                    <label key={e.id} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-xs cursor-pointer">
                      <span className="flex items-center gap-2"><input type="checkbox" checked={!!sel[e.id]} onChange={(ev) => setSel({ ...sel, [e.id]: ev.target.checked })} /> {e.name} <span className="text-white/30">{e.email}</span></span>
                      <span className="font-bold">${fmt(e.salary)} {e.currency}</span>
                    </label>
                  ))}
                  <button className={btn} disabled={busy || !Object.values(sel).some(Boolean)} onClick={() => run(async () => { const ids = Object.keys(sel).filter((k) => sel[k]); await nb.runPayroll(ids.map((employeeId) => ({ employeeId }))); setSel({}); }, "Payroll run — salaries paid privately")}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />} Run payroll for selected</button>
                </div>
              )}
              <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
                <span className={label}>Add an employee</span>
                <div className="grid grid-cols-3 gap-2">
                  <input className={input + " col-span-2"} value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="Name" />
                  <input className={input} type="number" value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} placeholder="Salary" />
                </div>
                <button className={ghost + " self-start"} disabled={busy || !empName || !empSalary} onClick={() => run(async () => { await nb.addEmployee({ name: empName.trim(), salary: Number(empSalary) }); setEmpName(""); setEmpSalary(""); }, "Employee added")}>+ Add</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <DevDrawer open={dev} onClose={() => setDev(false)} title={TITLES[view]} calls={callsFor[view]} />
    </div>
  );
}
