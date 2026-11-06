import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { ACCOUNT_TYPES, ASSET_CLASSES } from "@/db/schema";
import { accountValue, holdingPnl } from "@/lib/finance";
import { createHolding, deleteAccount, deleteHolding, updateAccount, updateHoldingPrice } from "@/lib/actions";
import { Card, Field, Kpi, PageHeader, Select } from "@/components/ui";
import { fmtEur, fmtEur2, fmtPct, signClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Compte({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const a = db.select().from(schema.accounts).where(eq(schema.accounts.id, id)).get();
  if (!a) notFound();
  const hs = db.select().from(schema.holdings).where(eq(schema.holdings.accountId, id)).all();
  const value = accountValue(a, hs);
  const invested = hs.reduce((s, h) => s + holdingPnl(h).cost, 0);
  const pnl = hs.reduce((s, h) => s + holdingPnl(h).pnl, 0);
  const hasPositions = !["courant", "livret"].includes(a.type);

  return (
    <>
      <Link href="/comptes" className="text-xs text-muted">← Comptes</Link>
      <PageHeader title={a.name}>
        <span className="text-sm text-muted">{ACCOUNT_TYPES[a.type]} {a.institution && `· ${a.institution}`}
          {a.source !== "manual" && ` · source ${a.source.toUpperCase()}`}
          {a.lastSyncedAt && `, mis à jour le ${new Date(a.lastSyncedAt).toLocaleDateString("fr-FR")}`}</span>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Valeur totale" value={fmtEur(value)} />
        <Kpi label="Liquidités" value={fmtEur(a.cash)} />
        {hasPositions && <Kpi label="Investi (PRU)" value={fmtEur(invested)} />}
        {hasPositions && <Kpi label="Plus-value latente" value={fmtEur(pnl)} tone={pnl} sub={invested ? fmtPct((pnl / invested) * 100) : undefined} />}
      </div>

      {hasPositions && (
        <Card title="Positions" className="mt-4">
          {hs.length === 0 ? <p className="text-sm text-muted">Aucune position.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr><th className="py-2">Nom</th><th>Quantité</th><th>PRU</th><th>Cours</th><th className="text-right">Valeur</th><th className="text-right">+/- value</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hs.map((h) => {
                    const x = holdingPnl(h);
                    return (
                      <tr key={h.id}>
                        <td className="py-2">{h.name}<div className="text-xs text-muted">{h.ticker} · {ASSET_CLASSES[h.assetClass as keyof typeof ASSET_CLASSES] ?? h.assetClass}</div></td>
                        <td colSpan={3}>
                          <form action={updateHoldingPrice.bind(null, h.id)} className="flex items-center gap-2">
                            <input className="input w-24" name="quantity" defaultValue={h.quantity} />
                            <span className="w-24 text-muted">{fmtEur2(h.avgPrice)}</span>
                            <input className="input w-24" name="currentPrice" defaultValue={h.currentPrice} />
                            <button className="btn-ghost" title="Mettre à jour">↻</button>
                          </form>
                        </td>
                        <td className="text-right font-medium">{fmtEur(x.value)}</td>
                        <td className={`text-right ${signClass(x.pnl)}`}>{fmtEur(x.pnl)}<div className="text-xs">{fmtPct(x.pnlPct)}</div></td>
                        <td className="pl-2 text-right">
                          <form action={deleteHolding.bind(null, h.id)}><button className="text-xs text-muted hover:text-rose-600">✕</button></form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {hasPositions && (
          <Card title="Ajouter une position">
            <form action={createHolding.bind(null, a.id)} className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label="Nom" name="name" placeholder="MSCI World" required /></div>
              <Field label="Ticker / ISIN" name="ticker" />
              <Select label="Classe" name="assetClass" options={ASSET_CLASSES} defaultValue={a.type === "crypto" ? "crypto" : "etf"} />
              <Field label="Quantité" name="quantity" type="number" required />
              <Field label="PRU (€)" name="avgPrice" type="number" required />
              <Field label="Cours actuel (€)" name="currentPrice" type="number" />
              <div className="flex items-end"><button className="btn w-full">Ajouter</button></div>
            </form>
          </Card>
        )}
        <Card title="Modifier le compte">
          <form action={updateAccount.bind(null, a.id)} className="grid grid-cols-2 gap-3">
            <Field label="Nom" name="name" defaultValue={a.name} />
            <Select label="Type" name="type" options={ACCOUNT_TYPES} defaultValue={a.type} />
            <Field label="Établissement" name="institution" defaultValue={a.institution} />
            <Field label="Liquidités / solde (€)" name="cash" type="number" defaultValue={a.cash} />
            <button className="btn">Enregistrer</button>
          </form>
          <form action={deleteAccount.bind(null, a.id)} className="mt-3"><button className="btn-danger">Supprimer le compte</button></form>
        </Card>
      </div>
    </>
  );
}
