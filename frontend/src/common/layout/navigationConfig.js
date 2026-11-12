/**
 * Ethiroli SaaS Platform — Role-Based Navigation Configuration
 * Defines sidebar menu items for the three live roles (Super Admin, HR, Employee) based on PROJECT_DOCUMENTATION.md Section 5.2.
 */

import { ROLES } from '../utils/roleRouting.js';

export const ROLE_NAVIGATION = Object.freeze({
  [ROLES.SUPER_ADMIN]: [
    { label: 'Dashboard', path: '/app/super-admin/dashboard', icon: 'dashboard' },
    {
      label: 'Platform',
      icon: 'domain',
      children: [
        { label: 'Tenants / Organizations', path: '/app/super-admin/tenants', icon: 'domain' },
        { label: 'Users', path: '/app/super-admin/users', icon: 'group' },
        { label: 'Roles & Permissions', path: '/app/super-admin/roles-permissions', icon: 'admin_panel_settings' },
        { label: 'Subscriptions & Plans', path: '/app/super-admin/plans', icon: 'subscriptions' },
        { label: 'Platform Billing', path: '/app/super-admin/billing', icon: 'payments' },
      ],
    },
    {
      label: 'CRM',
      icon: 'contact_mail',
      children: [
        { label: 'Leads (CRM)', path: '/app/super-admin/leads', icon: 'contact_mail' },
        { label: 'Website Enquiries', path: '/app/super-admin/enquiries', icon: 'contact_mail' },
      ],
    },
    {
      label: 'Operations',
      icon: 'calendar_month',
      children: [
        { label: 'Global Calendar', path: '/app/super-admin/calendar', icon: 'calendar_month' },
        { label: 'Approvals', path: '/app/super-admin/approvals', icon: 'verified' },
        { label: 'Notifications', path: '/app/super-admin/notifications', icon: 'notifications' },
        { label: 'Communications', path: '/app/super-admin/communications', icon: 'forum' },
      ],
    },
    {
      label: 'Platform Services',
      icon: 'smart_toy',
      children: [
        { label: 'Automation Studio', path: '/app/super-admin/automation', icon: 'smart_toy' },
        { label: 'Integrations', path: '/app/super-admin/integrations', icon: 'hub' },
        { label: 'Email / SMS / WhatsApp', path: '/app/super-admin/messaging', icon: 'sms' },
        { label: 'Developer Portal', path: '/app/super-admin/developer', icon: 'code' },
        { label: 'Marketplace', path: '/app/super-admin/marketplace', icon: 'storefront' },
      ],
    },
    {
      label: 'Analytics',
      icon: 'bar_chart',
      children: [
        { label: 'Reports', path: '/app/super-admin/reports', icon: 'bar_chart' },
        { label: 'AI Analytics', path: '/app/super-admin/analytics', icon: 'analytics' },
        { label: 'Gamification', path: '/app/super-admin/gamification', icon: 'emoji_events' },
      ],
    },
    {
      label: 'System',
      icon: 'monitor_heart',
      children: [
        { label: 'System Monitoring', path: '/app/super-admin/monitoring', icon: 'monitor_heart' },
        { label: 'System Search', path: '/app/super-admin/system-search', icon: 'search' },
        { label: 'Feature Flags', path: '/app/super-admin/feature-flags', icon: 'toggle_on' },
        { label: 'System Configuration', path: '/app/super-admin/configuration', icon: 'tune' },
        { label: 'Database / Storage', path: '/app/super-admin/storage', icon: 'storage' },
        { label: 'Backup & Recovery', path: '/app/super-admin/backups', icon: 'backup' },
      ],
    },
    {
      label: 'Security',
      icon: 'security',
      children: [
        { label: 'Security Center', path: '/app/super-admin/security', icon: 'security' },
        { label: 'Audit Logs', path: '/app/super-admin/audit-logs', icon: 'history' },
      ],
    },
    {
      label: 'Administration',
      icon: 'settings',
      children: [
        { label: 'Settings', path: '/app/super-admin/settings', icon: 'settings' },
        { label: 'Admin Profile', path: '/app/super-admin/profile', icon: 'person' },
      ],
    },
  ],

  [ROLES.HR]: [
    { label: 'Dashboard', path: '/app/hr/dashboard', icon: 'dashboard' },
    { label: 'Employee Directory', path: '/app/hr/employees', icon: 'badge' },
    { label: 'Intern Directory', path: '/app/hr/interns', icon: 'school' },
    { label: 'Organization Settings', path: '/app/hr/organization', icon: 'account_tree' },
    { label: 'Projects & Roles', path: '/app/hr/projects', icon: 'folder_special' },
    {
      label: 'Attendance & Leaves',
      icon: 'schedule',
      children: [
        { label: 'Workforce Attendance', path: '/app/hr/attendance', icon: 'schedule' },
        { label: 'Leave Management', path: '/app/hr/leaves', icon: 'event_busy' },
      ],
    },
    { label: 'Website Enquiries', path: '/app/hr/enquiries', icon: 'contact_mail' },
    { label: 'My Profile', path: '/app/hr/profile', icon: 'person' },
  ],

  [ROLES.EMPLOYEE]: [
    { label: 'Dashboard', path: '/app/employee/dashboard', icon: 'speedometer2' },
    {
      label: 'Employee Management',
      icon: 'briefcase',
      children: [
        { label: 'My Tasks', path: '/app/employee/tasks', icon: 'check2-square' },
        { label: 'My Projects', path: '/app/employee/projects', icon: 'kanban' },
        { label: 'Attendance', path: '/app/employee/attendance', icon: 'clock' },
        { label: 'Leave Management', path: '/app/employee/leaves', icon: 'calendar-x' },
        { label: 'Calendar', path: '/app/employee/calendar', icon: 'calendar3' },
      ],
    },
    {
      label: 'Learning & Development',
      icon: 'mortarboard',
      children: [
        { label: 'My Training', path: '/app/employee/training', icon: 'book' },
        { label: 'Assignments', path: '/app/employee/assignments', icon: 'journal-check' },
        { label: 'Performance', path: '/app/employee/performance', icon: 'graph-up-arrow' },
      ],
    },
    {
      label: 'Personal Records',
      icon: 'person-badge',
      children: [
        { label: 'My Documents', path: '/app/employee/documents', icon: 'folder2' },
        { label: 'Payslips', path: '/app/employee/payslips', icon: 'receipt' },
        { label: 'My Profile', path: '/app/employee/profile', icon: 'person-circle' },
      ],
    },
    {
      label: 'Communication & Governance',
      icon: 'chat-square-dots',
      children: [
        { label: 'Approvals', path: '/app/employee/approvals', icon: 'patch-check' },
        { label: 'Announcements', path: '/app/employee/announcements', icon: 'megaphone' },
        { label: 'Messages', path: '/app/employee/messages', icon: 'chat-left-text' },
        { label: 'Notifications', path: '/app/employee/notifications', icon: 'bell' },
        { label: 'Achievements', path: '/app/employee/achievements', icon: 'trophy' },
        { label: 'Help & Support', path: '/app/employee/support', icon: 'life-preserver' },
      ],
    },
  ],

});

