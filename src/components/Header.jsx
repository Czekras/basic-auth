import AppSearchPopover from './AppSearchPopover.jsx'
import './Header.css'

// Vite injects __APP_VERSION__ from package.json at build time.
export default function Header({ title }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <h1 className="app-header__title">{title}</h1>
          <span className="app-header__version">v{__APP_VERSION__}</span>
        </div>
        <AppSearchPopover />
      </div>
    </header>
  )
}
