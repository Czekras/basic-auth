import test from 'node:test'
import assert from 'node:assert/strict'
import {
  findAccountByPath,
  findAccountById,
  updateAccountSnapshot,
  prependAccount,
  removeAccount,
  restoreAccount,
  cycleAccountStatus,
  appendGroup,
  renameGroup,
  deleteGroup,
  moveAccount,
  reorderGroups,
  upsertCredential,
} from '../src/lib/accountGroups.js'
import { DEFAULT_GROUP_ID } from '../src/lib/accounts.js'

function snapshot(overrides = {}) {
  return {
    caseName: 'SH12345',
    serverType: 'vps',
    domain: 'example.com',
    sakuraAccount: '',
    xserverLabel: '',
    manualPath: '',
    authName: 'Members only',
    users: [],
    memo: '',
    status: 'enabled',
    ...overrides,
  }
}

function account(id, overrides = {}) {
  return {
    id,
    label: id,
    snapshot: snapshot(overrides),
  }
}

function groups() {
  return [
    {
      id: DEFAULT_GROUP_ID,
      name: 'Recent',
      accounts: [account('recent-account')],
    },
    {
      id: 'clients',
      name: 'Clients',
      accounts: [account('client-a'), account('client-b')],
    },
    {
      id: 'archive',
      name: 'Archive',
      accounts: [account('archived')],
    },
  ]
}

test('finds accounts by ID and generated path', () => {
  const source = groups()

  assert.equal(findAccountById(source, 'client-a')?.groupId, 'clients')
  assert.equal(
    findAccountByPath(source, '/var/www/vhosts/example.com/httpdocs/.htpasswd')
      ?.account.id,
    'recent-account',
  )
  assert.equal(findAccountById(source, 'missing'), null)
})

test('updates, prepends, and removes accounts without mutating other groups', () => {
  const source = groups()
  const updatedSnapshot = snapshot({ memo: 'updated' })
  const updated = updateAccountSnapshot(
    source,
    'clients',
    'client-a',
    updatedSnapshot,
  )

  assert.equal(updated[1].accounts[0].snapshot.memo, 'updated')
  assert.equal(updated[0], source[0])

  const addedAccount = account('new-account')
  const added = prependAccount(updated, DEFAULT_GROUP_ID, addedAccount)
  assert.deepEqual(
    added[0].accounts.map((item) => item.id),
    ['new-account', 'recent-account'],
  )

  const removed = removeAccount(added, DEFAULT_GROUP_ID, 'new-account')
  assert.deepEqual(
    removed[0].accounts.map((item) => item.id),
    ['recent-account'],
  )
})

test('restores an account to its original group or Recent when that group is gone', () => {
  const restoredAccount = account('restored')
  const originalGroup = restoreAccount(groups(), 'clients', restoredAccount)
  assert.equal(originalGroup[1].accounts[0], restoredAccount)

  const fallback = restoreAccount(groups(), 'deleted-group', restoredAccount)
  assert.equal(fallback[0].accounts[0], restoredAccount)
})

test('cycles account status while preserving unrelated accounts', () => {
  const source = groups()
  const disabled = cycleAccountStatus(source, 'clients', 'client-a')
  const needsUpdate = cycleAccountStatus(disabled, 'clients', 'client-a')
  const enabled = cycleAccountStatus(needsUpdate, 'clients', 'client-a')

  assert.equal(disabled[1].accounts[0].snapshot.status, 'disabled')
  assert.equal(needsUpdate[1].accounts[0].snapshot.status, 'needs-update')
  assert.equal(enabled[1].accounts[0].snapshot.status, 'enabled')
  assert.equal(enabled[1].accounts[1], source[1].accounts[1])
})

test('manages groups while protecting Recent and retaining deleted accounts', () => {
  const source = groups()
  const added = appendGroup(source, {
    id: 'new-group',
    name: 'New group',
    accounts: [],
  })
  assert.equal(added.at(-1).name, 'New group')

  const renamed = renameGroup(added, 'clients', 'Customers')
  assert.equal(renamed[1].name, 'Customers')
  assert.equal(renameGroup(renamed, DEFAULT_GROUP_ID, 'Changed'), renamed)

  const afterDelete = deleteGroup(renamed, 'clients')
  assert.deepEqual(
    afterDelete[0].accounts.map((item) => item.id),
    ['recent-account', 'client-a', 'client-b'],
  )
  assert.equal(
    afterDelete.some((group) => group.id === 'clients'),
    false,
  )
  assert.equal(deleteGroup(afterDelete, DEFAULT_GROUP_ID), afterDelete)
})

test('moves accounts within and between groups', () => {
  const source = groups()
  const reordered = moveAccount(source, 'client-a', 'clients', 'clients', 1)
  assert.deepEqual(
    reordered[1].accounts.map((item) => item.id),
    ['client-b', 'client-a'],
  )

  const moved = moveAccount(reordered, 'client-a', 'clients', 'archive', 0)
  assert.deepEqual(
    moved[1].accounts.map((item) => item.id),
    ['client-b'],
  )
  assert.deepEqual(
    moved[2].accounts.map((item) => item.id),
    ['client-a', 'archived'],
  )
})

test('reorders groups while keeping Recent pinned first', () => {
  const source = groups()
  const reordered = reorderGroups(source, 2, 0)

  assert.deepEqual(
    reordered.map((group) => group.id),
    [DEFAULT_GROUP_ID, 'archive', 'clients'],
  )
  assert.equal(reorderGroups(source, 0, 2), source)
})

test('upserts credentials by username without changing their order otherwise', () => {
  const source = [
    { user: 'admin', pass: 'old', enc: 'old-hash' },
    { user: 'editor', pass: 'editor-pass', enc: 'editor-hash' },
  ]
  const credential = { user: 'admin', pass: 'new', enc: 'new-hash' }

  assert.deepEqual(upsertCredential(source, credential), [
    source[1],
    credential,
  ])
})
