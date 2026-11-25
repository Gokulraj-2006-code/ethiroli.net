import React, { useCallback, useEffect, useMemo, useState } from 'react';
import todoApi from '../../../services/api/todoApi.js';
import ListRail from './ListRail.jsx';
import TaskList from './TaskList.jsx';
import TaskDetailPanel from './TaskDetailPanel.jsx';
import { asArray, errorMessage, normalizePeople } from './formatters.js';
import './TodoBoard.css';

/**
 * Reusable To-Do workspace backed by /api/v1/todos. Authentication scope is
 * derived by axiosInstance from the current browser path, so the same mount
 * works in Super Admin, Manager, Sales and Employee portals.
 */
const TodoBoard = ({ compact = false, title = 'To-Dos' }) => {
  const [lists, setLists] = useState([]);
  const [summary, setSummary] = useState(null);
  const [listsLoading, setListsLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState(null);
  const [listDetail, setListDetail] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sort, setSort] = useState('manual');

  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const itemParams = useMemo(() => {
    const params = { sort: sort || 'manual' };
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (priorityFilter !== 'ALL') params.priority = priorityFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  }, [debouncedSearch, priorityFilter, sort, statusFilter]);

  const loadLists = useCallback(async (silent = false) => {
    if (!silent) setListsLoading(true);
    try {
      const [listRows, summaryData] = await Promise.all([
        todoApi.getLists(),
        todoApi.getSummary().catch(() => null),
      ]);
      setLists(asArray(listRows));
      setSummary(summaryData || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      if (!silent) setListsLoading(false);
    }
  }, []);

  const loadPeople = useCallback(async () => {
    setPeopleLoading(true);
    try {
      const rows = await todoApi.getAssignablePeople();
      setPeople(normalizePeople(rows));
    } catch {
      // No user-directory endpoint is available for this role: hide pickers.
      setPeople([]);
    } finally {
      setPeopleLoading(false);
    }
  }, []);

  const fetchBoardData = useCallback(async (silent = false) => {
    if (!selectedListId) {
      setListDetail(null);
      setItems([]);
      return;
    }
    if (!silent) setItemsLoading(true);
    try {
      const [detail, itemRows] = await Promise.all([
        todoApi.getList(selectedListId),
        todoApi.getItems(selectedListId, itemParams),
      ]);
      setListDetail(detail || null);
      setItems(asArray(itemRows));
    } catch (requestError) {
      setError(errorMessage(requestError));
      if (!silent) {
        setListDetail(null);
        setItems([]);
      }
    } finally {
      if (!silent) setItemsLoading(false);
    }
  }, [itemParams, selectedListId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  useEffect(() => {
    if (!listsLoading && lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, listsLoading, selectedListId]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;
  const showPanel = detailOpen && Boolean(selectedItem || listDetail);

  useEffect(() => {
    if (selectedItemId && !itemsLoading && !items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(null);
      setDetailOpen(false);
    }
  }, [items, itemsLoading, selectedItemId]);

  /**
   * All mutations share one error/loading path. `after` runs before the silent
   * refresh and may return false to skip it (used after deleting the open list).
   */
  const performAction = useCallback(async (request, after) => {
    setBusy(true);
    setError(null);
    try {
      const data = await request();
      const shouldRefresh = after ? after(data) !== false : true;
      if (shouldRefresh) {
        await Promise.all([loadLists(true), fetchBoardData(true)]);
      }
      return { ok: true, data };
    } catch (requestError) {
      setError(errorMessage(requestError));
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }, [fetchBoardData, loadLists]);

  const handleSelectList = (id) => {
    setSelectedListId(id);
    setSelectedItemId(null);
    setDetailOpen(false);
  };

  const handleCreateList = (name) => performAction(
    () => todoApi.createList({ name, visibility: 'PERSONAL' }),
    (result) => {
      if (result?.id) {
        setSelectedListId(result.id);
        setSelectedItemId(null);
        setDetailOpen(false);
      }
      return false;
    },
  ).then(async (result) => {
    if (result.ok) await loadLists(true);
    return result;
  });

  const handleDeleteList = (id) => {
    if (id !== selectedListId) return;
    if (!window.confirm('Delete this list and all of its tasks?')) return;
    return performAction(
      () => todoApi.deleteList(id),
      () => {
        const remaining = lists.filter((list) => list.id !== id);
        setSelectedListId(remaining[0]?.id || null);
        setSelectedItemId(null);
        setDetailOpen(false);
        return false;
      },
    ).then(async (result) => {
      if (result.ok) await loadLists(true);
      return result;
    });
  };

  const handleCreateItem = ({ title, priority }) => performAction(
    () => todoApi.createItem(selectedListId, { title, priority }),
  );

  const handleToggleItemStatus = (item) => performAction(() => todoApi.updateItem(item.id, {
    status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
  }));

  const handleDeleteItem = (id) => {
    if (!window.confirm('Delete this task?')) return;
    return performAction(
      () => todoApi.deleteItem(id),
      () => {
        setSelectedItemId(null);
        setDetailOpen(false);
      },
    );
  };

  const openListSettings = () => {
    setSelectedItemId(null);
    setDetailOpen(true);
  };

  return (
    <div className={`todo-board ${compact ? 'todo-board--compact' : ''} ${showPanel ? '' : 'todo-board--no-panel'}`}>
      <div className="todo-board__titlebar">
        <div>
          <span className="todo-board__eyebrow">Microsoft To-Do style</span>
          <h2>{title}</h2>
        </div>
        {listDetail && (
          <button type="button" className="todo-btn todo-btn--ghost" onClick={openListSettings} disabled={busy}>
            List settings
          </button>
        )}
      </div>

      <ListRail
        lists={lists}
        selectedListId={selectedListId}
        onSelect={handleSelectList}
        onCreate={handleCreateList}
        loading={listsLoading}
        busy={busy}
      />

      <TaskList
        list={listDetail}
        items={items}
        loading={itemsLoading}
        busy={busy || !selectedListId}
        summary={summary}
        error={error}
        onDismissError={() => setError(null)}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        sort={sort}
        onSort={setSort}
        onCreate={handleCreateItem}
        onSelect={(id) => {
          setSelectedItemId(id);
          setDetailOpen(true);
        }}
        onToggleStatus={handleToggleItemStatus}
        selectedItemId={selectedItemId}
        people={people}
        members={asArray(listDetail?.members)}
      />

      {showPanel && (
        <TaskDetailPanel
          item={selectedItem}
          list={listDetail}
          members={asArray(listDetail?.members)}
          people={people}
          peopleEnabled={!peopleLoading && people.length > 0}
          busy={busy}
          onAction={performAction}
          onClose={() => setDetailOpen(false)}
          onDeleteItem={handleDeleteItem}
          onDeleteList={handleDeleteList}
        />
      )}
    </div>
  );
};

export { todoApi };
export default TodoBoard;
