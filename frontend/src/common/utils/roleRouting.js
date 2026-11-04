/**
 * Ethiroli SaaS Platform — Role Routing Architecture
 * Defines canonical role enums, default home paths, and role resolution utilities.
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HR: 'HR',
  TUTOR: 'TUTOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  FINANCE: 'FINANCE',
  SALES: 'SALES',
  RECEPTION: 'RECEPTION',
  EMPLOYEE: 'EMPLOYEE',
  STUDENT: 'STUDENT',
  INTERN: 'INTERN',
  VIDE_EDITOR: 'VIDEO_EDITOR',
});

/**
 * Canonical landing dashboard for each system role
 */
export const ROLE_DEFAULT_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/app/super-admin/dashboard',
  [ROLES.ADMIN]: '/unauthorized',
  [ROLES.HR]: '/app/hr/dashboard',
  [ROLES.TUTOR]: '/unauthorized',
  [ROLES.PROJECT_MANAGER]: '/app/manager/dashboard',
  [ROLES.FINANCE]: '/unauthorized',
  [ROLES.VIDEO_EDITOR]: '/unauthorized',
  [ROLES.SALES]: '/unauthorized',
  [ROLES.RECEPTION]: '/unauthorized',
  [ROLES.EMPLOYEE]: '/app/employee/dashboard',
  [ROLES.STUDENT]: '/unauthorized',
  // Interns share the same self-service portal and workflows as employees.
  [ROLES.INTERN]: '/app/employee/dashboard',
});

/**
 * Returns the default dashboard path for a given role, or fallback to login
 * @param {string} role - The user's assigned role enum
 * @returns {string} The canonical route path
 */
export const getRoleDefaultPath = (role) => {
  if (!role) return '/app/login';
  const normalized = String(role).trim().toUpperCase();
  return ROLE_DEFAULT_ROUTES[normalized] || '/app/login';
};

/**
 * Checks whether a user's role satisfies the allowed roles list
 * @param {string} userRole - The user's role
 * @param {string[]} allowedRoles - List of authorized role enums
 * @returns {boolean}
 */
export const isRoleAuthorized = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  const normalized = String(userRole).trim().toUpperCase();
  return allowedRoles.includes(normalized);
};
