import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bisq2-node',
  title: 'Bisq 2 Node',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9-Community/bisq2-startos',
  upstreamRepo: 'https://github.com/bisq-network/bisq2',
  marketingUrl: 'https://bisq.network',
  donationUrl: 'https://bisq.network/contribute/',
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      // Tag pinned to its immutable multi-arch index digest so a registry-side
      // re-tag can never change the bytes inside a signed package. On upgrade,
      // refresh with: TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:bisq-network/bisq2-api:pull" | jq -r .token);
      // curl -sI -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.oci.image.index.v1+json" \
      //   https://ghcr.io/v2/bisq-network/bisq2-api/manifests/<tag> | grep -i docker-content-digest
      source: {
        dockerTag:
          'ghcr.io/bisq-network/bisq2-api:2.1.11.2@sha256:3dd9152da26fa6d409707e16b4e0a5725ed95e59383de02a1f5778ec75d69306',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
