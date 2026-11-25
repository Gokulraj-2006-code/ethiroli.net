import React, { useEffect } from 'react';
import RolePortalShell from './RolePortalShell.jsx';
import SalesRoutes from './roles/sales/SalesRoutes.jsx';
import SalesLoginPage from './auth/portals/pages/SalesLoginPage.jsx';
import { ROLES } from './common/utils/roleRouting.js';

/**
 * SalesApp - the Sales panel (sales.html).
 *
 * The internal role stays SALES; "Sales" is only the visible panel label.
 * All routes live under /app/sales/* and the shared shell wires the portal
 * login at /auth/sales/login.
 */
export default function SalesApp() {
  useEffect(() => {
    // The shared sidebar brand links to the Employee dashboard. Keep Sales
    // users inside their own portal when they click it.
    const keepBrandInPortal = (event) => {
      const brand = event.target instanceof Element ? event.target.closest('.portalBrandBox') : null;
      if (brand) {
        event.preventDefault();
        window.location.assign('/app/sales/dashboard');
      }
    };
    document.addEventListener('click', keepBrandInPortal);
    return () => {
      document.removeEventListener('click', keepBrandInPortal);
    };
  }, []);

  return (
    <RolePortalShell
      slug="sales"
      loginPage={<SalesLoginPage />}
      allowedRoles={[ROLES.SALES]}
      routes={<SalesRoutes />}
    />
  );
}
