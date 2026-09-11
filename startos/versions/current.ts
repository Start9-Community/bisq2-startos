import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.12.1:0',
  releaseNotes: {
    en_US:
      'Updates the node to Bisq 2 API 2.1.12.1 (bisq2 @ fb9849b). Full changes: https://github.com/bisq-network/bisq2/compare/v2.1.12...fb9849b',
    es_ES:
      'Actualiza el nodo a la API 2.1.12.1 de Bisq 2 (bisq2 @ fb9849b). Cambios completos: https://github.com/bisq-network/bisq2/compare/v2.1.12...fb9849b',
    de_DE:
      'Aktualisiert den Knoten auf die Bisq-2-API 2.1.12.1 (bisq2 @ fb9849b). Alle Änderungen: https://github.com/bisq-network/bisq2/compare/v2.1.12...fb9849b',
    pl_PL:
      'Aktualizuje węzeł do API Bisq 2 w wersji 2.1.12.1 (bisq2 @ fb9849b). Pełna lista zmian: https://github.com/bisq-network/bisq2/compare/v2.1.12...fb9849b',
    fr_FR:
      "Met à jour le nœud vers l'API Bisq 2 2.1.12.1 (bisq2 @ fb9849b). Liste complète des changements : https://github.com/bisq-network/bisq2/compare/v2.1.12...fb9849b",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
