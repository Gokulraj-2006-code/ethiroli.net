import { ROLES } from '../../../common/utils/roleRouting.js';

export const PORTAL_CONFIGS = {
  [ROLES.SUPER_ADMIN]: {
    slug: 'super-admin',
    label: 'Super Administrator',
    pageComponent: 'SuperAdminLoginPage',
    strategies: ['password'],
    mfaRequired: false,
    oauthProviders: [],
    brandColor: '#1a1a2e',
  },
  [ROLES.HR]: {
    slug: 'hr',
    label: 'Human Resources',
    pageComponent: 'HrLoginPage',
    strategies: ['password'],
    mfaRequired: false,
    oauthProviders: [],
    brandColor: '#0f3460',
  },
  [ROLES.PROJECT_MANAGER]: {
    slug: 'manager',
    label: 'Manager',
    pageComponent: 'PmLoginPage',
    strategies: ['password'],
    mfaRequired: false,
    oauthProviders: [],
    brandColor: '#e94560',
  },
  [ROLES.EMPLOYEE]: {
    slug: 'employee',
    label: 'Employee',
    pageComponent: 'EmployeeLoginPage',
    strategies: ['password'],
    mfaRequired: false,
    oauthProviders: [],
    brandColor: '#264653',
  },
  [ROLES.SALES]: {
    slug: 'sales',
    label: 'Sales',
    pageComponent: 'SalesLoginPage',
    strategies: ['password'],
    mfaRequired: false,
    oauthProviders: [],
    brandColor: '#1a4b48',
  },
};

export const getPortalConfig = (roleOrSlug) => {
  if (!roleOrSlug) return null;
  if (PORTAL_CONFIGS[roleOrSlug]) return PORTAL_CONFIGS[roleOrSlug];
  const found = Object.values(PORTAL_CONFIGS).find(
    (config) => config.slug === roleOrSlug || config.slug === String(roleOrSlug).toLowerCase()
  );
  return found || null;
};

export const getPortalBySlug = (slug) =>
  Object.values(PORTAL_CONFIGS).find((config) => config.slug === slug) || null;

/**
 * Resolve a portal slug to its role enum.
 *
 * PORTAL_CONFIGS is keyed by the role enum, and the slugs are abbreviated
 * (`pm` -> PROJECT_MANAGER), so uppercasing a slug is not a safe substitute.
 * The backend's demo-users endpoint filters `WHERE u.role = ?` against a MySQL
 * enum, and a non-matching value returns an empty list rather than an error.
 */
export const getRoleBySlug = (slug) => {
  const config = getPortalConfig(slug);
  if (!config) return null;
  return Object.keys(PORTAL_CONFIGS).find((key) => PORTAL_CONFIGS[key] === config) || null;
};
