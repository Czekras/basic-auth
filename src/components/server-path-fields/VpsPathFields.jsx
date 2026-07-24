import DomainField from './DomainField.jsx'

export default function VpsPathFields({ domain, onDomainChange, onEnter }) {
  return (
    <DomainField value={domain} onChange={onDomainChange} onEnter={onEnter} />
  )
}
