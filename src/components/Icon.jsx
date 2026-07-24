import {
  LayoutGrid,
  Search,
  SearchX,
  UserRoundKey,
  ClipboardList,
  SquareKanban,
  Route,
  ImageDown,
} from 'lucide-react'
import './Icon.css'

// Static imports avoid bundling every Lucide glyph. Keep hidden-app entries so
// status changes cannot silently fall back to LayoutGrid.
const ICONS = {
  'layout-grid': LayoutGrid,
  search: Search,
  'search-x': SearchX,
  'user-round-key': UserRoundKey,
  'clipboard-list': ClipboardList,
  'square-kanban': SquareKanban,
  route: Route,
  'image-down': ImageDown,
}

export default function Icon({ name, className = '' }) {
  const Cmp = ICONS[name] ?? LayoutGrid
  return <Cmp className={`icon ${className}`} aria-hidden="true" />
}
