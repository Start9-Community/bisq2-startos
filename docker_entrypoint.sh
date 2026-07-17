#!/bin/sh
# StartOS entrypoint for Bisq 2 Node.
#
# StartOS overrides the image ENTRYPOINT with this file. We (1) serve the pairing/status web UI
# (the StartOS interface) via nginx, (2) keep StartOS "properties" (pairing code / onion) in sync
# with the node's rotating pairing file in the background, then (3) hand off to the node image's
# own entrypoint (`/usr/local/bin/entrypoint.sh`), which chowns /data, drops to uid 999 via
# setpriv, and runs the node.
set -e

printf "\n [i] Starting Bisq 2 Node ...\n\n"

# Web UI on :8091 (the StartOS interface). nginx master starts as root and binds the port; its
# workers run as the node's `bisq` uid (999) so they can read the owner-only pairing file. Don't
# let a web-UI hiccup take down the node — log and continue.
nginx || printf " [!] web UI (nginx) failed to start; node continues without it\n"

# Clear STALE generated state from a previous run/restore so health can't report success on a
# pairing token that isn't fresh, then hand the dir to the node's uid.
mkdir -p /data/start9
rm -f /data/start9/stats.yaml /data/start9/.stats.yaml.*.tmp
chown 999:999 /data/start9

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
