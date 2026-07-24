import { useRef, useState } from 'react'
import './InfoTip.css'

const VIEWPORT_GUTTER = 8

export default function InfoTip({ text }) {
  const tipRef = useRef(null)
  const bubbleRef = useRef(null)
  const [bubbleStyle, setBubbleStyle] = useState(undefined)

  // Fixed positioning avoids modal clipping; viewport clamping prevents narrow-screen overflow.
  const positionBubble = () => {
    const anchor = tipRef.current
    const bubble = bubbleRef.current
    if (!anchor || !bubble) return

    const anchorRect = anchor.getBoundingClientRect()
    const bubbleWidth = bubble.offsetWidth

    const maxLeft = window.innerWidth - bubbleWidth - VIEWPORT_GUTTER
    const left = Math.max(
      VIEWPORT_GUTTER,
      Math.min(anchorRect.left - 2, maxLeft),
    )
    const top = anchorRect.top - bubble.offsetHeight - 9
    const arrowLeft = Math.min(
      Math.max(anchorRect.left + anchorRect.width / 2 - left, 14),
      bubbleWidth - 14,
    )

    setBubbleStyle({ left, top, '--info-tip-arrow': `${arrowLeft}px` })
  }

  return (
    <span
      className="info-tip"
      tabIndex={0}
      ref={tipRef}
      onMouseEnter={positionBubble}
      onFocus={positionBubble}
    >
      <span className="info-tip__badge">?</span>
      <span
        className="info-tip__bubble"
        role="tooltip"
        ref={bubbleRef}
        style={bubbleStyle}
      >
        {text}
      </span>
    </span>
  )
}
