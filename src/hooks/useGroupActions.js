import { useCallback } from 'react'
import { newGroupId } from '../lib/accounts.js'
import {
  appendGroup,
  deleteGroup as deleteGroupFromList,
  moveAccount as moveAccountInGroups,
  renameGroup as renameGroupInList,
  reorderGroups as reorderGroupList,
} from '../lib/accountGroups.js'

export default function useGroupActions(setGroups) {
  const createGroup = useCallback(
    (name) => {
      const trimmedName = name.trim()
      if (!trimmedName) return

      setGroups((previousGroups) =>
        appendGroup(previousGroups, {
          id: newGroupId(),
          name: trimmedName,
          accounts: [],
        }),
      )
    },
    [setGroups],
  )

  const renameGroup = useCallback(
    (groupId, name) => {
      setGroups((previousGroups) =>
        renameGroupInList(previousGroups, groupId, name),
      )
    },
    [setGroups],
  )

  const deleteGroup = useCallback(
    (groupId) => {
      setGroups((previousGroups) =>
        deleteGroupFromList(previousGroups, groupId),
      )
    },
    [setGroups],
  )

  const moveAccount = useCallback(
    (accountId, fromGroupId, toGroupId, toIndex) => {
      setGroups((previousGroups) =>
        moveAccountInGroups(
          previousGroups,
          accountId,
          fromGroupId,
          toGroupId,
          toIndex,
        ),
      )
    },
    [setGroups],
  )

  const reorderGroups = useCallback(
    (fromIndex, toIndex) => {
      setGroups((previousGroups) =>
        reorderGroupList(previousGroups, fromIndex, toIndex),
      )
    },
    [setGroups],
  )

  return {
    createGroup,
    renameGroup,
    deleteGroup,
    moveAccount,
    reorderGroups,
  }
}
