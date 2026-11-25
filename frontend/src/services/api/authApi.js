import axiosInstance from './axiosInstance.js';

export const login = async (email, password, portal = null, mfaToken = null) => {
  const payload = { email, password };
  const headers = {};
  if (portal) {
    const slug = String(portal).trim().toLowerCase();
    headers['X-Portal'] = slug;
    payload.portal = slug;
  }
  if (mfaToken) {
    payload.mfaToken = mfaToken;
  }
  const endpoint = portal ? '/v1/auth/portal-login' : '/v1/auth/login';
  const response = await axiosInstance.post(endpoint, payload, { headers });
  // axiosInstance's response interceptor already returns response.data.
  // Return that unwrapped payload directly so MFA challenges reach LoginPage.
  return response;
};

export const logout = async (portal = null) => {
  const payload = portal ? { portal: String(portal).trim().toLowerCase() } : {};
  const response = await axiosInstance.post('/v1/auth/logout', payload);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/v1/auth/me');
  return response.data;
};

/** Panels the signed-in role is allowed to monitor (backend-authoritative). */
export const getMonitorablePanels = async () => {
  const response = await axiosInstance.get('/v1/auth/monitorable-panels');
  return response?.data?.panels || response?.panels || response?.data?.data?.panels || [];
};

export const impersonate = async (targetUserId) => {
  const response = await axiosInstance.post('/v1/auth/impersonate', { targetUserId });
  return response.data;
};

export const stopImpersonation = async () => {
  const response = await axiosInstance.post('/v1/auth/stop-impersonation');
  return response.data;
};

export const getDemoUsers = async (role = 'STUDENT') => {
  const response = await axiosInstance.get(`/v1/auth/demo-users?role=${role}`);
  return response.data?.data || response.data || [];
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.post('/v1/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

