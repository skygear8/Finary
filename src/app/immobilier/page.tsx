import Link from "next/link";
import { getPortfolio, PROPERTY_TYPES } from "@/lib/portfolio";
import { createProperty } from "@/lib/actions";
import { Card, Kpi, PageHeader } from "@/components/ui";
import { PropertyFields } from "@/components/property-form";
import { fmtEur, fmtPct, signClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Immobilier() {
  const { propertyRows: rows } = getPortfolio();
  const value = rows.reduce((s, r) => s + r.m.value, 0);
  const debt = rows.reduce((s, r) => s + r.m.debt, 0);
  const cf = rows.reduce((s, r) => s + r.m.monthlyCashflow, 0);
  const rent = rows.reduce((s, r) => s + r.m.annualRent, 0);

  return (
    <>
      <PageHeader title="Immobilier" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Valeur (quote-part)" value={fmtEur(value)} />
        <Kpi label="Capital restant dû" value={fmtEur(debt)} />
        <Kpi label="Valeur nette" value={fmtEur(value - debt)} />
        <Kpi label="Cash-flow mensuel" value={fmtEur(cf)} tone={cf} sub={`Loyers bruts ${fmtEur(rent)} / an`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {rows.length === 0 && <Card><p className="text-sm text-muted">Aucun bien pour l&apos;instant.</p></Card>}
          {rows.map((r) => (
            <Link key={r.id} href={`/immobilier/${r.id}`} className="block rounded-2xl border border-border bg-surface p-5 hover:border-accent">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted">{PROPERTY_TYPES[r.type as keyof typeof PROPERTY_TYPES]}{r.address && ` · ${r.address}`}{r.surface && ` · ${r.surface} m²`}</div>
                </div>
                <div className="text-lg font-semibold">{fmtEur(r.m.value)}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div><div className="text-muted">Restant dû</div><div className="font-medium">{fmtEur(r.m.debt)}</div></div>
                <div><div className="text-muted">Plus-value latente</div><div className={`font-medium ${signClass(r.m.capitalGain)}`}>{fmtEur(r.m.capitalGain)}</div></div>
                <div><div className="text-muted">Rendement brut / net</div><div className="font-medium">{r.m.annualRent ? `${fmtPct(r.m.grossYield)} / ${fmtPct(r.m.netYield)}` : "—"}</div></div>
                <div><div className="text-muted">Cash-flow / mois</div><div className={`font-medium ${signClass(r.m.monthlyCashflow)}`}>{fmtEur(r.m.monthlyCashflow)}</div></div>
              </div>
            </Link>
          ))}
        </div>
        <Card title="Ajouter un bien">
          <form action={createProperty} className="space-y-4">
            <PropertyFields />
            <button className="btn w-full">Créer le bien</button>
          </form>
        </Card>
      </div>
    </>
  );
}
