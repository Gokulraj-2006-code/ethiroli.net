import React, { useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage';
import pmApi from '../../../services/api/pmApi';

const number = (value) => Number(value || 0).toLocaleString('en-IN');

/** Manager delivery KPIs. Every figure comes from the scoped KPI endpoint. */
export default function PMPerformance() {
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
        if (active) setError(requestError.response?.data?.message || 'Unable to load performance metrics.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const cards = [
    ['Milestones delivered on time', kpis?.onTimeDeliveryRate || '0%', `${number(kpis?.milestoneStats?.completed_count)} of ${number(kpis?.milestoneStats?.total_milestones)} milestones`],
    ['Completed tasks', number(kpis?.deliveryVelocity?.completed_tasks), 'Real completed task records in your scope'],
    ['Average delivery hours', Number(kpis?.deliveryVelocity?.average_hours || 0).toFixed(1), 'Average hours on completed tasks'],
    ['Approved project expenses', number(kpis?.financials?.total_amount || kpis?.financials?.total_expenses), 'From approved project expenses']
  ];

  return (
    <AdminPage title="Project Performance & Delivery KPIs" subtitle="Metrics derived from your assigned projects, tasks, milestones, and expenses" loading={loading} error={error}>
      <div className="row g-3">
        {cards.map(([label, value, hint]) => (
          <div className="col-md-3" key={label}>
            <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
              <small className="text-muted text-uppercase fw-semibold">{label}</small>
              <h1 className="fw-bold text-primary my-2">{value}</h1>
              <small className="text-muted">{hint}</small>
            </div>
          </div>
        ))}
      </div>
      {!loading && !kpis && !error && <div className="alert alert-secondary mt-3 mb-0">No performance metrics are available for your scope.</div>}
    </AdminPage>
  );
}
