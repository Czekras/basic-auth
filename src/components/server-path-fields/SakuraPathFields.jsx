import { useState } from 'react'
import {
  sakuraAccountIssues,
  sanitizeSakuraAccount,
} from '../../lib/validation.js'

export default function SakuraPathFields({ value, onChange, onEnter }) {
  const [hadInvalidCharacters, setHadInvalidCharacters] = useState(false)
  const { edgeHyphen, allDigits, badLength } = sakuraAccountIssues(value)

  const handleChange = (event) => {
    const rawValue = event.target.value
    const sanitizedValue = sanitizeSakuraAccount(rawValue)
    setHadInvalidCharacters(sanitizedValue !== rawValue.toLowerCase())
    onChange(sanitizedValue)
  }

  return (
    <div className="input-form__field">
      <label className="input-form__label" htmlFor="input-form-sakura-account">
        アカウント名<span className="input-form__required">*</span>
      </label>
      <input
        id="input-form-sakura-account"
        className="input-form__input input-form__input--mono"
        value={value}
        onChange={handleChange}
        onKeyDown={onEnter}
        maxLength={16}
        placeholder="半角英数字（小文字）とハイフン、3〜16文字"
      />
      {hadInvalidCharacters && (
        <span className="input-form__warning">
          使える文字：半角英数字（小文字）、「-」
        </span>
      )}
      {edgeHyphen && (
        <span className="input-form__warning">
          「-」で開始・終了はできません
        </span>
      )}
      {allDigits && (
        <span className="input-form__warning">数字のみは使用できません</span>
      )}
      {badLength && (
        <span className="input-form__warning">3〜16文字で入力してください</span>
      )}
    </div>
  )
}
