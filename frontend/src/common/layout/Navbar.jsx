import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/roleRouting.js';
import { useAppDispatch } from '../../store/hooks.js';
import { toggleSidebar } from '../../store/slices/uiSlice.js';
import RoleAvatar from '../components/RoleAvatar/RoleAvatar.jsx';
import NotificationBell from '../components/NotificationBell.jsx';

export default function Navbar({ role, onSearchClick, onToggleFeed, unreadFeedCount = 0 }) {
  const { logout, user, activeRole } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = activeRole || role || user?.role;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const profileDisplayName = currentRole === ROLES.SUPER_ADMIN ? 'CEO' : (user?.full_name || 'Intern User');

  // Extract the actual portal slug from the current URL path (e.g. /app/manager/dashboard → manager)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const portalSlug = pathSegments.length >= 2 && pathSegments[0] === 'app' ? pathSegments[1] : null;

  const getRoleSlug = (r) => {
    switch (r) {
      case ROLES.SUPER_ADMIN: return 'super-admin';
      case ROLES.ADMIN: return 'admin';
      case ROLES.HR: return 'hr';
      case ROLES.TUTOR: return 'tutor';
      case ROLES.PROJECT_MANAGER: return 'pm';
      case ROLES.FINANCE: return 'finance';
      case ROLES.SALES: return 'sales';
      case ROLES.RECEPTION: return 'reception';
      case ROLES.EMPLOYEE: return 'employee';
      case ROLES.STUDENT: return 'student';
      case ROLES.INTERN: return 'intern';
      default: return 'admin';
    }
  };

  // Use the actual portal slug from the URL so navigation stays within the current portal
  const navSlug = portalSlug || getRoleSlug(currentRole);

  return (
    <header className="portalNavbar" role="banner">
      {currentRole === ROLES.INTERN ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="portalSidebarToggle d-md-none"
            onClick={() => dispatch(toggleSidebar())}
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <button
            type="button"
            className="portalSearchPill internSearchPill"
            onClick={onSearchClick || (() => navigate(`/app/${navSlug}/dashboard`))}
            title="Global Search"
            style={{ width: '260px', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-search" style={{ color: '#64748b', fontSize: '13px' }}></i>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Search...</span>
            </div>
            <kbd style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px' }}>Ctrl K</kbd>
          </button>
        </div>
      ) : (
        <div className="portalNavbarBrand">
          <button
            type="button"
            className="portalSidebarToggle"
            onClick={() => dispatch(toggleSidebar())}
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <img
            src="/assets/images/ethiroli_logo.png"
            alt="Ethiroli"
            style={{ width: '22px', height: '22px', objectFit: 'contain', marginRight: '6px' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />

          <span className="portalBrandTitle">
            ETHIROLI
          </span>

          <span className="portalRoleBadge">
            {String(currentRole || 'PORTAL').replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <div className="portalNavbarActions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {currentRole !== ROLES.INTERN && currentRole !== ROLES.SUPER_ADMIN && (
          <button
            type="button"
            className="portalSearchPill"
            onClick={onSearchClick || (() => navigate(`/app/${navSlug}/dashboard`))}
            title="Global Search"
          >
            <i className="bi bi-search"></i>
            <span className="d-none d-sm-inline">Search...</span>
            <kbd className="d-none d-md-inline">Ctrl K</kbd>
          </button>
        )}

        {/* Activity feed is not part of the CEO read-only monitoring surface. */}
        <button
          type="button"
          className="portalNotificationBtn"
          onClick={onToggleFeed || (() => navigate(`/app/${navSlug}/notifications`))}
          title="Notifications"
          aria-label="View notifications"
          style={currentRole === ROLES.INTERN ? { border: 'none', background: 'transparent', fontSize: '18px', color: '#1e293b', width: '32px', height: '32px' } : undefined}
        >
          <i className="bi bi-bell"></i>
          {unreadFeedCount > 0 && (
            <span className="portalNotificationBadge">
              {unreadFeedCount > 99 ? '99+' : unreadFeedCount}
            </span>
          )}
        </button>

          <div className="dropdown" style={{ position: 'relative' }}>
            <button
              type="button"
              className="portalUserPill btn p-0 border-0 d-flex align-items-center dropdown-toggle"
              id="userMenuButton"
              onClick={() => setUserMenuOpen(prev => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              style={{ background: 'transparent' }}
            >
              <RoleAvatar
                className="portalAvatar"
                style={currentRole === ROLES.INTERN ? { width: '36px', height: '36px', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '14px' } : undefined}
                src={user.avatar_url}
                role={currentRole}
                name={profileDisplayName}
                email={user.email}
                title={user.email}
              />
              <div className="d-none d-md-block text-start ms-2" style={{ lineHeight: '1.25' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {profileDisplayName}
                  {currentRole === ROLES.INTERN && (
                    <span className="badge rounded-pill text-bg-info ms-2">Intern</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {user.email}
                </div>
              </div>
            </button>
            {userMenuOpen && (
              <ul
                className="dropdown-menu dropdown-menu-end shadow-sm show"
                aria-labelledby="userMenuButton"
                style={{
                  minWidth: '220px',
                  display: 'block',
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  zIndex: 1050,
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border-subtle, rgba(0,0,0,0.1))'
                }}
              >
                <li className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                  <RoleAvatar
                    className="portalAvatar"
                    style={{ width: '32px', height: '32px', fontSize: '12px', flexShrink: 0 }}
                    src={user.avatar_url}
                    role={currentRole}
                    name={user.full_name}
                    email={user.email}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div className="fw-bold text-truncate" style={{ fontSize: '13px' }}>
                      {profileDisplayName || 'Portal User'}
                      {currentRole === ROLES.INTERN && <span className="badge rounded-pill text-bg-info ms-2">Intern</span>}
                    </div>
                    <small className="text-muted text-truncate d-block" style={{ fontSize: '11px' }}>{user.email}</small>
                  </div>
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 py-2"
                    onClick={() => { setUserMenuOpen(false); navigate(`/app/${navSlug}/profile`); }}
                  >
                    <i className="bi bi-person-circle"></i> My Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 py-2"
                    onClick={() => { setUserMenuOpen(false); navigate(`/app/${navSlug}/messages`); }}
                  >
                    <i className="bi bi-chat-dots"></i> Messages
                  </button>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
      </div>
    </header>
  );
}
