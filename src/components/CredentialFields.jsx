import { useState } from 'react'
import InfoTip from './InfoTip.jsx'
import { sanitizeAuthName, sanitizeUsername } from '../lib/validation.js'

export default function CredentialFields({
  draft,
  isDuplicateUsername,
  onDraftChange,
  onRandomPassword,
  onEnter,
}) {
  const [usernameHadInvalidCharacters, setUsernameHadInvalidCharacters] =
    useState(false)
  const [authNameHadInvalidCharacters, setAuthNameHadInvalidCharacters] =
    useState(false)

  const handleUsernameChange = (event) => {
    const rawValue = event.target.value
    const sanitizedValue = sanitizeUsername(rawValue)
    setUsernameHadInvalidCharacters(sanitizedValue !== rawValue)
    onDraftChange('username', sanitizedValue)
  }

  const handleAuthNameChange = (event) => {
    const rawValue = event.target.value
    const sanitizedValue = sanitizeAuthName(rawValue)
    setAuthNameHadInvalidCharacters(sanitizedValue !== rawValue)
    onDraftChange('authName', sanitizedValue)
  }

  return (
    <>
      <div className="input-form__field">
        <label className="input-form__label" htmlFor="input-form-user">
          ユーザー名<span className="input-form__required">*</span>
        </label>
        <input
          id="input-form-user"
          className="input-form__input input-form__input--mono"
          value={draft.username}
          onChange={handleUsernameChange}
          onKeyDown={onEnter}
          placeholder="admin"
        />
        {usernameHadInvalidCharacters && (
          <span className="input-form__warning">
            使える文字：半角英数字、「_」、「-」
          </span>
        )}
        {isDuplicateUsername && (
          <span className="input-form__warning">
            既存のユーザーを上書きします
          </span>
        )}
      </div>

      <div className="input-form__field">
        <div className="input-form__label-row">
          <label className="input-form__label" htmlFor="input-form-pass">
            パスワード<span className="input-form__required">*</span>
          </label>
          {draft.password.length > 0 && (
            <span className="input-form__hint">
              （文字数：{draft.password.length}）
            </span>
          )}
          <button
            className="input-form__link input-form__link--push"
            type="button"
            title="ランダムなパスワードを生成します（ユーザー名はそのまま）"
            onClick={onRandomPassword}
          >
            ランダム生成
          </button>
        </div>
        <input
          id="input-form-pass"
          className="input-form__input input-form__input--mono"
          value={draft.password}
          onChange={(event) => onDraftChange('password', event.target.value)}
          onKeyDown={onEnter}
          placeholder="パスワード"
        />
        {draft.password !== '' && draft.password.trim() === '' && (
          <span className="input-form__warning">
            スペースのみのパスワードは使用できません
          </span>
        )}
      </div>

      <div className="input-form__field">
        <div className="input-form__label-row">
          <label className="input-form__label" htmlFor="input-form-auth-name">
            認証名（AuthName）
          </label>
          <InfoTip text="基本認証のログイン画面（ダイアログ）に表示されるメッセージです。" />
        </div>
        <input
          id="input-form-auth-name"
          className="input-form__input"
          value={draft.authName}
          onChange={handleAuthNameChange}
          onKeyDown={onEnter}
          placeholder="メンテナンス中"
        />
        {authNameHadInvalidCharacters && (
          <span className="input-form__warning">
            「"」は使用できません（自動で削除しました）
          </span>
        )}
      </div>
    </>
  )
}
