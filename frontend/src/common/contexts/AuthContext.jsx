/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { setCredentials, updateUserProfile, clearCredentials } from '../../store/slices/authSlice.js';
import { getMe, login as apiLogin, logout as apiLogout } from '../../services/api/authApi.js';

const AuthContext = createContext(null);

const getScopedKey = (scope, key) => scope ? `portal:${scope}:${key}` : key;

export const AuthProvider = ({ children, portalScope = null }) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state?.auth) || {};
  const { user = null, isAuthenticated = false, socketToken = null, activePortal = null, loading: reduxLoading = false } = authState;
  // A stored token means a session may still be valid: keep the guard in its
  // "Authenticating..." state until getMe() resolves instead of bouncing a
  // hard reload straight to the login screen.
  const tokenKey = getScopedKey(portalScope, 'auth_token');
  const userKey = getScopedKey(portalScope, 'user');
  const roleKey = getScopedKey(portalScope, 'active_role');
  const hasStoredToken = Boolean(localStorage.getItem(tokenKey) || (!portalScope && localStorage.getItem('token')));
  const [loading, setLoading] = useState(reduxLoading || hasStoredToken);

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem(roleKey) || null;
  });

  const checkAuth = useCallback(async () => {
    try {
      const data = await getMe();
      const user = data?.data?.user || data?.user;
      if (user) {
        dispatch(setCredentials({ 
          user, 
          socket_token: data?.data?.socket_token || data?.socket_token || localStorage.getItem(tokenKey), 
          activePortal: data?.data?.activePortal || data?.activePortal 
        }));
        setActiveRole(prev => prev || user.role);
      } else {
        dispatch(clearCredentials());
      }
    } catch {
      // Clear credentials on session expiration or error
      dispatch(clearCredentials());
    } finally {
      setLoading(false);
    }
  }, [dispatch, tokenKey]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    if (newRole) {
      localStorage.setItem(roleKey, newRole);
    } else {
      localStorage.removeItem(roleKey);
    }
  };

  const login = async (email, password, portal = null, mfaToken = null) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password, portal, mfaToken);
      const token = data?.data?.token || data?.token || data?.data?.socket_token || data?.socket_token;
      const user = data?.data?.user || data?.user;

      if (token) {
        localStorage.setItem(tokenKey, token);
      }
      if (user) {
        localStorage.setItem(userKey, JSON.stringify(user));
        setActiveRole(user.role);
        localStorage.setItem(roleKey, user.role);
      }

      const normalizedPortal = portal ? String(portal).trim().toLowerCase() : null;
      const activePortal = data?.data?.activePortal || data?.activePortal || normalizedPortal;
      
      if (user) {
        dispatch(setCredentials({ user, token, socket_token: token, activePortal }));
      }
      return data;
    } catch (err) {
      dispatch(clearCredentials());
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout(activePortal);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      localStorage.removeItem(roleKey);
      dispatch(clearCredentials());
      setActiveRole(null);
      setLoading(false);
    }
  };

  const updateProfile = useCallback((updates) => {
    if (!updates) return;
    dispatch(updateUserProfile(updates));
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(userKey, JSON.stringify({ ...parsed, ...updates }));
      }
    } catch {
      // The authenticated React state still updates if browser storage is unavailable.
    }
  }, [dispatch, userKey]);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const effectiveRole = activeRole || user?.role || null;

  const value = {
    user,
    role: effectiveRole,
    realRole: user?.role || null,
    activeRole: effectiveRole,
    switchRole,
    isAuthenticated,
    socketToken,
    activePortal,
    loading,
    login,
    logout,
    updateProfile,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
