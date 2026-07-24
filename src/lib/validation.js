// Colons corrupt htpasswd rows; restrict usernames to an unambiguous safe subset.
const USERNAME_DISALLOWED = /[^a-zA-Z0-9_-]/g
const SAKURA_ACCOUNT_DISALLOWED = /[^a-z0-9-]/g
const XSERVER_LABEL_DISALLOWED = /[^a-z0-9]/g
const DOMAIN_DISALLOWED = /[^a-z0-9.-]/g
const AUTH_NAME_DISALLOWED = /"/g

const SAKURA_ALL_DIGITS = /^[0-9]+$/

export function sanitizeUsername(value) {
  return value.replace(USERNAME_DISALLOWED, '')
}

export function sanitizeSakuraAccount(value) {
  return value.toLowerCase().replace(SAKURA_ACCOUNT_DISALLOWED, '')
}

export function sanitizeXserverLabel(value) {
  return value.toLowerCase().replace(XSERVER_LABEL_DISALLOWED, '')
}

// Do not enforce a TLD shape: modern TLDs vary and incomplete typing must remain possible.
export function sanitizeDomain(value) {
  return value.toLowerCase().replace(DOMAIN_DISALLOWED, '')
}

// Quotes would break the generated `AuthName "..."` directive.
export function sanitizeAuthName(value) {
  return value.replace(AUTH_NAME_DISALLOWED, '')
}

export function sakuraAccountIssues(value) {
  return {
    edgeHyphen: value.startsWith('-') || value.endsWith('-'),
    allDigits: value !== '' && SAKURA_ALL_DIGITS.test(value),
    badLength: value !== '' && value.length < 3,
  }
}

export function sakuraAccountValid(value) {
  const issues = sakuraAccountIssues(value)
  return !issues.edgeHyphen && !issues.allDigits && !issues.badLength
}

export function xserverLabelIssues(value) {
  return { badLength: value !== '' && value.length < 3 }
}

export function xserverLabelValid(value) {
  return !xserverLabelIssues(value).badLength
}

// Per-label checks let the UI distinguish edge hyphens from invalid `--` placement.
export function domainLabelIssues(value) {
  const labels = value.split('.').filter(Boolean)
  let edgeHyphen = false
  let consecutiveHyphen = false
  for (const label of labels) {
    if (label.startsWith('-') || label.endsWith('-')) edgeHyphen = true
    if (label[2] === '-' && label[3] === '-' && !label.startsWith('xn--'))
      consecutiveHyphen = true
  }
  return { edgeHyphen, consecutiveHyphen }
}

export function domainValid(value) {
  const issues = domainLabelIssues(value)
  return !issues.edgeHyphen && !issues.consecutiveHyphen
}

export function manualPathIssues(value) {
  const trimmed = (value || '').trim()
  return {
    missingLeadingSlash: trimmed !== '' && !trimmed.startsWith('/'),
    // Missing .htpasswd is suspicious but valid, so it remains advisory.
    missingHtpasswd: trimmed !== '' && !trimmed.includes('.htpasswd'),
  }
}

export function manualPathValid(value) {
  return !manualPathIssues(value).missingLeadingSlash
}

// Validate only fields visible for the selected server type.
export function fieldsValid({
  serverType,
  domain,
  sakuraAccount,
  xserverLabel,
  manualPath,
}) {
  switch (serverType) {
    case 'sakura':
      return sakuraAccountValid(sakuraAccount)
    case 'xserver':
      return domainValid(domain) && xserverLabelValid(xserverLabel)
    case 'manual':
      return manualPathValid(manualPath)
    case 'vps':
    default:
      return domainValid(domain)
  }
}
