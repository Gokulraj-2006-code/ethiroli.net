import { describe, expect, it } from 'vitest';
import {
  MONITOR_PANELS,
  PANEL_MONITOR_ACCESS,
  authorizeMonitorPanels,
  getMonitorablePanelsForRole,
} from '../src/common/utils/panelMonitoring.js';

describe('panel monitoring hierarchy', () => {
  it.each([
    ['SUPER_ADMIN', ['sales', 'manager', 'hr', 'employee']],
    ['PROJECT_MANAGER', ['hr', 'employee']],
    ['HR', ['employee']],
    ['SALES', []],
    ['EMPLOYEE', []],
    ['INTERN', []],
  ])('allows %s to monitor exactly %j', (role, panels) => {
    expect(getMonitorablePanelsForRole(role)).toEqual(panels);
  });

  it('does not give Manager or HR access to Super Admin monitoring', () => {
    expect(PANEL_MONITOR_ACCESS.PROJECT_MANAGER).not.toContain('super-admin');
    expect(PANEL_MONITOR_ACCESS.HR).not.toContain('manager');
  });

  it('filters unknown and unauthorized panels from an API response', () => {
    expect(authorizeMonitorPanels('HR', ['employee', 'manager', 'super-admin', 'unknown']))
      .toEqual(['employee']);
    expect(authorizeMonitorPanels('EMPLOYEE', ['employee', 'hr']))
      .toEqual([]);
  });

  it('keeps monitored panel metadata display-only', () => {
    Object.values(MONITOR_PANELS).forEach((panel) => {
      expect(panel).not.toHaveProperty('href');
      expect(panel).not.toHaveProperty('url');
    });
  });
});
