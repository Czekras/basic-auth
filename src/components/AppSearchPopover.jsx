import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  loadCachedApps,
  fetchApps,
  visibleApps,
  currentAppName as getCurrentAppName,
  navigateToApp,
} from '../lib/apps.js'
import Icon from './Icon.jsx'
import './AppSearchPopover.css'

const BLOCK = 'app-search'
const MAX_EMPTY_QUERY_LENGTH = 15
const COMPACT_MEDIA_QUERY = '(max-width: 640px)'
const OPTION_SELECTOR = '[role="option"]'

function isAppUnavailable(app) {
  return app.status === 'soon' || app.status === 'maintenance' || !app.url
}

function getStatusLabel(app) {
  if (app.status === 'soon') return 'Coming Soon'
  if (app.status === 'maintenance') return 'Maintenance'
  if (!app.url) return 'Unavailable'
  return ''
}

function useAppCatalog() {
  const [apps, setApps] = useState(() => loadCachedApps())

  useEffect(() => {
    let isMounted = true

    fetchApps()
      .then((freshApps) => {
        if (isMounted) setApps(freshApps)
      })
      .catch(() => {
        /* Keep cached data available when a refresh fails. */
      })

    return () => {
      isMounted = false
    }
  }, [])

  return apps
}

// Keep this query aligned with the breakpoint in AppSearchPopover.css.
function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(
    () => window.matchMedia(COMPACT_MEDIA_QUERY).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_MEDIA_QUERY)
    const updateLayout = (event) => setIsCompact(event.matches)

    mediaQuery.addEventListener('change', updateLayout)
    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  return isCompact
}

function AppOption({
  app,
  index,
  optionId,
  isActive,
  isCurrent,
  onActivate,
  onKeyDown,
  onSelect,
}) {
  const isUnavailable = isAppUnavailable(app)
  const statusLabel = getStatusLabel(app)
  const className = [
    `${BLOCK}__item`,
    isActive && !isUnavailable && `${BLOCK}__item--active`,
    isCurrent && `${BLOCK}__item--current`,
    isUnavailable && `${BLOCK}__item--soon`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      id={optionId}
      className={className}
      role="option"
      aria-selected={isActive}
      aria-current={isCurrent || undefined}
      tabIndex={isUnavailable ? -1 : 0}
      onFocus={() => onActivate(index)}
      onKeyDown={(event) => onKeyDown(event, true)}
      onMouseMove={() => {
        if (!isActive) onActivate(index)
      }}
      onClick={() => onSelect(app)}
    >
      <span className={`${BLOCK}__icon-wrap`}>
        <Icon name={app.icon} className={`${BLOCK}__icon`} />
      </span>
      <span className={`${BLOCK}__name`}>{app.name}</span>
      {statusLabel && <span className={`${BLOCK}__meta`}>{statusLabel}</span>}
    </div>
  )
}

function EmptyResults({ query }) {
  const displayedQuery =
    query.length > MAX_EMPTY_QUERY_LENGTH
      ? `${query.slice(0, MAX_EMPTY_QUERY_LENGTH)}…`
      : query

  return (
    <div className={`${BLOCK}__empty`}>
      <Icon name="search-x" className={`${BLOCK}__empty-icon`} />
      <span>No apps match “{displayedQuery}”</span>
    </div>
  )
}

