import axiosInstance from './axiosInstance.js';

/**
 * Sales portal API helpers.
 *
 * axiosInstance's response interceptor already unwraps AxiosResponse.data, so
 * every call below receives the backend envelope `{ success, data, message }`.
 * `unwrap` returns just the envelope's data, keeping pages free of `res.data`
 * chains and making empty responses honestly empty rather than defaulted.
 */
const unwrap = (payload) => (payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload);

/** Fallible API calls should surface the server's own validation message. */
export const salesErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  'The request could not be completed.';

export const salesPortalApi = {
  // Budget (read-only for Sales)
  getSalesBudget: async () => unwrap(await axiosInstance.get('/v1/budgets/sales')),

  // Client orders
  listClientOrders: async (params) => unwrap(await axiosInstance.get('/v1/client-orders', { params })),
  getClientOrder: async (id) => unwrap(await axiosInstance.get(`/v1/client-orders/${encodeURIComponent(id)}`)),
  createClientOrder: async (payload) => unwrap(await axiosInstance.post('/v1/client-orders', payload)),
  updateClientOrder: async (id, payload) => unwrap(await axiosInstance.put(`/v1/client-orders/${encodeURIComponent(id)}`, payload)),
  deleteClientOrder: async (id) => unwrap(await axiosInstance.delete(`/v1/client-orders/${encodeURIComponent(id)}`)),
  convertClientOrder: async (id, payload) => unwrap(await axiosInstance.post(`/v1/client-orders/${encodeURIComponent(id)}/convert`, payload)),
  listOrderManagers: async () => unwrap(await axiosInstance.get('/v1/client-orders/managers')),

  // Clients (selection for an order)
  listClients: async () => unwrap(await axiosInstance.get('/v1/clients')),

  // To-Do summary — the full workspace is the shared TodoBoard component.
  getTodoSummary: async () => unwrap(await axiosInstance.get('/v1/todos/summary')),

  // Notifications
  getNotifications: async (params) => unwrap(await axiosInstance.get('/v1/bell-notifications', { params })),
  markNotificationRead: async (id) => unwrap(await axiosInstance.patch(`/v1/bell-notifications/${encodeURIComponent(id)}/read`)),
  markAllNotificationsRead: async () => unwrap(await axiosInstance.post('/v1/bell-notifications/read-all')),

  // Profile — the same self-service endpoints every other portal uses.
  getMyProfile: async () => unwrap(await axiosInstance.get('/v1/users/me')),
  updateMyProfile: async (payload) => unwrap(await axiosInstance.patch('/v1/users/me', payload)),
};

export default salesPortalApi;
