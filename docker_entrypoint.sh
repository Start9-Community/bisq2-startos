#!/bin/sh
# StartOS entrypoint for Bisq 2 Node.
#
# StartOS overrides the image ENTRYPOINT with this file. We (1) serve the static status/landing page
# (the StartOS interface) via nginx, (2) keep StartOS "properties" (the pairing code) in sync with
# the node's rotating pairing file in the background, then (3) hand off to the node image's own
# entrypoint (`/usr/local/bin/entrypoint.sh`), which chowns /data, drops to uid 999 via setpriv,
# and runs the node.
set -e

printf "\n [i] Starting Bisq 2 Node ...\n\n"

# Clear STALE generated state from a previous run/restore so health can't report success on a
# pairing token that isn't fresh, then hand the dir to the node's uid.
#
# Refuse a symlinked state dir before this root-run cleanup: a compromised uid-999 node could have
# swapped /data/start9 for a symlink (e.g. -> /etc), which the chown below would dereference,
# handing that target to uid 999 and defeating the non-root boundary. The dir only holds
# regenerated state, so removing a symlinked path is safe.
[ -L /data/start9 ] && rm -f /data/start9
mkdir -p /data/start9
[ -L /data/start9 ] && { printf " [!] /data/start9 is a symlink; refusing\n" >&2; exit 1; }

# Also drop the SOURCE pairing file: the node rewrites it at runtime with a fresh (rotating) code,
# so a stale one surviving a restart/restore would let write-stats republish an unusable token that
# health then reports as ready. Gone until the node writes a fresh one -> health stays "starting".
rm -f /data/start9/stats.yaml /data/start9/.stats.yaml.*.tmp /data/pairing_qr_code.txt
chown 999:999 /data/start9

# Static status page on :8091 (the StartOS interface). Serves only web/index.html — no proxy, no
# access to the pairing file — so it can neither leak the token nor misreport node health. Started
# only AFTER the stale-state cleanup above, so it can't serve during the window where the existence-
# only health check would accept a persisted stats.yaml. This is the service's ONLY interface, so a
# failure to bind is FATAL: exit and let StartOS restart us rather than run a headless, unpairable
# node (the `status-page` health check then catches nginx dying later — see healthChecks.ts).
nginx || { printf " [!] status page (nginx) failed to start; aborting\n" >&2; exit 1; }

# Background: refresh /data/start9/stats.yaml from the pairing file every few seconds so the
# StartOS UI shows the current (auto-rotating) pairing code + QR. Runs UNPRIVILEGED as the node's
# uid (999) — never as root — so a compromised node cannot abuse a privileged writer.
setpriv --reuid=999 --regid=999 --clear-groups sh -c '
  while true; do
    /usr/local/bin/write-stats.sh || true
    sleep 5
  done
' &

exec /usr/local/bin/entrypoint.sh
