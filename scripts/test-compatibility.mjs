#!/usr/bin/env node

/**
 * Compatibility test orchestrator - runs all module format tests
 */

import { spawn } from 'node:child_process'

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

async function main() {
  console.log('🧪 Running compatibility tests...')
  
  const tests = [
    { file: 'scripts/test-esm.mjs', name: 'ESM compatibility test' },
    { file: 'scripts/test-cjs.cjs', name: 'CJS compatibility test' },
    { file: 'scripts/test-types.mjs', name: 'TypeScript definitions test' }
  ]
  
  const results = []
  
  for (const test of tests) {
    const result = await runTest(test.file, test.name)
    results.push(result)
  }
  
  const allPassed = results.every(result => result)
  
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('🎉 All compatibility tests passed!')
    process.exit(0)
  } else {
    console.log('💥 Some compatibility tests failed!')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Compatibility test runner failed:', error)
  process.exit(1)
})
