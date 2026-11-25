import React from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import TodoBoard from '../../../common/components/TodoBoard/TodoBoard.jsx';

export default function Todos() {
  return (
    <AdminPage title="To-Dos" subtitle="Company task lists, assigned items and personal reminders.">
      <TodoBoard title="To-Dos" />
    </AdminPage>
  );
}
