import { useCallback, useState } from 'react'
import useGroupActions from './useGroupActions.js'
import useUndoableAccountDeletion from './useUndoableAccountDeletion.js'
import {
  autoLabel,
  blankSnapshot,
  defaultGroups,
  makeSnapshot,
  newAccountId,
  DEFAULT_GROUP_ID,
} from '../lib/accounts.js'
import {
  cycleAccountStatus as cycleStatusInGroups,
  findAccountById,
  findAccountByPath,
  prependAccount,
  updateAccountSnapshot,
  upsertCredential,
} from '../lib/accountGroups.js'
import { fullPath } from '../lib/codegen.js'

function initialWorkspace(stored) {
  const groups = stored.groups || defaultGroups()
  const restoredAccount = findAccountById(
    groups,
    stored.activeAccountId || null,
  )
  const fallbackSnapshot =
    restoredAccount?.account.snapshot ??
    makeSnapshot({
      caseName: stored.caseName || '',
      serverType: stored.serverType || 'vps',
      domain: stored.domain || '',
      sakuraAccount: stored.sakuraAccount || '',
      xserverLabel: stored.xserverLabel || '',
      manualPath: stored.manualPath || '',
      authName: stored.authName ?? 'メンテナンス中',
      users: stored.users || [],
    })

  return {
    groups,
    activeAccountId: restoredAccount ? stored.activeAccountId : null,
    fallbackSnapshot,
  }
}

export default function useAccountWorkspace(stored) {
  const [initial] = useState(() => initialWorkspace(stored))
  const [groups, setGroups] = useState(initial.groups)
  const [activeAccountId, setActiveAccountId] = useState(
    initial.activeAccountId,
  )
  const [fallbackSnapshot, setFallbackSnapshot] = useState(
    initial.fallbackSnapshot,
  )
  const activeEntry = findAccountById(groups, activeAccountId)
  const previewSnapshot = activeEntry?.account.snapshot ?? fallbackSnapshot

  const clearSelection = useCallback(() => {
    setActiveAccountId(null)
    setFallbackSnapshot(blankSnapshot())
  }, [])
  const deletion = useUndoableAccountDeletion({
    groups,
    setGroups,
    activeAccountId,
    clearSelection,
  })
  const groupActions = useGroupActions(setGroups)

  const selectAccount = useCallback(
    (accountId) => {
      const entry = findAccountById(groups, accountId)
      if (!entry) return null

      setActiveAccountId(accountId)
      return entry
    },
    [groups],
  )

  const saveSnapshot = useCallback(
    (snapshot) => {
      const match = findAccountByPath(groups, fullPath(snapshot))
      let accountId

      if (match) {
        accountId = match.account.id
        setGroups((previousGroups) =>
          updateAccountSnapshot(
            previousGroups,
            match.groupId,
            accountId,
            snapshot,
          ),
        )
      } else {
        accountId = newAccountId()
        setGroups((previousGroups) =>
          prependAccount(previousGroups, DEFAULT_GROUP_ID, {
            id: accountId,
            label: autoLabel(snapshot),
            snapshot,
          }),
        )
      }

      setActiveAccountId(accountId)
    },
    [groups],
  )

  const saveCredentialToPath = useCallback(
    (path, credential, shouldReplaceUsers = false) => {
      const match = findAccountByPath(groups, path)
      if (!match) return false

      const users = shouldReplaceUsers
        ? [credential]
        : upsertCredential(match.account.snapshot.users, credential)
      const snapshot = { ...match.account.snapshot, users }

      setGroups((previousGroups) =>
        updateAccountSnapshot(
          previousGroups,
          match.groupId,
          match.account.id,
          snapshot,
        ),
      )
      setActiveAccountId(match.account.id)
      return true
    },
    [groups],
  )

  const addCredential = useCallback(
    (accountId, credential) => {
      const entry = findAccountById(groups, accountId)
      if (!entry) return

      const users = upsertCredential(entry.account.snapshot.users, credential)
      const snapshot = { ...entry.account.snapshot, users }

      setGroups((previousGroups) =>
        updateAccountSnapshot(
          previousGroups,
          entry.groupId,
          accountId,
          snapshot,
        ),
      )
    },
    [groups],
  )

  const removeCredential = useCallback(
    (accountId, username) => {
      const entry = findAccountById(groups, accountId)
      if (!entry) return

      const users = entry.account.snapshot.users.filter(
        (credential) => credential.user !== username,
      )
      const snapshot = { ...entry.account.snapshot, users }

      setGroups((previousGroups) =>
        updateAccountSnapshot(
          previousGroups,
          entry.groupId,
          accountId,
          snapshot,
        ),
      )
    },
    [groups],
  )

  const updateMemo = useCallback(
    (memo) => {
      const entry = findAccountById(groups, activeAccountId)
      if (!entry) return

      const snapshot = { ...entry.account.snapshot, memo }
      setGroups((previousGroups) =>
        updateAccountSnapshot(
          previousGroups,
          entry.groupId,
          entry.account.id,
          snapshot,
        ),
      )
    },
    [activeAccountId, groups],
  )

  const cycleAccountStatus = useCallback((groupId, accountId) => {
    setGroups((previousGroups) =>
      cycleStatusInGroups(previousGroups, groupId, accountId),
    )
  }, [])

  return {
    groups,
    activeAccountId,
    previewSnapshot,
    clearSelection,
    selectAccount,
    saveSnapshot,
    saveCredentialToPath,
    addCredential,
    removeCredential,
    updateMemo,
    cycleAccountStatus,
    ...deletion,
    ...groupActions,
  }
}
