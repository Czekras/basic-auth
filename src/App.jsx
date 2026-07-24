import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import InputFormModal from './components/InputFormModal.jsx'
import EditFormModal from './components/EditFormModal.jsx'
import SavedAccounts from './components/SavedAccounts.jsx'
import Toast from './components/Toast.jsx'
import OutputPanel from './components/OutputPanel.jsx'
import HelpModal from './components/HelpModal.jsx'
import useAccountForm from './hooks/useAccountForm.js'
import useAccountWorkspace from './hooks/useAccountWorkspace.js'
import useOutputActions from './hooks/useOutputActions.js'
import { loadStore, saveStore } from './lib/storage.js'
import { accountStatus } from './lib/accounts.js'

export default function App() {
  const [stored] = useState(loadStore)
  const workspace = useAccountWorkspace(stored)
  const forms = useAccountForm(stored, workspace)
  const output = useOutputActions(workspace.previewSnapshot)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    saveStore({
      caseName: forms.newAccount.draft.caseName,
      authName: forms.newAccount.draft.authName,
      domain: forms.newAccount.draft.domain,
      serverType: forms.newAccount.draft.serverType,
      sakuraAccount: forms.newAccount.draft.sakuraAccount,
      xserverLabel: forms.newAccount.draft.xserverLabel,
      xserverServers: forms.newAccount.xserverServers,
      manualPath: forms.newAccount.draft.manualPath,
      users: workspace.previewSnapshot.users,
      groups: workspace.groups,
      activeAccountId: workspace.activeAccountId,
    })
  }, [
    forms.newAccount.draft,
    forms.newAccount.xserverServers,
    workspace.previewSnapshot.users,
    workspace.groups,
    workspace.activeAccountId,
  ])

  return (
    <div className="app">
      <Header title="Basic Auth" />

      <div className="app__mobile-warning">
        本ツールはPC専用（SP非対応）です。
        <br />
        PC環境でのご利用を推奨します。
      </div>

      <main className="app__main">
        <div className="app__input">
          <button
            className="app__open-form"
            type="button"
            onClick={forms.openNew}
          >
            基本認証の新規作成
          </button>

          {forms.mode === 'edit' && forms.editor.entry && (
            <EditFormModal
              serverType={forms.editor.entry.account.snapshot.serverType}
              caseName={forms.editor.entry.account.snapshot.caseName}
              users={forms.editor.entry.account.snapshot.users}
              onClose={forms.close}
              onDelete={forms.editor.deleteAccount}
              onAddUser={forms.editor.addCredential}
              onRemoveUser={forms.editor.removeCredential}
              onCopyLogin={output.copyLogin}
              loginCopied={output.copiedSection === 'login'}
            />
          )}

          {forms.mode === 'new' && (
            <InputFormModal
              title="基本認証の新規作成"
              subtitle="通常案件（GMO）・さくらインターネット・XServer"
              onClose={forms.close}
              draft={forms.newAccount.draft}
              pathPreview={forms.newAccount.pathPreview}
              canGenerate={forms.newAccount.canGenerate}
              isDuplicateUsername={forms.newAccount.isDuplicateUsername}
              collision={
                forms.newAccount.collisionMatch
                  ? { label: forms.newAccount.collisionMatch.account.label }
                  : null
              }
              xserver={{
                servers: forms.newAccount.xserverServers,
                showInput: forms.newAccount.showXserverInput,
                onSelect: forms.newAccount.selectXserverServer,
                onStartAdding: forms.newAccount.startAddingXserverServer,
                onSave: forms.newAccount.saveXserverServer,
                onRemove: forms.newAccount.removeXserverServer,
              }}
              onDraftChange={forms.newAccount.updateDraft}
              onRandomPassword={forms.newAccount.generateRandomPassword}
              onAddCredential={forms.newAccount.addCredentialToExisting}
              onReplaceCredentials={forms.newAccount.replaceExistingCredentials}
              onGenerate={forms.newAccount.generateAccount}
              onEnter={forms.newAccount.handleEnter}
            />
          )}

          <SavedAccounts
            groups={workspace.groups}
            activeAccountId={workspace.activeAccountId}
            onSelectAccount={forms.openEditor}
            onPreviewAccount={workspace.selectAccount}
            onDeleteAccount={workspace.deleteAccount}
            onCycleStatus={workspace.cycleAccountStatus}
            onCreateGroup={workspace.createGroup}
            onRenameGroup={workspace.renameGroup}
            onDeleteGroup={workspace.deleteGroup}
            onMoveAccount={workspace.moveAccount}
            onReorderGroups={workspace.reorderGroups}
          />
        </div>

        <OutputPanel
          htaccess={output.htaccess}
          htpasswd={output.htpasswd}
          hasEncoded={output.hasEncoded}
          outputReady={output.outputReady}
          serverType={workspace.previewSnapshot.serverType}
          status={accountStatus(workspace.previewSnapshot)}
          caseName={workspace.previewSnapshot.caseName}
          memo={workspace.previewSnapshot.memo}
          onMemoChange={workspace.updateMemo}
          copied={output.copiedSection}
          zipSaved={output.savedSection === 'zip'}
          onOpenHelp={() => setShowHelp(true)}
          onDownloadZip={output.downloadOutputZip}
          onCopyHtaccess={() => output.copyOutput('htaccess', output.htaccess)}
          onCopyHtpasswd={() => output.copyOutput('htpasswd', output.htpasswd)}
          onCopyLogin={output.copyLogin}
          onDownloadHtaccess={() =>
            output.outputReady &&
            output.downloadOutput('htaccess', '.htaccess', output.htaccess)
          }
          onDownloadHtpasswd={() =>
            output.hasEncoded &&
            output.downloadOutput('htpasswd', '.htpasswd', output.htpasswd)
          }
        />
      </main>

      <Footer />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {workspace.pendingDeletes.length > 0 && (
        <div className="toast-stack">
          {workspace.pendingDeletes.map(({ id, account }) => (
            <Toast
              key={id}
              message={`${account.label} を削除しました`}
              onUndo={() => workspace.undoDelete(id)}
              onDismiss={() => workspace.dismissUndo(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
