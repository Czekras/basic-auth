import { useCallback, useState } from 'react'
import useAccountEditor from './useAccountEditor.js'
import useNewAccountForm from './useNewAccountForm.js'
import { findAccountById } from '../lib/accountGroups.js'

export default function useAccountForm(stored, workspace) {
  const { groups, activeAccountId, clearSelection, selectAccount } = workspace
  const [mode, setMode] = useState(null)
  const close = useCallback(() => setMode(null), [])
  const newAccount = useNewAccountForm(stored, workspace, close)

  const editingEntry =
    mode === 'edit' ? findAccountById(groups, activeAccountId) : null
  const editor = useAccountEditor(workspace, editingEntry, close)
  const { resetDraft } = newAccount

  const openNew = useCallback(() => {
    resetDraft()
    clearSelection()
    setMode('new')
  }, [clearSelection, resetDraft])

  const openEditor = useCallback(
    (accountId) => {
      if (selectAccount(accountId)) setMode('edit')
    },
    [selectAccount],
  )

  return {
    mode,
    close,
    openNew,
    openEditor,
    newAccount,
    editor,
  }
}
