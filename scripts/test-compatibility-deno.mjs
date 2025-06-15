#!/usr/bin/env -S deno run --allow-read --allow-run --allow-env

/**
 * Deno-specific compatibility test orchestrator
 */

import { runTestSuite } from './test-runner-shared.mjs'

async function runTest(testFile, testName) {
  console.log(`\n🧪 Running ${testName}...`)

  return new Promise((resolve) => {
    const command = new Deno.Command('deno', {
      args: ['run', '--allow-read', '--allow-net', testFile],
      stdout: 'inherit',
      stderr: 'inherit',
    })

    const child = command.spawn()

    child.status
      .then((status) => {
        if (status.success) {
          console.log(`✅ ${testName} passed`)
          resolve(true)
        } else {
          console.log(`❌ ${testName} failed`)
          resolve(false)
        }
      })
      .catch((error) => {
        console.error(`❌ ${testName} failed to run:`, error.message)
        resolve(false)
      })
  })
}

const config = {
  suiteName: 'Deno compatibility tests',
  successMessage: '🎉 All Deno compatibility tests passed!',
  failureMessage: '💥 Some Deno compatibility tests failed!',
  tests: [
    { file: 'scripts/test-esm.mjs', name: 'ESM compatibility test' },
    { file: 'scripts/test-types.mjs', name: 'TypeScript definitions test' },
  ],
  runTest,
  exit: (code) => Deno.exit(code),
}

runTestSuite(config).catch((error) => {
  console.error('💥 Deno compatibility test runner failed:', error)
  Deno.exit(1)
})
