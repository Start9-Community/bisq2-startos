# Stage 1: the published Bisq 2 web-UI image — source of the pairing/status page assets +
# nginx server config. Digest-pinned, multi-arch (amd64+arm64); same image the Umbrel app uses.
FROM ghcr.io/bisq-network/bisq2-api-web-ui:2.1.11.1@sha256:0295d45b6dafb3d9bf0d2e6ba74caeb42222e00eb30d9fa847a136a0f358aa23 AS webui

# Stage 2: the published Bisq 2 node image (multi-arch amd64+arm64) + a bundled nginx that
# serves the pairing/status page on :8091 as the StartOS interface.
FROM ghcr.io/bisq-network/bisq2-api:2.1.11.1@sha256:af77443abc90114b0282d44a1fa5b5f3beeb608b6df76d8674f4366236856154

USER root
# nginx serves the pairing/status UI on :8091 (the StartOS interface). nginx-light includes
# the proxy module used by the /api/v1/settings/version health probe. Workers run as the
# node's `bisq` user (uid 999) so they can read the node's owner-only (0600) pairing file
# WITHOUT relaxing its perms — master starts as root (binds the port, writes the pid), workers
# drop to bisq and therefore need the temp/log dirs owned by 999.
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx-light \
 && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default \
 && sed -i 's/^user .*/user bisq;/' /etc/nginx/nginx.conf \
 && chown -R 999:0 /var/lib/nginx /var/log/nginx

# Static page + server config from the published web-UI image (single source of truth).
COPY --from=webui /usr/share/nginx/html /usr/share/nginx/html
COPY --from=webui /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# StartOS layer: the entrypoint starts nginx + keeps the pairing "properties" in sync, then
# hands off to the node image's own entrypoint (chowns /data, drops to uid 999, runs the node).
COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY write-stats.sh /usr/local/bin/write-stats.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh /usr/local/bin/write-stats.sh
