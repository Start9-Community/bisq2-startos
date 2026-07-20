#!/bin/sh
# Refresh /data/start9/stats.yaml from the node's pairing file so the pairing code (with a
# scannable QR) shows up as a StartOS "property".
#
# SECURITY: this runs UNPRIVILEGED as the node's `bisq` uid (999) — the entrypoint drops to 999
# before launching the loop — so a compromised node process cannot trick a root helper into
# writing through attacker-controlled paths. It also refuses to follow symlinks and writes
# atomically (temp + rename) with mode 0600.
#
# The pairing code is the raw first chunk of pairing_qr_code.txt (base64url, no decode needed).
# We deliberately do NOT derive the onion here: it is encoded (length-prefixed, URL-safe base64)
# inside the code and the mobile app decodes it properly — a shell base64/grep decode of that
# binary structure is unreliable.
set -eu

PAIRING_FILE="/data/pairing_qr_code.txt"
STATS_DIR="/data/start9"
STATS_FILE="${STATS_DIR}/stats.yaml"
TMP_FILE="${STATS_DIR}/.stats.yaml.$$.tmp"

# Refuse to operate through symlinks (a compromised node could swap in a symlink to a file
# outside the data volume).
for p in "${STATS_DIR}" "${STATS_FILE}" "${PAIRING_FILE}"; do
  [ -L "${p}" ] && { echo "write-stats: ${p} is a symlink; refusing" >&2; exit 1; }
done

mkdir -p "${STATS_DIR}"

# No pairing file yet -> nothing to publish (health stays "starting").
[ -f "${PAIRING_FILE}" ] || exit 0

# Pairing code = everything up to the first blank line (the base64url blob; before the ASCII QR).
code="$(awk 'NF{print; next} {exit}' "${PAIRING_FILE}" | tr -d '\r')"
[ -n "${code}" ] || exit 0

umask 077
cat > "${TMP_FILE}" <<EOF
version: 2
data:
  Pairing Code:
    type: string
    value: "${code}"
    description: Scan this with Bisq Connect, or copy it into "Pair with a new trusted node". Keep it private — it grants trade control of your node.
    copyable: true
    qr: true
    masked: true
EOF
chmod 600 "${TMP_FILE}"
mv -f "${TMP_FILE}" "${STATS_FILE}"