/**
 * Returns navigation links for a given user role
 * @param {string} role - The user's role
 * @returns {Array<{label: string, path: string, icon?: string, children?: Array}>}
 */
export const getNavigationForRole = (role) => {
  if (!role) return [];
  const normalized = String(role).trim().toUpperCase();
  if (normalized === 'SUPER_ADMIN') {
    return [
      { label: 'Company overview', path: '/app/super-admin/dashboard', icon: 'dashboard' },
      { label: 'Contact enquiries', path: '/app/super-admin/enquiries', icon: 'mail' },
      { label: 'Leave monitoring', path: '/app/super-admin/leaves', icon: 'event' },
      { label: 'Staff administration', path: '/app/super-admin/staff', icon: 'people' },
      { label: 'Deactivation requests', path: '/app/super-admin/deactivation-requests', icon: 'person_off' },
      { label: 'My Profile', path: '/app/super-admin/profile', icon: 'person' }
    ];
  }
  if (normalized === 'HR') return [
    { label: 'Dashboard', path: '/app/hr/dashboard', icon: 'dashboard' },
    { label: 'HR attendance', path: '/app/hr/attendance', icon: 'schedule' },
    { label: 'HR calendar', path: '/app/hr/calendar', icon: 'calendar_month' },
    { label: 'Employees', path: '/app/hr/employees', icon: 'badge' },
    { label: 'Interns', path: '/app/hr/interns', icon: 'school' },
    { label: 'Projects & Roles', path: '/app/hr/projects', icon: 'folder_special' },
    { label: 'Leave requests', path: '/app/hr/leaves', icon: 'event' },
    { label: 'Contact enquiries', path: '/app/hr/enquiries', icon: 'mail' },
    { label: 'Organization structure', path: '/app/hr/organization', icon: 'org' },
    { label: 'Career applications', path: '/app/hr/career-applications', icon: 'work' },
    { label: 'Employee documents', path: '/app/hr/documents', icon: 'description' },
    { label: 'Deactivated register', path: '/app/hr/deactivated', icon: 'person_off' },
    { label: 'My Profile', path: '/app/hr/profile', icon: 'person' }
  ];
  if (normalized === 'EMPLOYEE' || normalized === 'INTERN') return [
    { label: 'Dashboard', path: '/app/employee/dashboard', icon: 'dashboard' },
    { label: 'My Tasks', path: '/app/employee/tasks', icon: 'checklist' },
    { label: 'Attendance', path: '/app/employee/attendance', icon: 'schedule' },
    { label: 'Leaves', path: '/app/employee/leaves', icon: 'event_busy' },
    { label: 'Calendar', path: '/app/employee/calendar', icon: 'calendar_month' },
    { label: 'My Documents', path: '/app/employee/documents', icon: 'description' },
    { label: 'My Profile', path: '/app/employee/profile', icon: 'person' },
    { label: 'Income', path: '/app/employee/income', icon: 'payments' }
  ];
  if (normalized === 'INTERN') return ROLE_NAVIGATION.EMPLOYEE || [];
  return ROLE_NAVIGATION[normalized] || [];
};
