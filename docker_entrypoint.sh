#!/bin/sh
# StartOS entrypoint for Bisq 2 Node.
#
# StartOS overrides the image ENTRYPOINT with this file. We (1) keep StartOS "properties" (the
# pairing code) in sync with the node's rotating pairing file in the background, then (2) hand
# off to the node image's own entrypoint (`/usr/local/bin/entrypoint.sh`), which chowns /data,
# drops to uid 999 via setpriv, and runs the node.
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
