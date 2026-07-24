import './InputForm.css'
import CredentialFields from './CredentialFields.jsx'
import InfoTip from './InfoTip.jsx'
import ServerPathFields from './ServerPathFields.jsx'
import { ArrowIcon, ChevronDownIcon } from '../lib/icons.jsx'

export default function InputForm({
  draft,
  pathPreview,
  canGenerate,
  isDuplicateUsername,
  collision,
  xserver,
  onDraftChange,
  onRandomPassword,
  onAddCredential,
  onReplaceCredentials,
  onGenerate,
  onEnter,
}) {
  return (
    <div className="input-form">
      <div className="input-form__notice">
        保存後、案件番号・案件名およびパス（AuthUserFile）の変更はできません。
        <br />
        入力内容をご確認のうえ「生成する」ボタンを押してください。
      </div>

      <div className="input-form__field">
        <label className="input-form__label" htmlFor="input-form-case-name">
          案件番号・案件名<span className="input-form__required">*</span>
        </label>
        <input
          id="input-form-case-name"
          className="input-form__input input-form__input--mono"
          value={draft.caseName}
          onChange={(event) => onDraftChange('caseName', event.target.value)}
          onKeyDown={onEnter}
          autoFocus
          placeholder="SH○○○○○、株式会社サンプル"
        />
      </div>

      <div className="input-form__field">
        <div className="input-form__label-row">
          <label className="input-form__label" htmlFor="input-form-server-type">
            サーバー選択（AuthUserFile）
          </label>
          <InfoTip text="選択したサーバーの種類に応じて .htpasswd の絶対パスを自動生成します。その他の構成は「カスタムパス」をご利用ください。" />
        </div>
        <div className="input-form__select-wrap">
          <select
            id="input-form-server-type"
            className="input-form__input input-form__select"
            value={draft.serverType}
            onChange={(event) =>
              onDraftChange('serverType', event.target.value)
            }
          >
            <option value="vps">通常案件(GMO)</option>
            <option value="sakura">さくらインターネット</option>
            <option value="xserver">XServer</option>
            <option value="manual">カスタムパス</option>
          </select>
          <span className="input-form__select-chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      <div className="input-form__variable">
        <ServerPathFields
          draft={draft}
          xserver={xserver}
          onDraftChange={onDraftChange}
          onEnter={onEnter}
        />
      </div>

      <CredentialFields
        draft={draft}
        isDuplicateUsername={isDuplicateUsername}
        onDraftChange={onDraftChange}
        onRandomPassword={onRandomPassword}
        onEnter={onEnter}
      />

      <div className="input-form__path-preview">
        <span className="input-form__path-preview-arrow">
          <ArrowIcon />
        </span>
        <span className="input-form__path-preview-code">{pathPreview}</span>
      </div>

      <div className="input-form__actions">
        {collision && (
          <span className="input-form__warning">
            この設定（{collision.label}
            ）は既に登録されています。ユーザーを追加するか、既存のデータを上書きできます。
          </span>
        )}
        {collision && (
          <button
            className="input-form__replace"
            type="button"
            onClick={onReplaceCredentials}
            disabled={!canGenerate}
          >
            既存のデータを上書きする
          </button>
        )}
        <button
          className="input-form__encode"
          type="button"
          onClick={collision ? onAddCredential : onGenerate}
          disabled={!canGenerate}
        >
          {collision ? 'ユーザーを追加する' : '生成する'}
        </button>
      </div>
    </div>
  )
}
