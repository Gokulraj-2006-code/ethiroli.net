import React from 'react';
import TodoBoard from '../../../common/components/TodoBoard/TodoBoard.jsx';

/** Manager To-Do workspace (personal lists plus lists shared by other roles). */
export default function ManagerTodos() {
  return (
    <div className="emp-portal">
      <TodoBoard title="Manager To-Dos" />
    </div>
  );
}
