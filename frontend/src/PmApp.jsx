import React from 'react';
import RolePortalShell from './RolePortalShell.jsx';
import ManagerRoutes from './roles/project-manager/ManagerRoutes.jsx';
import PmLoginPage from './auth/portals/pages/PmLoginPage.jsx';
import { ROLES } from './common/utils/roleRouting.js';
import './roles/project-manager/pm-overrides.css';

/**
 * Manager portal application (retained at the historic pm.html entry point).
 */
export default function PmApp() {
  return (
    <RolePortalShell
      slug="manager"
      loginPage={<PmLoginPage />}
      allowedRoles={[ROLES.PROJECT_MANAGER]}
      routes={<ManagerRoutes />}
    />
  );
}
