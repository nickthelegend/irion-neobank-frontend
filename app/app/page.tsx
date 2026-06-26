"use client";

import { Loader2 } from "lucide-react";
import { NeobankAuthProvider, useNeobank } from "@/components/neobank/auth";
import Login from "@/components/neobank/Login";
import Dashboard from "@/components/Dashboard";

function Gate() {
  const { account, loading } = useNeobank();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  return account ? <Dashboard /> : <Login />;
}

export default function Page() {
  return (
    <NeobankAuthProvider>
      <Gate />
    </NeobankAuthProvider>
  );
}
