import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../services/api/axiosInstance.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/v1/bell-notifications');
      const data = res?.data?.data ?? res?.data;
      setNotifications(data?.notifications || []);
      setUnread(data?.unread_count || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await axiosInstance.patch(`/v1/bell-notifications/${id}/read`);
    load();
  };

  const markAll = async () => {
    await axiosInstance.post('/v1/bell-notifications/read-all');
    load();
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-link position-relative" onClick={() => setOpen(!open)} aria-label="Notifications">
        <i className="bi bi-bell"></i>
        {unread > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, minWidth: 320, maxHeight: 400, overflowY: 'auto', zIndex: 1050 }}>
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <strong>Notifications</strong>
            <button className="btn btn-sm btn-link" onClick={markAll}>Mark all read</button>
          </div>
          {notifications.length === 0 && <div className="px-3 py-2 text-muted small">No notifications</div>}
          {notifications.map((n) => (
            <div key={n.id} className={`px-3 py-2 border-bottom ${n.is_read ? '' : 'bg-light'}`} style={{ cursor: 'pointer' }} onClick={() => markRead(n.id)}>
              <div className="fw-semibold small">{n.title}</div>
              <div className="small text-muted">{n.message}</div>
              <div className="small text-secondary">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
