import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage';
import axiosInstance from '../../../services/api/axiosInstance.js';
import NotificationBell from '../../../common/components/NotificationBell.jsx';

const unwrap = (response) => response?.data?.data ?? response?.data;

/** Real notifications for the signed-in Manager. No sample alerts. */
export default function PMNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = unwrap(await axiosInstance.get('/v1/bell-notifications?limit=100')) || {};
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try {
      await axiosInstance.post('/v1/bell-notifications/read-all');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark notifications as read.');
    }
  };

  return (
    <AdminPage
      title="Notifications"
      subtitle="Project assignments, task reviews, expenses, and delivery updates"
      loading={loading}
      error={error}
      onRetry={load}
      actions={<button className="btn btn-outline-primary btn-sm" onClick={markAllRead}>Mark all as read</button>}
    >
      <NotificationBell />
      <div className="card border-0 shadow-sm rounded-3 mt-3">
        <div className="list-group list-group-flush">
          {notifications.map((notification) => (
            <div key={notification.id} className={`list-group-item p-3 border-0 border-bottom ${!notification.is_read ? 'bg-primary bg-opacity-10' : ''}`}>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <h6 className={`mb-1 ${!notification.is_read ? 'fw-bold text-dark' : 'fw-medium'}`}>{notification.title}</h6>
                <small className="text-muted">{notification.created_at ? new Date(notification.created_at).toLocaleString('en-IN') : ''}</small>
              </div>
              <p className="mb-1 text-muted small">{notification.message || notification.body}</p>
              <div className="small text-secondary">
                {notification.sender_name ? `From ${notification.sender_name} · ` : ''}
                {notification.project_code || notification.task_description || ''}
              </div>
              {notification.action_url && <a className="small" href={notification.action_url}>Open</a>}
            </div>
          ))}
          {!notifications.length && !loading && <div className="p-3 text-secondary">No notifications have been sent to you.</div>}
        </div>
      </div>
    </AdminPage>
  );
}
