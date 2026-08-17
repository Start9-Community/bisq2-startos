<p align="center">
  <img src="icon.png" alt="Bisq 2 Node Logo" width="21%">
</p>

# Bisq 2 Node on StartOS

> Everything not listed in this document should behave the same as an upstream
> Bisq 2 trusted node. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

A headless [Bisq 2](https://github.com/bisq-network/bisq2) node — the "trusted node" the Bisq Connect mobile app trades through. Running your own means the app talks to a node you control rather than a stranger's. The node joins the Bisq P2P network over its own bundled Tor, and Bisq Connect reaches it over an onion service the node creates and publishes itself.

This packages the **node** only, not the Bisq 2 desktop application.

- **Upstream repo:** <https://github.com/bisq-network/bisq2>
- **Wrapper repo:** <https://github.com/Start9-Community/bisq2-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, published by the Bisq project and consumed unmodified — this package builds nothing and ships no `Dockerfile`.

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Image         | `ghcr.io/bisq-network/bisq2-api`           |
| Architectures | x86_64, aarch64                            |
| Entrypoint    | The image's own, via `sdk.useEntrypoint()` |

| Subcontainer     | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `bisq2-node-sub` | The oneshot and the node daemon — the one to `attach` to |

The image's entrypoint runs as root, takes ownership of the data directory, and drops to the unprivileged `bisq` user before starting the node, so the node process itself never runs as root. It also points the node at the mounted data directory and sets the pairing-code lifetime; this package overrides neither.

**Everything the node does is configured inside the image.** The API bind address, the transport, the seed nodes, and the pairing behavior all come from the config bundled in the image rather than from anything here, which is why this package has no configuration surface at all.

## Volume and Data Layout

One volume, holding the node's entire identity.

| Volume | Mount Point | Purpose                                        |
| ------ | ----------- | ---------------------------------------------- |
| `main` | `/data`     | Database, Tor state, pairing code, and the log |

| Path                  | Holds                                              |
| --------------------- | -------------------------------------------------- |
| `db/`                 | The node's database                                |
| `tor/`                | Bundled Tor state, including the onion service key |
| `pairing_qr_code.txt` | The current pairing code, written by the node      |
| `bisq.log`            | The node's own log                                 |

**The onion service key is in this volume**, which is what makes the node's address survive a restore — see [Backups and Restore](#backups-and-restore). The package writes nothing of its own here; every file is the node's.

## File Models

None. There is no configuration file this package owns, seeds, or rewrites.

One file on the volume is read but not modelled: `pairing_qr_code.txt`, which the node writes and the package reads directly on each use. It is deliberately not a file model, because it is **state rather than configuration** — single-use, expiring, and rewritten by the node — so caching or merging it would hand out a code that is no longer valid. The read parses the first blank-line-delimited chunk, since the node writes the code, a blank line, and then the same code as ASCII-art QR.

The package does delete that file once, at start-up, before the node comes up. That is not configuration either; it is what stops a stale code from a previous run being presented as current.

## Dependencies

None.

## Network Access and Interfaces

**None, and deliberately so.** `setInterfaces` returns an empty array.

The node's API is bound to loopback inside the container. Bisq Connect does not reach it through StartOS at all: the node runs its own bundled Tor, creates its own onion service, and publishes that address **inside the pairing code**. There is no address StartOS could supply that the app would ever dial.

| Port | Scope                   | Purpose                                                                  |
| ---- | ----------------------- | ------------------------------------------------------------------------ |
| 8090 | Container loopback only | The node's HTTP/WebSocket API, reached over the node's own onion service |

Exporting a binding would publish a second live, authenticated path to that API that nothing uses, and put an address on the service page that looks like the pairing address and is not. Two upstream facts make it useless rather than merely unnecessary: the node's config has no advertised-address option, so the pairing code can only ever name an address the node itself binds; and Bisq Connect's trusted-node setup accepts only a pasted code or a scanned QR, with no field to type an address into.

## Installation and First-Run Flow

There is no wizard, no configuration, and no credential to choose. Install raises a single `important` task pointing at [Show Pairing Code](#actions), and that is the whole of setup.

**A cold start takes minutes, and the order matters.** The node bootstraps Tor, publishes an onion service, starts its API, and only then mints a pairing code. The two health checks report those stages in sequence, so the correct behavior on a fresh install is to wait for the Pairing Code check rather than to act.

Roughly two and a half minutes to the API on x86_64, and longer on ARM. The grace periods are sized against that — see [Health Checks](#health-checks).

## Actions

One action.

### Show Pairing Code

Displays the code that pairs a device with this node, as masked copyable text and as a scannable QR. Run it once the Pairing Code check is green, and again after any failed pairing attempt.

- **When to run it:** only while the service is running — it reads a file the running node maintains, and fails with an explanatory error if no code has been published yet.
- **What it changes:** nothing. It is a read.
- **Cost:** immediate.
- **Repeat safety:** read-only, but the value is **single-use**: a code that has been consumed by a pairing is spent, and the node publishes a replacement. Re-running the action is the correct recovery from a failed pairing, because it returns whatever code is current rather than a cached one.
- **Outputs:** the pairing code. It carries this node's address, so nothing else needs entering on the device.

**The code is a credential.** Anyone holding it can trade on this node, which is why it is masked and reachable only through an authenticated action. Its lifetime is the image entrypoint's default; this package does not set it.

## Tasks

One, raised at install only.

| Task              | Severity    | Raised when | Cleared when             |
| ----------------- | ----------- | ----------- | ------------------------ |
| Pair Bisq Connect | `important` | At install  | Show Pairing Code is run |

`important` is prominent but **non-blocking**: the node runs, joins the network, and is perfectly healthy unpaired. That is the right severity here, because a node with no paired device is a valid state — it just is not doing anything for you yet.

It is not raised on restore, since a restored node keeps its identity and any device already paired with it stays paired.

## Health Checks

Two checks, and the second is the one that matters.

| Check               | Displayed as   | Method                                | Grace Period |
| ------------------- | -------------- | ------------------------------------- | ------------ |
| `primary`           | "Node API"     | HTTP request to the loopback API port | 300s         |
| `pairing-published` | "Pairing Code" | A pairing code exists on disk         | 600s         |

**"Node API" means alive; "Pairing Code" means reachable.** The node publishes a code only after Tor has published its onion service _and_ the API is running, so the second check going green is what tells you Bisq Connect can actually reach this node. A green API check on its own does not.

The grace periods encode the cold-start shape: five minutes for the API, because most of that window is Tor bootstrapping before the port is bound at all; then ten minutes for the pairing code, measured from when the API comes up. Both display failures as "starting" inside the grace period. The second one is deliberately allowed to go **red** afterwards rather than spinning forever — a Tor bootstrap wedged by a firewall or by clock skew is a fault and should read as one.

The API check is a plain HTTP request rather than a port probe. That is not a stylistic choice: the API binds an IPv4-mapped IPv6 socket, which the SDK's port-listening helper does not match, and it would report failure indefinitely.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`.

**That includes the Tor onion service key**, so a restored node comes back at the _same_ onion address and every device already paired with it stays paired. This is the single most important property of the backup: without the key, restoring would mean re-pairing every device.

The pairing code is not meaningfully restored — the package clears it at every start and the running node publishes a fresh one. Nothing is lost by that, since a code is single-use anyway.

A restored instance needs nothing done to it and raises no task.

## Limitations and Differences

1. **No web interface.** The node is headless. Everything a user needs — health, logs, the pairing code — is on the StartOS service page, and there is nothing to open.
2. **Tor only, including on a LAN.** Bisq Connect always reaches the node over Tor, even from the same network. This is not a packaging choice: the node can only advertise an address it binds itself, and the app takes its endpoint from inside the pairing code.
3. **Trading happens in the app.** This service is the node; offers, trades and chat all live in Bisq Connect.
4. **A pairing code cannot be revoked from StartOS.** It expires on its own, and restarting the service mints a new one.
5. **There is nothing to configure.** The node's settings come from the image, and the package exposes no action to change them.

---

## Quick Reference for AI Consumers

```yaml
package_id: bisq2-node # note: the repo is bisq2-startos
image: ghcr.io/bisq-network/bisq2-api
architectures:
  - x86_64
  - aarch64
subcontainers:
  - bisq2-node-sub
volumes:
  main: /data
file_models: [] # pairing_qr_code.txt is read directly, not modelled
startos_managed_env_vars: []
dependencies: []
interfaces: {} # none; the API is loopback-only, reached over the node's own onion
actions:
  - show-pairing-code
tasks:
  - { action: show-pairing-code, severity: important }
health_checks:
  - primary # displayed "Node API"
  - pairing-published # displayed "Pairing Code"
```
