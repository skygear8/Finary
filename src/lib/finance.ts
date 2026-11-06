import type { InferSelectModel } from "drizzle-orm";
import type { accounts, holdings, properties, loans } from "@/db/schema";

export type Account = InferSelectModel<typeof accounts>;
export type Holding = InferSelectModel<typeof holdings>;
export type Property = InferSelectModel<typeof properties>;
export type Loan = InferSelectModel<typeof loans>;

/** Mensualité hors assurance d'un prêt amortissable à taux fixe. */
export function monthlyPayment(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Nombre d'échéances payées entre la date de début et `at`. */
export function monthsElapsed(startDate: string, at = new Date()) {
  const s = new Date(startDate);
  const m = (at.getFullYear() - s.getFullYear()) * 12 + (at.getMonth() - s.getMonth());
  return Math.max(0, m + (at.getDate() >= s.getDate() ? 1 : 0) - 1);
}

export type AmortRow = { n: number; date: string; payment: number; interest: number; principal: number; remaining: number };

export function amortization(loan: Loan): AmortRow[] {
  const pmt = monthlyPayment(loan.principal, loan.annualRate, loan.durationMonths);
  const r = loan.annualRate / 100 / 12;
  const rows: AmortRow[] = [];
  let remaining = loan.principal;
  const start = new Date(loan.startDate);
  for (let n = 1; n <= loan.durationMonths; n++) {
    const interest = remaining * r;
    const princ = Math.min(pmt - interest, remaining);
    remaining = Math.max(0, remaining - princ);
    const d = new Date(start.getFullYear(), start.getMonth() + n, 1);
    rows.push({ n, date: d.toISOString().slice(0, 7), payment: pmt, interest, principal: princ, remaining });
  }
  return rows;
}

export function loanStatus(loan: Loan, at = new Date()) {
  const rows = amortization(loan);
  const paid = Math.min(monthsElapsed(loan.startDate, at), loan.durationMonths);
  const remaining = paid === 0 ? loan.principal : rows[paid - 1].remaining;
  const pmt = monthlyPayment(loan.principal, loan.annualRate, loan.durationMonths);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const interestPaid = rows.slice(0, paid).reduce((s, r) => s + r.interest, 0);
  const end = rows.at(-1)?.date ?? loan.startDate;
  return {
    payment: pmt,
    paymentWithInsurance: pmt + loan.insuranceMonthly,
    remaining,
    paidMonths: paid,
    remainingMonths: loan.durationMonths - paid,
    totalInterest,
    interestPaid,
    totalCost: totalInterest + loan.insuranceMonthly * loan.durationMonths,
    progressPct: (1 - remaining / loan.principal) * 100,
    endDate: end,
  };
}

export function propertyMetrics(p: Property, propLoans: Loan[]) {
  const share = p.ownershipShare / 100;
  const totalCost = p.purchasePrice + p.notaryFees + p.worksCost;
  const annualRent = p.monthlyRent * 12;
  const effectiveRent = annualRent * (1 - p.vacancyPct / 100);
  const annualExpenses =
    p.monthlyCharges * 12 + p.propertyTax + p.insurance + effectiveRent * (p.managementPct / 100);
  const netIncome = effectiveRent - annualExpenses;
  const statuses = propLoans.map((l) => loanStatus(l));
  const debt = statuses.reduce((s, x) => s + x.remaining, 0);
  const monthlyLoan = statuses.reduce((s, x) => s + x.paymentWithInsurance, 0);
  const annualInterest = propLoans.reduce((s, l) => {
    const st = loanStatus(l);
    const rows = amortization(l).slice(st.paidMonths, st.paidMonths + 12);
    return s + rows.reduce((a, r) => a + r.interest, 0);
  }, 0);
  return {
    totalCost,
    grossYield: totalCost ? (annualRent / totalCost) * 100 : 0,
    netYield: totalCost ? (netIncome / totalCost) * 100 : 0,
    annualRent,
    annualExpenses,
    netIncome,
    monthlyCashflow: netIncome / 12 - monthlyLoan,
    monthlyLoan,
    annualInterest,
    debt: debt * share,
    value: p.currentValue * share,
    equity: (p.currentValue - debt) * share,
    capitalGain: (p.currentValue - totalCost) * share,
    capitalGainPct: totalCost ? ((p.currentValue - totalCost) / totalCost) * 100 : 0,
    pricePerSqm: p.surface ? p.currentValue / p.surface : null,
  };
}

export function holdingValue(h: Holding) {
  return h.quantity * h.currentPrice;
}
export function holdingPnl(h: Holding) {
  const cost = h.quantity * h.avgPrice;
  const value = holdingValue(h);
  return { cost, value, pnl: value - cost, pnlPct: cost ? ((value - cost) / cost) * 100 : 0 };
}
export function accountValue(a: Account, hs: Holding[]) {
  return a.cash + hs.reduce((s, h) => s + holdingValue(h), 0);
}
