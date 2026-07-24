import { manualPathIssues } from '../../lib/validation.js'

export default function ManualPathFields({ value, onChange, onEnter }) {
  const { missingLeadingSlash, missingHtpasswd } = manualPathIssues(value)

  return (
    <div className="input-form__field">
      <label className="input-form__label" htmlFor="input-form-manual-path">
        .htpasswd の絶対パス（AuthUserFile）
        <span className="input-form__required">*</span>
      </label>
      <input
        id="input-form-manual-path"
        className="input-form__input input-form__input--mono"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onEnter}
        placeholder="/home/user/public_html/.htpasswd"
      />
      {missingLeadingSlash && (
        <span className="input-form__warning">
          「/」から始まる絶対パスを入力してください
        </span>
      )}
      {missingHtpasswd && (
        <span className="input-form__warning">
          パスに「.htpasswd」が含まれていません。ファイル名をご確認ください
        </span>
      )}
    </div>
  )
}
