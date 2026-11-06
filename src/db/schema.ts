import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";

export const ACCOUNT_TYPES = {
  courant: "Compte courant",
  livret: "Livret / épargne",
  pea: "PEA",
  cto: "Compte-titres",
  assurance_vie: "Assurance-vie",
  per: "PER",
  crypto: "Crypto",
  autre: "Autre",
} as const;
export type AccountType = keyof typeof ACCOUNT_TYPES;

export const ASSET_CLASSES = {
  action: "Action",
  etf: "ETF",
  fonds: "Fonds / OPCVM",
  obligation: "Obligation",
  crypto: "Crypto",
  fonds_euro: "Fonds euros",
  autre: "Autre",
} as const;

export const PROPERTY_TYPES = {
  residence_principale: "Résidence principale",
  locatif: "Locatif",
  secondaire: "Résidence secondaire",
  scpi: "SCPI",
} as const;

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull().$type<AccountType>(),
  institution: text("institution"),
  cash: real("cash").notNull().default(0), // liquidités du compte
  createdAt: text("created_at").notNull(),
});

export const holdings = sqliteTable("holdings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ticker: text("ticker"),
  assetClass: text("asset_class").notNull(),
  quantity: real("quantity").notNull(),
  avgPrice: real("avg_price").notNull(), // PRU
  currentPrice: real("current_price").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  address: text("address"),
  surface: real("surface"),
  purchaseDate: text("purchase_date"),
  purchasePrice: real("purchase_price").notNull(),
  notaryFees: real("notary_fees").notNull().default(0),
  worksCost: real("works_cost").notNull().default(0),
  currentValue: real("current_value").notNull(),
  ownershipShare: real("ownership_share").notNull().default(100), // %
  monthlyRent: real("monthly_rent").notNull().default(0),
  monthlyCharges: real("monthly_charges").notNull().default(0), // copro non récupérables
  propertyTax: real("property_tax").notNull().default(0), // taxe foncière annuelle
  insurance: real("insurance").notNull().default(0), // PNO annuelle
  managementPct: real("management_pct").notNull().default(0), // % des loyers
  vacancyPct: real("vacancy_pct").notNull().default(0), // % vacance locative
});

export const loans = sqliteTable("loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  principal: real("principal").notNull(),
  annualRate: real("annual_rate").notNull(), // %
  durationMonths: integer("duration_months").notNull(),
  startDate: text("start_date").notNull(),
  insuranceMonthly: real("insurance_monthly").notNull().default(0),
});

export const snapshots = sqliteTable("snapshots", {
  date: text("date").primaryKey(), // YYYY-MM-DD
  assets: real("assets").notNull(),
  debts: real("debts").notNull(),
});
