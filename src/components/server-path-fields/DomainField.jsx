import { useState } from 'react'
import { domainLabelIssues, sanitizeDomain } from '../../lib/validation.js'

export default function DomainField({ value, onChange, onEnter }) {
  const [hadInvalidCharacters, setHadInvalidCharacters] = useState(false)
  const { edgeHyphen, consecutiveHyphen } = domainLabelIssues(value)

  const handleChange = (event) => {
    const rawValue = event.target.value
    const sanitizedValue = sanitizeDomain(rawValue)
    setHadInvalidCharacters(sanitizedValue !== rawValue.toLowerCase())
    onChange(sanitizedValue)
  }

  return (
    <div className="input-form__field">
      <label className="input-form__label" htmlFor="input-form-domain">
        ドメイン名<span className="input-form__required">*</span>
      </label>
      <input
        id="input-form-domain"
        className="input-form__input input-form__input--mono"
        value={value}
        onChange={handleChange}
        onKeyDown={onEnter}
        placeholder="example.com"
      />
      {hadInvalidCharacters && (
        <span className="input-form__warning">
          使用できない文字を自動で削除しました（半角英数字、「-」、「.」のみ使用可）
        </span>
      )}
      {edgeHyphen && (
        <span className="input-form__warning">
          「-」をドメイン名の先頭や末尾に使用することはできません
        </span>
      )}
      {consecutiveHyphen && (
        <span className="input-form__warning">
          3文字目と4文字目に連続した「--」は使用できません（「xn--」を除く）
        </span>
      )}
    </div>
  )
}
