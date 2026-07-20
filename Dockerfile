# The published Bisq 2 node image (multi-arch amd64+arm64), digest-pinned. The package is
# headless: no web UI is bundled — pairing happens via the authenticated StartOS Properties
# view (see write-stats.sh).
FROM ghcr.io/bisq-network/bisq2-api:2.1.11.1@sha256:af77443abc90114b0282d44a1fa5b5f3beeb608b6df76d8674f4366236856154

USER root

# StartOS layer: the entrypoint keeps the pairing "properties" in sync, then hands off to the
# node image's own entrypoint (chowns /data, drops to uid 999, runs the node).
COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY write-stats.sh /usr/local/bin/write-stats.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh /usr/local/bin/write-stats.sh
