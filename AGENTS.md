# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **The package id is `bisq2-node`, in a repo named `bisq2-startos`.** `Start9-Community/bisq2-startos` is Start9's fork of the Bisq project's repo, and the community registry builds from the fork.
- **Don't add a `Dockerfile` to get a helper script in.** The upstream image is consumed unmodified; put the logic in `startos/` instead. When you need to know what the image actually does, read its `entrypoint.sh` and bundled `api_app.conf` rather than assuming — `UPDATING.md` has the commands.
- **`startos/interfaces.ts` returning `[]` is finished, not unfinished.** The node cannot advertise an address it does not bind — `ApiConfig` exposes only `bindHost` / `bindPort` / `onionServicePort` — and Bisq Connect derives the endpoint from inside the pairing code (`apiUrl = code.restApiUrl`), with no host field to override it. An interface would publish a second, live, authenticated path to the API that the app never dials. Don't work around it by re-encoding the pairing blob: that reimplements `PairingQrCodeFormat` out of tree and breaks silently the first time its version, flags, or TLS-fingerprint fields change.
- **Keep the `clear-stale-pairing-code` oneshot ahead of the daemon.** Without it the previous run's code stays on disk, and both the health check and the action would present a spent code as current.

### `start-cli package attach` exits 0 even when the command fails

This is a StartOS bug rather than a quirk of this package, and it belongs in the packaging guide; it is recorded here because that is currently the only place it is written down. `attach … -- sh -c 'exit 7'` exits 0, and so does `-- false`. **Test conditions by matching on output, never on `$?`.**

The attach protocol does carry the exit code, but the server sends `ExitStatus::into_raw()` — the raw `wait` status, which encodes the code as `code << 8` — and the client hands that to `std::process::exit`, where the kernel keeps only the low byte. `strace` confirms it: an inner `exit 7` reaches `exit_group(1792)`. Since `code << 8` always has a zero low byte, every exit code collapses to 0. A non-zero status from `attach` means `attach` itself failed (6, for instance, when no subcontainer is running).
