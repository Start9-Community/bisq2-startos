import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.11.1:0',
  releaseNotes: {
    en_US:
      'First StartOS release of Bisq 2 Node. Runs a headless Bisq 2 node for the Bisq Connect mobile app, joining the Bisq P2P network over its own bundled Tor. Pair your phone with the Show Pairing Code action, which surfaces the current code as a scannable QR.',
    es_ES:
      'Primera versión para StartOS de Bisq 2 Node. Ejecuta un nodo Bisq 2 sin interfaz para la app móvil Bisq Connect, que se une a la red P2P de Bisq mediante su propio Tor incorporado. Vincula tu teléfono con la acción Mostrar código de vinculación, que muestra el código actual como un QR escaneable.',
    de_DE:
      'Erste StartOS-Veröffentlichung von Bisq 2 Node. Betreibt einen Bisq-2-Knoten ohne Oberfläche für die Bisq-Connect-App, der dem Bisq-P2P-Netzwerk über sein eigenes mitgeliefertes Tor beitritt. Koppele dein Telefon mit der Aktion Kopplungscode anzeigen, die den aktuellen Code als scanbaren QR-Code darstellt.',
    pl_PL:
      'Pierwsze wydanie Bisq 2 Node dla StartOS. Uruchamia węzeł Bisq 2 bez interfejsu graficznego dla aplikacji Bisq Connect, dołączający do sieci P2P Bisq przez własny wbudowany Tor. Sparuj telefon akcją Pokaż kod parowania, która pokazuje bieżący kod jako skanowalny kod QR.',
    fr_FR:
      "Première version StartOS de Bisq 2 Node. Fait tourner un nœud Bisq 2 sans interface pour l'app Bisq Connect, qui rejoint le réseau P2P Bisq via son propre Tor intégré. Appairez votre téléphone avec l'action Afficher le code d'appairage, qui présente le code courant sous forme de QR code scannable.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
