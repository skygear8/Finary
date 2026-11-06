import type { Connector } from "./types";

/**
 * Emplacement réservé pour un agrégateur bancaire (Powens, Bridge…).
 * À implémenter quand tu auras un compte développeur :
 *  1. lien de connexion bancaire (webview de l'agrégateur) → token utilisateur stocké côté serveur ;
 *  2. fetchAccounts : appel de l'API « accounts » + « investments », mappé vers ExternalAccount
 *     avec externalId = identifiant du compte chez l'agrégateur ;
 *  3. un bouton « Synchroniser » ou une tâche planifiée qui appelle applySync(connector).
 * Clés attendues dans .env.local : AGGREGATOR_CLIENT_ID, AGGREGATOR_CLIENT_SECRET, AGGREGATOR_BASE_URL.
 */
export const aggregatorConnector: Connector = {
  id: "aggregator",
  label: "Agrégation bancaire (à venir)",
  async fetchAccounts() {
    throw new Error("Agrégation bancaire non configurée.");
  },
};
