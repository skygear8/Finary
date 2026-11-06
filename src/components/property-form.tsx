import { PROPERTY_TYPES } from "@/db/schema";
import type { Property } from "@/lib/finance";
import { Field, Select } from "./ui";

export function PropertyFields({ p }: { p?: Property }) {
  return (
    <div className="space-y-4">
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="col-span-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Le bien</legend>
        <div className="col-span-2"><Field label="Nom" name="name" defaultValue={p?.name} placeholder="T2 Lyon 7e" required /></div>
        <Select label="Usage" name="type" options={PROPERTY_TYPES} defaultValue={p?.type ?? "locatif"} />
        <Field label="Surface (m²)" name="surface" type="number" defaultValue={p?.surface} />
        <div className="col-span-2"><Field label="Adresse" name="address" defaultValue={p?.address} /></div>
        <Field label="Quote-part détenue (%)" name="ownershipShare" type="number" defaultValue={p?.ownershipShare ?? 100} />
        <Field label="Date d'achat" name="purchaseDate" type="date" defaultValue={p?.purchaseDate} />
      </fieldset>
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="col-span-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Acquisition & valeur</legend>
        <Field label="Prix d'achat (€)" name="purchasePrice" type="number" defaultValue={p?.purchasePrice} required />
        <Field label="Frais de notaire (€)" name="notaryFees" type="number" defaultValue={p?.notaryFees ?? 0} />
        <Field label="Travaux (€)" name="worksCost" type="number" defaultValue={p?.worksCost ?? 0} />
        <Field label="Valeur actuelle estimée (€)" name="currentValue" type="number" defaultValue={p?.currentValue} />
      </fieldset>
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="col-span-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Revenus & charges</legend>
        <Field label="Loyer mensuel HC (€)" name="monthlyRent" type="number" defaultValue={p?.monthlyRent ?? 0} />
        <Field label="Charges copro non récup. / mois (€)" name="monthlyCharges" type="number" defaultValue={p?.monthlyCharges ?? 0} />
        <Field label="Taxe foncière / an (€)" name="propertyTax" type="number" defaultValue={p?.propertyTax ?? 0} />
        <Field label="Assurance PNO / an (€)" name="insurance" type="number" defaultValue={p?.insurance ?? 0} />
        <Field label="Frais de gestion (% loyers)" name="managementPct" type="number" defaultValue={p?.managementPct ?? 0} />
        <Field label="Vacance locative (%)" name="vacancyPct" type="number" defaultValue={p?.vacancyPct ?? 0} />
      </fieldset>
    </div>
  );
}
