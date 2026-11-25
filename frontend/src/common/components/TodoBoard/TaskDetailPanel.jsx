import React, { useEffect, useState } from 'react';
import todoApi from '../../../services/api/todoApi.js';
import {
  asArray,
  formatDateTime,
  normalizeColor,
  personName,
  safeUrl,
  toDateInput,
  toIso,
} from './formatters.js';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const InlineInput = ({ value, onSave, disabled, ariaLabel, className = '' }) => {
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);

  return (
    <input
      type="text"
      className={className}
      value={draft}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onSave(draft)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraft(value || '');
          event.currentTarget.blur();
        }
      }}
    />
  );
};

const Section = ({ title, count, children }) => (
  <section className="todo-board__detail-section">
    <h4>
      {title}
      {typeof count === 'number' && <span className="todo-board__count">{count}</span>}
    </h4>
    {children}
  </section>
);

const TaskDetailPanel = ({
  item,
  list,
  members,
  people,
  peopleEnabled,
  busy,
  onAction,
  onClose,
  onDeleteItem,
  onDeleteList,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [reminderUserId, setReminderUserId] = useState('');

  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [listVisibility, setListVisibility] = useState('PERSONAL');
  const [listColor, setListColor] = useState(normalizeColor());
  const [shareSelection, setShareSelection] = useState([]);
  const [sharePermission, setSharePermission] = useState('VIEW');

  useEffect(() => {
    setTitle(item?.title || '');
    setDescription(item?.description || '');
    setPriority(item?.priority || 'MEDIUM');
    setDueDate(toDateInput(item?.due_date));
    setAssigneeId(item?.assigned_to || '');
    setSubtaskTitle('');
    setCommentBody('');
    setAttachmentName('');
    setAttachmentUrl('');
    setReminderAt('');
    setReminderUserId('');
  }, [item?.id, item?.updated_at]);

  useEffect(() => {
    setListName(list?.name || '');
    setListDescription(list?.description || '');
    setListVisibility(list?.visibility || 'PERSONAL');
    setListColor(normalizeColor(list?.color));
    setShareSelection([]);
  }, [list?.id, list?.name, list?.description, list?.visibility, list?.color]);

  const canEdit = Boolean(list) && list?.permission !== 'VIEW' && !busy;

  const patchItem = (patch) => onAction(() => todoApi.updateItem(item.id, patch));

  const saveTitle = () => {
    const next = title.trim();
    if (!next || next === item.title) {
      setTitle(item.title || '');
      return;
    }
    patchItem({ title: next });
  };

  const saveDescription = () => {
    if ((description || '') === (item.description || '')) return;
    patchItem({ description: description.trim() || null });
  };

  const toggleStatus = () => patchItem({ status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' });

  const addSubtask = async (event) => {
    event.preventDefault();
    const next = subtaskTitle.trim();
    if (!next || !canEdit) return;
    const result = await onAction(() => todoApi.createSubtask(item.id, { title: next }));
    if (result?.ok) setSubtaskTitle('');
  };

  const addComment = async (event) => {
    event.preventDefault();
    const next = commentBody.trim();
    if (!next || !canEdit) return;
    const result = await onAction(() => todoApi.createComment(item.id, { body: next }));
    if (result?.ok) setCommentBody('');
  };

  const addAttachment = async (event) => {
    event.preventDefault();
    if (!attachmentName.trim() || !attachmentUrl.trim() || !canEdit) return;
    const result = await onAction(() => todoApi.createAttachment(item.id, {
      file_name: attachmentName.trim(),
      file_url: attachmentUrl.trim(),
    }));
    if (result?.ok) {
      setAttachmentName('');
      setAttachmentUrl('');
    }
  };

  const addReminder = async (event) => {
    event.preventDefault();
    const remindAt = toIso(reminderAt);
    if (!remindAt || !canEdit) return;
    const payload = { remind_at: remindAt };
    if (reminderUserId) payload.user_id = reminderUserId;
    const result = await onAction(() => todoApi.createReminder(item.id, payload));
    if (result?.ok) {
      setReminderAt('');
      setReminderUserId('');
    }
  };

  const saveList = async (event) => {
    event.preventDefault();
    if (!listName.trim() || !canEdit) return;
    await onAction(() => todoApi.updateList(list.id, {
      name: listName.trim(),
      description: listDescription.trim() || null,
      visibility: listVisibility,
      color: normalizeColor(listColor),
    }));
  };

  const toggleShareSelection = (id) => {
    setShareSelection((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const shareSelected = async () => {
    if (!shareSelection.length || !canEdit) return;
    const result = await onAction(async () => {
      if (list.visibility !== 'SHARED') {
        await todoApi.updateList(list.id, { visibility: 'SHARED' });
      }
      return todoApi.shareList(list.id, { user_ids: shareSelection, permission: sharePermission });
    });
    if (result?.ok) setShareSelection([]);
  };

  if (!item && !list) return null;

  if (item) {
    const subtasks = asArray(item.subtasks);
    const comments = asArray(item.comments);
    const attachments = asArray(item.attachments);
    const reminders = asArray(item.reminders);
    const done = item.status === 'COMPLETED';

    return (
      <aside className="todo-board__panel" aria-label="Task details">
        <div className="todo-board__panel-head">
          <span className="todo-board__eyebrow">Task details</span>
          <button type="button" className="todo-icon-btn" onClick={onClose} aria-label="Close task details" title="Close">×</button>
        </div>

        <div className="todo-board__panel-scroll">
          <div className="todo-board__detail-title">
            <button
              type="button"
              className={`todo-task__check ${done ? 'is-done' : ''}`}
              onClick={toggleStatus}
              disabled={!canEdit}
              aria-label={done ? 'Mark task as pending' : 'Mark task as completed'}
              aria-pressed={done}
            >
              {done ? '✓' : ''}
            </button>
            <InlineInput
              value={title}
              onSave={saveTitle}
              disabled={!canEdit}
              ariaLabel="Task title"
              className="todo-board__title-input"
            />
          </div>
          {list?.permission === 'VIEW' && <p className="todo-board__hint">You have view-only access to this list.</p>}

          <div className="todo-board__detail-grid">
            <label>
              <span>Priority</span>
              <select value={priority} onChange={(event) => patchItem({ priority: event.target.value })} disabled={!canEdit}>
                {PRIORITIES.map((value) => <option key={value} value={value}>{value[0]}{value.slice(1).toLowerCase()}</option>)}
              </select>
            </label>
            <label>
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => {
                  const next = event.target.value;
                  setDueDate(next);
                  patchItem({ due_date: next || null });
                }}
                disabled={!canEdit}
              />
            </label>
            {peopleEnabled && (
              <label>
                <span>Assigned to</span>
                <select
                  value={assigneeId}
                  onChange={(event) => {
                    const next = event.target.value;
                    setAssigneeId(next);
                    patchItem({ assigned_to: next || null });
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Unassigned</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
              </label>
            )}
            {assigneeId && !peopleEnabled && (
              <p className="todo-board__detail-assignee">
                Assigned to: {personName(assigneeId, people, members) || assigneeId}
              </p>
            )}
          </div>

          <Section title="Description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={saveDescription}
              placeholder="Add a description"
              aria-label="Task description"
              rows={3}
              disabled={!canEdit}
            />
          </Section>

          <Section title="Steps" count={subtasks.length}>
            {subtasks.length === 0 && <p className="todo-board__hint">No steps yet.</p>}
            <ul className="todo-board__subtasks">
              {subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <input
                    type="checkbox"
                    checked={Boolean(subtask.is_done)}
                    onChange={() => onAction(() => todoApi.updateSubtask(subtask.id, { is_done: !subtask.is_done }))}
                    disabled={!canEdit}
                    aria-label={`Complete step ${subtask.title}`}
                  />
                  <InlineInput
                    value={subtask.title}
                    onSave={(next) => {
                      if (next.trim() && next.trim() !== subtask.title) {
                        onAction(() => todoApi.updateSubtask(subtask.id, { title: next.trim() }));
                      }
                    }}
                    disabled={!canEdit}
                    ariaLabel={`Edit step ${subtask.title}`}
                    className={`todo-board__inline-input ${subtask.is_done ? 'is-done' : ''}`}
                  />
                  <button
                    type="button"
                    className="todo-icon-btn"
                    onClick={() => onAction(() => todoApi.deleteSubtask(subtask.id))}
                    disabled={!canEdit}
                    aria-label={`Delete step ${subtask.title}`}
                    title="Delete step"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {canEdit && (
              <form className="todo-board__inline-form" onSubmit={addSubtask}>
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(event) => setSubtaskTitle(event.target.value)}
                  placeholder="Add a step"
                  aria-label="New step title"
                  disabled={busy}
                />
                <button type="submit" className="todo-btn todo-btn--ghost" disabled={!subtaskTitle.trim() || busy}>Add</button>
              </form>
            )}
          </Section>

          <Section title="Comments" count={comments.length}>
            {comments.length === 0 && <p className="todo-board__hint">No comments yet.</p>}
            <ul className="todo-board__comments">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <div className="todo-board__comment-head">
                    <strong>{comment.author_name || 'Team member'}</strong>
                    <span>{formatDateTime(comment.created_at)}</span>
                    <button
                      type="button"
                      className="todo-icon-btn"
                      onClick={() => onAction(() => todoApi.deleteComment(comment.id))}
                      disabled={!canEdit}
                      aria-label="Delete comment"
                      title="Delete comment"
                    >
                      ×
                    </button>
                  </div>
                  <p>{comment.body}</p>
                </li>
              ))}
            </ul>
            {canEdit && (
              <form className="todo-board__inline-form" onSubmit={addComment}>
                <textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Write a comment"
                  aria-label="New comment"
                  rows={2}
                  disabled={busy}
                />
                <button type="submit" className="todo-btn todo-btn--ghost" disabled={!commentBody.trim() || busy}>Comment</button>
              </form>
            )}
          </Section>

          <Section title="Attachments" count={attachments.length}>
            <p className="todo-board__hint">Link an existing file by name and URL. Files are not uploaded here.</p>
            {attachments.length === 0 && <p className="todo-board__hint">No files linked yet.</p>}
            <ul className="todo-board__attachments">
              {attachments.map((attachment) => {
                const href = safeUrl(attachment.file_url);
                return (
                  <li key={attachment.id}>
                    {href
                      ? <a href={href} target="_blank" rel="noopener noreferrer">{attachment.file_name}</a>
                      : <span title={attachment.file_url}>{attachment.file_name}</span>}
                    <button
                      type="button"
                      className="todo-icon-btn"
                      onClick={() => onAction(() => todoApi.deleteAttachment(attachment.id))}
                      disabled={!canEdit}
                      aria-label={`Remove ${attachment.file_name}`}
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
            {canEdit && (
              <form className="todo-board__inline-form" onSubmit={addAttachment}>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(event) => setAttachmentName(event.target.value)}
                  placeholder="File name"
                  aria-label="Attachment file name"
                  disabled={busy}
                />
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(event) => setAttachmentUrl(event.target.value)}
                  placeholder="https://..."
                  aria-label="Attachment URL"
                  disabled={busy}
                />
                <button
                  type="submit"
                  className="todo-btn todo-btn--ghost"
                  disabled={!attachmentName.trim() || !attachmentUrl.trim() || busy}
                >
                  Link file
                </button>
              </form>
            )}
          </Section>

          <Section title="Reminders" count={reminders.length}>
            {reminders.length === 0 && <p className="todo-board__hint">No reminders set.</p>}
            <ul className="todo-board__reminders">
              {reminders.map((reminder) => {
                const target = personName(reminder.user_id, people, members);
                return (
                  <li key={reminder.id}>
                    <span>{formatDateTime(reminder.remind_at)}{target ? ` · ${target}` : ''}</span>
                    <button
                      type="button"
                      className="todo-icon-btn"
                      onClick={() => onAction(() => todoApi.deleteReminder(reminder.id))}
                      disabled={!canEdit}
                      aria-label="Delete reminder"
                      title="Delete reminder"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
            {canEdit && (
              <form className="todo-board__inline-form" onSubmit={addReminder}>
                <input
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(event) => setReminderAt(event.target.value)}
                  aria-label="Reminder date and time"
                  disabled={busy}
                />
                {peopleEnabled && (
                  <select
                    value={reminderUserId}
                    onChange={(event) => setReminderUserId(event.target.value)}
                    aria-label="Remind user (optional)"
                    disabled={busy}
                  >
                    <option value="">Default recipient</option>
                    {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                  </select>
                )}
                <button type="submit" className="todo-btn todo-btn--ghost" disabled={!reminderAt || busy}>Remind</button>
              </form>
            )}
          </Section>

          <div className="todo-board__danger">
            <button type="button" className="todo-btn todo-btn--danger" onClick={() => onDeleteItem(item.id)} disabled={!canEdit}>
              Delete task
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="todo-board__panel" aria-label="List settings">
      <div className="todo-board__panel-head">
        <span className="todo-board__eyebrow">List settings</span>
        <button type="button" className="todo-icon-btn" onClick={onClose} aria-label="Close list settings" title="Close">×</button>
      </div>

      <div className="todo-board__panel-scroll">
        {list?.permission === 'VIEW' && <p className="todo-board__hint">You have view-only access to this list.</p>}
        <form className="todo-board__settings-form" onSubmit={saveList}>
          <label>
            <span>Name</span>
            <input type="text" value={listName} onChange={(event) => setListName(event.target.value)} disabled={!canEdit} maxLength={120} />
          </label>
          <label>
            <span>Description</span>
            <textarea value={listDescription} onChange={(event) => setListDescription(event.target.value)} rows={3} disabled={!canEdit} />
          </label>
          <div className="todo-board__settings-row">
            <label>
              <span>Visibility</span>
              <select value={listVisibility} onChange={(event) => setListVisibility(event.target.value)} disabled={!canEdit}>
                <option value="PERSONAL">Personal</option>
                <option value="SHARED">Shared</option>
              </select>
            </label>
            <label>
              <span>Colour</span>
              <input type="color" value={normalizeColor(listColor)} onChange={(event) => setListColor(event.target.value)} disabled={!canEdit} />
            </label>
          </div>
          <button type="submit" className="todo-btn todo-btn--primary" disabled={!canEdit || !listName.trim()}>Save list</button>
        </form>

        <Section title="Sharing" count={asArray(members).length}>
          {list?.visibility !== 'SHARED' && (
            <p className="todo-board__hint">Sharing will switch this list to Shared automatically.</p>
          )}
          {!peopleEnabled && <p className="todo-board__hint">A people picker is not available for this account.</p>}
          {peopleEnabled && canEdit && (
            <>
              <div className="todo-board__people">
                {people.map((person) => (
                  <label key={person.id} className="todo-board__person">
                    <input
                      type="checkbox"
                      checked={shareSelection.includes(person.id)}
                      onChange={() => toggleShareSelection(person.id)}
                    />
                    <span>
                      {person.name}
                      {person.email && <small>{person.email}</small>}
                    </span>
                  </label>
                ))}
              </div>
              <div className="todo-board__inline-form">
                <select
                  value={sharePermission}
                  onChange={(event) => setSharePermission(event.target.value)}
                  aria-label="Share permission"
                >
                  <option value="VIEW">Can view</option>
                  <option value="EDIT">Can edit</option>
                </select>
                <button
                  type="button"
                  className="todo-btn todo-btn--ghost"
                  onClick={shareSelected}
                  disabled={!shareSelection.length}
                >
                  Share
                </button>
              </div>
            </>
          )}
          {asArray(members).length === 0 ? (
            <p className="todo-board__hint">This list is not shared with anyone yet.</p>
          ) : (
            <ul className="todo-board__members">
              {members.map((member) => (
                <li key={member.id || member.user_id}>
                  <span>
                    {member.full_name || member.email || member.user_id}
                    <small>{member.permission}</small>
                  </span>
                  <button
                    type="button"
                    className="todo-icon-btn"
                    onClick={() => onAction(() => todoApi.removeMember(list.id, member.user_id))}
                    disabled={!canEdit}
                    aria-label={`Remove ${member.full_name || member.email || 'member'}`}
                    title="Remove member"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="todo-board__danger">
          <button type="button" className="todo-btn todo-btn--danger" onClick={() => onDeleteList(list.id)} disabled={!canEdit}>
            Delete list
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TaskDetailPanel;
