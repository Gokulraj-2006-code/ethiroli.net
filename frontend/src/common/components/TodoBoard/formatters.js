export const asArray = (value) => (Array.isArray(value) ? value : []);

export const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export const normalizeColor = (value) =>
  /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : '#1A4B48';

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toIso = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/** Only render http(s) or same-origin paths as clickable links. */
export const safeUrl = (value) => {
  const url = String(value || '').trim();
  return /^(https?:\/\/|\/)/i.test(url) ? url : null;
};

export const normalizePeople = (rows) => {
  const seen = new Set();
  return asArray(rows)
    .map((person) => ({
      id: String(person?.id ?? person?.user_id ?? ''),
      name: person?.full_name || person?.name || person?.email || String(person?.id ?? person?.user_id ?? ''),
      email: person?.email || '',
    }))
    .filter((person) => person.id && !seen.has(person.id) && seen.add(person.id));
};

export const personName = (id, people = [], members = []) => {
  if (!id) return '';
  const match = people.find((person) => person.id === String(id)) || members.find((member) => String(member.user_id) === String(id));
  return match?.full_name || match?.name || match?.email || '';
};
