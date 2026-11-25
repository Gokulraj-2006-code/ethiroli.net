import React, { useState, useEffect, useCallback } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import { useAuth } from '../../../common/hooks/useAuth.js';

export default function Messages() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/v1/bell-notifications');
      const data = res?.data?.data ?? res?.data;
      setNotifications(data?.notifications || []);
      setUnread(data?.unread_count || 0);
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await axiosInstance.patch(`/v1/bell-notifications/${id}/read`);
      load();
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.post('/v1/bell-notifications/read-all');
      load();
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  return (
    <AdminPage title="Messages" subtitle="Your messages and notifications">
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <div>
            <h5 className="fw-bold mb-0">Messages</h5>
            <p className="text-muted small mb-0">Notifications and direct messages</p>
          </div>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={markAllRead}
            disabled={unread === 0 || loading}
          >
            {unread > 0 ? `Mark all ${unread} as read` : 'All read'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" role="status" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 mb-3 opacity-25"></i>
            <p className="mb-0">No messages yet.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item list-group-item-action border-0 p-3 ${n.is_read ? '' : 'bg-light fw-semibold'}`}
                onClick={() => markRead(n.id)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="fw-bold">{n.title || 'New Message'}</div>
                    <div className="text-muted small">{n.message}</div>
                  </div>
                  <div className="text-end ms-3">
                    <small className="text-muted d-block">
                      {new Date(n.created_at).toLocaleDateString()}
                    </small>
                    {!n.is_read && (
                      <span className="badge bg-primary">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
}
