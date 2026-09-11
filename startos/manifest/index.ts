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
      source: { dockerTag: 'ghcr.io/bisq-network/bisq2-api:2.1.12.1@sha256:79fb71d64d23863c8f48d484a9d84754dae40e12cb395bca348f17dcec46b297' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
