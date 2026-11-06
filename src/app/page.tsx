import Link from "next/link";
import { getPortfolio, getHistory, recordSnapshot, ACCOUNT_TYPES } from "@/lib/portfolio";
import { Card, Kpi, PageHeader } from "@/components/ui";
import { AllocationDonut, NetWorthChart } from "@/components/charts";
import { fmtEur, fmtPct, signClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const p = getPortfolio();
  if (p.assets > 0) recordSnapshot(p.assets, p.debts);
  const history = getHistory().map((h) => ({ date: h.date, net: h.assets - h.debts }));
  const monthlyCashflow = p.propertyRows.filter((x) => x.type !== "residence_principale").reduce((s, x) => s + x.m.monthlyCashflow, 0);
  const rent = p.propertyRows.reduce((s, x) => s + x.m.annualRent, 0);

  if (p.assets === 0 && p.debts === 0)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-semibold">Bienvenue sur Socle</h1>
        <p className="mt-2 text-muted">Ajoute un premier compte ou un bien immobilier pour voir ton patrimoine.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn" href="/comptes">Ajouter un compte</Link>
          <Link className="btn-ghost" href="/immobilier">Ajouter un bien</Link>
        </div>
        <p className="mt-6 text-xs text-muted">Astuce : <code>npm run seed</code> charge des données de démonstration.</p>
      </div>
    );

  return (
    <>
      <PageHeader title="Synthèse" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Patrimoine net" value={fmtEur(p.net)} />
        <Kpi label="Patrimoine brut" value={fmtEur(p.assets)} />
        <Kpi label="Dettes" value={fmtEur(p.debts)} sub={p.assets ? `Endettement ${fmtPct((p.debts / p.assets) * 100, 1)}` : undefined} />
        <Kpi label="Cash-flow locatif / mois" value={fmtEur(monthlyCashflow)} tone={monthlyCashflow} sub={`Loyers ${fmtEur(rent)} / an`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card title="Répartition" className="lg:col-span-3">
          <AllocationDonut data={p.allocation} />
        </Card>
        <Card title="Évolution du patrimoine net" className="lg:col-span-2">
          <NetWorthChart data={history} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Comptes" action={<Link href="/comptes" className="text-xs text-accent">Tout voir</Link>}>
          <ul className="divide-y divide-border text-sm">
            {[...p.accountRows].sort((a, b) => b.value - a.value).slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <Link href={`/comptes/${a.id}`} className="hover:underline">
                  {a.name} <span className="text-xs text-muted">· {ACCOUNT_TYPES[a.type]}</span>
                </Link>
                <span className="font-medium">{fmtEur(a.value)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Immobilier" action={<Link href="/immobilier" className="text-xs text-accent">Tout voir</Link>}>
          <ul className="divide-y divide-border text-sm">
            {p.propertyRows.map((x) => (
              <li key={x.id} className="flex items-center justify-between py-2">
                <Link href={`/immobilier/${x.id}`} className="hover:underline">{x.name}</Link>
                <span className="text-right">
                  <span className="font-medium">{fmtEur(x.m.equity)}</span>
                  <span className="ml-2 text-xs text-muted">net de crédit</span>
                  {x.m.annualRent > 0 && <span className={`ml-2 text-xs ${signClass(x.m.netYield)}`}>{fmtPct(x.m.netYield)} net</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
