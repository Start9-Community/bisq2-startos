import { sdk } from './sdk'

/**
 * The node's HTTP/WebSocket API, bound to loopback inside the container
 * (`api.server.bind` in the image's `api_app.conf`). It is not exported as a
 * StartOS interface: Bisq Connect reaches the node over the node's own bundled
 * Tor onion service, whose address is carried inside the pairing code.
 */
export const apiPort = 8090

/** Where the node writes the current pairing code, relative to the data volume. */
export const pairingCodeFile = 'pairing_qr_code.txt'

/**
 * Read the current pairing code, or `null` if the node has not published one.
 *
 * The file holds the base64url pairing string, then a blank line, then the same
 * code rendered as ASCII-art QR — so the code is the first blank-line-delimited
 * chunk, with whitespace stripped.
 */
export async function readPairingCode(): Promise<string | null> {
  const contents = await sdk.volumes.main
    .readFile(pairingCodeFile, 'utf-8')
    .catch((e) => {
      // Absent until the node publishes one. Anything else — a permission or I/O
      // fault — is a real problem, and must not be reported to the user as the
      // node merely still starting up.
      if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') return null
      throw e
    })
  if (typeof contents !== 'string') return null

  return contents.split(/\n\s*\n/)[0].replace(/\s/g, '') || null
}
