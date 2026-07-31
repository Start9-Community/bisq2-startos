import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { readPairingCode } from '../utils'

export const showPairingCode = sdk.Action.withoutInput(
  'show-pairing-code',

  async () => ({
    name: i18n('Show Pairing Code'),
    description: i18n(
      'Display the current pairing code, so you can add this node as a trusted node in Bisq Connect.',
    ),
    warning: i18n(
      'Anyone holding this code can trade on your node. Only scan it into your own device.',
    ),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async () => {
    const code = await readPairingCode()
    if (!code) {
      throw new Error(
        'No pairing code published yet. The node publishes one once it has bootstrapped Tor and started its API — watch the Pairing Code health check.',
      )
    }

    return {
      version: '1',
      title: i18n('Pairing Code'),
      message: i18n(
        'Scan this from Bisq Connect, or paste it into “Pair with a new trusted node”. It already carries this node’s address, so nothing else is needed.',
      ),
      result: {
        type: 'single',
        name: i18n('Pairing Code'),
        description: i18n(
          'Single use, and it expires — run this action again for a fresh code.',
        ),
        value: code,
        masked: true,
        copyable: true,
        qr: true,
      },
    }
  },
)
