# The published Bisq 2 node image (multi-arch amd64+arm64), digest-pinned.
FROM ghcr.io/bisq-network/bisq2-api:2.1.11.1@sha256:af77443abc90114b0282d44a1fa5b5f3beeb608b6df76d8674f4366236856154

USER root

# nginx-light serves ONLY the static status/landing page (see web/) on :8091 as the StartOS
# interface. Deliberately NOT the bisq2-api-web-ui image: that one renders the pairing code, which
# is a bearer token — this page shows no secrets and never reads the pairing file, so the workers
# run as the default unprivileged nginx user with no access to /data.
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx-light \
 && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

# Static page + its server block (single source of truth in this repo, not pulled from any image).
COPY web/index.html /usr/share/nginx/html/index.html
COPY web/default.conf /etc/nginx/conf.d/default.conf

# StartOS layer: the entrypoint starts the static status server + keeps the pairing "properties" in
# sync, then hands off to the node image's own entrypoint (chowns /data, drops to uid 999, runs it).
COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY write-stats.sh /usr/local/bin/write-stats.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh /usr/local/bin/write-stats.sh
