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

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `bisq2-node`**, in a repo named `bisq2-startos` — the repo belongs to the Bisq project; `Start9-Community/bisq2-startos` is Start9's fork, and the fork is what the community registry builds from.
- **The upstream image is consumed unmodified.** There is no `Dockerfile` and nothing is built from source — `startos/manifest/index.ts` pins `ghcr.io/bisq-network/bisq2-api` by tag, and the daemon runs the image's own entrypoint via `sdk.useEntrypoint()`. Don't reintroduce a build layer to add a helper script; put the logic in `startos/` instead.
- **The node's config comes from the image**, not from this package. `api_app.conf` inside `api-app.jar` is the source of truth for the API bind address, the transport, and the pairing behavior — read it there before assuming anything about them (`UPDATING.md` has the command).
- **No interfaces, deliberately.** The node's API is loopback-only and Bisq Connect reaches it over an onion service the node creates for itself, so there is nothing for a StartOS binding to address. `startos/interfaces.ts` returning `[]` is correct, not unfinished.
- **Don't health-check port 8090 with `checkPortListening`.** The API binds an IPv4-mapped IPv6 socket (`::ffff:127.0.0.1`); that helper only matches IPv6 sockets on the wildcard address, so it reports failure forever. `main.ts` probes the port over HTTP instead.
- **The pairing code is state, not config.** It is single-use, expires, and is rewritten by the node every few minutes — so it is read fresh on each use and never cached. `main.ts` deletes the file at startup so a code from a previous run can't be handed out as current.

## Inspecting a running install

To run a command inside a service's container (read its generated config, grep app logs), use `start-cli package attach <id> -n <subcontainer-name> -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `bisq2-node-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers". A service with more than one subcontainer requires a selector; with none given, `attach` falls back to an interactive picker that panics in a non-TTY shell — that's the missing selector, not a TTY requirement.

`attach` also **does not propagate the inner command's exit code** — `attach … -- sh -c 'exit 7'` exits 0. Test conditions by matching on its output, not on `$?`.
