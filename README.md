# Bisq 2 Node for StartOS

A [StartOS](https://start9.com) service that packages **Bisq 2 Node** —
a self-hosted [Bisq 2](https://github.com/bisq-network/bisq2) node for the
[Bisq Connect](https://github.com/bisq-network/bisq-mobile) mobile app.

Run your own node so Bisq Connect talks to a node **you** control instead of a
stranger's — more privacy, no third-party trust. The node is headless and reaches
the Bisq P2P network over its own bundled Tor. StartOS surfaces the node's pairing
code (with a scannable QR) as a service **Property**.

> **Scope:** this packages the **headless trusted node** for Bisq Connect — not the
> full Bisq 2 desktop application. There is no web UI: pairing happens via the
> authenticated StartOS **Properties** view.

## Install

**Sideload the package** (no signed release is published yet — build it from source):

1. Build `bisq-node.s9pk` yourself — see [Build & test](#build--test).
2. In StartOS, go to **System → Sideload a Service** and upload the `.s9pk`.
3. Open **Bisq 2 Node** and start it.

Once accepted into the Start9 **Community Registry** it will be installable from the
marketplace directly.

## Pair with Bisq Connect

1. Start the service and give it a minute to bootstrap over Tor.
2. Open the service's **Properties** — you'll see a **Pairing Code** (with a scannable
   QR). The code already encodes the node's onion address, so Bisq Connect needs nothing else.
3. In the [Bisq Connect](https://github.com/bisq-network/bisq-mobile) mobile app, scan
   the QR — or copy the pairing code into **More → Trusted node setup → Pair with a new
   trusted node**.

> **Security:** the pairing code grants trade control of your node. Keep it private and
> only pair devices you own. The code rotates automatically; Properties always show the
> current one. All node data lives under the service's data volume and is included in
> StartOS backups.

## What's inside

| File | Purpose |
|---|---|
| `manifest.yaml` | Service manifest — metadata, multi-arch (`x86_64` + `aarch64`), health check, properties, backup, migrations |
| `Dockerfile` | Wraps the published, digest-pinned `bisq2-api` node image with the StartOS entrypoint layer |
| `docker_entrypoint.sh` | StartOS entrypoint — keeps Properties in sync, then hands off to the node image's own entrypoint |
| `write-stats.sh` | Parses the node's pairing file into `stats.yaml` (pairing code + QR) for the Properties view |
| `scripts/embassy.ts` | Service procedures — health check, properties, config, migrations |
| `Makefile` | Builds the multi-arch `.s9pk` (`start-sdk pack`) |
| `instructions.md` | In-app instructions shown in StartOS |
| `icon.png`, `LICENSE` | Service icon and license |

The node image (`ghcr.io/bisq-network/bisq2-api`) is built multi-arch (amd64 + arm64)
from [bisq-network/bisq2](https://github.com/bisq-network/bisq2) and **digest-pinned**
in the `Dockerfile`. It's released automatically from the
[bisq-network/bisq-mobile](https://github.com/bisq-network/bisq-mobile) CI, which is the
single source of truth for the node version — the same image the
[Umbrel packaging](https://github.com/bisq-network/bisq2-umbrel) uses.

## Build & test

**Prerequisites:** [`start-sdk`](https://github.com/Start9Labs/start-os), Docker with
`buildx`, [`deno`](https://deno.land), and [`yq`](https://github.com/mikefarah/yq).

```bash
make            # multi-arch (x86_64 + aarch64) build → bisq-node.s9pk, then verify
make x86        # x86_64 only  (faster; for a quick VM test)
make arm        # aarch64 only
make install    # sideload to a StartOS box via start-cli
                # (needs `host: http://<server-name>.local` in ~/.embassy/config.yaml)
make clean
```

`make install` sideloads to the host in `~/.embassy/config.yaml`. Start9's reviewers
build the same way (`make`) on their own system, so the build must succeed from a clean
checkout with no manual steps.

Testing targets both architectures: `x86_64` and `aarch64` (Raspberry Pi 8GB-class).
For local integration testing without dedicated hardware, StartOS runs in a QEMU VM.

## Contributing

Issues and PRs welcome — please keep changes focused on the StartOS packaging. Bisq 2
itself lives in [bisq-network/bisq2](https://github.com/bisq-network/bisq2), and the
mobile client in [bisq-network/bisq-mobile](https://github.com/bisq-network/bisq-mobile).

## License

[AGPL-3.0](./LICENSE), matching Bisq 2.
