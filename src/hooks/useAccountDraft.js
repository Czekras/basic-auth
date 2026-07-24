import { useCallback, useState } from 'react'

const EMPTY_DRAFT = {
  username: '',
  password: '',
  caseName: '',
  authName: 'メンテナンス中',
  domain: '',
  serverType: 'vps',
  sakuraAccount: '',
  xserverLabel: '',
  manualPath: '',
}

function initialDraft(stored) {
  return {
    ...EMPTY_DRAFT,
    caseName: stored.caseName || '',
    authName: stored.authName ?? EMPTY_DRAFT.authName,
    domain: stored.domain || '',
    serverType: stored.serverType || EMPTY_DRAFT.serverType,
    sakuraAccount: stored.sakuraAccount || '',
    xserverLabel: stored.xserverLabel || '',
    manualPath: stored.manualPath || '',
  }
}

export default function useAccountDraft(stored) {
  const [draft, setDraft] = useState(() => initialDraft(stored))
  const [xserverServers, setXserverServers] = useState(
    stored.xserverServers || [],
  )
  const [isAddingXserverServer, setIsAddingXserverServer] = useState(false)

  const updateDraft = useCallback((field, value) => {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(EMPTY_DRAFT)
    setIsAddingXserverServer(false)
  }, [])

  const clearCredentials = useCallback(() => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      username: '',
      password: '',
    }))
  }, [])

  const selectXserverServer = useCallback(
    (label) => {
      updateDraft('xserverLabel', label)
    },
    [updateDraft],
  )

  const startAddingXserverServer = useCallback(() => {
    updateDraft('xserverLabel', '')
    setIsAddingXserverServer(true)
  }, [updateDraft])

  const saveXserverServer = useCallback(() => {
    const label = draft.xserverLabel.trim()
    if (!label) return

    setXserverServers((previousServers) =>
      previousServers.includes(label)
        ? previousServers
        : [...previousServers, label],
    )
    setIsAddingXserverServer(false)
  }, [draft.xserverLabel])

  const removeXserverServer = useCallback(
    (label) => {
      setXserverServers((previousServers) =>
        previousServers.filter((server) => server !== label),
      )
      if (draft.xserverLabel === label) updateDraft('xserverLabel', '')
    },
    [draft.xserverLabel, updateDraft],
  )

  return {
    draft,
    xserverServers,
    showXserverInput: isAddingXserverServer || xserverServers.length === 0,
    updateDraft,
    resetDraft,
    clearCredentials,
    selectXserverServer,
    startAddingXserverServer,
    saveXserverServer,
    removeXserverServer,
  }
}
