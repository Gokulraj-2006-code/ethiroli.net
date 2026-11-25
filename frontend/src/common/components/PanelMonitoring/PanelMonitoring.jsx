import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { getMonitorablePanels } from '../../../services/api/authApi.js';
import { MONITOR_PANELS, authorizeMonitorPanels } from '../../utils/panelMonitoring.js';

/**
 * PanelMonitoring - read-only overview of the panels this role may monitor.
 *
 * The allowed list comes from the authenticated backend endpoint, then is
 * intersected with the frontend hierarchy so a response can never render a
 * panel the UI does not recognise. These cards are display-only: they do not
 * link to, or redirect into, another panel. Employees/Interns see no section.
 */
export default function PanelMonitoring() {
  const { role, realRole } = useAuth();
  const activeRole = realRole || role;
  const [panelSlugs, setPanelSlugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMonitorablePanels()
      .then((panels) => {
        if (!active) return;
        setPanelSlugs(authorizeMonitorPanels(activeRole, Array.isArray(panels) ? panels : []));
      })
      .catch(() => {
        // If the authority is unavailable, show no monitoring cards rather than
        // guessing at permissions.
        if (active) setPanelSlugs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [activeRole]);

  const panels = useMemo(
    () => panelSlugs.map((slug) => MONITOR_PANELS[slug]).filter(Boolean),
    [panelSlugs]
  );

  if (!loading && panels.length === 0) return null;

  return (
    <section className="card shadow-sm mb-4" aria-labelledby="panel-monitoring-title">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h2 className="h6 mb-0" id="panel-monitoring-title">
          <i className="bi bi-diagram-3 me-2" aria-hidden="true"></i>
          Monitor panels
        </h2>
        <span className="text-secondary small">Approved connections for your role</span>
      </div>
      <div className="card-body">
        {loading ? (
          <p className="text-secondary small mb-0">Loading allowed panels…</p>
        ) : (
          <div className="row g-3">
            {panels.map((panel) => (
              <div className="col-12 col-md-6 col-xl-4" key={panel.slug}>
                <div className="monitorCard h-100" aria-label={`${panel.label} panel is visible to your role`}>
                  <div className="monitorCardIcon" aria-hidden="true">
                    <i className={`bi ${panel.icon}`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span className="fw-semibold text-dark">{panel.label}</span>
                      <span className="monitorCardPill">Visible</span>
                    </div>
                    <p className="text-secondary small mb-0">{panel.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
