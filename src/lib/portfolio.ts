import { db, schema } from "@/db";
import { ACCOUNT_TYPES, PROPERTY_TYPES } from "@/db/schema";
import { accountValue, loanStatus, propertyMetrics } from "./finance";

export type AllocationSlice = { key: string; label: string; value: number };

/** Vue d'ensemble : tout le calcul du patrimoine passe par ici. */
export function getPortfolio() {
  const accs = db.select().from(schema.accounts).all();
  const hs = db.select().from(schema.holdings).all();
  const props = db.select().from(schema.properties).all();
  const ls = db.select().from(schema.loans).all();

  const accountRows = accs.map((a) => {
    const own = hs.filter((h) => h.accountId === a.id);
    return { ...a, value: accountValue(a, own), holdingsCount: own.length };
  });
  const propertyRows = props.map((p) => ({ ...p, m: propertyMetrics(p, ls.filter((l) => l.propertyId === p.id)) }));
  const standaloneLoans = ls.filter((l) => l.propertyId == null).map((l) => ({ ...l, s: loanStatus(l) }));

  const byType = new Map<string, number>();
  for (const a of accountRows) byType.set(a.type, (byType.get(a.type) ?? 0) + a.value);

  const allocation: AllocationSlice[] = [
    { key: "liquidites", label: "Liquidités", value: (byType.get("courant") ?? 0) + (byType.get("livret") ?? 0) },
    { key: "bourse", label: "Bourse", value: (byType.get("pea") ?? 0) + (byType.get("cto") ?? 0) },
    { key: "assurance", label: "Assurance-vie / PER", value: (byType.get("assurance_vie") ?? 0) + (byType.get("per") ?? 0) },
    { key: "crypto", label: "Crypto", value: byType.get("crypto") ?? 0 },
    { key: "immobilier", label: "Immobilier", value: propertyRows.reduce((s, p) => s + p.m.value, 0) },
    { key: "autre", label: "Autre", value: byType.get("autre") ?? 0 },
  ].filter((s) => s.value > 0);

  const assets = allocation.reduce((s, x) => s + x.value, 0);
  const debts =
    propertyRows.reduce((s, p) => s + p.m.debt, 0) + standaloneLoans.reduce((s, l) => s + l.s.remaining, 0);

  return { accountRows, propertyRows, standaloneLoans, allocation, assets, debts, net: assets - debts };
}

/** Enregistre une photo du jour pour l'historique (une par jour, écrasée). */
export function recordSnapshot(assets: number, debts: number) {
  const date = new Date().toISOString().slice(0, 10);
  db.insert(schema.snapshots)
    .values({ date, assets, debts })
    .onConflictDoUpdate({ target: schema.snapshots.date, set: { assets, debts } })
    .run();
}

export function getHistory() {
  return db.select().from(schema.snapshots).orderBy(schema.snapshots.date).all();
}

export { ACCOUNT_TYPES, PROPERTY_TYPES };
