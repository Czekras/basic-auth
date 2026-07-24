import Modal from './Modal.jsx'
import './HelpModal.css'

const STEPS = [
  <>
    サーバー種別を選びます。選んだ種別に応じて .htpasswd
    の推奨される設置パスが決まります。
  </>,
  <>
    案件名・ユーザー名・パスワードを入力します。パスワードは「ランダム生成」も使えます。
  </>,
  <>
    「生成する」ボタンをクリックします。保存後に案件名やパス（AuthUserFile）を変更することはできないため、事前によくご確認ください。
  </>,
  <>
    生成された .htaccess と .htpasswd をコピー、またはダウンロードします。
    <br />
    一括で .zip 形式でのダウンロードも可能です。
  </>,
  <>2つのファイルをサーバーにアップロードします（※配置場所は下記を参照）。</>,
  <>アップロード後、対象ページを開いてログイン画面が出れば完了です。</>,
]

export default function HelpModal({ onClose }) {
  return (
    <Modal
      title="使い方"
      subtitle="ベーシック認証の設定から、ファイルをサーバーに設置するまでの流れをご案内します。"
      onClose={onClose}
    >
      <div className="help-modal">
        <section className="help-modal__section">
          <h3 className="help-modal__label">手順</h3>
          <ol className="help-modal__steps">
            {STEPS.map((text, i) => (
              <li className="help-modal__step" key={i}>
                <span className="help-modal__step-num">{i + 1}</span>
                <span className="help-modal__step-text">{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="help-modal__section">
          <h3 className="help-modal__label">ファイルの置き場所</h3>

          <div className="help-modal__places">
            <div className="help-modal__place">
              <span className="help-modal__place-name">.htaccess</span>
              <span className="help-modal__place-desc">
                アクセス制限をかけたいディレクトリ（フォルダ）の直下に配置します。
              </span>
            </div>
            <div className="help-modal__place">
              <span className="help-modal__place-name">.htpasswd</span>
              <span className="help-modal__place-desc">
                .htaccess 内の AuthUserFile
                で指定した絶対パスと同じ場所に配置します。
              </span>
            </div>
          </div>

          <div className="help-modal__path-group">
            <code className="help-modal__path">
              AuthUserFile /var/www/vhosts/example.com/httpdocs/.htpasswd
            </code>
            <p className="help-modal__path-caption">
              ※上記 AuthUserFile に記述されている絶対パスと、実際の .htpasswd
              の配置場所が完全に一致している必要があります。
            </p>
          </div>
        </section>

        <section className="help-modal__section">
          <h3 className="help-modal__label">補足</h3>
          <div className="help-modal__notes">
            <p className="help-modal__note">
              同じパスワードを入力しても、生成するたびに異なるハッシュ文字列（暗号化文字列）が出力されます。これはセキュリティ上の仕様であり、どのハッシュ値でも問題なくログイン可能です。
            </p>
            <p className="help-modal__note">
              入力内容および保存されたアカウント情報は、お使いのブラウザ内のみに安全に保存され、外部サーバーへ送信されることはありません。そのため、ブラウザのキャッシュをクリアしたり、別の端末・ブラウザからアクセスした場合は、保存した一覧が表示されなくなりますのでご注意ください。
            </p>
          </div>
        </section>
      </div>
    </Modal>
  )
}
