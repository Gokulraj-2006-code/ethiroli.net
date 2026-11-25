import axiosInstance from '../../../services/api/axiosInstance.js';

/** Normalise the `{ success, data, message }` envelope returned by the API. */
const unwrap = (response) => response?.data ?? response;

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const apiMessage = (error, fallback = 'The request could not be completed.') => (
  error?.response?.data?.message || error?.message || fallback
);

export const formatDate = (value) => {
  if (!value) return '—';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN');
};

export const formatMoney = (value, currency) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  const code = String(currency || '').trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(code)) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount);
    } catch {
      // Fall through to a neutral numeric rendering for non-ISO codes.
    }
  }
  return `${code ? `${code} ` : ''}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const labelize = (value) => {
  const text = String(value || '').replace(/_/g, ' ').trim();
  if (!text) return '—';
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ------------------------------- Budgets -------------------------------- */

export const listBudgets = async () => asArray(unwrap(await axiosInstance.get('/v1/budgets')));

export const getBudget = async (id) => unwrap(await axiosInstance.get(`/v1/budgets/${encodeURIComponent(id)}`));

export const createBudget = (payload) => axiosInstance.post('/v1/budgets', payload).then(unwrap);

export const approveBudget = (id) => axiosInstance.patch(`/v1/budgets/${encodeURIComponent(id)}/approve`).then(unwrap);

export const reviseBudget = (id, { total_amount, description }) => axiosInstance.patch(
  `/v1/budgets/${encodeURIComponent(id)}/revise`,
  {
    total_amount,
    // The API also accepts/uses these keys; sending both keeps the client
    // compatible with either controller contract.
    new_total: total_amount,
    description,
    reason: description,
  }
).then(unwrap);

export const allocatePanel = ({ budget_id, panel = 'SALES', allocated_amount, description }) => (
  axiosInstance.post('/v1/budgets/allocate', {
    budget_id,
    panel,
    allocated_amount,
    description,
  }).then(unwrap)
);

export const reviseAllocation = (id, { allocated_amount, description }) => axiosInstance.patch(
  `/v1/budgets/allocations/${encodeURIComponent(id)}/revise`,
  {
    allocated_amount,
    new_amount: allocated_amount,
    description,
    reason: description,
  }
).then(unwrap);

export const getBudgetHistory = async () => {
  const history = unwrap(await axiosInstance.get('/v1/budgets/history')) || {};
  return {
    budget_revisions: asArray(history.budget_revisions),
    allocation_revisions: asArray(history.allocation_revisions),
  };
};

/* --------------------------- Company projects ---------------------------- */

export const listCompanyProjects = async (params = {}) => (
  asArray(unwrap(await axiosInstance.get('/v1/company-projects', { params })))
);

export const getCompanyProject = async (id) => (
  unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}`))
);

export const getCompanyProjectActivity = async (id) => (
  asArray(unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}/activity`)))
);

export const decideProjectExpense = (projectId, expenseId, decision, note) => axiosInstance.put(
  `/v1/company-projects/${encodeURIComponent(projectId)}/expenses/${encodeURIComponent(expenseId)}/${decision}`,
  {
    note: note || undefined,
    reason: note || undefined,
    rejection_note: decision === 'reject' ? (note || undefined) : undefined,
  }
).then(unwrap);

export const completeProjectDelivery = (id) => (
  axiosInstance.post(`/v1/company-projects/${encodeURIComponent(id)}/delivery/complete`).then(unwrap)
);

export const getOrgDirectory = async () => asArray(unwrap(await axiosInstance.get('/v1/org/directory')));
