export function Gutter({ text }) {
  const n = text.split('\n').length
  return (
    <div>
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  )
}

// This intentionally highlights only the generated format; it is not a general parser.
const DIRECTIVES = new Set([
  'AuthType',
  'AuthName',
  'AuthUserFile',
  'require',
  'Order',
  'Allow',
  'Deny',
  'Satisfy',
])

function kw(children, key) {
  return (
    <span key={key} className="code-card__token code-card__token--keyword">
      {children}
    </span>
  )
}
function str(children, key) {
  return (
    <span key={key} className="code-card__token code-card__token--string">
      {children}
    </span>
  )
}
function com(children, key) {
  return (
    <span key={key} className="code-card__token code-card__token--comment">
      {children}
    </span>
  )
}

export function HtaccessCode({ text }) {
  const lines = text.split('\n').map((line, i) => {
    if (line.trimStart().startsWith('#')) return <div key={i}>{com(line)}</div>
    const first = line.split(' ')[0]
    if (!DIRECTIVES.has(first)) return <div key={i}>{line}</div>
    const rest = line.slice(first.length)
    const re = /("[^"]*")/g
    const chunks = []
    let last = 0
    let m
    let k = 0
    while ((m = re.exec(rest)) !== null) {
      if (m.index > last) chunks.push(rest.slice(last, m.index))
      chunks.push(str(m[1], 'q' + k++))
      last = re.lastIndex
    }
    if (last < rest.length) chunks.push(rest.slice(last))
    return (
      <div key={i}>
        {kw(first, 'd')}
        <span>{chunks}</span>
      </div>
    )
  })
  return <div>{lines}</div>
}

export function HtpasswdCode({ text }) {
  const lines = text.split('\n').map((line, i) => {
    if (line.startsWith('#')) return <div key={i}>{com(line)}</div>
    const ci = line.indexOf(':')
    if (ci < 0) return <div key={i}>{line}</div>
    const left = line.slice(0, ci)
    const right = line.slice(ci + 1)
    const leftEl = /^<.*>$/.test(left) ? str(left, 'l') : left
    return (
      <div key={i}>
        {leftEl}
        {':'}
        {str(right, 'r')}
      </div>
    )
  })
  return <div>{lines}</div>
}
