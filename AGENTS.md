# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The package id is `bisq2-node`, in a repo named `bisq2-startos`.** `Start9-Community/bisq2-startos` is Start9's fork of the Bisq project's repo, and the community registry builds from the fork.
- **Don't add a `Dockerfile` to get a helper script in.** The upstream image is consumed unmodified; put the logic in `startos/` instead. When you need to know what the image actually does, read its `entrypoint.sh` and bundled `api_app.conf` rather than assuming — `UPDATING.md` has the commands.
- **`startos/interfaces.ts` returning `[]` is finished, not unfinished.** Why an interface cannot work — and why re-encoding the pairing blob ourselves is not the workaround — is argued out in `TODO.md`; read it before revisiting.
- **Keep the `clear-stale-pairing-code` oneshot ahead of the daemon.** Without it the previous run's code stays on disk, and both the health check and the action would present a spent code as current.

### `start-cli package attach` exits 0 even when the command fails

This is a StartOS bug rather than a quirk of this package, and it belongs in the packaging guide; it is recorded here because that is currently the only place it is written down. `attach … -- sh -c 'exit 7'` exits 0, and so does `-- false`. **Test conditions by matching on output, never on `$?`.**

The attach protocol does carry the exit code, but the server sends `ExitStatus::into_raw()` — the raw `wait` status, which encodes the code as `code << 8` — and the client hands that to `std::process::exit`, where the kernel keeps only the low byte. `strace` confirms it: an inner `exit 7` reaches `exit_group(1792)`. Since `code << 8` always has a zero low byte, every exit code collapses to 0. A non-zero status from `attach` means `attach` itself failed (6, for instance, when no subcontainer is running).
