import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Modal from './Modal.jsx'
import './ManageGroupsModal.css'
import { LockIcon, GripIcon, CloseIcon } from '../lib/icons.jsx'
import { DEFAULT_GROUP_ID, DEFAULT_GROUP_NAME } from '../lib/accounts.js'

export default function ManageGroupsModal({
  groups,
  onClose,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onReorderGroups,
}) {
  const [newName, setNewName] = useState('')

  const saveNewGroup = () => {
    const name = newName.trim()
    if (name === '') return
    onCreateGroup(name)
    setNewName('')
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorderGroups(result.source.index, result.destination.index)
  }

  return (
    <Modal
      title="グループを管理"
      subtitle="新規アカウントは「Recent」に保存されます。ドラッグでグループの並び替え・移動ができます。"
      onClose={onClose}
      panelClassName="modal__panel--fill"
      bodyClassName="modal__body--fill"
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="groups">
          {(provided) => (
            <div
              className="manage-groups-modal__list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {groups.map((group, index) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  index={index}
                  onRenameGroup={onRenameGroup}
                  onDeleteGroup={onDeleteGroup}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="manage-groups-modal__new">
        <input
          className="manage-groups-modal__new-input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()}
          placeholder="新しいグループ名"
        />
        <button
          className="manage-groups-modal__new-save"
          type="button"
          onClick={saveNewGroup}
          disabled={newName.trim() === ''}
        >
          保存
        </button>
      </div>
    </Modal>
  )
}

function GroupRow({ group, index, onRenameGroup, onDeleteGroup }) {
  const isDefault = group.id === DEFAULT_GROUP_ID
  const count = (group.accounts?.length ?? 0) + ' 件'
  const empty = (group.accounts?.length ?? 0) === 0

  return (
    <Draggable draggableId={group.id} index={index} isDragDisabled={isDefault}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className={
            'manage-groups-modal__row' +
            (isDefault ? ' manage-groups-modal__row--fixed' : '') +
            (dragSnapshot.isDragging
              ? ' manage-groups-modal__row--dragging'
              : '')
          }
        >
          {isDefault ? (
            <span
              className="manage-groups-modal__lock"
              title="常に最上部（既定グループ）"
              aria-label="固定グループ"
            >
              <LockIcon size={14} />
            </span>
          ) : (
            <span
              className="manage-groups-modal__handle"
              {...dragProvided.dragHandleProps}
              title="ドラッグして並び替え"
            >
              <GripIcon />
            </span>
          )}

          {isDefault ? (
            <span className="manage-groups-modal__name manage-groups-modal__name--fixed">
              {DEFAULT_GROUP_NAME}
            </span>
          ) : (
            <input
              className="manage-groups-modal__name"
              value={group.name}
              onChange={(e) => onRenameGroup(group.id, e.target.value)}
            />
          )}

          <span
            className={
              'manage-groups-modal__count' +
              (empty ? ' manage-groups-modal__count--empty' : '')
            }
          >
            {count}
          </span>

          {isDefault ? (
            <span
              className="manage-groups-modal__remove manage-groups-modal__remove--hidden"
              aria-hidden="true"
            >
              <CloseIcon />
            </span>
          ) : (
            <button
              type="button"
              className="manage-groups-modal__remove"
              onClick={() => onDeleteGroup(group.id)}
              aria-label="グループを削除"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      )}
    </Draggable>
  )
}
