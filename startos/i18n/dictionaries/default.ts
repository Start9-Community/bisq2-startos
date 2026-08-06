export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Bisq 2 Node!': 0,
  'Node API': 1,
  'The node API is ready': 2,
  'The node API is not ready': 3,
  'Pairing Code': 4,
  'A pairing code is available': 5,
  'No pairing code yet — the node may still be bootstrapping Tor': 6,

  // actions/showPairingCode.ts
  'Show Pairing Code': 7,
  'Display the current pairing code, so you can add this node as a trusted node in Bisq Connect.': 8,
  'Anyone holding this code can trade on your node. Only scan it into your own device.': 9,
  'Scan this from Bisq Connect, or paste it into “Pair with a new trusted node”. It already carries this node’s address, so nothing else is needed.': 10,
  'Single use, and it expires — run this action again for a fresh code.': 11,

  // init/taskPairDevice.ts
  'Pair Bisq Connect with this node once it has finished starting.': 12,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
