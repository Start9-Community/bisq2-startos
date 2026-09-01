# Updating the upstream version

This package wraps the node image the Bisq project publishes,
`ghcr.io/bisq-network/bisq2-api`, unmodified. There is no `Dockerfile` here and
nothing is built from source, so a version bump is a one-line change to the
image tag.

The image tag is **not** the Bisq 2 release tag. It carries a fourth segment for
the image build — Bisq 2 `v2.1.11` is published as `bisq2-api:2.1.11.1` — and a
rebuild of the same Bisq 2 release bumps that last segment. Take the tag as
published rather than deriving it from the Bisq 2 release.

## Determining the upstream version

The current pin lives in `startos/manifest/index.ts` at
`images.main.source.dockerTag`.

Fetch the tags published for the image:

```sh
curl -s "https://ghcr.io/token?scope=repository:bisq-network/bisq2-api:pull" \
  | jq -r .token \
  | xargs -I{} curl -s -H "Authorization: Bearer {}" \
      https://ghcr.io/v2/bisq-network/bisq2-api/tags/list \
  | jq -r '.tags[]' | sort -V
```

Confirm the tag you intend to pin ships both architectures before using it:

```sh
docker manifest inspect ghcr.io/bisq-network/bisq2-api:<tag> \
  | jq -r '.manifests[].platform.architecture'
```

It must list `amd64` and `arm64`. For context on what changed in the underlying
release, see <https://github.com/bisq-network/bisq2/releases>.

## Applying the bump

1. Set `dockerTag` in `startos/manifest/index.ts` to the new `ghcr.io/bisq-network/bisq2-api:<tag>`.
2. Set `version` in `startos/versions/current.ts` to `<tag>:0` — the image tag,
   then the packaging revision. Bump only the `:N` suffix for changes to this
   package that do not move the image.
3. Rewrite `releaseNotes` in that file, in all five locales.
4. Check whether the image's `api_app.conf` or its `entrypoint.sh` changed in a
   way this package depends on — in particular the data directory, the pairing
   file name, and the API bind address:

   ```sh
   docker run --rm --entrypoint sh ghcr.io/bisq-network/bisq2-api:<tag> \
     -c 'cat /usr/local/bin/entrypoint.sh'
   ```

   `README.md` documents the behavior this package relies on; update it if any of
   it has moved.
