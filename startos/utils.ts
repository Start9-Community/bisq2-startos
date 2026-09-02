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

/** The pairing string plus its ASCII-art QR rendering fit in a few KiB. */
const maxPairingFileBytes = 64 * 1024
const maxPairingCodeChars = 4096

/** Unpadded base64url alphabet, which is what the node's generator emits. */
const pairingCodePattern = /^[A-Za-z0-9_-]+$/

/** Floor on the decoded envelope: a version byte plus length-prefixed fields. */
const minPairingCodeBytes = 16

/** `PairingQrCodeFormat.VERSION` in bisq2 — re-verify on an image bump. */
const pairingQrCodeVersion = 1

/**
 * Decode canonical unpadded base64url, or `null` if `value` is not the canonical
 * encoding of any byte string. `Buffer.from` tolerates padding, stray characters
 * and non-zero trailing bits, so require the decode to round-trip.
 */
function decodeCanonicalBase64Url(value: string): Buffer | null {
  if (!pairingCodePattern.test(value)) return null
  const decoded = Buffer.from(value, 'base64url')
  return decoded.toString('base64url') === value ? decoded : null
}

/**
 * Read the current pairing code, or `null` if the node has not published one.
 *
 * The file holds the base64url pairing string, then a blank line, then the same
 * code rendered as ASCII-art QR — so the code is the first blank-line-delimited
 * chunk, with whitespace stripped.
 *
 * The node writes this file and the controller reads it, so the open is
 * `O_NOFOLLOW | O_NONBLOCK` with an `fstat` regular-file check and a bounded
 * read: a symlink, a FIFO or an unbounded file must not hang or exhaust the
 * controller. Structurally invalid content throws, because the health check and
 * the action both present whatever this returns as ready to scan.
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
    // Absent until the node publishes one; anything else is a real fault and
    // must not read to the user as the node merely still starting up.
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') return null
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
    const buffer = Buffer.alloc(stat.size)
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    const contents = buffer.subarray(0, bytesRead).toString('utf-8')

    const pairingCode = contents.split(/\n\s*\n/)[0].replace(/\s/g, '')
    if (!pairingCode) return null
    const decoded =
      pairingCode.length <= maxPairingCodeChars
        ? decodeCanonicalBase64Url(pairingCode)
        : null
    if (
      decoded === null ||
      decoded.length < minPairingCodeBytes ||
      decoded[0] !== pairingQrCodeVersion
    ) {
      throw new Error('pairing code file does not contain a valid pairing code')
    }
    return pairingCode
  } finally {
    await handle.close()
  }
}
