import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.15.0:1',
  releaseNotes: {
    en_US:
      'Security: mitigates Java4Shell (CVE-2026-114938) on affected x86-64 servers.',
    es_ES:
      'Seguridad: mitiga Java4Shell (CVE-2026-114938) en los servidores x86-64 afectados.',
    de_DE:
      'Sicherheit: entschärft Java4Shell (CVE-2026-114938) auf betroffenen x86-64-Servern.',
    pl_PL:
      'Bezpieczeństwo: ogranicza podatność Java4Shell (CVE-2026-114938) na podatnych serwerach x86-64.',
    fr_FR:
      'Sécurité : atténue Java4Shell (CVE-2026-114938) sur les serveurs x86-64 concernés.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
