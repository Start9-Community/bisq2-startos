import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.11.2:0',
  releaseNotes: {
    en_US:
      'Updates the node to Bisq 2 API 2.1.11.2. Adds WebSocket compression for faster, lighter phone syncing over Tor, network health metrics the Bisq Connect app can display, and support for the Telebirr payment method for the Ethiopian market.',
    es_ES:
      'Actualiza el nodo a la API 2.1.11.2 de Bisq 2. Añade compresión WebSocket para una sincronización del teléfono más rápida y ligera a través de Tor, métricas del estado de la red que la app Bisq Connect puede mostrar, y soporte para el método de pago Telebirr para el mercado etíope.',
    de_DE:
      'Aktualisiert den Knoten auf die Bisq-2-API 2.1.11.2. Fügt WebSocket-Kompression für schnellere, leichtere Telefon-Synchronisation über Tor hinzu, außerdem Netzwerkmetriken, die die Bisq-Connect-App anzeigen kann, sowie Unterstützung für die Zahlungsmethode Telebirr für den äthiopischen Markt.',
    pl_PL:
      'Aktualizuje węzeł do API Bisq 2 w wersji 2.1.11.2. Dodaje kompresję WebSocket dla szybszej i lżejszej synchronizacji telefonu przez Tor, metryki stanu sieci, które może wyświetlać aplikacja Bisq Connect, oraz obsługę metody płatności Telebirr dla rynku etiopskiego.',
    fr_FR:
      "Met à jour le nœud vers l'API Bisq 2 2.1.11.2. Ajoute la compression WebSocket pour une synchronisation du téléphone plus rapide et plus légère via Tor, des métriques réseau que l'app Bisq Connect peut afficher, et la prise en charge du moyen de paiement Telebirr pour le marché éthiopien.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
