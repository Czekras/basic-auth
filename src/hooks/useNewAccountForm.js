import { useCallback } from 'react'
import useAccountDraft from './useAccountDraft.js'
import { makeSnapshot } from '../lib/accounts.js'
import { findAccountByPath, upsertCredential } from '../lib/accountGroups.js'
import { fullPath, previewPath } from '../lib/codegen.js'
import { hashPassword, rand } from '../lib/crypto.js'
import { fieldsValid } from '../lib/validation.js'

function makeDraftSnapshot(draft, users, memo) {
  return makeSnapshot({
    caseName: draft.caseName,
    serverType: draft.serverType,
    domain: draft.domain,
    sakuraAccount: draft.sakuraAccount,
    xserverLabel: draft.xserverLabel,
    manualPath: draft.manualPath,
    authName: draft.authName,
    users,
    memo,
  })
}

export default function useNewAccountForm(stored, workspace, onSaved) {
  const { groups, previewSnapshot, saveSnapshot, saveCredentialToPath } =
    workspace
  const {
    draft,
    xserverServers,
    showXserverInput,
    updateDraft,
    resetDraft,
    clearCredentials,
    selectXserverServer,
    startAddingXserverServer,
    saveXserverServer,
    removeXserverServer,
  } = useAccountDraft(stored)

  const livePath = fullPath(draft)
  const pathPreview = previewPath(draft)
  const pathFilled = livePath !== ''
  const collisionMatch = pathFilled ? findAccountByPath(groups, livePath) : null
  const hasPathCollision = collisionMatch !== null

  // Collision actions retain the saved case name; ordinary generation requires it.
  const canGenerate =
    draft.username.trim() !== '' &&
    draft.password.trim() !== '' &&
    pathFilled &&
    (hasPathCollision || draft.caseName.trim() !== '') &&
    fieldsValid(draft)
  const credentialSource = collisionMatch
    ? collisionMatch.account.snapshot.users
    : previewSnapshot.users
  const isDuplicateUsername =
    draft.username.trim() !== '' &&
    credentialSource.some(
      (credential) => credential.user === draft.username.trim(),
    )

  const makeCredential = useCallback(() => {
    const username = draft.username.trim()
    if (!username || !draft.password.trim()) return null

    return {
      user: username,
      pass: draft.password,
      enc: hashPassword(draft.password),
    }
  }, [draft.password, draft.username])

  const finishSave = useCallback(() => {
    clearCredentials()
    onSaved()
  }, [clearCredentials, onSaved])

  const generateAccount = useCallback(() => {
    const credential = makeCredential()
    if (!credential || !pathFilled) return

    const match = findAccountByPath(groups, livePath)
    const users = upsertCredential(previewSnapshot.users, credential)
    const snapshot = makeDraftSnapshot(
      draft,
      users,
      // Re-encoding an existing path must not erase its memo.
      match?.account.snapshot.memo,
    )

    saveSnapshot(snapshot)
    finishSave()
  }, [
    draft,
    finishSave,
    groups,
    livePath,
    makeCredential,
    pathFilled,
    previewSnapshot.users,
    saveSnapshot,
  ])

  // A fresh draft has no saved users, so collisions update the matched account.
  const saveCollision = useCallback(
    (shouldReplaceUsers) => {
      const credential = makeCredential()
      if (!credential || !pathFilled) return
      if (!saveCredentialToPath(livePath, credential, shouldReplaceUsers)) {
        return
      }

      finishSave()
    },
    [finishSave, livePath, makeCredential, pathFilled, saveCredentialToPath],
  )

  const addCredentialToExisting = useCallback(
    () => saveCollision(false),
    [saveCollision],
  )
  const replaceExistingCredentials = useCallback(
    () => saveCollision(true),
    [saveCollision],
  )

  // Enter takes the non-destructive collision action; replacement needs a click.
  const handleEnter = useCallback(
    (event) => {
      if (event.key !== 'Enter') return

      event.preventDefault()
      if (hasPathCollision) addCredentialToExisting()
      else generateAccount()
    },
    [addCredentialToExisting, generateAccount, hasPathCollision],
  )

  const generateRandomPassword = useCallback(() => {
    updateDraft('password', rand(12))
  }, [updateDraft])

  return {
    draft,
    xserverServers,
    showXserverInput,
    pathPreview,
    canGenerate,
    isDuplicateUsername,
    collisionMatch,
    updateDraft,
    resetDraft,
    generateRandomPassword,
    selectXserverServer,
    startAddingXserverServer,
    saveXserverServer,
    removeXserverServer,
    generateAccount,
    addCredentialToExisting,
    replaceExistingCredentials,
    handleEnter,
  }
}
