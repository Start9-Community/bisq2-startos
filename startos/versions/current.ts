import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.12.0:0',
  releaseNotes: {
    en_US:
      'Security release: updates the node to Bisq 2 API 2.1.12.0. A Bisq security alert requires version 2.1.12 or newer for trading — older nodes are blocked from taking or processing offers. Also required by Bisq Connect 0.8.2+, which only pairs with nodes running 2.1.12 or newer.',
    es_ES:
      'Versión de seguridad: actualiza el nodo a la API 2.1.12.0 de Bisq 2. Una alerta de seguridad de Bisq exige la versión 2.1.12 o superior para operar — los nodos con versiones anteriores quedan bloqueados para tomar o procesar ofertas. También la requiere Bisq Connect 0.8.2+, que solo se empareja con nodos con la versión 2.1.12 o superior.',
    de_DE:
      'Sicherheitsrelease: aktualisiert den Knoten auf die Bisq-2-API 2.1.12.0. Eine Bisq-Sicherheitswarnung verlangt für den Handel Version 2.1.12 oder neuer — ältere Knoten können keine Angebote mehr annehmen oder verarbeiten. Außerdem erforderlich für Bisq Connect 0.8.2+, das sich nur mit Knoten ab Version 2.1.12 koppelt.',
    pl_PL:
      'Wydanie bezpieczeństwa: aktualizuje węzeł do API Bisq 2 w wersji 2.1.12.0. Alert bezpieczeństwa Bisq wymaga do handlu wersji 2.1.12 lub nowszej — starsze węzły nie mogą przyjmować ani przetwarzać ofert. Wymagane także przez Bisq Connect 0.8.2+, który paruje się tylko z węzłami w wersji 2.1.12 lub nowszej.',
    fr_FR:
      "Version de sécurité : met à jour le nœud vers l'API Bisq 2 2.1.12.0. Une alerte de sécurité Bisq exige la version 2.1.12 ou ultérieure pour trader — les nœuds plus anciens ne peuvent plus prendre ni traiter d'offres. Également requise par Bisq Connect 0.8.2+, qui ne s'appaire qu'avec des nœuds en version 2.1.12 ou ultérieure.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
