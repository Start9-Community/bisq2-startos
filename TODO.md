# TODO

- [ ] Verify on `aarch64` hardware. CI builds the `aarch64` s9pk, but the port has
      only been installed and exercised on `x86_64`. Cold-start timing is the thing
      to re-check: the API bound about two and a half minutes after start on x86,
      against a five-minute `gracePeriod`.
- [ ] Backup and restore sanity check — confirm a restored node comes back on the
      same onion address and that an already-paired device still works.
- [ ] Consider surfacing the pairing-code lifetime as a config action. The image
      entrypoint reads `PAIRING_TTL_SECONDS` and this package leaves it at the
      entrypoint's 24-hour default.

## Blocked upstream: exposing the API as a StartOS interface

Worth revisiting if upstream ever adds it, and worth not re-litigating until then.

Exporting the API port would let the user reach the node over a StartOS-provided
address — an onion from the Tor service, a public IPv4, or a custom domain —
instead of the node's own onion. On a LAN that would drop both the Tor hop and the
Tor bootstrap Bisq Connect performs on every connection, which is a real latency
win. StartOS supports all of those address types on an interface today.

It still cannot work, because the node cannot advertise an address it does not
bind:

- `ApiConfig` exposes only `bindHost` / `bindPort` / `onionServicePort`. There is
  no advertised-, external-, or announce-address option, so the pairing code
  always carries either the node's own onion (`TOR`) or `bindHost` (`CLEAR`) —
  which, in a container, is meaningless outside the box.
- Bisq Connect has nowhere to put an address anyway. Its trusted-node setup takes
  exactly two inputs, a pasted pairing code and a scanned QR
  (`TrustedNodeSetupUiAction`), and derives the endpoint from inside the code
  (`apiUrl = code.restApiUrl`). There is no manual host field to override it with.

So an interface would publish a second, live, authenticated path to the API that
the app would never dial, and put an address on the service page that looks like
the pairing address but is not.

Do not work around this by re-encoding the pairing blob ourselves — that means
re-implementing `PairingQrCodeFormat` out of tree, and it breaks silently the
first time the format version, flags, or the TLS-fingerprint / Tor-secret fields
change.
