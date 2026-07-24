import test from 'node:test'
import assert from 'node:assert/strict'
import {
  fullPath,
  htaccessText,
  htpasswdText,
  previewPath,
} from '../src/lib/codegen.js'

test('builds deployment paths for every supported server type', () => {
  assert.equal(
    fullPath({ serverType: 'vps', domain: 'example.com' }),
    '/var/www/vhosts/example.com/httpdocs/.htpasswd',
  )
  assert.equal(
    fullPath({ serverType: 'sakura', sakuraAccount: 'my-account' }),
    '/home/my-account/www/.htpasswd',
  )
  assert.equal(
    fullPath({
      serverType: 'xserver',
      xserverLabel: 'server01',
      domain: 'example.com',
    }),
    '/home/server01/example.com/public_html/.htpasswd',
  )
  assert.equal(
    fullPath({
      serverType: 'manual',
      manualPath: ' /srv/private/.htpasswd ',
    }),
    '/srv/private/.htpasswd',
  )
})

test('uses readable placeholders for incomplete path previews', () => {
  assert.equal(
    previewPath({ serverType: 'vps', domain: '' }),
    '/var/www/vhosts/ドメイン名/httpdocs/.htpasswd',
  )
  assert.equal(
    previewPath({
      serverType: 'xserver',
      xserverLabel: '',
      domain: '',
    }),
    '/home/サーバー名/ドメイン名/public_html/.htpasswd',
  )
})

test('generates safe htaccess and htpasswd output', () => {
  assert.match(
    htaccessText(
      'Members "Only"',
      '/var/www/vhosts/example.com/httpdocs/.htpasswd',
    ),
    /AuthName "Members Only"/,
  )

  const output = htpasswdText([
    { user: 'admin', pass: 'secret', enc: '$apr1$hash' },
  ])
  assert.match(output, /^admin:\$apr1\$hash/m)
  assert.match(output, /^# admin：secret/m)
})
