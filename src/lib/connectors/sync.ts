import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Connector, ExternalAccount } from "./types";

export type SyncReport = { created: number; updated: number; positions: number };

/** Fusionne les comptes renvoyés par un connecteur avec la base locale. */
export function applySync(connector: Connector, accounts: ExternalAccount[]): SyncReport {
  const now = new Date().toISOString();
  const report: SyncReport = { created: 0, updated: 0, positions: 0 };
  db.transaction((tx) => {
    for (const ext of accounts) {
      const match = ext.externalId
        ? and(eq(schema.accounts.source, connector.id), eq(schema.accounts.externalId, ext.externalId))
        : eq(schema.accounts.name, ext.name);
      let acc = tx.select().from(schema.accounts).where(match).get();
      if (!acc) {
        acc = tx.insert(schema.accounts).values({
          name: ext.name, type: ext.type, institution: ext.institution ?? null, cash: ext.cash ?? 0,
          createdAt: now, source: connector.id, externalId: ext.externalId ?? null, lastSyncedAt: now,
        }).returning().get();
        report.created++;
      } else {
        tx.update(schema.accounts).set({
          cash: ext.cash ?? acc.cash, lastSyncedAt: now,
          institution: ext.institution ?? acc.institution,
        }).where(eq(schema.accounts.id, acc.id)).run();
        report.updated++;
      }
      if (ext.holdings) {
        tx.delete(schema.holdings).where(eq(schema.holdings.accountId, acc.id)).run();
        for (const h of ext.holdings) {
          tx.insert(schema.holdings).values({ ...h, ticker: h.ticker ?? null, externalId: h.externalId ?? null, accountId: acc.id, updatedAt: now }).run();
          report.positions++;
        }
      }
    }
  });
  return report;
}
