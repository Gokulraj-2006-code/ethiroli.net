import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import companyProjectApi from '../../../services/api/companyProjectApi.js';
import { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState, StatusBadge } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatDateTime, labelize, progressPercent } from '../utils/salesFormat.js';

const STATUSES = ['AWAITING_MANAGER_ACCEPTANCE', 'ACTIVE', 'IN_PROGRESS', 'DELIVERY_SUBMITTED', 'AWAITING_ADMIN_CONFIRMATION', 'COMPLETED', 'CANCELLED'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [applied, setApplied] = useState({ status: '', search: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (applied.status) params.status = applied.status;
      if (applied.search.trim()) params.search = applied.search.trim();
      const rows = await companyProjectApi.listProjects(params);
      setProjects(asArray(rows));
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { load(); }, [load]);

  const deliveryLabel = (project) => {
    if (project?.sales_confirmed_at) return 'Confirmed by Sales';
    if (project?.delivery_submitted_at) return 'Awaiting Sales confirmation';
    return 'Not submitted';
  };

  return (
    <AdminPage
      title="Company Projects"
      subtitle="Follow the delivery of projects created from your client orders."
      loading={loading}
      error={error}
      onRetry={load}
    >
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <form
            className="sales-filter-bar"
            onSubmit={(event) => { event.preventDefault(); setApplied({ ...filters }); }}
          >
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="project-status-filter">Status</label>
              <select
                id="project-status-filter"
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="">All statuses</option>
                {STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
              </select>
            </div>
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="project-search-filter">Search</label>
              <input
                id="project-search-filter"
                className="form-control form-control-sm"
                placeholder="Project name, code or client"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-sm btn-outline-primary">Apply</button>
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => { setFilters({ status: '', search: '' }); setApplied({ status: '', search: '' }); }}
            >
              Clear
            </button>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {projects.length === 0 ? (
          <EmptyState
            icon="bi-folder2-open"
            title="No company projects"
            message="Projects converted from your client orders will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Expected end</th>
                  <th>Delivery</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link className="fw-semibold" to={`/app/sales/projects/${project.id}`}>{project.name}</Link>
                      <small className="text-muted d-block">{project.project_code || '—'}</small>
                    </td>
                    <td>{project.client_name || project.client_record_name || '—'}</td>
                    <td>{project.manager_name || 'Not assigned'}</td>
                    <td><StatusBadge status={project.status} /></td>
                    <td style={{ minWidth: '110px' }}>
                      <div className="sales-progress mb-1">
                        <span style={{ width: `${progressPercent(project.progress_percent)}%` }} />
                      </div>
                      <small>{progressPercent(project.progress_percent)}%</small>
                    </td>
                    <td>{formatDate(project.expected_end_date || project.due_date)}</td>
                    <td><small>{deliveryLabel(project)}</small></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link className="btn btn-outline-primary" to={`/app/sales/projects/${project.id}`}>View</Link>
                        <Link className="btn btn-outline-secondary" to={`/app/sales/expenses?project=${project.id}`}>Expenses</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <p className="small text-muted mt-3 mb-0">
          Most recent project created: {formatDateTime(projects[0]?.created_at)}
        </p>
      )}
    </AdminPage>
  );
}
