import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import Modal from '../../../common/components/Modal/Modal.jsx';
import { useHrData } from '../../../hooks/useHrData';
import { deleteCareerApplication, listCareerApplications } from '../../../../services/api/hrApi.standardized.js';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function HRCareerApplications() {
  const {
    data: applications,
    loading,
    error,
    refresh,
    search,
    setSearch,
  } = useHrData(listCareerApplications);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });
  const toastTimerRef = useRef(null);

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const appList = useMemo(
    () => (Array.isArray(applications) ? applications : []),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return appList;

    return appList.filter((app) => {
      const name = (app.candidate_name || app.name || '').toLowerCase();
      const role = (app.position || app.role || '').toLowerCase();
      const email = (app.email || '').toLowerCase();
      return name.includes(q) || role.includes(q) || email.includes(q);
    });
  }, [appList, search]);

  const handleDelete = async (app) => {
    if (!app) return;
    const name = app.candidate_name || app.name || 'this applicant';
    if (!window.confirm(`Delete the application from ${name}? This cannot be undone.`)) return;

    setDeletingId(app.id);
    try {
      await deleteCareerApplication(app.id);
      if (selectedApplication?.id === app.id) setSelectedApplication(null);
      await refresh();
      showToast('success', 'Application deleted successfully.');
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message || err.message || 'Could not delete this application.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminPage
      title="Career Applications"
      subtitle="Review applications submitted through the careers portal."
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <div className="dashboard">
        {toast.text && (
          <div
            role="status"
            style={{
              background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: toast.type === 'error' ? '#991b1b' : '#065f46',
              border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontWeight: 500,
            }}
          >
            <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} me-2`} />
            {toast.text}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
          }}
        >
          <input
            type="search"
            placeholder="Search candidate by name, role, or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="form-control"
            aria-label="Search career applications"
            style={{ flex: '1 1 240px', maxWidth: 460, borderRadius: '0.5rem' }}
          />
          <span className="text-muted small">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </span>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Candidates &amp; Applicants ({filteredApplications.length})</h3>
          </div>
          <div className="cardBody" style={{ padding: 0 }}>
            {filteredApplications.length === 0 ? (
              <div className="emptyState" style={{ padding: '3rem', textAlign: 'center' }}>
                <i className="bi bi-person-lines-fill" style={{ fontSize: '2.5rem', color: '#94a3b8' }} />
                <h4 style={{ marginTop: '1rem' }}>No job applications found</h4>
                <p style={{ color: '#64748b' }}>
                  {search ? 'No candidates match your search.' : 'Applications submitted from the careers page will appear here.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Applied Role</th>
                      <th>Experience / Institute</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => {
                      const name = app.candidate_name || app.name || 'Applicant';
                      return (
                        <tr key={app.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {app.email || 'No email'}
                              {app.phone ? ` · ${app.phone}` : ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{app.position || app.role || '—'}</div>
                          </td>
                          <td>{app.experience || app.current_company || '—'}</td>
                          <td>{formatDate(app.applied_at || app.created_at)}</td>
                          <td>
                            <span className="badge bg-secondary">{app.status || 'Applied'}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                display: 'flex',
                                gap: '6px',
                                justifyContent: 'flex-end',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setSelectedApplication(app)}
                              >
                                <i className="bi bi-eye me-1" /> View
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(app)}
                                disabled={deletingId === app.id}
                              >
                                <i className="bi bi-trash me-1" />
                                {deletingId === app.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={Boolean(selectedApplication)}
          onClose={() => setSelectedApplication(null)}
          title={`Candidate Profile — ${selectedApplication?.candidate_name || selectedApplication?.name || ''}`}
        >
          {selectedApplication && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                  <h4 className="mb-0 fw-bold">
                    {selectedApplication.candidate_name || selectedApplication.name}
                  </h4>
                  <small className="text-muted">
                    {selectedApplication.position || selectedApplication.role || 'General Application'}
                  </small>
                </div>
                <div>
                  <span className="badge bg-secondary">{selectedApplication.status || 'Applied'}</span>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Contact details</small>
                  <div>{selectedApplication.email || '—'}</div>
                  <div>{selectedApplication.phone || 'No phone provided'}</div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Experience / background</small>
                  <div>{selectedApplication.experience || '—'}</div>
                  <div className="text-muted small">{selectedApplication.current_company || ''}</div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Applied on</small>
                  <div>{formatDate(selectedApplication.applied_at || selectedApplication.created_at)}</div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Portfolio / resume</small>
                  {selectedApplication.portfolio_url || selectedApplication.resume_url ? (
                    <a
                      href={selectedApplication.portfolio_url || selectedApplication.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open link
                    </a>
                  ) : (
                    <div className="text-muted">Not provided</div>
                  )}
                </div>
              </div>

              <div className="card mb-3" style={{ background: '#f8fafc' }}>
                <div className="cardBody" style={{ padding: '0.85rem' }}>
                  <div className="small fw-bold text-muted mb-1">MESSAGE / SKILLS SUMMARY</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.resume_summary || selectedApplication.message || 'No message provided.'}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedApplication)}
                  disabled={deletingId === selectedApplication.id}
                >
                  <i className="bi bi-trash me-1" />
                  {deletingId === selectedApplication.id ? 'Deleting…' : 'Delete Application'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApplication(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminPage>
  );
}
