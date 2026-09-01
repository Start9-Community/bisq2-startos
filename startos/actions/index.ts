import { sdk } from '../sdk'
import { showPairingCode } from './showPairingCode'

export const actions = sdk.Actions.of().addAction(showPairingCode)
