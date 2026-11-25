import React, { useState } from 'react';
import { asArray, formatDate, personName } from './formatters.js';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const TaskList = ({
  list,
  items,
  loading,
  busy,
  summary,
  error,
  onDismissError,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  priorityFilter,
  onPriorityFilter,
  sort,
  onSort,
  onCreate,
  onSelect,
  onToggleStatus,
  selectedItemId,
  people,
  members,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    const result = await onCreate({ title: trimmed, priority });
    if (result?.ok) setTitle('');
  };

  return (
    <section className="todo-board__main" aria-label="Tasks">
      <header className="todo-board__main-head">
        <div>
          <span className="todo-board__eyebrow">List</span>
          <h2>{list?.name || 'No list selected'}</h2>
          {list?.description && <p className="todo-board__list-description">{list.description}</p>}
        </div>
        {summary && (
          <div className="todo-board__stats" aria-label="To-Do summary">
            <span><strong>{summary.pending ?? 0}</strong> open</span>
            <span><strong>{summary.completed ?? 0}</strong> done</span>
            <span className="todo-board__stats-overdue"><strong>{summary.overdue ?? 0}</strong> overdue</span>
          </div>
        )}
      </header>

      {error && (
        <div className="todo-board__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Dismiss error">×</button>
        </div>
      )}

      <div className="todo-board__toolbar">
        <label className="todo-board__search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
          />
        </label>
        <select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(event) => onPriorityFilter(event.target.value)} aria-label="Filter by priority">
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((value) => <option key={value} value={value}>{value[0] + value.slice(1).toLowerCase()}</option>)}
        </select>
        <select value={sort} onChange={(event) => onSort(event.target.value)} aria-label="Sort tasks">
          <option value="manual">Manual order</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
          <option value="created">Newest first</option>
        </select>
      </div>

      {list && (
        <form className="todo-board__add-task" onSubmit={submit}>
          <span className="todo-board__add-plus" aria-hidden="true">+</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            aria-label="New task title"
            maxLength={200}
            disabled={busy}
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-label="New task priority"
            disabled={busy}
          >
            {PRIORITIES.map((value) => <option key={value} value={value}>{value[0] + value.slice(1).toLowerCase()}</option>)}
          </select>
          <button type="submit" className="todo-btn todo-btn--primary" disabled={busy || !title.trim()}>Add</button>
        </form>
      )}

      {loading ? (
        <div className="todo-board__task-loading" aria-label="Loading tasks">
          <span /><span /><span /><span />
        </div>
      ) : !list ? (
        <div className="todo-board__empty">
          <h3>Select a list</h3>
          <p>Choose a list on the left, or create a new one to start adding tasks.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="todo-board__empty">
          <h3>Nothing here yet</h3>
          <p>{search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
            ? 'No tasks match the current filters.'
            : 'Add your first task to this list using the field above.'}</p>
        </div>
      ) : (
        <ul className="todo-board__tasks">
          {asArray(items).map((item) => {
            const done = item.status === 'COMPLETED';
            const subtasks = asArray(item.subtasks);
            const doneSubtasks = subtasks.filter((task) => task.is_done).length;
            const assignee = personName(item.assigned_to, people, members);
            return (
              <li
                key={item.id}
                className={`todo-task ${done ? 'is-done' : ''} ${item.id === selectedItemId ? 'is-selected' : ''}`}
              >
                <button
                  type="button"
                  className="todo-task__check"
                  onClick={() => onToggleStatus(item)}
                  aria-label={done ? `Mark ${item.title} as pending` : `Mark ${item.title} as completed`}
                  aria-pressed={done}
                  disabled={busy || list?.permission === 'VIEW'}
                >
                  {done ? '✓' : ''}
                </button>
                <button
                  type="button"
                  className="todo-task__open"
                  onClick={() => onSelect(item.id)}
                  aria-label={`Open details for ${item.title}`}
                >
                  <span className="todo-task__title">{item.title}</span>
                  <span className="todo-task__meta">
                    <span className={`todo-priority todo-priority--${String(item.priority || 'MEDIUM').toLowerCase()}`}>
                      {String(item.priority || 'MEDIUM')[0]}{String(item.priority || 'MEDIUM').slice(1).toLowerCase()}
                    </span>
                    {item.due_date && (
                      <span className={String(item.due_date).slice(0, 10) < new Date().toISOString().slice(0, 10) && !done ? 'is-overdue' : ''}>
                        Due {formatDate(item.due_date)}
                      </span>
                    )}
                    {subtasks.length > 0 && <span>{doneSubtasks}/{subtasks.length} steps</span>}
                    {asArray(item.comments).length > 0 && <span>{asArray(item.comments).length} comments</span>}
                    {asArray(item.attachments).length > 0 && <span>{asArray(item.attachments).length} files</span>}
                    {assignee && <span>{assignee}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default TaskList;
