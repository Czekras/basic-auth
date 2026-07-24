import { useCallback } from 'react'
import { hashPassword } from '../lib/crypto.js'

export default function useAccountEditor(workspace, editingEntry, onClose) {
  const { addCredential, removeCredential, deleteAccount } = workspace

  const deleteEditingAccount = useCallback(() => {
    if (!editingEntry) return

    deleteAccount(editingEntry.groupId, editingEntry.account.id)
    onClose()
  }, [deleteAccount, editingEntry, onClose])

  // Duplicate usernames replace their credential, matching collision-add behavior.
  const addCredentialToEditingAccount = useCallback(
    (username, password) => {
      if (!editingEntry) return

      const normalizedUsername = username.trim()
      if (!normalizedUsername || !password.trim()) return
      addCredential(editingEntry.account.id, {
        user: normalizedUsername,
        pass: password,
        enc: hashPassword(password),
      })
    },
    [addCredential, editingEntry],
  )

  const removeCredentialFromEditingAccount = useCallback(
    (username) => {
      if (!editingEntry) return
      removeCredential(editingEntry.account.id, username)
    },
    [editingEntry, removeCredential],
  )

  return {
    entry: editingEntry,
    deleteAccount: deleteEditingAccount,
    addCredential: addCredentialToEditingAccount,
    removeCredential: removeCredentialFromEditingAccount,
  }
}
