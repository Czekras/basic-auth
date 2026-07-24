import { useEffect, useId, useRef } from 'react'
import './Modal.css'
import { CloseIcon } from '../lib/icons.jsx'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  panelClassName,
  bodyClassName,
}) {
  const titleId = useId()
  const panelRef = useRef(null)
  // Capture before mount so autoFocus cannot replace the trigger we restore later.
  const previouslyFocusedRef = useRef(document.activeElement)
  // A ref keeps inline onClose callbacks from restarting the focus-trap effect.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const panel = panelRef.current
    const previouslyFocused = previouslyFocusedRef.current
    // Preserve child autoFocus; otherwise focus the panel to establish the trap.
    if (panel && !panel.contains(document.activeElement)) {
      panel.focus()
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll(FOCUSABLE_SELECTOR)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div className="modal" onClick={onClose}>
      <div
        ref={panelRef}
        className={
          'modal__panel' + (panelClassName ? ' ' + panelClassName : '')
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <div className="modal__titles">
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {subtitle && <span className="modal__subtitle">{subtitle}</span>}
          </div>
          <button
            className="modal__close"
            type="button"
            aria-label="閉じる"
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div
          className={'modal__body' + (bodyClassName ? ' ' + bodyClassName : '')}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
