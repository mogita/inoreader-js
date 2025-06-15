/**
 * Shared test runner functionality for compatibility tests
 * Provides common orchestration logic for both Node.js and Deno test runners
 */

/**
 * Run a test suite with the provided configuration
 * @param {Object} config - Test suite configuration
 * @param {string} config.suiteName - Name of the test suite for logging
 * @param {string} config.successMessage - Message to display when all tests pass
 * @param {string} config.failureMessage - Message to display when tests fail
 * @param {Array} config.tests - Array of test objects with {file, name} properties
 * @param {Function} config.runTest - Function to run a single test (testFile, testName) => Promise<boolean>
 * @param {Function} config.exit - Function to exit the process with a code
 */
export async function runTestSuite(config) {
  const { suiteName, successMessage, failureMessage, tests, runTest, exit } = config

  console.log(`🧪 Running ${suiteName}...`)

  const results = []

  for (const test of tests) {
    const result = await runTest(test.file, test.name)
    results.push(result)
  }

  const allPassed = results.every((result) => result)

  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log(successMessage)
    exit(0)
  } else {
    console.log(failureMessage)
    exit(1)
  }
}
