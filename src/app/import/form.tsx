"use client";
import { useActionState } from "react";
import { importCsv } from "@/lib/actions";

export function ImportForm() {
  const [state, action, pending] = useActionState(importCsv, null);
  return (
    <form action={action} className="space-y-3">
      <input type="file" name="file" accept=".csv,text/csv" className="input" />
      <button className="btn" disabled={pending}>{pending ? "Import…" : "Importer"}</button>
      {state && <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>}
    </form>
  );
}
