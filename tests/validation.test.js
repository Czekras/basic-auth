import test from 'node:test'
import assert from 'node:assert/strict'
import {
  sanitizeAuthName,
  sanitizeDomain,
  sanitizeSakuraAccount,
  sanitizeUsername,
  sanitizeXserverLabel,
} from '../src/lib/validation.js'

test('sanitizes credential and path fields according to their host rules', () => {
  assert.equal(sanitizeUsername('Admin:name!'), 'Adminname')
  assert.equal(sanitizeSakuraAccount('My-Account!'), 'my-account')
  assert.equal(sanitizeXserverLabel('SV-123'), 'sv123')
  assert.equal(sanitizeDomain('WWW.Example.COM/path'), 'www.example.compath')
  assert.equal(sanitizeAuthName('Members "Only"'), 'Members Only')
})
