# Bisq 2 Node

Run your own Bisq 2 node so the **Bisq Connect** mobile app connects to a node you control instead
of a stranger's — more privacy, no third-party trust. The node is headless and reaches the Bisq P2P
network over its own bundled Tor.

## Pairing with Bisq Connect

1. Start the service and give it a minute to bootstrap over Tor.
2. Open the service's **Properties** — you'll see a **Pairing Code** (with a scannable QR) and the
   node's **Tor Onion Address**.
3. In the [Bisq Connect](https://github.com/bisq-network/bisq-mobile) mobile app, scan the QR — or
   copy the pairing code into **More → Trusted node setup → Pair with a new trusted node**.

> **Security:** the pairing code grants trade control of your node. Keep it private and only pair
> devices you own.

## Notes

- The pairing code rotates automatically; the Properties always show the current one.
- All node data lives under the service's data volume and is included in StartOS backups.
