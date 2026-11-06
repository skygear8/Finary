import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PROPERTY_TYPES } from "@/db/schema";
import { amortization, loanStatus, propertyMetrics } from "@/lib/finance";
import { createLoan, deleteLoan, deleteProperty, updateProperty } from "@/lib/actions";
import { Card, Field, Kpi, PageHeader } from "@/components/ui";
import { PropertyFields } from "@/components/property-form";
import { AmortizationChart } from "@/components/charts";
import { fmtEur, fmtEur2, fmtPct, signClass } from "@/lib/format";

export const dynamic = "force-dynamic";

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: number }) {
  return (
    <div className={`flex justify-between py-1.5 text-sm ${strong ? "font-semibold" : ""}`}>
      <span className={strong ? "" : "text-muted"}>{label}</span>
      <span className={tone !== undefined ? signClass(tone) : ""}>{value}</span>
    </div>
  );
}

export default async function Bien({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const p = db.select().from(schema.properties).where(eq(schema.properties.id, id)).get();
  if (!p) notFound();
  const ls = db.select().from(schema.loans).where(eq(schema.loans.propertyId, id)).all();
  const m = propertyMetrics(p, ls);
  const effectiveRent = m.annualRent * (1 - p.vacancyPct / 100);

  return (
    <>
      <Link href="/immobilier" className="text-xs text-muted">← Immobilier</Link>
      <PageHeader title={p.name}>
        <span className="text-sm text-muted">
          {PROPERTY_TYPES[p.type as keyof typeof PROPERTY_TYPES]}
          {p.ownershipShare < 100 && ` · détenu à ${p.ownershipShare} %`}
          {m.pricePerSqm && ` · ${fmtEur(m.pricePerSqm)}/m²`}
        </span>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Valeur estimée" value={fmtEur(m.value)} sub={p.ownershipShare < 100 ? `100 % : ${fmtEur(p.currentValue)}` : undefined} />
        <Kpi label="Valeur nette de crédit" value={fmtEur(m.equity)} />
        <Kpi label="Plus-value latente" value={fmtEur(m.capitalGain)} tone={m.capitalGain} sub={`${fmtPct(m.capitalGainPct)} vs coût total`} />
        <Kpi label="Cash-flow mensuel" value={fmtEur(m.monthlyCashflow)} tone={m.monthlyCashflow} sub="après crédit et charges" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Coût d'acquisition">
          <Row label="Prix d'achat" value={fmtEur(p.purchasePrice)} />
          <Row label="Frais de notaire" value={fmtEur(p.notaryFees)} />
          <Row label="Travaux" value={fmtEur(p.worksCost)} />
          <div className="border-t border-border" />
          <Row label="Coût total" value={fmtEur(m.totalCost)} strong />
          {p.purchaseDate && <Row label="Acheté le" value={new Date(p.purchaseDate).toLocaleDateString("fr-FR")} />}
        </Card>
        <Card title="Rentabilité locative (annuelle)">
          <Row label="Loyers bruts" value={fmtEur(m.annualRent)} />
          <Row label={`Vacance (${p.vacancyPct} %)`} value={`− ${fmtEur(m.annualRent - effectiveRent)}`} />
          <Row label="Charges copro non récupérables" value={`− ${fmtEur(p.monthlyCharges * 12)}`} />
          <Row label="Taxe foncière" value={`− ${fmtEur(p.propertyTax)}`} />
          <Row label="Assurance PNO" value={`− ${fmtEur(p.insurance)}`} />
          <Row label={`Gestion (${p.managementPct} %)`} value={`− ${fmtEur(effectiveRent * (p.managementPct / 100))}`} />
          <div className="border-t border-border" />
          <Row label="Revenu net de charges" value={fmtEur(m.netIncome)} strong />
          <Row label="Rendement brut" value={fmtPct(m.grossYield)} />
          <Row label="Rendement net de charges" value={fmtPct(m.netYield)} />
          <Row label="Mensualités de crédit (assurance incl.)" value={`− ${fmtEur(m.monthlyLoan * 12)}`} />
          <Row label="Intérêts sur les 12 prochains mois" value={fmtEur(m.annualInterest)} />
          <div className="border-t border-border" />
          <Row label="Cash-flow annuel" value={fmtEur(m.monthlyCashflow * 12)} strong tone={m.monthlyCashflow} />
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Crédits</h2>
      <div className="space-y-4">
        {ls.map((l) => {
          const s = loanStatus(l);
          const yearly = amortization(l).filter((r) => r.n % 12 === 0 || r.n === l.durationMonths)
            .map((r) => ({ year: r.date.slice(0, 4), interest: r.interest, principal: r.principal, remaining: r.remaining }));
          return (
            <Card key={l.id} title={l.name} action={<form action={deleteLoan.bind(null, l.id)}><button className="text-xs text-muted hover:text-rose-600">Supprimer</button></form>}>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Capital restant dû" value={fmtEur(s.remaining)} sub={`sur ${fmtEur(l.principal)} empruntés`} />
                <Kpi label="Mensualité" value={fmtEur2(s.paymentWithInsurance)} sub={`dont assurance ${fmtEur2(l.insuranceMonthly)}`} />
                <Kpi label="Taux / durée" value={`${fmtPct(l.annualRate)}`} sub={`${l.durationMonths / 12} ans · fin ${s.endDate}`} />
                <Kpi label="Coût total du crédit" value={fmtEur(s.totalCost)} sub={`intérêts payés ${fmtEur(s.interestPaid)}`} />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>{s.paidMonths} échéances payées</span><span>{s.remainingMonths} restantes</span>
                </div>
                <div className="h-2 rounded-full bg-background"><div className="h-2 rounded-full bg-accent" style={{ width: `${s.progressPct}%` }} /></div>
              </div>
              <div className="mt-4"><AmortizationChart data={yearly} /></div>
            </Card>
          );
        })}
        <Card title="Ajouter un crédit">
          <form action={createLoan.bind(null, p.id)} className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Field label="Nom" name="name" defaultValue="Prêt immobilier" />
            <Field label="Montant emprunté (€)" name="principal" type="number" required />
            <Field label="Taux nominal (%)" name="annualRate" type="number" required />
            <Field label="Durée (années)" name="durationYears" type="number" defaultValue={20} />
            <Field label="Date de déblocage" name="startDate" type="date" required />
            <Field label="Assurance / mois (€)" name="insuranceMonthly" type="number" defaultValue={0} />
            <button className="btn">Ajouter</button>
          </form>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Modifier le bien</h2>
      <Card>
        <form action={updateProperty.bind(null, p.id)} className="space-y-4">
          <PropertyFields p={p} />
          <button className="btn">Enregistrer</button>
        </form>
        <form action={deleteProperty.bind(null, p.id)} className="mt-3"><button className="btn-danger">Supprimer le bien</button></form>
      </Card>
    </>
  );
}
