import { describe, expect, it } from 'vitest';
import { ROLES, getRoleDefaultPath, isRoleAuthorized } from '../src/common/utils/roleRouting.js';
import { getNavigationForRole } from '../src/common/layout/navigationConfig.js';

describe('four portal routing', () => {
  it.each([
    [ROLES.SUPER_ADMIN, '/app/super-admin/dashboard'],
    [ROLES.PROJECT_MANAGER, '/app/manager/dashboard'],
    [ROLES.HR, '/app/hr/dashboard'],
    [ROLES.EMPLOYEE, '/app/employee/dashboard'],
    [ROLES.INTERN, '/app/employee/dashboard'],
  ])('routes %s to %s', (role, path) => expect(getRoleDefaultPath(role)).toBe(path));

  it.each([ROLES.ADMIN, ROLES.TUTOR, ROLES.FINANCE, ROLES.SALES, ROLES.RECEPTION, ROLES.STUDENT])(
    'does not expose a separate portal for %s', (role) => expect(getRoleDefaultPath(role)).toBe('/unauthorized')
  );

  it('limits HR navigation to real HR routes', () => {
    const paths = getNavigationForRole(ROLES.HR).map(({ path }) => path);
    expect(paths).toEqual(['/app/hr/dashboard', '/app/hr/attendance', '/app/hr/calendar', '/app/hr/employees', '/app/hr/interns', '/app/hr/leaves', '/app/hr/enquiries', '/app/hr/organization', '/app/hr/documents', '/app/hr/profile']);
  });

  it('shares Employee navigation for employees and interns', () => {
    expect(getNavigationForRole(ROLES.INTERN)).toEqual(getNavigationForRole(ROLES.EMPLOYEE));
    expect(getNavigationForRole(ROLES.EMPLOYEE).map(({ path }) => path)).toContain('/app/employee/calendar');
  });

  it('exposes profile and attendance links to the roles that use them', () => {
    expect(getNavigationForRole(ROLES.SUPER_ADMIN).map(({ path }) => path)).toContain('/app/super-admin/profile');
    expect(getNavigationForRole(ROLES.HR).map(({ path }) => path)).toContain('/app/hr/profile');
    expect(getNavigationForRole(ROLES.PROJECT_MANAGER).map(({ path }) => path)).toEqual([
      '/app/manager/dashboard', '/app/manager/attendance', '/app/manager/calendar', '/app/manager/workspace', '/app/manager/profile'
    ]);
  });

  it('does not elevate interns or authorize unrelated roles', () => {
    expect(isRoleAuthorized(ROLES.INTERN, [ROLES.EMPLOYEE, ROLES.INTERN])).toBe(true);
    expect(isRoleAuthorized(ROLES.INTERN, [ROLES.HR])).toBe(false);
    expect(isRoleAuthorized(ROLES.ADMIN, [ROLES.SUPER_ADMIN, ROLES.HR])).toBe(false);
  });

  it('uses login fallback for unknown roles', () => expect(getRoleDefaultPath('unknown')).toBe('/app/login'));
});
