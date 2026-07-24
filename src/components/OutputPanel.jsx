import './OutputPanel.css'
import CodeCard from './CodeCard.jsx'
import { DownloadIcon, CheckIcon } from '../lib/icons.jsx'
import { serverTypeTag, statusLabel } from '../lib/accounts.js'

export default function OutputPanel({
  htaccess,
  htpasswd,
  hasEncoded,
  outputReady,
  serverType,
  status,
  caseName,
  memo,
  onMemoChange,
  copied,
  zipSaved,
  onOpenHelp,
  onDownloadZip,
  onCopyHtaccess,
  onCopyHtpasswd,
  onCopyLogin,
  onDownloadHtaccess,
  onDownloadHtpasswd,
}) {
  return (
    <div className="output">
      <div className="output__head">
        {outputReady && (
          <div className="output__info">
            <span className={'output__tag output__tag--' + serverType}>
              {serverTypeTag(serverType)}
            </span>
            <span className={'output__status output__status--' + status}>
              <span className="output__status-dot" />
              {statusLabel(status)}
            </span>
            <span className="output__info-text">
              {caseName && <span className="output__case">{caseName}</span>}
            </span>
          </div>
        )}
        <div className="output__actions">
          <button
            className="output__help"
            type="button"
            title="使い方を表示"
            onClick={onOpenHelp}
          >
            使い方
          </button>
          <button
            className="output__zip"
            type="button"
            title=".htaccess と .htpasswd を zip でまとめてダウンロード"
            onClick={onDownloadZip}
            disabled={!outputReady}
          >
            {zipSaved ? (
              <CheckIcon color="#ffffff" />
            ) : (
              <DownloadIcon color="#ffffff" />
            )}
            {zipSaved ? '保存しました' : 'まとめて (.zip)'}
          </button>
        </div>
      </div>

      <CodeCard
        filename=".htaccess"
        code={htaccess}
        variant="htaccess"
        copied={copied === 'htaccess'}
        onCopy={onCopyHtaccess}
        onDownload={onDownloadHtaccess}
        downloadEnabled={outputReady}
      />

      <CodeCard
        filename=".htpasswd"
        code={htpasswd}
        variant="htpasswd"
        hint={hasEncoded ? null : '生成するとハッシュが作成されます'}
        copied={copied === 'htpasswd'}
        onCopy={onCopyHtpasswd}
        onDownload={onDownloadHtpasswd}
        downloadEnabled={hasEncoded}
        onCopyLogin={onCopyLogin}
        loginCopied={copied === 'login'}
        loginCopyEnabled={hasEncoded}
      />

      <textarea
        className="output__memo"
        value={outputReady ? (memo ?? '') : ''}
        onChange={(e) => onMemoChange(e.target.value)}
        disabled={!outputReady}
        placeholder="メモ"
      />
    </div>
  )
}
