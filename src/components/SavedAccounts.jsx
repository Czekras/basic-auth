import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import './SavedAccounts.css'
import ManageGroupsModal from './ManageGroupsModal.jsx'
import { PencilIcon, TrashIcon, GripIcon } from '../lib/icons.jsx'
import {
  DEFAULT_GROUP_ID,
  serverTypeTag,
  accountStatus,
  statusLabel,
} from '../lib/accounts.js'

export default function SavedAccounts({
  groups,
  activeAccountId,
  onSelectAccount,
  onPreviewAccount,
  onDeleteAccount,
  onCycleStatus,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onMoveAccount,
  onReorderGroups,
}) {
  const [showManageGroups, setShowManageGroups] = useState(false)

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return
    onMoveAccount(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index,
    )
  }

  const totalAccounts = groups.reduce(
    (sum, group) => sum + group.accounts.length,
    0,
  )
  if (totalAccounts === 0) return null

  return (
    <div className="saved-accounts">
      <div className="saved-accounts__head">
        <span className="saved-accounts__section">Recent</span>
        <button
          className="saved-accounts__link"
          type="button"
          onClick={() => setShowManageGroups(true)}
        >
          グループを管理
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {groups.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            activeAccountId={activeAccountId}
            onSelectAccount={onSelectAccount}
            onPreviewAccount={onPreviewAccount}
            onDeleteAccount={(accountId) =>
              onDeleteAccount(group.id, accountId)
            }
            onCycleStatus={(accountId) => onCycleStatus(group.id, accountId)}
          />
        ))}
      </DragDropContext>

      {showManageGroups && (
        <ManageGroupsModal
          groups={groups}
          onClose={() => setShowManageGroups(false)}
          onCreateGroup={onCreateGroup}
          onRenameGroup={onRenameGroup}
          onDeleteGroup={onDeleteGroup}
          onReorderGroups={onReorderGroups}
        />
      )}
    </div>
  )
}

function GroupSection({
  group,
  activeAccountId,
  onSelectAccount,
  onPreviewAccount,
  onDeleteAccount,
  onCycleStatus,
}) {
  return (
    <div className="saved-accounts__group">
      {group.id !== DEFAULT_GROUP_ID && (
        <div className="saved-accounts__group-head">
          <span className="saved-accounts__group-name">
            {group.name.trim() !== '' ? group.name : '無題のグループ'}
          </span>
        </div>
      )}

      <Droppable droppableId={group.id}>
        {(provided, snapshot) => (
          <div
            className={
              'saved-accounts__cards' +
              (snapshot.isDraggingOver ? ' saved-accounts__cards--over' : '')
            }
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {group.accounts.length === 0 && (
              <div className="saved-accounts__card saved-accounts__card--empty">
                {group.id === DEFAULT_GROUP_ID
                  ? '生成したアカウントがここに表示されます'
                  : 'RECENTまたは他のグループからドラッグ＆ドロップしてください'}
              </div>
            )}
            {group.accounts.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
                isActive={account.id === activeAccountId}
                onSelect={() => onSelectAccount(account.id)}
                onPreview={() => onPreviewAccount(account.id)}
                onDelete={() => onDeleteAccount(account.id)}
                onCycleStatus={() => onCycleStatus(account.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function AccountCard({
  account,
  index,
  isActive,
  onSelect,
  onPreview,
  onDelete,
  onCycleStatus,
}) {
  const status = accountStatus(account.snapshot)
  return (
    <Draggable draggableId={account.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={
            'saved-accounts__card' +
            (isActive ? ' saved-accounts__card--active' : '') +
            (snapshot.isDragging ? ' saved-accounts__card--dragging' : '')
          }
          ref={provided.innerRef}
          {...provided.draggableProps}
          role="button"
          tabIndex={0}
          onClick={onPreview}
          onKeyDown={(e) => {
            // Only direct card keypresses open the preview; nested controls own theirs.
            if (e.target !== e.currentTarget) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onPreview()
            }
          }}
        >
          <span
            className="saved-accounts__handle"
            {...provided.dragHandleProps}
            title="ドラッグして移動"
          >
            <GripIcon />
          </span>
          <span
            className={
              'saved-accounts__tag saved-accounts__tag--' +
              account.snapshot.serverType
            }
          >
            {serverTypeTag(account.snapshot.serverType)}
          </span>
          <span className="saved-accounts__info">
            <span className="saved-accounts__label">{account.label}</span>
            {account.snapshot.caseName && (
              <span className="saved-accounts__case">
                {account.snapshot.caseName}
              </span>
            )}
          </span>
          <span className="saved-accounts__actions">
            <button
              type="button"
              className={
                'saved-accounts__status saved-accounts__status--' + status
              }
              onClick={(e) => {
                e.stopPropagation()
                onCycleStatus()
              }}
              aria-label={statusLabel(status) + '（クリックで変更）'}
            >
              <span className="saved-accounts__status-dot" />
            </button>
            <button
              type="button"
              className="saved-accounts__rename"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              aria-label="編集"
            >
              <PencilIcon size={14} />
            </button>
            <button
              type="button"
              className="saved-accounts__remove"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              aria-label="削除"
            >
              <TrashIcon size={14} />
            </button>
          </span>
        </div>
      )}
    </Draggable>
  )
}
