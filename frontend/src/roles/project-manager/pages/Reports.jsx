import React, { useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage';
import pmApi from '../../../services/api/pmApi';

const number = (value) => Number(value || 0).toLocaleString('en-IN');

/** Manager reports built from live scoped KPI data rather than sample figures. */
export default function PMReports() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await pmApi.getPerformanceKPIs();
        if (active) setKpis(res?.kpis || null);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load report data.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const reports = [
    ['Milestone delivery', `${kpis?.milestoneStats?.completed_count || 0} of ${kpis?.milestoneStats?.total_milestones || 0} milestones delivered`, 'From milestone records in your scope'],
    ['Completed work', `${number(kpis?.deliveryVelocity?.completed_tasks)} tasks completed`, 'Average delivery time from completed task records'],
    ['Project portfolio', `${number(kpis?.portfolio?.total_projects)} projects in scope`, `${number(kpis?.portfolio?.active_projects)} currently active`],
    ['Approved expenses', number(kpis?.financials?.total_amount || kpis?.financials?.total_expenses), 'Sum of approved project expenses']
  ];

  return (
    <AdminPage title="Project Performance Reports" subtitle="Live figures derived from your assigned projects, tasks, milestones, and expenses" loading={loading} error={error}>
      <div className="row g-3">
        {reports.map(([title, metric, desc]) => (
          <div className="col-md-6" key={title}>
            <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="fw-bold mb-0 text-dark">{title}</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary">{metric}</span>
              </div>
              <p className="text-muted small mb-0">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      {!loading && !kpis && !error && <div className="alert alert-secondary mt-3 mb-0">No report data is available for your scope.</div>}
    </AdminPage>
  );
}
