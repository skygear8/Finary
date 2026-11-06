"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Papa from "papaparse";
import { db, schema } from "@/db";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};
const num = (f: FormData, k: string, def = 0) => {
  const v = str(f, k);
  if (v == null) return def;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : def;
};
const now = () => new Date().toISOString();

function refresh() {
  revalidatePath("/", "layout");
}

/* ---------- Comptes ---------- */
export async function createAccount(f: FormData) {
  const row = db
    .insert(schema.accounts)
    .values({
      name: str(f, "name") ?? "Nouveau compte",
      type: (str(f, "type") ?? "courant") as never,
      institution: str(f, "institution"),
      cash: num(f, "cash"),
      createdAt: now(),
    })
    .returning()
    .get();
  refresh();
  redirect(`/comptes/${row.id}`);
}

export async function updateAccount(id: number, f: FormData) {
  db.update(schema.accounts)
    .set({ name: str(f, "name") ?? "Compte", institution: str(f, "institution"), cash: num(f, "cash"), type: (str(f, "type") ?? "courant") as never })
    .where(eq(schema.accounts.id, id))
    .run();
  refresh();
}

export async function deleteAccount(id: number) {
  db.delete(schema.accounts).where(eq(schema.accounts.id, id)).run();
  refresh();
  redirect("/comptes");
}

/* ---------- Positions ---------- */
export async function createHolding(accountId: number, f: FormData) {
  const avg = num(f, "avgPrice");
  db.insert(schema.holdings)
    .values({
      accountId,
      name: str(f, "name") ?? "Position",
      ticker: str(f, "ticker"),
      assetClass: str(f, "assetClass") ?? "etf",
      quantity: num(f, "quantity"),
      avgPrice: avg,
      currentPrice: num(f, "currentPrice", avg),
      updatedAt: now(),
    })
    .run();
  refresh();
}

export async function updateHoldingPrice(id: number, f: FormData) {
  db.update(schema.holdings)
    .set({ currentPrice: num(f, "currentPrice"), quantity: num(f, "quantity"), updatedAt: now() })
    .where(eq(schema.holdings.id, id))
    .run();
  refresh();
}

export async function deleteHolding(id: number) {
  db.delete(schema.holdings).where(eq(schema.holdings.id, id)).run();
  refresh();
}

/* ---------- Immobilier ---------- */
function propertyValues(f: FormData) {
  const price = num(f, "purchasePrice");
  return {
    name: str(f, "name") ?? "Bien",
    type: str(f, "type") ?? "locatif",
    address: str(f, "address"),
    surface: str(f, "surface") ? num(f, "surface") : null,
    purchaseDate: str(f, "purchaseDate"),
    purchasePrice: price,
    notaryFees: num(f, "notaryFees"),
    worksCost: num(f, "worksCost"),
    currentValue: num(f, "currentValue", price),
    ownershipShare: num(f, "ownershipShare", 100),
    monthlyRent: num(f, "monthlyRent"),
    monthlyCharges: num(f, "monthlyCharges"),
    propertyTax: num(f, "propertyTax"),
    insurance: num(f, "insurance"),
    managementPct: num(f, "managementPct"),
    vacancyPct: num(f, "vacancyPct"),
  };
}

export async function createProperty(f: FormData) {
  const row = db.insert(schema.properties).values(propertyValues(f)).returning().get();
  refresh();
  redirect(`/immobilier/${row.id}`);
}

export async function updateProperty(id: number, f: FormData) {
  db.update(schema.properties).set(propertyValues(f)).where(eq(schema.properties.id, id)).run();
  refresh();
}

export async function deleteProperty(id: number) {
  db.delete(schema.properties).where(eq(schema.properties.id, id)).run();
  refresh();
  redirect("/immobilier");
}

/* ---------- Prêts ---------- */
export async function createLoan(propertyId: number | null, f: FormData) {
  db.insert(schema.loans)
    .values({
      propertyId,
      name: str(f, "name") ?? "Prêt",
      principal: num(f, "principal"),
      annualRate: num(f, "annualRate"),
      durationMonths: Math.round(num(f, "durationYears", 20) * 12),
      startDate: str(f, "startDate") ?? now().slice(0, 10),
      insuranceMonthly: num(f, "insuranceMonthly"),
    })
    .run();
  refresh();
}

export async function deleteLoan(id: number) {
  db.delete(schema.loans).where(eq(schema.loans.id, id)).run();
  refresh();
}

/* ---------- Import CSV ---------- */
export type ImportResult = { ok: boolean; message: string };

/**
 * Colonnes attendues (séparateur , ou ;) :
 * compte;type_compte;nom;ticker;classe;quantite;pru;cours
 * Une ligne sans nom de position met à jour les liquidités du compte (colonne cours = solde).
 */
export async function importCsv(_prev: ImportResult | null, f: FormData): Promise<ImportResult> {
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Aucun fichier sélectionné." };
  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  if (parsed.errors.length) return { ok: false, message: `CSV illisible : ${parsed.errors[0].message}` };

  const n = (v?: string) => Number((v ?? "0").replace(/\s/g, "").replace(",", ".")) || 0;
  let positions = 0;
  let created = 0;
  db.transaction((tx) => {
    for (const r of parsed.data) {
      const accName = r["compte"]?.trim();
      if (!accName) continue;
      let acc = tx.select().from(schema.accounts).where(eq(schema.accounts.name, accName)).get();
      if (!acc) {
        acc = tx
          .insert(schema.accounts)
          .values({ name: accName, type: (r["type_compte"]?.trim() || "cto") as never, cash: 0, createdAt: now() })
          .returning()
          .get();
        created++;
      }
      const name = r["nom"]?.trim();
      if (!name) {
        tx.update(schema.accounts).set({ cash: n(r["cours"]) }).where(eq(schema.accounts.id, acc.id)).run();
        continue;
      }
      tx.insert(schema.holdings)
        .values({
          accountId: acc.id,
          name,
          ticker: r["ticker"]?.trim() || null,
          assetClass: r["classe"]?.trim() || "etf",
          quantity: n(r["quantite"]),
          avgPrice: n(r["pru"]),
          currentPrice: n(r["cours"]) || n(r["pru"]),
          updatedAt: now(),
        })
        .run();
      positions++;
    }
  });
  refresh();
  return { ok: true, message: `${positions} position(s) importée(s), ${created} compte(s) créé(s).` };
}
