ARG IMAGE
FROM ${IMAGE}
# The base image's JVM trust store is only as current as its last release.
RUN keytool -list -cacerts -storepass changeit | grep -i '^[^ ]*emsign.*trustedCertEntry' \
  | sed -E 's/, [A-Z][a-z]{2} [0-9]{1,2}, [0-9]{4}, trustedCertEntry,.*$//' \
  | while IFS= read -r alias; do keytool -delete -cacerts -storepass changeit -alias "$alias"; done \
 && ! keytool -list -cacerts -storepass changeit | grep -qi emsign
