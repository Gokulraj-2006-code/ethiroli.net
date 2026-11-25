/** Small, honest formatters for the Sales portal. No sample/fallback figures. */

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const formatMoney = (value, currency) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  const code = typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : null;
  try {
    return new Intl.NumberFormat(undefined, code
      ? { style: 'currency', currency: code, maximumFractionDigits: 2 }
      : { maximumFractionDigits: 2 }).format(amount);
  } catch {
    // An unrecognised currency code from the backend should not break the page.
    return `${amount.toFixed(2)}${code ? ` ${code}` : ''}`;
  }
};

const parseDateValue = (value) => {
  if (!value) return null;
  // MySQL DATE values arrive as YYYY-MM-DD. Parsing with `new Date(string)`
  // shifts the day for timezones west of UTC, so force local midnight.
  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = parseDateValue(value);
  return date ? date.toLocaleDateString() : '—';
};

export const formatDateTime = (value) => {
  const date = parseDateValue(value);
  return date ? date.toLocaleString() : '—';
};

export const labelize = (value) => {
  if (!value) return '—';
  return String(value)
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
};

export const statusClass = (status) => {
  const key = String(status || '').toUpperCase();
  if (['COMPLETED', 'APPROVED', 'CONVERTED', 'CONFIRMED', 'ACTIVE'].includes(key)) return 'sales-badge--success';
  if (['PENDING', 'AWAITING_MANAGER_ACCEPTANCE', 'DRAFT', 'DELIVERY_SUBMITTED', 'AWAITING_ADMIN_CONFIRMATION'].includes(key)) return 'sales-badge--warning';
  if (['CANCELLED', 'REJECTED'].includes(key)) return 'sales-badge--danger';
  return 'sales-badge--neutral';
};

export const progressPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};
