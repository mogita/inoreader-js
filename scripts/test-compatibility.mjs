#!/usr/bin/env node

/**
 * Compatibility test orchestrator - runs all module format tests
 */

import { spawn } from 'node:child_process'
import { runTestSuite } from './test-runner-shared.mjs'

async function runTest(testFile, testName) {
  console.log(`\n🧪 Running ${testName}...`)

  return new Promise((resolve) => {
    const child = spawn('node', [testFile], { stdio: 'inherit' })

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testName} passed`)
        resolve(true)
      } else {
        console.log(`❌ ${testName} failed`)
        resolve(false)
      }
    })

    child.on('error', (error) => {
      console.error(`❌ ${testName} failed to run:`, error.message)
      resolve(false)
    })
  })
}

const config = {
  suiteName: 'compatibility tests',
  successMessage: '🎉 All compatibility tests passed!',
  failureMessage: '💥 Some compatibility tests failed!',
  tests: [
    { file: 'scripts/test-esm.mjs', name: 'ESM compatibility test' },
    { file: 'scripts/test-cjs.cjs', name: 'CJS compatibility test' },
    { file: 'scripts/test-types.mjs', name: 'TypeScript definitions test' },
  ],
  runTest,
  exit: (code) => process.exit(code),
}

runTestSuite(config).catch((error) => {
  console.error('💥 Compatibility test runner failed:', error)
  process.exit(1)
})
