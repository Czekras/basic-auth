import { fullPath } from './codegen.js'
import { DEFAULT_GROUP_ID, accountStatus, nextStatus } from './accounts.js'

/** @typedef {import('./accounts.js').AccountGroup} AccountGroup */
/** @typedef {import('./accounts.js').AccountSnapshot} AccountSnapshot */
/** @typedef {import('./accounts.js').Credential} Credential */
/** @typedef {import('./accounts.js').SavedAccount} SavedAccount */

/**
 * @param {AccountGroup[]} groups
 * @param {string} path
 * @returns {{ groupId: string, account: SavedAccount } | null}
 */
export function findAccountByPath(groups, path) {
  for (const group of groups) {
    const account = group.accounts.find(
      (candidate) => fullPath(candidate.snapshot) === path,
    )
    if (account) return { groupId: group.id, account }
  }
  return null
}

/**
 * @param {AccountGroup[]} groups
 * @param {string | null} accountId
 * @returns {{ groupId: string, account: SavedAccount } | null}
 */
export function findAccountById(groups, accountId) {
  for (const group of groups) {
    const account = group.accounts.find(
      (candidate) => candidate.id === accountId,
    )
    if (account) return { groupId: group.id, account }
  }
  return null
}

/**
 * @param {AccountGroup[]} groups
 * @param {string} groupId
 * @param {string} accountId
 * @param {AccountSnapshot} snapshot
 * @returns {AccountGroup[]}
 */
export function updateAccountSnapshot(groups, groupId, accountId, snapshot) {
  return groups.map((group) =>
    group.id !== groupId
      ? group
      : {
          ...group,
          accounts: group.accounts.map((account) =>
            account.id === accountId ? { ...account, snapshot } : account,
          ),
        },
  )
}

export function prependAccount(groups, groupId, account) {
  return groups.map((group) =>
    group.id === groupId
      ? { ...group, accounts: [account, ...group.accounts] }
      : group,
  )
}

export function removeAccount(groups, groupId, accountId) {
  return groups.map((group) =>
    group.id === groupId
      ? {
          ...group,
          accounts: group.accounts.filter(
            (account) => account.id !== accountId,
          ),
        }
      : group,
  )
}

// Undo targets the original group when possible and falls back to Recent.
export function restoreAccount(groups, preferredGroupId, account) {
  const targetGroupId = groups.some((group) => group.id === preferredGroupId)
    ? preferredGroupId
    : DEFAULT_GROUP_ID
  return prependAccount(groups, targetGroupId, account)
}

export function cycleAccountStatus(groups, groupId, accountId) {
  return groups.map((group) =>
    group.id !== groupId
      ? group
      : {
          ...group,
          accounts: group.accounts.map((account) =>
            account.id !== accountId
              ? account
              : {
                  ...account,
                  snapshot: {
                    ...account.snapshot,
                    status: nextStatus(accountStatus(account.snapshot)),
                  },
                },
          ),
        },
  )
}

export function appendGroup(groups, group) {
  return [...groups, group]
}

export function renameGroup(groups, groupId, name) {
  if (groupId === DEFAULT_GROUP_ID) return groups
  return groups.map((group) =>
    group.id === groupId ? { ...group, name } : group,
  )
}

// Deleting a group keeps its accounts by moving them into Recent.
export function deleteGroup(groups, groupId) {
  if (groupId === DEFAULT_GROUP_ID) return groups

  const deletedGroup = groups.find((group) => group.id === groupId)
  if (!deletedGroup) return groups

  return groups
    .map((group) =>
      group.id === DEFAULT_GROUP_ID
        ? {
            ...group,
            accounts: [...group.accounts, ...deletedGroup.accounts],
          }
        : group,
    )
    .filter((group) => group.id !== groupId)
}

/**
 * @param {AccountGroup[]} groups
 * @param {string} accountId
 * @param {string} fromGroupId
 * @param {string} toGroupId
 * @param {number} toIndex
 * @returns {AccountGroup[]}
 */
export function moveAccount(
  groups,
  accountId,
  fromGroupId,
  toGroupId,
  toIndex,
) {
  const sourceGroup = groups.find((group) => group.id === fromGroupId)
  const account = sourceGroup?.accounts.find(
    (candidate) => candidate.id === accountId,
  )
  if (!account) return groups

  return groups.map((group) => {
    if (group.id === fromGroupId && group.id === toGroupId) {
      const remainingAccounts = group.accounts.filter(
        (candidate) => candidate.id !== accountId,
      )
      const insertionIndex = Math.min(toIndex, remainingAccounts.length)
      return {
        ...group,
        accounts: [
          ...remainingAccounts.slice(0, insertionIndex),
          account,
          ...remainingAccounts.slice(insertionIndex),
        ],
      }
    }

    if (group.id === fromGroupId) {
      return {
        ...group,
        accounts: group.accounts.filter(
          (candidate) => candidate.id !== accountId,
        ),
      }
    }

    if (group.id === toGroupId) {
      const insertionIndex = Math.min(toIndex, group.accounts.length)
      return {
        ...group,
        accounts: [
          ...group.accounts.slice(0, insertionIndex),
          account,
          ...group.accounts.slice(insertionIndex),
        ],
      }
    }

    return group
  })
}

export function reorderGroups(groups, fromIndex, toIndex) {
  // Recent is permanently pinned first.
  if (groups[fromIndex]?.id === DEFAULT_GROUP_ID) return groups

  const reorderedGroups = [...groups]
  const [movedGroup] = reorderedGroups.splice(fromIndex, 1)
  if (!movedGroup) return groups

  reorderedGroups.splice(Math.max(toIndex, 1), 0, movedGroup)
  return reorderedGroups
}

/**
 * @param {Credential[]} users
 * @param {Credential} credential
 * @returns {Credential[]}
 */
export function upsertCredential(users, credential) {
  return [
    ...users.filter((existing) => existing.user !== credential.user),
    credential,
  ]
}
