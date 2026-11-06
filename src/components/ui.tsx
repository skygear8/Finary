import { signClass } from "@/lib/format";

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold text-muted">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tone !== undefined ? signClass(tone) : ""}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Field({ label, name, type = "text", defaultValue, step, placeholder, required }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null; step?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input className="input mt-1 text-foreground" name={name} type={type} step={step ?? (type === "number" ? "any" : undefined)}
        defaultValue={defaultValue ?? undefined} placeholder={placeholder} required={required} />
    </label>
  );
}

export function Select({ label, name, options, defaultValue }: { label: string; name: string; options: Record<string, string>; defaultValue?: string }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <select className="input mt-1 text-foreground" name={name} defaultValue={defaultValue}>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
