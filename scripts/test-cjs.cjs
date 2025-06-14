#!/usr/bin/env node

/**
 * CJS compatibility test
 */

function testCJSRequire() {
  console.log('🧪 Testing CJS require...')
  try {
    const { InoreaderClient } = require('../dist/cjs/index.js')

    // Test basic instantiation
    const client = new InoreaderClient({
      appId: 'test-app',
      appKey: 'test-key',
    })

    console.log('✅ CJS require successful')
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
    console.error('❌ CJS require failed:', error)
    return false
  }
}

function main() {
  const success = testCJSRequire()
  process.exit(success ? 0 : 1)
}

main()
