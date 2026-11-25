import React, { useState } from 'react';

const ListRail = ({ lists, selectedListId, onSelect, onCreate, loading, busy }) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    const result = await onCreate(trimmed);
    if (result?.ok) {
      setName('');
      setCreating(false);
    }
  };

  return (
    <aside className="todo-board__rail" aria-label="To-Do lists">
      <div className="todo-board__rail-head">
        <div>
          <span className="todo-board__eyebrow">Workspace</span>
          <h3>Lists</h3>
        </div>
        <button
          type="button"
          className="todo-icon-btn"
          onClick={() => setCreating((value) => !value)}
          aria-label={creating ? 'Cancel new list' : 'Create new list'}
          title={creating ? 'Cancel' : 'New list'}
        >
          {creating ? '×' : '+'}
        </button>
      </div>

      {creating && (
        <form className="todo-board__create-list" onSubmit={submit}>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="List name"
            aria-label="New list name"
            maxLength={120}
            autoFocus
            disabled={busy}
          />
          <button type="submit" className="todo-btn todo-btn--primary" disabled={busy || !name.trim()}>
            Add
          </button>
        </form>
      )}

      {loading ? (
        <div className="todo-board__rail-loading" aria-hidden="true">
          <span /><span /><span />
        </div>
      ) : lists.length === 0 ? (
        <p className="todo-board__empty-note">No lists yet. Create one to start organizing tasks.</p>
      ) : (
        <ul className="todo-board__lists">
          {lists.map((list) => {
            const total = Number(list.item_count || 0);
            const done = Number(list.completed_count || 0);
            const active = list.id === selectedListId;
            return (
              <li key={list.id}>
                <button
                  type="button"
                  className={`todo-list-link ${active ? 'is-active' : ''}`}
                  onClick={() => onSelect(list.id)}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className="todo-list-link__dot" style={{ backgroundColor: list.color || 'var(--base-teal, #1A4B48)' }} />
                  <span className="todo-list-link__body">
                    <span className="todo-list-link__name">{list.name}</span>
                    <span className="todo-list-link__meta">
                      {done}/{total} done
                      {list.visibility === 'SHARED' ? ' · Shared' : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default ListRail;
