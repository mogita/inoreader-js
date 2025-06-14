#!/usr/bin/env node

/**
 * Compatibility test script to verify the built package works across different runtimes
 * This script tests the actual built artifacts without running Bun-specific test code
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function testESMImport() {
  console.log('Testing ESM import...');
  try {
    const { InoreaderClient } = await import('../dist/esm/index.js');
    
    // Test basic instantiation
    const client = new InoreaderClient({
      appId: 'test-app',
      appKey: 'test-key'
    });
    
    console.log('✅ ESM import successful');
    console.log('✅ Client instantiation successful');
    
    // Test that methods exist
    const methods = ['authenticate', 'getUserInfo', 'getStreamContents', 'markAsRead'];
    for (const method of methods) {
      if (typeof client[method] !== 'function') {
        throw new Error(`Method ${method} not found or not a function`);
      }
    }
    console.log('✅ All expected methods are present');
    
    return true;
  } catch (error) {
    console.error('❌ ESM import failed:', error.message);
    return false;
  }
}

async function testCJSRequire() {
  console.log('\nTesting CJS require...');
  try {
    // Use dynamic import for CJS in ESM context
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    const { InoreaderClient } = require('../dist/cjs/index.js');
    
    // Test basic instantiation
    const client = new InoreaderClient({
      appId: 'test-app',
      appKey: 'test-key'
    });
    
    console.log('✅ CJS require successful');
    console.log('✅ Client instantiation successful');
    
    // Test that methods exist
    const methods = ['authenticate', 'getUserInfo', 'getStreamContents', 'markAsRead'];
    for (const method of methods) {
      if (typeof client[method] !== 'function') {
        throw new Error(`Method ${method} not found or not a function`);
      }
    }
    console.log('✅ All expected methods are present');
    
    return true;
  } catch (error) {
    console.error('❌ CJS require failed:', error.message);
    return false;
  }
}

async function testTypeDefinitions() {
  console.log('\nTesting TypeScript definitions...');
  try {
    const typesPath = join(process.cwd(), 'dist/types/index.d.ts');
    const typesContent = readFileSync(typesPath, 'utf8');
    
    // Check for essential exports
    const requiredExports = [
      'InoreaderClient',
      'InoreaderConfig',
      'AuthResponse',
      'UserInfo'
    ];
    
    for (const exportName of requiredExports) {
      if (!typesContent.includes(exportName)) {
        throw new Error(`Type definition for ${exportName} not found`);
      }
    }
    
    console.log('✅ TypeScript definitions are present');
    return true;
  } catch (error) {
    console.error('❌ TypeScript definitions test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Running compatibility tests...\n');
  
  const results = await Promise.all([
    testESMImport(),
    testCJSRequire(),
    testTypeDefinitions()
  ]);
  
  const allPassed = results.every(result => result);
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All compatibility tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some compatibility tests failed!');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Compatibility test runner failed:', error);
  process.exit(1);
});
