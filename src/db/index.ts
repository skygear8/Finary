import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const file = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "socle.db");
fs.mkdirSync(path.dirname(file), { recursive: true });

const globalForDb = globalThis as unknown as { sqlite?: Database.Database };
const sqlite = globalForDb.sqlite ?? new Database(file);
if (!globalForDb.sqlite) {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL,
      institution TEXT, cash REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL, ticker TEXT, asset_class TEXT NOT NULL, quantity REAL NOT NULL,
      avg_price REAL NOT NULL, current_price REAL NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL, address TEXT,
      surface REAL, purchase_date TEXT, purchase_price REAL NOT NULL, notary_fees REAL NOT NULL DEFAULT 0,
      works_cost REAL NOT NULL DEFAULT 0, current_value REAL NOT NULL, ownership_share REAL NOT NULL DEFAULT 100,
      monthly_rent REAL NOT NULL DEFAULT 0, monthly_charges REAL NOT NULL DEFAULT 0,
      property_tax REAL NOT NULL DEFAULT 0, insurance REAL NOT NULL DEFAULT 0,
      management_pct REAL NOT NULL DEFAULT 0, vacancy_pct REAL NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      name TEXT NOT NULL, principal REAL NOT NULL, annual_rate REAL NOT NULL,
      duration_months INTEGER NOT NULL, start_date TEXT NOT NULL, insurance_monthly REAL NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS snapshots (date TEXT PRIMARY KEY, assets REAL NOT NULL, debts REAL NOT NULL);
  `);
  // Migrations légères : ajoute les colonnes manquantes sur une base existante.
  const addColumn = (table: string, col: string, def: string) => {
    const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === col)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  };
  addColumn("accounts", "source", "TEXT NOT NULL DEFAULT 'manual'");
  addColumn("accounts", "external_id", "TEXT");
  addColumn("accounts", "last_synced_at", "TEXT");
  addColumn("holdings", "external_id", "TEXT");
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { schema };
