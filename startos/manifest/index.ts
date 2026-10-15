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
      // Pinned to the tag's multi-arch index digest so a registry-side re-tag
      // cannot change what a build pulls. UPDATING.md has the refresh command.
      source: {
        dockerTag:
          'ghcr.io/bisq-network/bisq2-api:2.1.14.0@sha256:5b028dbe98353fae10d49d8d69f864a7ef9d294647d868c127f66c9f6a4f0a64',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
