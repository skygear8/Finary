// Données de démonstration fictives : `npm run seed` (efface la base).
import { db, schema } from "../src/db";

const now = new Date().toISOString();
db.delete(schema.loans).run();
db.delete(schema.holdings).run();
db.delete(schema.properties).run();
db.delete(schema.accounts).run();
db.delete(schema.snapshots).run();

const acc = (name: string, type: string, institution: string, cash: number) =>
  db.insert(schema.accounts).values({ name, type: type as never, institution, cash, createdAt: now }).returning().get();

acc("Compte joint", "courant", "Banque A", 3200);
acc("Livret A", "livret", "Banque A", 22950);
acc("LDDS", "livret", "Banque A", 12000);
const pea = acc("PEA", "pea", "Courtier B", 640);
const av = acc("Assurance-vie", "assurance_vie", "Assureur C", 0);
const cr = acc("Portefeuille crypto", "crypto", "Wallet", 0);

const h = (accountId: number, name: string, ticker: string, assetClass: string, quantity: number, avgPrice: number, currentPrice: number) =>
  db.insert(schema.holdings).values({ accountId, name, ticker, assetClass, quantity, avgPrice, currentPrice, updatedAt: now }).run();

h(pea.id, "ETF MSCI World", "CW8", "etf", 38, 410, 548.2);
h(pea.id, "ETF S&P 500", "ESE", "etf", 520, 21.4, 27.9);
h(pea.id, "Action luxe", "MC", "action", 6, 690, 612);
h(av.id, "Fonds euros", "", "fonds_euro", 1, 18000, 18740);
h(av.id, "Fonds actions monde", "", "fonds", 120, 95, 118.6);
h(cr.id, "Bitcoin", "BTC", "crypto", 0.085, 31000, 88000);
h(cr.id, "Ether", "ETH", "crypto", 1.6, 1900, 3100);

const rp = db.insert(schema.properties).values({
  name: "Appartement résidence principale", type: "residence_principale", address: "Nantes", surface: 68,
  purchaseDate: "2021-06-15", purchasePrice: 265000, notaryFees: 19500, worksCost: 8000, currentValue: 284000,
  ownershipShare: 50,
}).returning().get();
db.insert(schema.loans).values({ propertyId: rp.id, name: "Prêt RP", principal: 245000, annualRate: 1.25, durationMonths: 300, startDate: "2021-07-05", insuranceMonthly: 38 }).run();

const loc = db.insert(schema.properties).values({
  name: "Studio locatif", type: "locatif", address: "Rennes", surface: 24,
  purchaseDate: "2023-03-01", purchasePrice: 112000, notaryFees: 8900, worksCost: 6500, currentValue: 118000,
  ownershipShare: 100, monthlyRent: 560, monthlyCharges: 45, propertyTax: 620, insurance: 110, managementPct: 7, vacancyPct: 4,
}).returning().get();
db.insert(schema.loans).values({ propertyId: loc.id, name: "Prêt locatif", principal: 120000, annualRate: 3.6, durationMonths: 240, startDate: "2023-03-10", insuranceMonthly: 18 }).run();

// Historique fictif sur 12 mois pour la courbe
for (let i = 12; i >= 1; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  const assets = 360000 + (12 - i) * 2400 + Math.sin(i) * 3000;
  db.insert(schema.snapshots).values({ date: d.toISOString().slice(0, 10), assets, debts: 222000 - (12 - i) * 850 }).run();
}
console.log("Données de démonstration chargées.");
