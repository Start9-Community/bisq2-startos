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
      source: {
        dockerBuild: {
          buildArgs: {
            // Pinned to the tag's multi-arch index digest so a registry-side
            // re-tag cannot change what a build pulls. UPDATING.md has the
            // refresh command.
            IMAGE:
              'ghcr.io/bisq-network/bisq2-api:2.1.16.0@sha256:15ef5bd524676730e16036a7ef1aae7da7f53a33064e118aaebb57d21da648f0',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
