import { useState } from 'react'
import { CloseIcon } from '../../lib/icons.jsx'
import {
  sanitizeXserverLabel,
  xserverLabelIssues,
} from '../../lib/validation.js'
import DomainField from './DomainField.jsx'

export default function XserverPathFields({
  domain,
  label,
  xserver,
  onDomainChange,
  onLabelChange,
  onEnter,
}) {
  const [hadInvalidCharacters, setHadInvalidCharacters] = useState(false)
  const { badLength } = xserverLabelIssues(label)

  const handleLabelChange = (event) => {
    const rawValue = event.target.value
    const sanitizedValue = sanitizeXserverLabel(rawValue)
    setHadInvalidCharacters(sanitizedValue !== rawValue.toLowerCase())
    onLabelChange(sanitizedValue)
  }

  const startAddingServer = () => {
    setHadInvalidCharacters(false)
    xserver.onStartAdding()
  }

  return (
    <>
      <div className="input-form__field">
        <div className="input-form__label-row">
          <label
            className="input-form__label"
            htmlFor="input-form-xserver-name"
          >
            サーバー名<span className="input-form__required">*</span>
          </label>
          {!xserver.showInput && (
            <button
              className="input-form__link input-form__link--push"
              type="button"
              onClick={startAddingServer}
            >
              ＋ 新しいサーバー名
            </button>
          )}
        </div>

        {xserver.showInput && (
          <div className="input-form__row">
            <input
              id="input-form-xserver-name"
              className="input-form__input input-form__input--mono"
              value={label}
              onChange={handleLabelChange}
              onKeyDown={onEnter}
              maxLength={12}
              placeholder="半角英数字（小文字）のみ、3〜12文字"
            />
            <button
              className="input-form__save"
              type="button"
              onClick={xserver.onSave}
              disabled={!label.trim() || badLength}
            >
              保存
            </button>
          </div>
        )}

        {xserver.showInput && hadInvalidCharacters && (
          <span className="input-form__warning">
            使用できない文字を自動で削除しました（半角英数字のみ使用できます）
          </span>
        )}
        {xserver.showInput && badLength && (
          <span className="input-form__warning">
            3〜12文字以内で入力してください
          </span>
        )}

        {!xserver.showInput && (
          <div className="input-form__chips">
            {xserver.servers.map((server) => (
              <div
                key={server}
                className={
                  'input-form__chip' +
                  (label === server ? ' input-form__chip--active' : '')
                }
              >
                <button
                  type="button"
                  className="input-form__chip-select"
                  aria-pressed={label === server}
                  onClick={() => xserver.onSelect(server)}
                >
                  {server}
                </button>
                <button
                  type="button"
                  className="input-form__chip-remove"
                  aria-label={`${server} を削除`}
                  onClick={() => xserver.onRemove(server)}
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DomainField value={domain} onChange={onDomainChange} onEnter={onEnter} />
    </>
  )
}
