ARG IMAGE
FROM ${IMAGE}
# The base image's JVM trust store is only as current as its last release.
# Each keytool call must succeed: a failed or empty listing would otherwise
# look like "no emSign roots left" and skip the removal.
RUN set -eu; \
    certs="$(keytool -list -cacerts -storepass changeit)"; \
    printf '%s\n' "$certs" | grep -q 'trustedCertEntry' \
      || { echo 'keytool listed no trusted certificates' >&2; exit 1; }; \
    printf '%s\n' "$certs" | grep -i '^[^ ]*emsign.*trustedCertEntry' \
      | sed -E 's/, [A-Z][a-z]{2} [0-9]{1,2}, [0-9]{4}, trustedCertEntry,.*$//' \
      | while IFS= read -r alias; do keytool -delete -cacerts -storepass changeit -alias "$alias"; done; \
    remaining="$(keytool -list -cacerts -storepass changeit)"; \
    printf '%s\n' "$remaining" | grep -q 'trustedCertEntry' \
      || { echo 'keytool listed no trusted certificates after removal' >&2; exit 1; }; \
    if printf '%s\n' "$remaining" | grep -qi emsign; then \
      echo 'emSign roots still present in the JVM trust store' >&2; exit 1; \
    fi
