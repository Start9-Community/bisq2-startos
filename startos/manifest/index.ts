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
          'ghcr.io/bisq-network/bisq2-api:2.1.13.0@sha256:caeebd10b6e232ea8567941e4c6594b4000b5771c9e53cef25cf9b9766d5570d',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
