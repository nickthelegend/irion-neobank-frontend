import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian — banking, built on Irion",
  description: "A reference neobank on the Canton Network, powered by the Irion B2B API: treasury, FX, private payroll, and lending.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-display bg-background text-foreground antialiased min-h-dvh">{children}</body>
    </html>
  );
}
