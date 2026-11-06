/**
 * Contrat commun à toutes les sources de données (CSV aujourd'hui, Powens ou Bridge demain).
 * Un connecteur ne touche jamais la base : il renvoie des comptes normalisés,
 * et `applySync` (sync.ts) se charge de les fusionner avec l'existant.
 */
import type { AccountType } from "@/db/schema";

export type ExternalHolding = {
  externalId?: string;
  name: string;
  ticker?: string | null;
  assetClass: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
};

export type ExternalAccount = {
  externalId?: string; // absent : rapprochement par nom
  name: string;
  type: AccountType;
  institution?: string | null;
  cash?: number; // absent : liquidités inchangées
  holdings?: ExternalHolding[]; // présent : remplace les positions du compte
};

export interface Connector {
  id: string; // stocké dans accounts.source
  label: string;
  /** Récupère l'état actuel des comptes chez la source. */
  fetchAccounts(input?: unknown): Promise<ExternalAccount[]>;
}
