import {
  Copy,
  CopyCheck,
  Download,
  Pin,
  Pencil,
  Trash2,
  GripVertical,
  X,
  CornerDownRight,
  ChevronDown,
} from 'lucide-react'

// Preserve the app's icon API while centralizing glyphs in Lucide.
export function CopyIcon({ color = 'currentColor', size = 15 }) {
  return <Copy color={color} size={size} className="icon" />
}

export function CheckIcon({ color = 'currentColor', size = 15 }) {
  return <CopyCheck color={color} size={size} className="icon" />
}

export function DownloadIcon({ color = 'currentColor', size = 15 }) {
  return <Download color={color} size={size} className="icon" />
}

export function LockIcon({ color = 'currentColor', size = 14 }) {
  return <Pin color={color} size={size} className="icon" />
}

export function PencilIcon({ color = 'currentColor', size = 14 }) {
  return <Pencil color={color} size={size} className="icon" />
}

export function TrashIcon({ color = 'currentColor', size = 14 }) {
  return <Trash2 color={color} size={size} className="icon" />
}

export function GripIcon({ color = 'currentColor', size = 14 }) {
  return <GripVertical color={color} size={size} className="icon" />
}

export function CloseIcon({ color = 'currentColor', size = 14 }) {
  return <X color={color} size={size} className="icon" />
}

export function ArrowIcon({ color = 'currentColor', size = 12 }) {
  return <CornerDownRight color={color} size={size} className="icon" />
}

export function ChevronDownIcon({ color = 'currentColor', size = 14 }) {
  return <ChevronDown color={color} size={size} className="icon" />
}
