import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : (rawBase.endsWith('/') ? `${rawBase}api` : `${rawBase}/api`);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * A bare, unauthenticated client on the same base URL.
 *
 * The password-recovery endpoints are public by necessity - a locked-out
 * employee has no session - and they must be called from the sign-in screen
 * without triggering this module's 401 interceptor, which would clear local
 * storage and redirect. Sent without an Authorization header on purpose.
 */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Portal': 'employee',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const scope = portalScopeForPath(window.location.pathname);
    const scopedToken = scope ? localStorage.getItem(`portal:${scope}:auth_token`) : null;
    const token = scopedToken || (!scope ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function portalScopeForPath(pathname) {
  const segments = String(pathname || '').toLowerCase().split('/').filter(Boolean);
  const portalSegment = segments[0] === 'auth' ? segments[1] : (segments[0] === 'app' ? segments[1] : null);
  if (portalSegment === 'pm' || portalSegment === 'project-manager') return 'manager';
  return ['super-admin', 'manager', 'hr', 'employee'].includes(portalSegment) ? portalSegment : null;
}

/**
 * Portal login screens, mirroring PrivateRoute.getLoginUrlForPath.
 *
 * A 401 has to send the user to the login page of the portal they are actually
 * using. Redirecting to the generic /auth/login looked harmless, but this app
 * is multi-page: /auth/login is owned by the public site (index.html), and every
 * other portal resolves it to admin.html. So an employee hitting a 401 was
 * dropped into the Admin portal, whose own login route then 401'd again and
 * re-ran this redirect - an endless reload loop with the error never shown.
 */
const PORTAL_LOGINS = [
  ['super-admin', '/auth/super-admin/login'],
  ['manager', '/auth/manager/login'],
  ['student', '/auth/student/login'],
  ['intern', '/auth/intern/login'],
  ['tutor', '/auth/tutor/login'],
  ['pm', '/auth/manager/login'],
  ['project-manager', '/auth/manager/login'],
  ['finance', '/auth/finance/login'],
  ['sales', '/auth/sales/login'],
  ['reception', '/auth/reception/login'],
  ['employee', '/auth/employee/login'],
  ['hr', '/auth/hr/login'],
  ['admin', '/auth/admin/login'],
];

// Paths with no recognisable role segment keep the previous target so the
// public site (index.html), which really does own /auth/login, is unchanged.
export const loginUrlForPathname = (pathname) => {
  const segments = String(pathname || '').toLowerCase().split('/').filter(Boolean);
  const hit = PORTAL_LOGINS.find(([segment]) => segments.includes(segment));
  return hit ? hit[1] : '/auth/login';
};

// A login screen must never be redirected again: if a request made from a login
// page returns 401, re-running the redirect is what turns one expiry into a
// reload loop.
export const isLoginPath = (pathname) => {
  const path = String(pathname || '');
  return path.startsWith('/auth/') || /(^|\/)login\/?$/.test(path);
};

// One page can fire several requests at once (dashboard, notifications, ...).
// Without this guard every parallel 401 starts its own reload.
let redirecting = false;

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};

    // Handle 401 - Unauthenticated: clear auth and send the user to the login
    // screen of the portal they are using, exactly once.
    if (status === 401) {
      const { pathname } = new URL(window.location.href);

      if (!redirecting && !isLoginPath(pathname)) {
        redirecting = true;
        const scope = portalScopeForPath(pathname);
        if (scope) {
          localStorage.removeItem(`portal:${scope}:auth_token`);
          localStorage.removeItem(`portal:${scope}:user`);
          localStorage.removeItem(`portal:${scope}:active_role`);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('active_role');
        }

        // Explain the bounce instead of silently reloading.
        try {
          sessionStorage.setItem('auth_redirect_reason', 'session-expired');
        } catch {
          /* storage unavailable - the redirect still happens */
        }

        window.location.href = loginUrlForPathname(pathname);
      }

      return Promise.reject(error);
    }

    // Handle 403 - Forbidden: log warning and let caller or PrivateRoute handle gracefully
    if (status === 403) {
      console.warn('Access forbidden (403):', error.config?.url, data.message || 'Permission denied');
      return Promise.reject(error);
    }

    // Handle 422 - Unprocessable Entity: validation errors
    if (status === 422) {
      console.warn('Validation error (422):', data.message || error.message);
      return Promise.reject(error);
    }

    // Handle 500+ - Server errors
    if (status >= 500) {
      console.error('Server error (500+):', error.config?.url, data.message || error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