export default function AppSearchPopover() {
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const apps = useAppCatalog()
  const isCompact = useCompactLayout()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndexState, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)

  const currentAppName = getCurrentAppName(apps)

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const availableApps = visibleApps(apps)

    if (!normalizedQuery) return availableApps
    return availableApps.filter((app) =>
      (app.name ?? '').toLowerCase().includes(normalizedQuery),
    )
  }, [query, apps])

  // Render-time clamping prevents a filtered list from exposing a stale index.
  const activeIndex = filteredApps.length
    ? Math.min(activeIndexState, filteredApps.length - 1)
    : 0

  function openPopover() {
    setIsOpen(true)
    setQuery('')
    setActiveIndex(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function closePopover(focusTarget) {
    setIsOpen(false)
    // Restore focus after the trigger remounts; callers may redirect it.
    requestAnimationFrame(() => (focusTarget ?? triggerRef.current)?.focus())
  }

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openPopover()
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  // Document listeners provide dismissal because the popover has no backdrop.
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event) => {
      // Escape returns to the primary action so account entry can resume immediately.
      if (event.key === 'Escape') {
        closePopover(document.querySelector('.app__open-form'))
      }
    }

    document.addEventListener('mousedown', handleOutsideClick, true)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function getOptionAt(index) {
    return listRef.current?.querySelectorAll(OPTION_SELECTOR)[index]
  }

  function scrollOptionIntoView(index) {
    const list = listRef.current
    if (!list) return

    const option = getOptionAt(index)
    if (!option) return

    const listRect = list.getBoundingClientRect()
    const optionRect = option.getBoundingClientRect()

    if (optionRect.bottom > listRect.bottom) {
      list.scrollTop += optionRect.bottom - listRect.bottom + 6
    } else if (optionRect.top < listRect.top) {
      list.scrollTop -= listRect.top - optionRect.top + 6
    }
  }

  // Programmatic focus reaches disabled-tab-order items during keyboard roving.
  function focusOption(index) {
    getOptionAt(index)?.focus()
  }

  function activateOption(index, shouldFocus) {
    setActiveIndex(index)
    scrollOptionIntoView(index)
    if (shouldFocus) focusOption(index)
  }

  // Input arrows preserve typing focus; item arrows move DOM focus as well
  // so subsequent Tab navigation starts from the highlighted item.
  function moveSelection(delta, shouldFocus) {
    if (!filteredApps.length) return

    const nextIndex =
      (activeIndex + delta + filteredApps.length) % filteredApps.length
    activateOption(nextIndex, shouldFocus)
  }

  function selectApp(app) {
    if (!app || isAppUnavailable(app)) return

    if (app.name === currentAppName) {
      closePopover()
      return
    }

    navigateToApp(app)
  }

  function handleNavigationKey(event, shouldFocus = false) {
    const lastIndex = filteredApps.length - 1

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveSelection(1, shouldFocus)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveSelection(-1, shouldFocus)
        break
      case 'Enter':
        event.preventDefault()
        selectApp(filteredApps[activeIndex])
        break
      case 'Home':
        event.preventDefault()
        activateOption(0, shouldFocus)
        break
      case 'End':
        event.preventDefault()
        activateOption(lastIndex, shouldFocus)
        break
    }
  }

  function handleQueryChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
    if (listRef.current) listRef.current.scrollTop = 0
  }

  return (
    <div className={BLOCK} ref={rootRef}>
      {!isOpen || isCompact ? (
        <button
          ref={triggerRef}
          type="button"
          className={`${BLOCK}__trigger${
            isOpen ? ` ${BLOCK}__trigger--active` : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Switch app"
          title="Switch app · ⌘K"
          onClick={() => (isOpen ? closePopover() : openPopover())}
        >
          <Icon name="layout-grid" className={`${BLOCK}__trigger-icon`} />
        </button>
      ) : (
        <div className={`${BLOCK}__field`}>
          <Icon name="search" className={`${BLOCK}__field-icon`} />
          <input
            ref={inputRef}
            className={`${BLOCK}__input`}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleNavigationKey}
            placeholder="Switch to..."
            aria-label="Search apps"
            aria-controls={listboxId}
            aria-activedescendant={
              filteredApps.length
                ? `${baseId}-option-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      )}

      <div
        className={`${BLOCK}__popover`}
        id={listboxId}
        role="listbox"
        aria-label="Support Tools"
        hidden={!isOpen}
      >
        <div className={`${BLOCK}__list`} ref={listRef}>
          <div className={`${BLOCK}__heading`} role="presentation">
            <span className={`${BLOCK}__heading-label`}>Support Tools</span>
          </div>
          {filteredApps.map((app, index) => (
            <AppOption
              key={app.name}
              app={app}
              index={index}
              optionId={`${baseId}-option-${index}`}
              isActive={index === activeIndex}
              isCurrent={app.name === currentAppName}
              onActivate={setActiveIndex}
              onKeyDown={handleNavigationKey}
              onSelect={selectApp}
            />
          ))}
          {filteredApps.length === 0 && <EmptyResults query={query} />}
        </div>
      </div>
    </div>
  )
}
