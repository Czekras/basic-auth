import ManualPathFields from './server-path-fields/ManualPathFields.jsx'
import SakuraPathFields from './server-path-fields/SakuraPathFields.jsx'
import VpsPathFields from './server-path-fields/VpsPathFields.jsx'
import XserverPathFields from './server-path-fields/XserverPathFields.jsx'

export default function ServerPathFields({
  draft,
  xserver,
  onDraftChange,
  onEnter,
}) {
  switch (draft.serverType) {
    case 'sakura':
      return (
        <SakuraPathFields
          value={draft.sakuraAccount}
          onChange={(value) => onDraftChange('sakuraAccount', value)}
          onEnter={onEnter}
        />
      )
    case 'xserver':
      return (
        <XserverPathFields
          domain={draft.domain}
          label={draft.xserverLabel}
          xserver={xserver}
          onDomainChange={(value) => onDraftChange('domain', value)}
          onLabelChange={(value) => onDraftChange('xserverLabel', value)}
          onEnter={onEnter}
        />
      )
    case 'manual':
      return (
        <ManualPathFields
          value={draft.manualPath}
          onChange={(value) => onDraftChange('manualPath', value)}
          onEnter={onEnter}
        />
      )
    case 'vps':
    default:
      return (
        <VpsPathFields
          domain={draft.domain}
          onDomainChange={(value) => onDraftChange('domain', value)}
          onEnter={onEnter}
        />
      )
  }
}
