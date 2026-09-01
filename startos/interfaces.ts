import { sdk } from './sdk'

// This package exposes no StartOS interfaces. The node's API is bound to
// loopback and is reached by Bisq Connect over the node's own bundled Tor onion
// service, which the node creates and publishes itself — nothing about that path
// runs through a StartOS binding. Everything the user needs (the pairing code,
// health, logs, backups) is on the service page.
export const setInterfaces = sdk.setupInterfaces(async () => [])
