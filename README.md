# Socle

Application personnelle de suivi de patrimoine : comptes bancaires, épargne, bourse (PEA, CTO, assurance-vie, PER), crypto et immobilier détaillé (prêts, loyers, charges, rendement, cash-flow).

Tout tourne en local : les données restent dans `data/socle.db` (SQLite).

## Démarrer

```bash
npm install
npm run seed   # optionnel : données de démonstration fictives (efface la base)
npm run dev    # http://localhost:3000
```

## Fonctionnalités

- **Synthèse** : patrimoine net, brut, dettes, répartition, historique (photo quotidienne automatique).
- **Comptes & placements** : liquidités, positions avec quantité, PRU, cours et plus-value latente.
- **Immobilier** : coût d'acquisition, quote-part, valorisation, rendement brut et net, cash-flow, crédits avec capital restant dû et tableau d'amortissement.
- **Import CSV** de positions (format décrit dans l'app).

## Stack

Next.js 15 (App Router, server actions), TypeScript, Tailwind CSS 4, Drizzle ORM + better-sqlite3, Recharts.

Les calculs financiers sont dans `src/lib/finance.ts` et l'agrégation du patrimoine dans `src/lib/portfolio.ts`.
