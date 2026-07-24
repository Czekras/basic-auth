import test from 'node:test'
import assert from 'node:assert/strict'
import {
  accountStatus,
  autoLabel,
  makeSnapshot,
  nextStatus,
} from '../src/lib/accounts.js'

function snapshot(overrides = {}) {
  return makeSnapshot({
    caseName: 'SH12345',
    serverType: 'vps',
    domain: 'example.com',
    sakuraAccount: '',
    xserverLabel: '',
    manualPath: '',
    authName: 'Members only',
    users: [],
    ...overrides,
  })
}

test('normalizes optional snapshot fields at the domain boundary', () => {
  assert.deepEqual(
    {
      memo: snapshot().memo,
      status: snapshot().status,
    },
    {
      memo: '',
      status: 'enabled',
    },
  )
})

test('cycles account statuses in their displayed order', () => {
  assert.equal(nextStatus('enabled'), 'disabled')
  assert.equal(nextStatus('disabled'), 'needs-update')
  assert.equal(nextStatus('needs-update'), 'enabled')
  assert.equal(accountStatus({}), 'enabled')
})

test('labels accounts from only the active server configuration', () => {
  assert.equal(
    autoLabel(
      snapshot({
        serverType: 'sakura',
        domain: 'stale.example.com',
        sakuraAccount: 'customer',
      }),
    ),
    'customer',
  )
  assert.equal(
    autoLabel(
      snapshot({
        serverType: 'xserver',
        domain: 'example.com',
        xserverLabel: 'server01',
      }),
    ),
    'server01/example.com',
  )
})
