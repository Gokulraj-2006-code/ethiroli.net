import React, { useEffect, useState } from 'react';
import LoginPage from '../../pages/LoginPage.jsx';
import styles from '../../pages/Auth.module.css';

const REASON_KEY = 'auth_redirect_reason';
const BRAND_LOGO = '/assets/images/ethiroli_logo.png';

const readNotice = () => {
  try {
    return sessionStorage.getItem(REASON_KEY) === 'session-expired'
      ? 'Your session has expired or you were signed out. Please sign in again.'
      : null;
  } catch {
    /* storage unavailable - show the plain login form */
    return null;
  }
};

/**
 * Sales portal sign-in screen.
 *
 * Uses the shared polished LoginPage (real logo, password reveal) and the
 * `sales` portal scope, so the backend validates the SALES role. Password
 * recovery is intentionally not offered here.
 */
export default function SalesLoginPage() {
  const [notice] = useState(readNotice);

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
        portal="sales"
        variant="polished"
        brandLogo={BRAND_LOGO}
        showPasswordToggle
      />
    </>
  );
}
