import { useCallback, useEffect, useRef, useState } from 'react'
import { copyText } from '../lib/clipboard.js'
import {
  fullPath,
  htaccessText,
  htpasswdText,
  previewPath,
} from '../lib/codegen.js'
import { downloadFile, downloadZip } from '../lib/download.js'

const FEEDBACK_DURATION_MS = 1400

export default function useOutputActions(previewSnapshot) {
  const [copiedSection, setCopiedSection] = useState(null)
  const [savedSection, setSavedSection] = useState(null)
  const copyTimer = useRef(null)
  const savedTimer = useRef(null)

  const users = previewSnapshot.users
  const htaccess = htaccessText(
    previewSnapshot.authName,
    previewPath(previewSnapshot),
  )
  const htpasswd = htpasswdText(users)
  const hasEncoded = users.length > 0
  const outputReady = fullPath(previewSnapshot) !== '' && hasEncoded

  useEffect(
    () => () => {
      clearTimeout(copyTimer.current)
      clearTimeout(savedTimer.current)
    },
    [],
  )

  const showFeedback = useCallback((setter, timer, value) => {
    setter(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setter(null), FEEDBACK_DURATION_MS)
  }, [])

  const copyOutput = useCallback(
    async (section, text) => {
      if (await copyText(text)) {
        showFeedback(setCopiedSection, copyTimer, section)
      }
    },
    [showFeedback],
  )

  const copyLogin = useCallback(() => {
    const text = users
      .map(
        (credential) =>
          `ユーザー名：${credential.user}\nパスワード：${credential.pass}`,
      )
      .join('\n\n')
    copyOutput('login', text)
  }, [copyOutput, users])

  const downloadOutput = useCallback(
    (section, filename, text) => {
      if (downloadFile(filename, text)) {
        showFeedback(setSavedSection, savedTimer, section)
      }
    },
    [showFeedback],
  )

  const downloadOutputZip = useCallback(async () => {
    if (!outputReady) return

    const downloaded = await downloadZip(
      { '.htaccess': htaccess, '.htpasswd': htpasswd },
      'basic-auth.zip',
    )
    if (downloaded) {
      showFeedback(setSavedSection, savedTimer, 'zip')
    }
  }, [htaccess, htpasswd, outputReady, showFeedback])

  return {
    htaccess,
    htpasswd,
    hasEncoded,
    outputReady,
    copiedSection,
    savedSection,
    copyOutput,
    copyLogin,
    downloadOutput,
    downloadOutputZip,
  }
}
