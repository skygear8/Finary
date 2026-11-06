"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

export const SLICE_COLORS: Record<string, string> = {
  liquidites: "#64748b",
  bourse: "#0f766e",
  assurance: "#7c3aed",
  crypto: "#d97706",
  immobilier: "#2563eb",
  autre: "#9ca3af",
};
const eur = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export function AllocationDonut({ data }: { data: { key: string; label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="100%" stroke="var(--surface)" strokeWidth={2}>
              {data.map((d) => <Cell key={d.key} fill={SLICE_COLORS[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v) => eur(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SLICE_COLORS[d.key] }} />
            <span className="flex-1 whitespace-nowrap">{d.label}</span>
            <span className="whitespace-nowrap text-muted">{((d.value / total) * 100).toFixed(1)} %</span>
            <span className="w-28 text-right font-medium">{eur(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NetWorthChart({ data }: { data: { date: string; net: number }[] }) {
  if (data.length < 2)
    return <p className="text-sm text-muted">L&apos;historique se construit automatiquement : une photo de ton patrimoine est prise chaque jour où tu ouvres l&apos;app.</p>;
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 8, right: 8 }}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${Math.round(v / 1000)} k€`} tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} width={56} />
          <Tooltip formatter={(v) => eur(Number(v))} />
          <Area dataKey="net" name="Patrimoine net" stroke="var(--accent)" fill="url(#g)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AmortizationChart({ data }: { data: { year: string; interest: number; principal: number; remaining: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${Math.round(v / 1000)} k€`} tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} width={56} />
          <Tooltip formatter={(v) => eur(Number(v))} />
          <Area dataKey="remaining" name="Capital restant dû" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
