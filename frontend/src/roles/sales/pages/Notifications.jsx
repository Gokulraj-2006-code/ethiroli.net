import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import salesPortalApi, { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState, FormAlert, SalesModal } from '../components/SalesUi.jsx';
import { asArray, formatDateTime, labelize } from '../utils/salesFormat.js';

const categoryFor = (type) => {
  const key = String(type || '').toUpperCase();
  if (key.includes('PROJECT') || key.includes('DELIVERY')) return { label: 'Project', icon: 'bi-folder2-open' };
  if (key.includes('EXPENSE')) return { label: 'Expense', icon: 'bi-receipt' };
  if (key.includes('TASK')) return { label: 'Task', icon: 'bi-check2-square' };
  if (key.includes('APPROVAL')) return { label: 'Approval', icon: 'bi-patch-check' };
  return { label: labelize(type), icon: 'bi-bell' };
};

/** Backend action URLs may point at other panels; keep Sales users in Sales. */
const salesActionPath = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/app/sales/')) return null;
  return url;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesPortalApi.getNotifications({ limit: 100 });
      setNotifications(asArray(result?.notifications));
      setUnreadCount(Number(result?.unread_count) || 0);
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markOne = async (item) => {
    if (item.is_read) return;
    setFormError(null);
    try {
      await salesPortalApi.markNotificationRead(item.id);
      setNotifications((rows) => rows.map((row) => (
        row.id === item.id ? { ...row, is_read: 1, read_at: new Date().toISOString() } : row
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setFormError(salesErrorMessage(err));
      await load();
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    markOne(item);
  };

  const markAll = async () => {
    setBusy(true);
    setFormError(null);
    try {
      await salesPortalApi.markAllNotificationsRead();
      await load();
    } catch (err) {
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visible = useMemo(() => (
    filter === 'UNREAD' ? notifications.filter((item) => !item.is_read) : notifications
  ), [filter, notifications]);

  return (
    <AdminPage
      title="Notifications"
      subtitle="Delivery, expense and approval updates sent to you across the platform."
      loading={loading}
      error={error}
      onRetry={load}
      actions={
        <button type="button" className="btn btn-outline-primary" onClick={markAll} disabled={busy || unreadCount === 0}>
          <i className="bi bi-check2-all me-2" aria-hidden="true"></i>
          {busy ? 'Updating…' : 'Mark all as read'}
        </button>
      }
    >
      <FormAlert error={formError} />

      <div className="btn-group mb-3" role="group" aria-label="Notification filters">
        <button type="button" className={`btn btn-sm ${filter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setFilter('ALL')}>
          All ({notifications.length})
        </button>
        <button type="button" className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setFilter('UNREAD')}>
          Unread ({unreadCount})
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        {visible.length === 0 ? (
          <EmptyState
            icon="bi-bell-slash"
            title="No notifications"
            message={filter === 'UNREAD' ? 'You have no unread notifications.' : 'Notifications sent to you will appear here.'}
          />
        ) : (
          <div className="list-group list-group-flush">
            {visible.map((item) => {
              const category = categoryFor(item.type);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 ${item.is_read ? '' : 'bg-light'}`}
                  onClick={() => openDetail(item)}
                >
                  <span className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-light text-secondary" style={{ width: '42px', height: '42px', flexShrink: 0 }} aria-hidden="true">
                    <i className={`bi ${category.icon} fs-5`}></i>
                  </span>
                  <span className="flex-grow-1 text-start">
                    <span className="d-flex justify-content-between align-items-center gap-2 mb-1">
                      <strong className="text-dark">{item.title}</strong>
                      <small className="text-muted text-nowrap">{formatDateTime(item.created_at)}</small>
                    </span>
                    <span className="d-block text-secondary small">{item.message}</span>
                    <small className="text-muted">{category.label}{item.project_name ? ` · ${item.project_name}` : ''}</small>
                  </span>
                  {!item.is_read && <span className="badge bg-primary rounded-pill mt-1">Unread</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <SalesModal title={selected.title || 'Notification'} onClose={() => setSelected(null)}>
          <div className="modal-body">
            <p>{selected.message}</p>
            <div className="sales-fact-grid">
              <div>
                <span className="sales-fact-label">Type</span>
                <span className="sales-fact-value">{labelize(selected.type)}</span>
              </div>
              <div>
                <span className="sales-fact-label">Received</span>
                <span className="sales-fact-value">{formatDateTime(selected.created_at)}</span>
              </div>
              <div>
                <span className="sales-fact-label">Sender</span>
                <span className="sales-fact-value">{selected.sender_name || 'System'}</span>
              </div>
              <div>
                <span className="sales-fact-label">Project</span>
                <span className="sales-fact-value">{selected.project_name || '—'}</span>
              </div>
            </div>
            {salesActionPath(selected.action_url) && (
              <Link className="btn btn-sm btn-outline-primary mt-3" to={salesActionPath(selected.action_url)}>
                Open related project →
              </Link>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
        </SalesModal>
      )}
    </AdminPage>
  );
}
