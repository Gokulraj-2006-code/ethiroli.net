import { describe, expect, it } from 'vitest';
import { ROLES, getRoleDefaultPath, isRoleAuthorized } from '../src/common/utils/roleRouting.js';
import { getNavigationForRole } from '../src/common/layout/navigationConfig.js';

// Five panels ship: Super Admin, Sales, Manager, HR and Employee (interns share Employee).
describe('five portal routing', () => {
  it.each([
    [ROLES.SUPER_ADMIN, '/app/super-admin/dashboard'],
    [ROLES.SALES, '/app/sales/dashboard'],
    [ROLES.HR, '/app/hr/dashboard'],
    [ROLES.PROJECT_MANAGER, '/app/manager/dashboard'],
    [ROLES.EMPLOYEE, '/app/employee/dashboard'],
    [ROLES.INTERN, '/app/employee/dashboard'],
  ])('routes %s to %s', (role, path) => expect(getRoleDefaultPath(role)).toBe(path));

  it.each([
    ROLES.ADMIN,
    ROLES.TUTOR,
    ROLES.FINANCE,
    ROLES.RECEPTION,
    ROLES.STUDENT,
  ])('does not expose a separate portal for %s', (role) => expect(getRoleDefaultPath(role)).toBe('/unauthorized'));

  it('limits HR navigation to real HR routes, including project assignments', () => {
    const paths = getNavigationForRole(ROLES.HR).map(({ path }) => path);
    expect(paths).toEqual([
      '/app/hr/dashboard',
      '/app/hr/attendance',
      '/app/hr/calendar',
      '/app/hr/employees',
      '/app/hr/interns',
      '/app/hr/projects',
      '/app/hr/leaves',
      '/app/hr/enquiries',
      '/app/hr/organization',
      '/app/hr/career-applications',
      '/app/hr/documents',
      '/app/hr/deactivated',
      '/app/hr/profile',
    ]);
  });

  it('shares Employee navigation for employees and interns', () => {
    expect(getNavigationForRole(ROLES.INTERN)).toEqual(getNavigationForRole(ROLES.EMPLOYEE));
    expect(getNavigationForRole(ROLES.EMPLOYEE).map(({ path }) => path)).toContain('/app/employee/calendar');
  });

  it('exposes profile and attendance links to the roles that use them', () => {
    expect(getNavigationForRole(ROLES.SUPER_ADMIN).map(({ path }) => path)).toContain('/app/super-admin/profile');
    expect(getNavigationForRole(ROLES.HR).map(({ path }) => path)).toContain('/app/hr/profile');
    expect(getNavigationForRole(ROLES.PROJECT_MANAGER).map(({ path }) => path)).toContain('/app/manager/profile');
    expect(getNavigationForRole(ROLES.PROJECT_MANAGER).map(({ path }) => path)).toContain('/app/manager/attendance');
    expect(getNavigationForRole(ROLES.EMPLOYEE).map(({ path }) => path)).toContain('/app/employee/attendance');
  });

  it('exposes budget, project and To-Do navigation to the roles that use them', () => {
    const pathsFor = (role) => getNavigationForRole(role).map(({ path }) => path);
    expect(pathsFor(ROLES.SUPER_ADMIN)).toEqual(expect.arrayContaining([
      '/app/super-admin/budgets',
      '/app/super-admin/projects',
      '/app/super-admin/monitoring',
      '/app/super-admin/todos',
    ]));
    expect(pathsFor(ROLES.SALES)).toEqual(expect.arrayContaining([
      '/app/sales/budget',
      '/app/sales/client-orders',
      '/app/sales/projects',
      '/app/sales/todos',
    ]));
    expect(pathsFor(ROLES.PROJECT_MANAGER)).toEqual(expect.arrayContaining([
      '/app/manager/projects',
      '/app/manager/todos',
      '/app/manager/workspace',
    ]));
    expect(pathsFor(ROLES.EMPLOYEE)).toContain('/app/employee/todos');
  });

  it('gives retired portal roles no sidebar of their own', () => {
    expect(getNavigationForRole(ROLES.TUTOR)).toEqual([]);
    expect(getNavigationForRole(ROLES.FINANCE)).toEqual([]);
  });

  it('does not elevate interns or authorize unrelated roles', () => {
    expect(isRoleAuthorized(ROLES.INTERN, [ROLES.EMPLOYEE, ROLES.INTERN])).toBe(true);
    expect(isRoleAuthorized(ROLES.INTERN, [ROLES.HR])).toBe(false);
    expect(isRoleAuthorized(ROLES.ADMIN, [ROLES.SUPER_ADMIN, ROLES.HR])).toBe(false);
  });

  it('uses login fallback for unknown roles', () => expect(getRoleDefaultPath('unknown')).toBe('/app/login'));
});
