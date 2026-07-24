const cleanPathSegment = (value) =>
  (value || '').trim().replace(/^\/+|\/+$/g, '')

// These host templates reflect the deployment paths used by the QC/coder team.
export function fullPath({
  serverType,
  domain,
  sakuraAccount,
  xserverLabel,
  manualPath,
}) {
  switch (serverType) {
    case 'sakura': {
      const accountName = cleanPathSegment(sakuraAccount)
      return accountName ? `/home/${accountName}/www/.htpasswd` : ''
    }
    case 'xserver': {
      const serverName = cleanPathSegment(xserverLabel)
      const domainName = cleanPathSegment(domain)
      return serverName && domainName
        ? `/home/${serverName}/${domainName}/public_html/.htpasswd`
        : ''
    }
    case 'manual':
      return (manualPath || '').trim()
    case 'vps':
    default: {
      const domainName = cleanPathSegment(domain)
      return domainName
        ? `/var/www/vhosts/${domainName}/httpdocs/.htpasswd`
        : ''
    }
  }
}

/** Builds a display path with labels for fields the user has not filled yet. */
export function previewPath({
  serverType,
  domain,
  sakuraAccount,
  xserverLabel,
  manualPath,
}) {
  switch (serverType) {
    case 'sakura': {
      const accountName = cleanPathSegment(sakuraAccount) || 'アカウント名'
      return `/home/${accountName}/www/.htpasswd`
    }
    case 'xserver': {
      const serverName = cleanPathSegment(xserverLabel) || 'サーバー名'
      const domainName = cleanPathSegment(domain) || 'ドメイン名'
      return `/home/${serverName}/${domainName}/public_html/.htpasswd`
    }
    case 'manual':
      return (manualPath || '').trim() || '/home/user/public_html/.htpasswd'
    case 'vps':
    default: {
      const domainName = cleanPathSegment(domain) || 'ドメイン名'
      return `/var/www/vhosts/${domainName}/httpdocs/.htpasswd`
    }
  }
}

export function htaccessText(authName, path) {
  // Sanitize again because older saved accounts may predate input filtering.
  const sanitizedAuthName =
    (authName || '').replace(/"/g, '').trim() || 'メンテナンス中'
  return [
    '#ベーシック認証',
    'AuthType Basic',
    'AuthName "' + sanitizedAuthName + '"',
    'AuthUserFile ' + path,
    'require valid-user',
  ].join('\n')
}

// Keep the file format visible before the first user is encoded.
export function htpasswdText(users) {
  if (users.length === 0) {
    return [
      '<ユーザー名>:<エンコードパスワード>',
      '# ユーザー名：<ユーザー名>',
      '# パスワード：<パスワード>',
    ].join('\n')
  }
  const hashLines = users.map(
    (credential) => credential.user + ':' + credential.enc,
  )
  const commentLines = users.map(
    (credential) => '# ' + credential.user + '：' + credential.pass,
  )
  return hashLines
    .concat(['', '# ログイン情報（保管用）'], commentLines)
    .join('\n')
}
