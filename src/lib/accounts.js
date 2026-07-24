import { rand } from './crypto.js'

/**
 * @typedef {'vps' | 'sakura' | 'xserver' | 'manual'} ServerType
 * @typedef {'enabled' | 'disabled' | 'needs-update'} AccountStatus
 *
 * @typedef {object} Credential
 * @property {string} user
 * @property {string} pass
 * @property {string} enc
 *
 * @typedef {object} AccountSnapshot
 * @property {string} caseName
 * @property {ServerType} serverType
 * @property {string} domain
 * @property {string} sakuraAccount
 * @property {string} xserverLabel
 * @property {string} manualPath
 * @property {string} authName
 * @property {Credential[]} users
 * @property {string} memo
 * @property {AccountStatus} status
 *
 * @typedef {object} SavedAccount
 * @property {string} id
 * @property {string} label
 * @property {AccountSnapshot} snapshot
 *
 * @typedef {object} AccountGroup
 * @property {string} id
 * @property {string} name
 * @property {SavedAccount[]} accounts
 */

// Recent is fixed and receives new accounts until the user moves them.
export const DEFAULT_GROUP_ID = 'recent'
export const DEFAULT_GROUP_NAME = 'Recent'

/** @returns {AccountGroup[]} */
export function defaultGroups() {
  return [{ id: DEFAULT_GROUP_ID, name: DEFAULT_GROUP_NAME, accounts: [] }]
}

/**
 * Creates the complete, persisted representation used for previews and output.
 *
 * @param {Omit<AccountSnapshot, 'memo' | 'status'> & {
 *   memo?: string,
 *   status?: AccountStatus
 * }} fields
 * @returns {AccountSnapshot}
 */
export function makeSnapshot({
  caseName,
  serverType,
  domain,
  sakuraAccount,
  xserverLabel,
  manualPath,
  authName,
  users,
  memo,
  status,
}) {
  return {
    caseName,
    serverType,
    domain,
    sakuraAccount,
    xserverLabel,
    manualPath,
    authName,
    users,
    memo: memo ?? '',
    status: status ?? 'enabled',
  }
}

export function blankSnapshot() {
  return makeSnapshot({
    caseName: '',
    serverType: 'vps',
    domain: '',
    sakuraAccount: '',
    xserverLabel: '',
    manualPath: '',
    authName: 'メンテナンス中',
    users: [],
    memo: '',
    status: 'enabled',
  })
}

// Status clicks follow this order and wrap; temporary disablement shares "disabled".
/** @type {AccountStatus[]} */
export const STATUSES = ['enabled', 'disabled', 'needs-update']

// Accounts saved before statuses existed default to enabled.
export function accountStatus(snapshot) {
  return snapshot.status || 'enabled'
}

export function nextStatus(status) {
  const statusIndex = STATUSES.indexOf(status)
  return STATUSES[(statusIndex + 1) % STATUSES.length]
}

export function statusLabel(status) {
  switch (status) {
    case 'disabled':
      return '無効'
    case 'needs-update':
      return '要更新'
    case 'enabled':
    default:
      return '有効'
  }
}

// Use only the active server field so hidden stale values cannot label an account.
export function autoLabel(snapshot) {
  switch (snapshot.serverType) {
    case 'sakura':
      return snapshot.sakuraAccount || '無題'
    case 'xserver':
      return snapshot.xserverLabel
        ? snapshot.xserverLabel + (snapshot.domain ? '/' + snapshot.domain : '')
        : '無題'
    case 'manual':
      return snapshot.manualPath || '無題'
    case 'vps':
    default:
      return snapshot.domain || '無題'
  }
}

export function serverTypeTag(serverType) {
  switch (serverType) {
    case 'sakura':
      return 'SKR'
    case 'xserver':
      return 'XSV'
    case 'manual':
      return 'CST'
    case 'vps':
    default:
      return 'GMO'
  }
}

export function newAccountId() {
  return rand(8)
}

export function newGroupId() {
  return rand(8)
}
