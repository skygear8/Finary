const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 6 });

export const fmtEur = (v: number) => eur.format(v);
export const fmtEur2 = (v: number) => eur2.format(v);
export const fmtNum = (v: number) => num.format(v);
export const fmtPct = (v: number, digits = 2) =>
  `${v >= 0 ? "" : "−"}${Math.abs(v).toLocaleString("fr-FR", { maximumFractionDigits: digits, minimumFractionDigits: digits })} %`;
export const signClass = (v: number) => (v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
