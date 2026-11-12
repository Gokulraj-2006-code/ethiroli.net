import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isRoleAuthorized } from '../../utils/roleRouting';

const getLoginUrlForPath = (pathname) => {
  // Interns share the Employee portal, so their paths land on the employee login.
  if (pathname.includes('/intern')) return '/auth/employee/login';
  if (pathname.includes('/employee')) return '/auth/employee/login';
  if (pathname.includes('/hr')) return '/auth/hr/login';
  if (pathname.includes('/super-admin')) return '/auth/super-admin/login';
  // Unknown/dead paths: /auth/login is registered by every portal bundle, so it
  // can never bounce between two portals the way a portal-specific fallback would.
  return '/auth/login';
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-accent)' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 12px auto' }}></div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const loginUrl = getLoginUrlForPath(location.pathname);
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || user.tenantRole;
    const userRoles = [
      userRole,
      ...(Array.isArray(user.roles) ? user.roles : []),
      ...(Array.isArray(user.preferences?.roles) ? user.preferences.roles : [])
    ].filter(Boolean);

    const isAuth = userRoles.some(r => isRoleAuthorized(r, allowedRoles));
    if (!isAuth) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Support both a wrapped component and a React Router layout route.
  return children || <Outlet />;
};

export default PrivateRoute;
