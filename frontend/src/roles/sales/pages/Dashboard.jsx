import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import salesPortalApi, { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import companyProjectApi from '../../../services/api/companyProjectApi.js';
import { EmptyState, StatusBadge, SuccessAlert } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatMoney, labelize, progressPercent } from '../utils/salesFormat.js';

const Stat = ({ label, value, hint, tone = '' }) => (
  <div className={`sales-stat ${tone}`}>
    <span className="sales-stat__label">{label}</span>
    <span className="sales-stat__value">{value}</span>
    {hint && <span className="sales-stat__hint">{hint}</span>}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState({ budget: null, orders: [], projects: [], todo: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarnings([]);
    const [budgetResult, ordersResult, projectsResult, todoResult] = await Promise.allSettled([
      salesPortalApi.getSalesBudget(),
      salesPortalApi.listClientOrders(),
      companyProjectApi.listProjects(),
      salesPortalApi.getTodoSummary(),
    ]);

    const failed = [];
    if (budgetResult.status === 'rejected') failed.push(`Budget: ${salesErrorMessage(budgetResult.reason)}`);
    if (ordersResult.status === 'rejected') failed.push(`Client orders: ${salesErrorMessage(ordersResult.reason)}`);
    if (projectsResult.status === 'rejected') failed.push(`Projects: ${salesErrorMessage(projectsResult.reason)}`);
    if (todoResult.status === 'rejected') failed.push(`To-Dos: ${salesErrorMessage(todoResult.reason)}`);

    // Only a total data outage is a page error; partial failures are shown as
    // warnings so the rest of the dashboard remains usable.
    if (budgetResult.status === 'rejected' && ordersResult.status === 'rejected' && projectsResult.status === 'rejected') {
      setError(failed[0]);
    } else if (failed.length) {
      setWarnings(failed);
    }

    setData({
      budget: budgetResult.status === 'fulfilled' ? budgetResult.value : null,
      orders: asArray(ordersResult.status === 'fulfilled' ? ordersResult.value : []),
      projects: asArray(projectsResult.status === 'fulfilled' ? projectsResult.value : []),
      todo: todoResult.status === 'fulfilled' ? todoResult.value : null,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const budgetConfigured = Boolean(data.budget?.configured);
  const currency = data.budget?.currency;
  const money = (value) => (budgetConfigured ? formatMoney(value, currency) : '—');
  const orders = data.orders;
  const projects = data.projects;
  const convertedOrders = orders.filter((order) => String(order.status).toUpperCase() === 'CONVERTED').length;
  const openOrders = orders.filter((order) => !['CONVERTED', 'CANCELLED'].includes(String(order.status).toUpperCase())).length;

  return (
    <AdminPage
      title="Sales Portal"
      subtitle="Your sales allocation, client orders and company project delivery at a glance."
      loading={loading}
      error={error}
      onRetry={load}
    >
      <SuccessAlert message={notice} onDismiss={() => setNotice('')} />

      {warnings.length > 0 && (
        <div className="alert alert-warning py-2 small" role="status">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
          {warnings.join(' · ')}
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3"><Stat label="Available allocation" value={money(data.budget?.available)} hint={budgetConfigured ? `FY ${data.budget?.fiscal_year || '—'}` : 'No approved Sales allocation'} tone="sales-stat--accent" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><Stat label="Allocated" value={money(data.budget?.allocated)} hint={budgetConfigured ? `Committed ${money(data.budget?.committed)}` : 'Not configured'} tone="sales-stat--info" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><Stat label="Client orders" value={orders.length} hint={`${openOrders} open · ${convertedOrders} converted`} /></div>
        <div className="col-12 col-sm-6 col-xl-3"><Stat label="Company projects" value={projects.length} hint={`${data.todo?.pending ?? 0} pending to-dos`} tone="sales-stat--warning" /></div>
      </div>

      {budgetConfigured && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="sales-section-title mb-0">Allocation usage</h6>
              <span className="sales-progress-label">
                {money(data.budget?.spent)} spent · {money(data.budget?.committed)} committed
              </span>
            </div>
            <div className="sales-progress" role="progressbar" aria-valuenow={progressPercent(data.budget?.allocated ? (Math.max(Number(data.budget.committed) || 0, Number(data.budget.spent) || 0) / Number(data.budget.allocated)) * 100 : 0)} aria-valuemin="0" aria-valuemax="100">
              <span style={{ width: `${progressPercent(data.budget?.allocated ? (Math.max(Number(data.budget.committed) || 0, Number(data.budget.spent) || 0) / Number(data.budget.allocated)) * 100 : 0)}%` }} />
            </div>
            <Link className="small mt-2 d-inline-block" to="/app/sales/budget">View budget details →</Link>
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="sales-section-title mb-0">Recent client orders</h6>
              <Link className="small" to="/app/sales/client-orders">View all →</Link>
            </div>
            <div className="table-responsive">
              {orders.length === 0 ? (
                <EmptyState icon="bi-clipboard-x" title="No client orders yet" message="Orders you create will appear here." />
              ) : (
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr><th>Order</th><th>Client</th><th>Value</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="fw-semibold">{order.title}</div>
                          <small className="text-muted">{order.order_number}</small>
                        </td>
                        <td>{order.client_name || '—'}</td>
                        <td>{formatMoney(order.order_value, order.currency)}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="sales-section-title mb-0">My company projects</h6>
              <Link className="small" to="/app/sales/projects">View all →</Link>
            </div>
            <div className="table-responsive">
              {projects.length === 0 ? (
                <EmptyState icon="bi-folder2-open" title="No company projects yet" message="Convert a client order to create one." />
              ) : (
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr><th>Project</th><th>Manager</th><th>Due</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project.id}>
                        <td>
                          <Link to={`/app/sales/projects/${project.id}`} className="fw-semibold">{project.name}</Link>
                          <small className="text-muted d-block">{project.project_code || labelize(project.status)}</small>
                        </td>
                        <td>{project.manager_name || 'Not assigned'}</td>
                        <td>{formatDate(project.expected_end_date || project.due_date)}</td>
                        <td style={{ minWidth: '110px' }}>
                          <div className="sales-progress mb-1"><span style={{ width: `${progressPercent(project.progress_percent)}%` }} /></div>
                          <small>{progressPercent(project.progress_percent)}%</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
