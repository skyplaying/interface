// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { registerCommands } from './commands'
import { registerSetupTests } from './setupTests'
// In order to use cypress commands with sideEffects set in package.json
// we need to import the commands and setupTests files here.
// See: https://github.com/cypress-io/cypress-documentation/pull/5454/files
registerCommands()
registerSetupTests()

// Squelch logs from fetches, as they clutter the logs so much as to make them unusable.
// See https://docs.cypress.io/api/commands/intercept#Disabling-logs-for-a-request.
// TODO(https://github.com/cypress-io/cypress/issues/26069): Squelch only wildcard logs once Cypress allows it.
const log = Cypress.log
Cypress.log = function (options, ...args) {
  if (options.displayName === 'script' || options.name === 'request') {
    return undefined
  }
  return log(options, ...args)
} as typeof log

Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false
})
