import axiosInstance from './axiosInstance.js';

/**
 * Company-project API helpers shared by the Sales and Manager portals.
 *
 * The backend deliberately scopes the list to projects the signed-in user owns
 * or works on, so no client-side filtering is needed (and no hidden projects
 * can leak through a stale cache).
 */
const unwrap = (payload) => (payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload);

export const companyProjectApi = {
  listProjects: async (params) => unwrap(await axiosInstance.get('/v1/company-projects', { params })),
  getProject: async (id) => unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}`)),
  listTasks: async (id) => unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}/tasks`)),
  listExpenses: async (id) => unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}/expenses`)),
  createExpense: async (id, payload) => unwrap(await axiosInstance.post(`/v1/company-projects/${encodeURIComponent(id)}/expenses`, payload)),
  getActivity: async (id) => unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}/activity`)),
  confirmSalesDelivery: async (id) => unwrap(await axiosInstance.post(`/v1/company-projects/${encodeURIComponent(id)}/delivery/confirm-sales`)),
  recomputeProject: async (id) => unwrap(await axiosInstance.post(`/v1/company-projects/${encodeURIComponent(id)}/recompute`)),
};

export default companyProjectApi;
