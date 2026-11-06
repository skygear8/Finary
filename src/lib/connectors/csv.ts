import Papa from "papaparse";
import type { AccountType } from "@/db/schema";
import type { Connector, ExternalAccount } from "./types";

const n = (v?: string) => Number((v ?? "0").replace(/\s/g, "").replace(",", ".")) || 0;

/**
 * Colonnes : compte;type_compte;nom;ticker;classe;quantite;pru;cours
 * Une ligne sans `nom` fixe les liquidités du compte (colonne cours).
 */
export const csvConnector: Connector = {
  id: "csv",
  label: "Import CSV",
  async fetchAccounts(input) {
    const parsed = Papa.parse<Record<string, string>>(String(input ?? ""), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });
    if (parsed.errors.length) throw new Error(`CSV illisible : ${parsed.errors[0].message}`);
    const byName = new Map<string, ExternalAccount>();
    for (const r of parsed.data) {
      const name = r["compte"]?.trim();
      if (!name) continue;
      const acc = byName.get(name) ?? { name, type: (r["type_compte"]?.trim() || "cto") as AccountType };
      byName.set(name, acc);
      const pos = r["nom"]?.trim();
      if (!pos) {
        acc.cash = n(r["cours"]);
        continue;
      }
      (acc.holdings ??= []).push({
        name: pos,
        ticker: r["ticker"]?.trim() || null,
        assetClass: r["classe"]?.trim() || "etf",
        quantity: n(r["quantite"]),
        avgPrice: n(r["pru"]),
        currentPrice: n(r["cours"]) || n(r["pru"]),
      });
    }
    return [...byName.values()];
  },
};
