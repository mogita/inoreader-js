#!/usr/bin/env node

/**
 * ESM compatibility test
 */

import process from 'node:process' // needed for Deno v1

async function testESMImport() {
  console.log('🧪 Testing ESM import...')
  try {
    const { InoreaderClient } = await import('../dist/esm/index.js')

    // Test basic instantiation
    const client = new InoreaderClient({
      appId: 'test-app',
      appKey: 'test-key',
    })

    console.log('✅ ESM import successful')
    console.log('✅ Client instantiation successful')

    // Test that methods exist
    const methods = ['getUserInfo', 'getStreamContents', 'markAllAsRead', 'getSubscriptions']
    for (const method of methods) {
      if (typeof client[method] !== 'function') {
        throw new Error(`Method ${method} not found or not a function`)
      }
    }
    console.log('✅ All expected methods are present')

    return true
  } catch (error) {
    console.error('❌ ESM import failed:', error.message)
    return false
  }
}

async function main() {
  const success = await testESMImport()
  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 ESM test runner failed:', error)
  process.exit(1)
})
