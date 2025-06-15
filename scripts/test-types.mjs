#!/usr/bin/env node

/**
 * TypeScript definitions compatibility test
 */

import process from 'node:process' // needed for Deno v1
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function testTypeDefinitions() {
  console.log('🧪 Testing TypeScript definitions...')
  try {
    const typesPath = join(process.cwd(), 'dist/types/index.d.ts')
    const typesContent = readFileSync(typesPath, 'utf8')

    // Check for essential exports
    const requiredExports = ['InoreaderClient', 'InoreaderConfig', 'AuthCredentials', 'UserInfo']

    for (const exportName of requiredExports) {
      if (!typesContent.includes(exportName)) {
        throw new Error(`Type definition for ${exportName} not found`)
      }
    }

    console.log('✅ TypeScript definitions are present')
    return true
  } catch (error) {
    console.error('❌ TypeScript definitions test failed:', error.message)
    return false
  }
}

function main() {
  const success = testTypeDefinitions()
  process.exit(success ? 0 : 1)
}

main()
