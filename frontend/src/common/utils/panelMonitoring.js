/**
 * Role-based monitoring hierarchy for the five live panels.
 *
 * Mirrors the backend's PANEL_MONITOR_ACCESS. The backend endpoint remains the
 * authority; this copy is used to validate its response and to keep the UI from
 * ever showing a connection the hierarchy does not allow.
 */
export const PANEL_MONITOR_ACCESS = Object.freeze({
  SUPER_ADMIN: ['sales', 'manager', 'hr', 'employee'],
  ADMIN: ['sales', 'manager', 'hr', 'employee'],
  PROJECT_MANAGER: ['hr', 'employee'],
  HR: ['employee'],
  SALES: [],
  EMPLOYEE: [],
  INTERN: [],
});

export const MONITOR_PANELS = Object.freeze({
  'super-admin': {
    slug: 'super-admin',
    label: 'Super Admin',
    icon: 'bi-shield-lock',
    description: 'Platform-wide overview and administration.',
  },
  sales: {
    slug: 'sales',
    label: 'Sales',
    icon: 'bi-currency-exchange',
    description: 'Sales budget, client orders, company projects, and delivery.',
  },
  manager: {
    slug: 'manager',
    label: 'Manager',
    icon: 'bi-kanban',
    description: 'Manager workspace, team progress, and attendance.',
  },
  hr: {
    slug: 'hr',
    label: 'HR',
    icon: 'bi-people',
    description: 'People operations, leave, and workforce records.',
  },
  employee: {
    slug: 'employee',
    label: 'Employee',
    icon: 'bi-person-badge',
    description: 'Employee self-service, tasks, and attendance.',
  },
});

export const getMonitorablePanelsForRole = (role) => {
  if (!role) return [];
  return PANEL_MONITOR_ACCESS[String(role).trim().toUpperCase()] || [];
};

/** Keep only known panels that both the backend and the local hierarchy allow. */
export const authorizeMonitorPanels = (role, requestedPanels = []) => {
  const allowed = getMonitorablePanelsForRole(role);
  return allowed.filter((slug) => requestedPanels.includes(slug) && MONITOR_PANELS[slug]);
};
