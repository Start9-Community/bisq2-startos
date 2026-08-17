# Bisq 2 Node

## Documentation

- [Bisq 2 on the Bisq wiki](https://bisq.wiki/Bisq_2) — what Bisq 2 is and how trading on it works.
- [Bisq Connect](https://github.com/bisq-network/bisq-mobile) — where to get the mobile app, for Android and iOS, and how to use it.

## What you get on StartOS

A headless Bisq 2 node of your own. Bisq Connect normally trades through somebody else's node; once you pair it with this one, it trades through yours instead.

The node joins the Bisq P2P network over its own bundled Tor, and your phone reaches it over an onion address the node creates for itself. There is no web interface to open — you drive the node from your phone, and StartOS shows you its health, its logs, and the pairing code.

## Getting set up

1. Start the service. The first start takes a few minutes: the node has to bootstrap Tor and publish an onion address before it can accept a pairing.
2. Watch the **Pairing Code** health check. It turns green once the node has published a code and is ready to pair.
3. Run the **Show Pairing Code** action.
4. In Bisq Connect, scan the QR code — or copy the code and paste it into **More → Trusted node setup → Pair with a new trusted node**.

The code already carries this node's address, so there is nothing else to enter.

## Using Bisq 2 Node

Once paired, everything you actually do — browsing offers, trading, chat — happens in Bisq Connect. The node just runs, and the service page is where you check on it.

### Show Pairing Code

Displays the code that pairs a device with this node, as text and as a scannable QR.

A code is good for one pairing and then expires. The action always shows the code that is currently valid, so if a pairing attempt fails, run it again and use whatever code it gives you. Restarting the service also mints a new one.

Treat the code like a key: anyone who has it can trade on your node. Only scan it into a device you own.

## Backing up

A backup of this service captures the node's identity and its onion address, so restoring it brings the node back at the same address — a phone that is already paired stays paired.
