import './CodeCard.css'
import { Gutter, HtaccessCode, HtpasswdCode } from '../lib/highlight.jsx'
import { CopyIcon, CheckIcon, DownloadIcon } from '../lib/icons.jsx'

export default function CodeCard({
  filename,
  code,
  variant,
  hint,
  copied,
  onCopy,
  onDownload,
  downloadEnabled,
  onCopyLogin,
  loginCopied,
  loginCopyEnabled,
}) {
  const Body = variant === 'htaccess' ? HtaccessCode : HtpasswdCode
  return (
    <div className="code-card">
      <div className="code-card__header">
        <span className="code-card__filename">{filename}</span>
        <div className="code-card__controls">
          {onCopyLogin && (
            <button
              className={
                'code-card__copy' +
                (loginCopied ? ' code-card__copy--done' : '')
              }
              type="button"
              title="ユーザー名とパスワードをコピー"
              onClick={onCopyLogin}
              disabled={!loginCopyEnabled}
            >
              {loginCopied ? <CheckIcon /> : <CopyIcon />}
              <span className="code-card__copy-label">
                {loginCopied ? 'コピーしました' : 'ログイン情報をコピー'}
              </span>
            </button>
          )}
          <button
            className={
              'code-card__copy' + (copied ? ' code-card__copy--done' : '')
            }
            type="button"
            title="このコードをコピー"
            onClick={onCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="code-card__copy-label">
              {copied ? 'コピーしました' : 'このコードをコピー'}
            </span>
          </button>
          <button
            className="code-card__download"
            type="button"
            aria-label={`${filename} をダウンロード`}
            onClick={onDownload}
            disabled={!downloadEnabled}
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      <div className="code-card__body">
        {hint && <div className="code-card__banner">{hint}</div>}
        <div className="code-card__code">
          <div className="code-card__gutter">
            <Gutter text={code} />
          </div>
          <div className="code-card__source">
            <Body text={code} />
          </div>
        </div>
      </div>
    </div>
  )
}
