import { constants } from 'node:fs'
import * as fs from 'node:fs/promises'
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
 * The pairing string plus its ASCII-art QR rendering fit in a few KiB; anything
 * beyond this is not a pairing file.
 */
const maxPairingFileBytes = 64 * 1024

/** base64url alphabet (plus padding), which is what the node emits. */
const pairingCodePattern = /^[A-Za-z0-9_=-]+$/

/**
 * Read the current pairing code, or `null` if the node has not published one.
 *
 * The file holds the base64url pairing string, then a blank line, then the same
 * code rendered as ASCII-art QR — so the code is the first blank-line-delimited
 * chunk, with whitespace stripped.
 *
 * This runs in the CONTROLLER while the file lives on a volume the node can
 * write, so a compromised node must not be able to hang or exhaust this
 * process. The read is therefore deliberately paranoid rather than
 * `readFile`: `O_NOFOLLOW` rejects a symlink (e.g. to `/dev/zero`),
 * `O_NONBLOCK` keeps a FIFO from blocking the open, `fstat` on the opened
 * handle (race-free, unlike a separate lstat) rejects any non-regular file,
 * and the read is bounded before allocation. Structurally invalid content
 * throws — tampering must surface as a fault, not as "still bootstrapping".
 */
export async function readPairingCode(): Promise<string | null> {
  const path = sdk.volumes.main.subpath(pairingCodeFile)
  let handle: fs.FileHandle
  try {
    handle = await fs.open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    )
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code
    // Absent until the node publishes one. Anything else — a symlink (ELOOP),
    // a permission or I/O fault — is a real problem, and must not be reported
    // to the user as the node merely still starting up.
    if (code === 'ENOENT') return null
    throw e
  }
  try {
    const stat = await handle.stat()
    if (!stat.isFile()) {
      throw new Error('pairing code path is not a regular file')
    }
    if (stat.size > maxPairingFileBytes) {
      throw new Error('pairing code file is implausibly large')
    }
    const buffer = Buffer.alloc(Number(stat.size))
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    const contents = buffer.subarray(0, bytesRead).toString('utf-8')

    const pairingCode = contents.split(/\n\s*\n/)[0].replace(/\s/g, '')
    if (!pairingCode) return null
    if (pairingCode.length > 4096 || !pairingCodePattern.test(pairingCode)) {
      throw new Error('pairing code file does not contain a valid pairing code')
    }
    return pairingCode
  } finally {
    await handle.close()
  }
}
