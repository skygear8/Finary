"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { csvConnector } from "./connectors/csv";
import { applySync } from "./connectors/sync";
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

/** Import CSV via la couche connecteurs : les positions d'un compte présent dans le fichier sont remplacées. */
export async function importCsv(_prev: ImportResult | null, f: FormData): Promise<ImportResult> {
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Aucun fichier sélectionné." };
  try {
    const accounts = await csvConnector.fetchAccounts(await file.text());
    const r = applySync(csvConnector, accounts);
    refresh();
    return { ok: true, message: `${r.positions} position(s) importée(s), ${r.created} compte(s) créé(s), ${r.updated} mis à jour.` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
