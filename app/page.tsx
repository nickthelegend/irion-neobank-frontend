import Link from "next/link";
import { ArrowRight, Repeat, Users, Landmark, Wallet, ShieldCheck, Code } from "lucide-react";

export default function Landing() {
  return (
    <div className="font-display relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/15 blur-[130px]" />
      </div>

      <header className="relative max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary" /></div>
          <span className="font-black tracking-tight text-lg">Meridian</span>
        </div>
        <Link href="/app" className="inline-flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.03] transition-all">
          Open app <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-widest uppercase">
            <ShieldCheck className="w-3 h-3" /> Built on Irion · Canton
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95]">
            Business banking,<br /><span className="text-primary">private by construction.</span>
          </h1>
          <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md">
            Meridian is a reference neobank built entirely on the <span className="text-white/80 font-bold">Irion B2B API</span>.
            Hold multi-currency treasury, swap FX, run private payroll, and borrow working capital — all settled on the Canton ledger,
            visible only to you.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary text-black px-7 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.03] transition-all">
              Open the app <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-[11px] text-white/40 inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/60" /> Sign in with a passkey — no password</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Wallet, title: "Multi-currency treasury", desc: "Hold USDC, EURC, GBPC. Idle cash earns yield." },
            { icon: Repeat, title: "FX in one tap", desc: "Convert between currencies, settled atomically on-ledger." },
            { icon: Users, title: "Private payroll", desc: "Each salary is its own contract — no one sees another's pay." },
            { icon: Landmark, title: "Working capital", desc: "Borrow against an on-ledger underwritten credit line." },
          ].map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-3"><f.icon className="w-4 h-4" /></div>
              <div className="font-bold text-sm">{f.title}</div>
              <div className="text-[11px] text-white/40 mt-1 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><Code className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold">Every screen is just an Irion API call.</h3>
              <p className="text-xs text-white/50 mt-1 max-w-xl leading-relaxed">
                Meridian holds no ledger logic of its own — it's a thin client over <code className="text-primary/80">irion-b2b-api</code>.
                Open the in-app <span className="text-white/80 font-semibold">Developer</span> drawer to see the exact REST calls behind each action.
              </p>
            </div>
          </div>
          <Link href="/app" className="shrink-0 inline-flex items-center gap-2 border border-primary/40 text-primary px-5 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-primary/10 transition-all">
            See it live <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-center text-[10px] text-white/25 uppercase tracking-[0.3em] mt-10">Meridian · a reference neobank · powered by Irion on Canton</p>
      </section>
    </div>
  );
}
