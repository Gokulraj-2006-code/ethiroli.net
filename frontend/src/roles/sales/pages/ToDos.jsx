import React from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import TodoBoard from '../../../common/components/TodoBoard/TodoBoard.jsx';

/**
 * Sales To-Dos mounts the same real /v1/todos workspace the other portals use.
 * Authentication scope comes from the current /app/sales path, so no duplicate
 * To-Do state or mock lists live in this panel.
 */
export default function ToDos() {
  return (
    <AdminPage
      title="To-Dos"
      subtitle="Your personal and shared task lists, backed by the live To-Do service."
    >
      <div className="card border-0 shadow-sm p-3">
        <TodoBoard title="Sales To-Dos" />
      </div>
    </AdminPage>
  );
}
