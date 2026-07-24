import './Toast.css'
import { CloseIcon } from '../lib/icons.jsx'

export default function Toast({ message, onUndo, onDismiss }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__message">{message}</span>
      <span className="toast__divider" aria-hidden="true" />
      <button type="button" className="toast__undo" onClick={onUndo}>
        Undo
      </button>
      <button
        type="button"
        className="toast__dismiss"
        onClick={onDismiss}
        aria-label="閉じる"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  )
}
