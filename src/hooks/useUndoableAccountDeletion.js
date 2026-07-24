import { useCallback, useEffect, useRef, useState } from 'react'
import {
  findAccountById,
  removeAccount,
  restoreAccount,
} from '../lib/accountGroups.js'

const MAX_UNDO_TOASTS = 3
const UNDO_DURATION_MS = 5000

export default function useUndoableAccountDeletion({
  groups,
  setGroups,
  activeAccountId,
  clearSelection,
}) {
  const [pendingDeletes, setPendingDeletes] = useState([])
  const undoTimers = useRef(new Map())

  const clearUndoTimer = useCallback((accountId) => {
    const timer = undoTimers.current.get(accountId)
    if (!timer) return

    clearTimeout(timer)
    undoTimers.current.delete(accountId)
  }, [])

  useEffect(
    () => () => {
      for (const timer of undoTimers.current.values()) clearTimeout(timer)
      undoTimers.current.clear()
    },
    [],
  )

  const deleteAccount = useCallback(
    (groupId, accountId) => {
      const entry = findAccountById(groups, accountId)
      setGroups((previousGroups) =>
        removeAccount(previousGroups, groupId, accountId),
      )

      if (entry) {
        setPendingDeletes((previousDeletes) => {
          const nextDeletes = [
            ...previousDeletes,
            { id: accountId, account: entry.account, groupId },
          ]
          if (nextDeletes.length <= MAX_UNDO_TOASTS) return nextDeletes

          clearUndoTimer(nextDeletes[0].id)
          return nextDeletes.slice(1)
        })

        clearUndoTimer(accountId)
        undoTimers.current.set(
          accountId,
          setTimeout(() => {
            undoTimers.current.delete(accountId)
            setPendingDeletes((previousDeletes) =>
              previousDeletes.filter(
                (pendingDelete) => pendingDelete.id !== accountId,
              ),
            )
          }, UNDO_DURATION_MS),
        )
      }

      if (activeAccountId === accountId) clearSelection()
    },
    [activeAccountId, clearSelection, clearUndoTimer, groups, setGroups],
  )

  const undoDelete = useCallback(
    (accountId) => {
      const entry = pendingDeletes.find(
        (pendingDelete) => pendingDelete.id === accountId,
      )
      if (!entry) return

      setGroups((previousGroups) =>
        restoreAccount(previousGroups, entry.groupId, entry.account),
      )
      setPendingDeletes((previousDeletes) =>
        previousDeletes.filter(
          (pendingDelete) => pendingDelete.id !== accountId,
        ),
      )
      clearUndoTimer(accountId)
    },
    [clearUndoTimer, pendingDeletes, setGroups],
  )

  const dismissUndo = useCallback(
    (accountId) => {
      setPendingDeletes((previousDeletes) =>
        previousDeletes.filter(
          (pendingDelete) => pendingDelete.id !== accountId,
        ),
      )
      clearUndoTimer(accountId)
    },
    [clearUndoTimer],
  )

  return {
    pendingDeletes,
    deleteAccount,
    undoDelete,
    dismissUndo,
  }
}
