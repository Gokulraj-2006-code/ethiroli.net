import React, { useEffect, useState } from 'react';
import LoginPage from '../../pages/LoginPage.jsx';
import styles from '../../pages/Auth.module.css';

const REASON_KEY = 'auth_redirect_reason';

// The real Ethiroli brand asset already used by the public site
// (frontend/public/assets/images/ethiroli_logo.png).
const BRAND_LOGO = '/assets/images/ethiroli_logo.png';

// Pure read so it is safe as a lazy useState initialiser (StrictMode may call it
// twice) and so nothing is written during render.
const readNotice = () => {
  try {
    return sessionStorage.getItem(REASON_KEY) === 'session-expired'
      ? 'Your session has expired or you were signed out. Please sign in again.'
      : null;
  } catch {
    /* storage unavailable - just show the plain login form */
    return null;
  }
};

/**
 * EmployeeLoginPage - the employee portal sign-in screen.
 *
 * Employee-specific concerns on top of the shared LoginPage:
 *  1. the polished card (`variant="polished"`), which is what makes the labels
 *     and inputs legible on this dark background - the global admin.css forces
 *     #374151 labels and white input boxes, which are unusable here. Opt-in, so
 *     no other portal's sign-in screen changes;
 *  2. the real Ethiroli logo, plus a password visibility toggle;
 *  3. when the axios 401 handler bounces an expired session here, the user is
 *     told why they landed on a login screen instead of the portal silently
 *     reloading in a loop.
 *
 * Password recovery is intentionally not offered on this login screen.
 */
export default function EmployeeLoginPage() {
  const [notice] = useState(readNotice);

  // The reason is only meaningful for this visit, so clear it afterwards.
  useEffect(() => {
    if (!notice) return;
    try {
      sessionStorage.removeItem(REASON_KEY);
    } catch {
      /* storage unavailable - nothing to clear */
    }
  }, [notice]);

  return (
    <>
      {notice && (
        <div role="alert" className={`${styles.error} ${styles.sessionNotice}`}>
          {notice}
        </div>
      )}

      <LoginPage
        portal="employee"
        variant="polished"
        brandLogo={BRAND_LOGO}
        showPasswordToggle
      />
    </>
  );
}
