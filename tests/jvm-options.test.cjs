const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const { test } = require('node:test')
const { runInNewContext } = require('node:vm')
const ts = require('typescript')

function load(file, modules) {
  const exports = {}
  runInNewContext(
    ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      console,
      require: (name) => {
        assert.ok(name in modules, `Unexpected import: ${name}`)
        return modules[name]
      },
    },
  )
  return exports
}

async function nodeExec() {
  let exec
  const chain = {
    addDaemon: (_id, daemon) => {
      exec = daemon.exec
      return chain
    },
    addHealthCheck: () => chain,
  }
  const sdk = {
    setupMain: (fn) => fn,
    SubContainer: { of: () => ({}) },
    Mounts: { of: () => ({ mountVolume: () => ({}) }) },
    Daemons: { of: () => chain },
  }
  const { main } = load('startos/main.ts', {
    './sdk': { sdk },
    './i18n': { i18n: (s) => s },
    './utils': { pairingCodeFile: 'pairing_qr_code.txt' },
  })
  await main({ effects: {} })
  return exec
}

const { manifest } = load('startos/manifest/index.ts', {
  '@start9labs/start-sdk': { setupManifest: (m) => m },
  './i18n': {},
})

const image = manifest.images.main.source.dockerBuild.buildArgs.IMAGE
const inspection = spawnSync('docker', ['manifest', 'inspect', image], {
  encoding: 'utf8',
})
assert.equal(inspection.status, 0, inspection.stderr)
const index = JSON.parse(inspection.stdout)

for (const platform of ['linux/amd64', 'linux/arm64']) {
  test(`entrypoint preserves upstream properties and disables the intrinsic on ${platform}`, async () => {
    const exec = await nodeExec()
    assert.equal(exec.env.JAVA_OPTS, undefined)
    const child = index.manifests.find(
      (m) => `linux/${m.platform.architecture}` === platform,
    )
    assert.ok(child, `Missing ${platform} image`)
    const reference = `${image.split(':')[0]}@${child.digest}`
    const result = spawnSync(
      'docker',
      [
        'run',
        '--rm',
        '--platform',
        platform,
        '--network',
        'none',
        '--tmpfs',
        '/data',
        '--entrypoint',
        '/usr/bin/timeout',
        '-e',
        `JAVA_TOOL_OPTIONS=${exec.env.JAVA_TOOL_OPTIONS}`,
        '-e',
        'JAVA_OPTS=-Xmx512m -Djava4shell.sentinel=preserved -XX:+PrintFlagsFinal -XshowSettings:properties --dry-run',
        reference,
        '15s',
        ...exec.command,
      ],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 ** 2 },
    )
    assert.ifError(result.error)
    const output = result.stdout + result.stderr
    assert.equal(result.status, 0, output)
    assert.match(
      output,
      /UseBASE64Intrinsics\s+= false\s+\{product\} \{environment\}/,
    )
    assert.match(output, /MaxHeapSize\s+= 536870912\s/)
    assert.match(output, /java4shell.sentinel = preserved/)
    assert.match(output, /application.baseDir = \/data/)
    assert.match(output, /application.api.pairing.ttlInSeconds = 86400/)
    assert.match(output, /user.name = bisq/)
    console.info(
      output
        .split('\n')
        .filter((line) =>
          /UseBASE64Intrinsics\s+=|java.runtime.version =/.test(line),
        )
        .join('\n'),
    )
  })
}
