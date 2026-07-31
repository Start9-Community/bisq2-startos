<p align="center">
  <img src="icon.png" alt="Bisq 2 Node Logo" width="21%">
</p>

# Bisq 2 Node on StartOS

> **Upstream docs:** <https://bisq.wiki/Bisq_2>
>
> Everything not listed in this document should behave the same as an upstream
> Bisq 2 trusted node. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable.

A headless [Bisq 2](https://github.com/bisq-network/bisq2) node — the "trusted
node" that the [Bisq Connect](https://github.com/bisq-network/bisq-mobile) mobile
app trades through. Running your own means the app talks to a node you control
rather than a stranger's. The node joins the Bisq P2P network over its own
bundled Tor, and Bisq Connect reaches it over an onion service the node creates
and publishes itself.

This packages the **node** only, not the Bisq 2 desktop application.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

|               |                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image source  | `ghcr.io/bisq-network/bisq2-api`, published by the Bisq project. Consumed unmodified — this package builds no image of its own and ships no `Dockerfile`. |
| Architectures | `x86_64`, `aarch64`                                                                                                                                       |
| Entrypoint    | The image's own, via `sdk.useEntrypoint()`                                                                                                                |

The image's entrypoint runs as root, takes ownership of the data directory, and
then drops to the unprivileged `bisq` user before launching the node — so the
node process itself never runs as root. It also points the node at the mounted
data directory and raises the pairing-code lifetime from the shipped default to
24 hours, which suits an always-on node that is paired only occasionally.

## Volume and Data Layout

One volume, `main`, mounted at `/data`. Everything the node persists lives under
it — network identity, database, the bundled Tor state (including the onion
service key), and the current pairing code — so a single volume snapshot
captures the node's whole identity.

| Path                        | Contents                                           |
| --------------------------- | -------------------------------------------------- |
| `/data/db`                  | Node database                                      |
| `/data/tor`                 | Bundled Tor state, including the onion service key |
| `/data/pairing_qr_code.txt` | The current pairing code, written by the node      |
| `/data/bisq.log`            | The node's own log file                            |

The package adds no files of its own to the volume.

## Installation and First-Run Flow

There is no setup wizard, no config to fill in, and no credential to choose. On
install the package raises one task — pair Bisq Connect — pointing at the
[Show Pairing Code](#actions-startos-ui) action.

A cold start takes a few minutes: the node bootstraps Tor, publishes an onion
service, and only then starts its API and mints a pairing code. Health reflects
each of those stages, so there is nothing to do but wait for the Pairing Code
check to go green.

## Configuration Management

| StartOS-Managed                                                                   | Upstream-Managed                                                                                                     |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Data directory location, pairing-code lifetime (both set by the image entrypoint) | Everything else — transport, API bind address, P2P and network settings, all from the image's bundled `api_app.conf` |

The package exposes no configuration. The node's config is the one shipped in
the image, which is already correct for a headless Tor-only node; nothing in
this package overrides it.

## Network Access and Interfaces

**This package exports no StartOS interfaces**, and that is deliberate rather
than an omission.

The node's API is bound to loopback inside the container. Bisq Connect does not
reach it through StartOS at all — the node runs its own bundled Tor, creates its
own onion service, and publishes that address inside the pairing code. Exporting
a StartOS binding would add an address nothing uses.

| Port | Scope                   | Purpose                                                                  |
| ---- | ----------------------- | ------------------------------------------------------------------------ |
| 8090 | Container loopback only | The node's HTTP/WebSocket API, reached over the node's own onion service |

## Actions (StartOS UI)

### Show Pairing Code

|              |                                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| Purpose      | Displays the node's current pairing code, as copyable text and a scannable QR |
| Visibility   | Enabled                                                                       |
| Availability | Only while running                                                            |
| Inputs       | None                                                                          |
| Outputs      | The pairing code, masked                                                      |

The code is read from the file the node maintains. It is single-use and expires,
and the node mints a replacement every few minutes and whenever one is consumed
— so the action always reflects the code that is currently valid, and running it
again after a failed pairing attempt is the correct recovery.

The pairing code grants trade control of the node, which is why it is masked and
surfaced only through an authenticated action.

## Backups and Restore

The `main` volume is backed up in full, which includes the node's network
identity and its Tor onion service key — so a restored node comes back at the
same onion address and stays paired with any device that already trusts it.

The pairing code is not meaningfully restored: the package clears it on every
start, and the running node publishes a fresh one.

## Health Checks

| Check        | Reports                                          |
| ------------ | ------------------------------------------------ |
| Node API     | The node's API is accepting requests on loopback |
| Pairing Code | The node has published a pairing code            |

The Node API check carries a five-minute grace period, during which failures
display as "starting" rather than as an error — a cold start spends most of that
window bootstrapping Tor before the API binds at all.

The Pairing Code check is the more meaningful of the two: the node publishes a
code only once Tor has published its onion service _and_ the API is running, so
it going green is what tells you the node is actually reachable by Bisq Connect,
rather than merely alive.

## Dependencies

None.

## Limitations and Differences

1. **No web interface.** The node is headless; everything the user needs is on
   the StartOS service page. There is no dashboard to open.
2. **Tor only.** The bundled config runs both the node's P2P transport and its
   API access over Tor, so Bisq Connect always reaches the node over Tor — even
   from the same LAN. This is not a choice this package makes: the node can only
   advertise an address it binds itself, and Bisq Connect takes its endpoint from
   inside the pairing code, so there is no address a StartOS interface could
   supply that the app would use.
3. **Trading happens in the app, not here.** This service is the node; offers,
   trades and chat all live in Bisq Connect.
4. **The pairing code cannot be revoked from StartOS.** It expires on its own
   and is replaced on a timer; restarting the service also mints a new one.

## What Is Unchanged from Upstream

- The node binary, its bundled Tor, and the shipped `api_app.conf`.
- Transport, P2P behavior, seed nodes, market-price and explorer providers.
- The pairing protocol and the API surface Bisq Connect talks to.
- On-disk data layout under the data directory.

## Contributing

See [AGENTS.md](AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: bisq2-node
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  api: 8090 # container loopback only; not exported as a StartOS interface
interfaces: none
dependencies: none
startos_managed_env_vars: []
actions:
  - show-pairing-code
```
