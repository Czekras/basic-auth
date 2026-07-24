import { useState } from 'react'
import Modal from './Modal.jsx'
import './EditFormModal.css'
import { serverTypeTag } from '../lib/accounts.js'
import { rand } from '../lib/crypto.js'
import { sanitizeUsername } from '../lib/validation.js'
import { TrashIcon } from '../lib/icons.jsx'

export default function EditFormModal({
  serverType,
  caseName,
  users,
  onClose,
  onDelete,
  onAddUser,
  onRemoveUser,
  onCopyLogin,
  loginCopied,
}) {
  const [adding, setAdding] = useState(false)
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newUserInvalid, setNewUserInvalid] = useState(false)

  const startAdding = () => {
    setAdding(true)
    setNewUser('')
    setNewPass('')
    setNewUserInvalid(false)
  }

  const cancelAdding = () => {
    setAdding(false)
    setNewUser('')
    setNewPass('')
    setNewUserInvalid(false)
  }

  const handleNewUserChange = (e) => {
    const raw = e.target.value
    const sanitized = sanitizeUsername(raw)
    setNewUserInvalid(sanitized !== raw)
    setNewUser(sanitized)
  }

  // Duplicate usernames overwrite credentials, matching collision-add behavior.
  const isDuplicateUser =
    newUser.trim() !== '' &&
    users.some((credential) => credential.user === newUser.trim())
  const canSave = newUser.trim() !== '' && newPass.trim() !== ''

  const confirmAdding = () => {
    if (!canSave) return
    onAddUser(newUser, newPass)
    cancelAdding()
  }

  const onEnterSave = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirmAdding()
    }
  }

  return (
    <Modal
      title="基本認証を編集"
      subtitle="登録されているログイン情報の編集"
      onClose={onClose}
      panelClassName="modal__panel--fill"
      bodyClassName="modal__body--fill"
    >
      <div className="edit-form-modal__info">
        <span
          className={'edit-form-modal__tag edit-form-modal__tag--' + serverType}
        >
          {serverTypeTag(serverType)}
        </span>
        <span className="edit-form-modal__info-text">
          {caseName && (
            <span className="edit-form-modal__case">{caseName}</span>
          )}
        </span>
      </div>

      <div className="edit-form-modal__count-row">
        <span className="edit-form-modal__count-label">ログイン情報</span>
        <span className="edit-form-modal__count">({users.length}件)</span>
        <button
          type="button"
          className="edit-form-modal__copy"
          onClick={onCopyLogin}
        >
          {loginCopied ? 'コピーしました' : 'ログイン情報をコピー'}
        </button>
      </div>

      <div className="edit-form-modal__list">
        {users.map((credential) => (
          <div key={credential.user} className="edit-form-modal__row">
            <span className="edit-form-modal__credential">
              {credential.user}:{credential.pass}
            </span>
            {users.length > 1 && (
              <button
                type="button"
                className="edit-form-modal__remove"
                onClick={() => onRemoveUser(credential.user)}
                aria-label="削除"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        ))}

        {adding && (
          <div className="edit-form-modal__credential-form">
            <div className="edit-form-modal__credential-form-field">
              <input
                className="edit-form-modal__credential-form-input"
                value={newUser}
                onChange={handleNewUserChange}
                onKeyDown={onEnterSave}
                placeholder="ユーザー名"
                aria-label="ユーザー名"
                autoFocus
              />
              {newUserInvalid && (
                <span className="edit-form-modal__credential-form-warning">
                  使える文字：半角英数字、「_」、「-」
                </span>
              )}
              {isDuplicateUser && (
                <span className="edit-form-modal__credential-form-warning">
                  既存のユーザーを上書きします
                </span>
              )}
            </div>

            <div className="edit-form-modal__credential-form-field">
              <div className="edit-form-modal__credential-form-pass-row">
                <input
                  className="edit-form-modal__credential-form-input"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  onKeyDown={onEnterSave}
                  placeholder="パスワード"
                  aria-label="パスワード"
                />
                <button
                  type="button"
                  className="edit-form-modal__credential-form-random"
                  title="ランダムなパスワードを生成します"
                  onClick={() => setNewPass(rand(12))}
                >
                  ランダム生成
                </button>
              </div>
              {newPass !== '' && newPass.trim() === '' && (
                <span className="edit-form-modal__credential-form-warning">
                  スペースのみのパスワードは使用できません
                </span>
              )}
            </div>

            <div className="edit-form-modal__credential-form-actions">
              <button
                type="button"
                className="edit-form-modal__credential-form-cancel"
                onClick={cancelAdding}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="edit-form-modal__credential-form-save"
                onClick={confirmAdding}
                disabled={!canSave}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="edit-form-modal__footer">
        <button
          type="button"
          className="edit-form-modal__delete"
          onClick={onDelete}
        >
          このアカウントを削除
        </button>
        <button
          type="button"
          className="edit-form-modal__add"
          onClick={startAdding}
          disabled={adding}
        >
          ログイン情報を追加
        </button>
      </div>
    </Modal>
  )
}
