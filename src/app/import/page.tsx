import { PageHeader, Card } from "@/components/ui";
import { ImportForm } from "./form";

export default function ImportPage() {
  return (
    <>
      <PageHeader title="Import CSV" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Importer des positions">
          <ImportForm />
        </Card>
        <Card title="Format attendu">
          <p className="text-sm text-muted">Séparateur virgule ou point-virgule, une ligne par position. Les comptes inexistants sont créés automatiquement ; pour un compte présent dans le fichier, ses positions sont remplacées par celles du fichier.</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-xs">{`compte;type_compte;nom;ticker;classe;quantite;pru;cours
PEA Bourso;pea;Amundi MSCI World;CW8;etf;12;420,5;512,3
Ledger;crypto;Bitcoin;BTC;crypto;0,05;28000;61000
PEA Bourso;pea;;;;;;850`}</pre>
          <p className="mt-3 text-xs text-muted">Une ligne sans <code>nom</code> fixe les liquidités du compte (valeur de la colonne <code>cours</code>). Types de compte : courant, livret, pea, cto, assurance_vie, per, crypto, autre.</p>
        </Card>
      </div>
    </>
  );
}
