import Link from "next/link";
import { getPortfolio, ACCOUNT_TYPES } from "@/lib/portfolio";
import { createAccount } from "@/lib/actions";
import { Card, Field, PageHeader, Select } from "@/components/ui";
import { fmtEur } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Comptes() {
  const p = getPortfolio();
  const groups = Object.entries(ACCOUNT_TYPES)
    .map(([k, label]) => ({ k, label, rows: p.accountRows.filter((a) => a.type === k) }))
    .filter((g) => g.rows.length);
  const total = p.accountRows.reduce((s, a) => s + a.value, 0);

  return (
    <>
      <PageHeader title="Comptes & placements">
        <span className="text-lg font-semibold">{fmtEur(total)}</span>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {groups.length === 0 && <Card><p className="text-sm text-muted">Aucun compte pour l&apos;instant.</p></Card>}
          {groups.map((g) => (
            <Card key={g.k} title={g.label} action={<span className="text-sm font-medium">{fmtEur(g.rows.reduce((s, a) => s + a.value, 0))}</span>}>
              <ul className="divide-y divide-border text-sm">
                {g.rows.map((a) => (
                  <li key={a.id}>
                    <Link href={`/comptes/${a.id}`} className="flex items-center justify-between py-2 hover:underline">
                      <span>
                        {a.name}
                        <span className="ml-2 text-xs text-muted">{a.institution}{a.holdingsCount ? ` · ${a.holdingsCount} position(s)` : ""}</span>
                      </span>
                      <span className="font-medium">{fmtEur(a.value)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Card title="Ajouter un compte">
          <form action={createAccount} className="space-y-3">
            <Field label="Nom" name="name" placeholder="PEA Boursorama" required />
            <Select label="Type" name="type" options={ACCOUNT_TYPES} />
            <Field label="Établissement" name="institution" />
            <Field label="Liquidités / solde (€)" name="cash" type="number" defaultValue={0} />
            <button className="btn w-full">Créer</button>
          </form>
        </Card>
      </div>
    </>
  );
}
