// This browser-side APR1 port ensures passwords never leave the page.

export const ITOA64 =
  './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function rand(len, set) {
  const chars =
    set || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = new Uint32Array(len)
  crypto.getRandomValues(bytes)
  let o = ''
  for (let i = 0; i < len; i++) o += chars[bytes[i] % chars.length]
  return o
}

function strBytes(s) {
  return Array.from(new TextEncoder().encode(s))
}

function md5bytes(bytes) {
  const sadd = (a, b) => {
    const l = (a & 0xffff) + (b & 0xffff)
    const m = (a >> 16) + (b >> 16) + (l >> 16)
    return (m << 16) | (l & 0xffff)
  }
  const rol = (n, c) => (n << c) | (n >>> (32 - c))
  const cmn = (q, a, b, x, s, t) =>
    sadd(rol(sadd(sadd(a, q), sadd(x, t)), s), b)
  const ff = (a, b, c, d, x, s, t) => cmn((b & c) | (~b & d), a, b, x, s, t)
  const gg = (a, b, c, d, x, s, t) => cmn((b & d) | (c & ~d), a, b, x, s, t)
  const hh = (a, b, c, d, x, s, t) => cmn(b ^ c ^ d, a, b, x, s, t)
  const ii = (a, b, c, d, x, s, t) => cmn(c ^ (b | ~d), a, b, x, s, t)
  const len = bytes.length,
    bitLen = len * 8
  const nWords = (((bitLen + 64) >>> 9) << 4) + 16
  const x = new Array(nWords).fill(0)
  for (let i = 0; i < len; i++) x[i >> 2] |= bytes[i] << ((i % 4) * 8)
  x[len >> 2] |= 0x80 << ((len % 4) * 8)
  x[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen
  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878
  for (let i = 0; i < x.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d
    a = ff(a, b, c, d, x[i + 0], 7, -680876936)
    d = ff(d, a, b, c, x[i + 1], 12, -389564586)
    c = ff(c, d, a, b, x[i + 2], 17, 606105819)
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330)
    a = ff(a, b, c, d, x[i + 4], 7, -176418897)
    d = ff(d, a, b, c, x[i + 5], 12, 1200080426)
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341)
    b = ff(b, c, d, a, x[i + 7], 22, -45705983)
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416)
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417)
    c = ff(c, d, a, b, x[i + 10], 17, -42063)
    b = ff(b, c, d, a, x[i + 11], 22, -1990404162)
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682)
    d = ff(d, a, b, c, x[i + 13], 12, -40341101)
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290)
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329)
    a = gg(a, b, c, d, x[i + 1], 5, -165796510)
    d = gg(d, a, b, c, x[i + 6], 9, -1069501632)
    c = gg(c, d, a, b, x[i + 11], 14, 643717713)
    b = gg(b, c, d, a, x[i + 0], 20, -373897302)
    a = gg(a, b, c, d, x[i + 5], 5, -701558691)
    d = gg(d, a, b, c, x[i + 10], 9, 38016083)
    c = gg(c, d, a, b, x[i + 15], 14, -660478335)
    b = gg(b, c, d, a, x[i + 4], 20, -405537848)
    a = gg(a, b, c, d, x[i + 9], 5, 568446438)
    d = gg(d, a, b, c, x[i + 14], 9, -1019803690)
    c = gg(c, d, a, b, x[i + 3], 14, -187363961)
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501)
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467)
    d = gg(d, a, b, c, x[i + 2], 9, -51403784)
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473)
    b = gg(b, c, d, a, x[i + 12], 20, -1926607734)
    a = hh(a, b, c, d, x[i + 5], 4, -378558)
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463)
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562)
    b = hh(b, c, d, a, x[i + 14], 23, -35309556)
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060)
    d = hh(d, a, b, c, x[i + 4], 11, 1272893353)
    c = hh(c, d, a, b, x[i + 7], 16, -155497632)
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640)
    a = hh(a, b, c, d, x[i + 13], 4, 681279174)
    d = hh(d, a, b, c, x[i + 0], 11, -358537222)
    c = hh(c, d, a, b, x[i + 3], 16, -722521979)
    b = hh(b, c, d, a, x[i + 6], 23, 76029189)
    a = hh(a, b, c, d, x[i + 9], 4, -640364487)
    d = hh(d, a, b, c, x[i + 12], 11, -421815835)
    c = hh(c, d, a, b, x[i + 15], 16, 530742520)
    b = hh(b, c, d, a, x[i + 2], 23, -995338651)
    a = ii(a, b, c, d, x[i + 0], 6, -198630844)
    d = ii(d, a, b, c, x[i + 7], 10, 1126891415)
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905)
    b = ii(b, c, d, a, x[i + 5], 21, -57434055)
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571)
    d = ii(d, a, b, c, x[i + 3], 10, -1894986606)
    c = ii(c, d, a, b, x[i + 10], 15, -1051523)
    b = ii(b, c, d, a, x[i + 1], 21, -2054922799)
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359)
    d = ii(d, a, b, c, x[i + 15], 10, -30611744)
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380)
    b = ii(b, c, d, a, x[i + 13], 21, 1309151649)
    a = ii(a, b, c, d, x[i + 4], 6, -145523070)
    d = ii(d, a, b, c, x[i + 11], 10, -1120210379)
    c = ii(c, d, a, b, x[i + 2], 15, 718787259)
    b = ii(b, c, d, a, x[i + 9], 21, -343485551)
    a = sadd(a, oa)
    b = sadd(b, ob)
    c = sadd(c, oc)
    d = sadd(d, od)
  }
  const out = []
  ;[a, b, c, d].forEach((w) => {
    out.push(w & 0xff, (w >>> 8) & 0xff, (w >>> 16) & 0xff, (w >>> 24) & 0xff)
  })
  return out
}

/** Produces an Apache-compatible `$apr1$<salt>$<hash>` value. */
export function apr1(password, saltStr) {
  const magic = '$apr1$'
  const pw = strBytes(password)
  const salt = (saltStr || '').slice(0, 8)
  const sl = strBytes(salt)
  let ctx = pw.concat(strBytes(magic), sl)
  let f = md5bytes(pw.concat(sl, pw))
  for (let i = pw.length; i > 0; i -= 16)
    ctx = ctx.concat(f.slice(0, Math.min(i, 16)))
  for (let i = pw.length; i > 0; i >>= 1) ctx = ctx.concat([i & 1 ? 0 : pw[0]])
  f = md5bytes(ctx)
  for (let i = 0; i < 1000; i++) {
    let c = []
    c = c.concat(i & 1 ? pw : f.slice(0, 16))
    if (i % 3) c = c.concat(sl)
    if (i % 7) c = c.concat(pw)
    c = c.concat(i & 1 ? f.slice(0, 16) : pw)
    f = md5bytes(c)
  }
  const to64 = (v, n) => {
    let s = ''
    while (n-- > 0) {
      s += ITOA64[v & 0x3f]
      v >>>= 6
    }
    return s
  }
  let out = ''
  out += to64((f[0] << 16) | (f[6] << 8) | f[12], 4)
  out += to64((f[1] << 16) | (f[7] << 8) | f[13], 4)
  out += to64((f[2] << 16) | (f[8] << 8) | f[14], 4)
  out += to64((f[3] << 16) | (f[9] << 8) | f[15], 4)
  out += to64((f[4] << 16) | (f[10] << 8) | f[5], 4)
  out += to64(f[11], 2)
  return magic + salt + '$' + out
}

export function hashPassword(password) {
  return apr1(password, rand(8, ITOA64))
}
