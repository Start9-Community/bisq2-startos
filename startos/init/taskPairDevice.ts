import { showPairingCode } from '../actions/showPairingCode'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskPairDevice = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await sdk.action.createOwnTask(effects, showPairingCode, 'important', {
    reason: i18n(
      'Pair Bisq Connect with this node once it has finished starting.',
    ),
  })
})
