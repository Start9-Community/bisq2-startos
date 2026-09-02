import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, pairingCodeFile, readPairingCode } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Bisq 2 Node!'))

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'bisq2-node-sub',
  )

  return (
    sdk.Daemons.of(effects)
      .addDaemon('primary', {
        subcontainer,
        // A pairing code is single-use, so the previous run's file goes at every
        // launch — crash-restarts included — before it can be handed out as current.
        exec: {
          command: [
            '/bin/sh',
            '-c',
            `rm -f /data/${pairingCodeFile} && exec /usr/local/bin/entrypoint.sh`,
          ],
        },
        ready: {
          display: i18n('Node API'),
          // Neither SDK helper fits. `checkPortListening` misses the port
          // entirely: the API binds an IPv4-mapped IPv6 socket
          // (`::ffff:127.0.0.1`), and that helper only matches IPv6 sockets on
          // the wildcard address. `checkWebUrl` works, but logs a fetch stack
          // trace on every failed poll, which would bury the node's own startup
          // output for the couple of minutes it spends bootstrapping Tor.
          fn: async () => {
            const answered = await fetch(`http://127.0.0.1:${apiPort}/`, {
              signal: AbortSignal.timeout(2_000),
            }).then(
              () => true,
              () => false,
            )
            return answered
              ? { result: 'success', message: i18n('The node API is ready') }
              : {
                  result: 'failure',
                  message: i18n('The node API is not ready'),
                }
          },
          // Cold start bootstraps Tor before the API binds — around two and a
          // half minutes on x86, longer on ARM. Failures inside the grace period
          // display as "starting".
          gracePeriod: 300_000,
        },
        requires: [],
      })
      // The node publishes a pairing code only after Tor has published its onion
      // service and the API is running, so this is the signal that the node is
      // actually reachable by Bisq Connect — not merely alive.
      .addHealthCheck('pairing-published', {
        ready: {
          display: i18n('Pairing Code'),
          fn: async () =>
            (await readPairingCode())
              ? {
                  result: 'success',
                  message: i18n('A pairing code is available'),
                }
              : {
                  result: 'failure',
                  message: i18n(
                    'No pairing code yet — the node may still be bootstrapping Tor',
                  ),
                },
          // Reported as "starting" for this long, then allowed to go red. The
          // check only begins once the API is up, and the node published a code
          // seconds later in testing, so ten minutes is well clear of a healthy
          // start — long enough not to cry wolf, short enough that a Tor
          // bootstrap wedged by a firewall or clock skew surfaces as a fault
          // rather than an indefinite spinner.
          gracePeriod: 600_000,
        },
        requires: ['primary'],
      })
  )
})
