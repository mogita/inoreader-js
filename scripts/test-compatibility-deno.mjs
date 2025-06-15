#!/usr/bin/env -S deno run --allow-read --allow-run --allow-env

/**
 * Deno-specific compatibility test orchestrator
 */

async function runTest(testFile, testName) {
  console.log(`\n🧪 Running ${testName}...`)
  
  return new Promise((resolve) => {
    const command = new Deno.Command('deno', {
      args: ['run', '--allow-read', '--allow-net', testFile],
      stdout: 'inherit',
      stderr: 'inherit'
    })
    
    const child = command.spawn()
    
    child.status.then((status) => {
      if (status.success) {
        console.log(`✅ ${testName} passed`)
        resolve(true)
      } else {
        console.log(`❌ ${testName} failed`)
        resolve(false)
      }
    }).catch((error) => {
      console.error(`❌ ${testName} failed to run:`, error.message)
      resolve(false)
    })
  })
}

async function main() {
  console.log('🧪 Running Deno compatibility tests...')
  
  const tests = [
    { file: 'scripts/test-esm.mjs', name: 'ESM compatibility test' },
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
    console.log('🎉 All Deno compatibility tests passed!')
    Deno.exit(0)
  } else {
    console.log('💥 Some Deno compatibility tests failed!')
    Deno.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Deno compatibility test runner failed:', error)
  Deno.exit(1)
})
