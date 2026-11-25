import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import { useAuth } from '../../../common/hooks/useAuth.js';

const unwrap = (r) => r?.data?.data ?? r?.data;

const STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const EMPTY_FORM = {
  name: '',
  description: '',
  github_repo_url: '',
  priority: 'MEDIUM',
  due_date: '',
  status: 'ACTIVE',
  manager_id: '',
  assigned_user_ids: [],
};

const ROLE_TINTS = {
  SUPER_ADMIN: 'text-bg-dark',
  ADMIN: 'text-bg-dark',
  HR: 'text-bg-primary',
  PROJECT_MANAGER: 'text-bg-warning',
  EMPLOYEE: 'text-bg-success',
  INTERN: 'text-bg-info',
  TUTOR: 'text-bg-secondary',
  STUDENT: 'text-bg-secondary',
};

const roleTint = (role) => ROLE_TINTS[role] || 'text-bg-secondary';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Projects & Roles — the HR project board.
 *
 * HR shares project delivery oversight with the Manager panel, so
 * this screen lists every project and lets HR assign a delivery lead and a team
 * (each member shown with their system role) to a project.
 */
export default function HRProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [peopleSearch, setPeopleSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projectResponse, peopleResponse] = await Promise.all([
        axiosInstance.get('/v1/projects?limit=200'),
        axiosInstance.get('/v1/projects/assignable-users'),
      ]);
      setProjects(unwrap(projectResponse) || []);
      setPeople(unwrap(peopleResponse) || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load projects. Confirm the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

  const personOf = useCallback((id) => peopleById.get(id) || null, [peopleById]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      const team = (project.assigned_user_ids || []).map((id) => peopleById.get(id)?.full_name || '');
      return [project.name, project.description, project.manager?.full_name, ...team]
        .some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [projects, peopleById, search, statusFilter]);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.status === 'ACTIVE').length,
    unassigned: projects.filter((p) => !p.manager_id && !(p.assigned_user_ids || []).length).length,
    overdue: projects.filter((p) => p.due_date && new Date(p.due_date) < new Date() && p.status !== 'COMPLETED').length,
  }), [projects]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPeopleSearch('');
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      github_repo_url: project.github_repo_url || '',
      priority: project.priority || 'MEDIUM',
      due_date: project.due_date ? String(project.due_date).slice(0, 10) : '',
      status: STATUSES.includes(project.status) ? project.status : 'ACTIVE',
      manager_id: project.manager_id || '',
      assigned_user_ids: project.assigned_user_ids || [],
    });
    setPeopleSearch('');
    setShowForm(true);
  };

  const toggleMember = (id) => {
    setForm((prev) => ({
      ...prev,
      assigned_user_ids: prev.assigned_user_ids.includes(id)
        ? prev.assigned_user_ids.filter((memberId) => memberId !== id)
        : [...prev.assigned_user_ids, id],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    if (!form.github_repo_url.trim()) { setError('Repository URL is required.'); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        github_repo_url: form.github_repo_url.trim(),
        priority: form.priority,
        due_date: form.due_date || null,
        status: form.status,
        manager_id: form.manager_id || null,
        assigned_user_ids: form.assigned_user_ids,
      };
      if (editing) {
        await axiosInstance.put(`/v1/projects/${encodeURIComponent(editing.id)}`, body);
        setNotice(`Roles updated for “${body.name}”.`);
      } else {
        await axiosInstance.post('/v1/projects', { ...body, student_id: user?.id });
        setNotice(`Project “${body.name}” created.`);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (requestError) {
      const details = requestError.response?.data?.errors;
      setError(requestError.response?.data?.message
        || (Array.isArray(details) ? details.map((d) => d.message).join(' ') : '')
        || 'Could not save the project.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/v1/projects/${encodeURIComponent(project.id)}`);
      setNotice(`Deleted “${project.name}”.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the project.');
    }
  };

  const filteredPeople = useMemo(() => {
    const term = peopleSearch.trim().toLowerCase();
    return people.filter((person) => !term
      || [person.full_name, person.email, person.role].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [people, peopleSearch]);

  return (
    <AdminPage
      title="Projects & Roles"
      subtitle="Create projects and assign a delivery lead plus team members, each shown with their role."
      loading={loading}
      error={error}
      onRetry={load}
      actions={<button type="button" className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1" />New project</button>}
    >
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="row g-2 mb-3">
        {[
          ['Projects', stats.total],
          ['Active', stats.active],
          ['Awaiting team', stats.unassigned],
          ['Past due', stats.overdue],
        ].map(([label, value]) => (
          <div className="col-6 col-md-3" key={label}>
            <div className="card h-100"><div className="card-body py-2 px-3">
              <div className="small text-secondary">{label}</div>
              <div className="fs-5 fw-bold">{value}</div>
            </div></div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 flex-wrap mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          aria-label="Search projects"
          placeholder="Search project, lead or team member"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" style={{ maxWidth: 200 }} aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          {STATUSES.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Project</th>
                <th>Delivery lead</th>
                <th>Team &amp; roles</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((project) => {
                const team = (project.assigned_user_ids || []).map(personOf).filter(Boolean);
                return (
                  <tr key={project.id}>
                    <td>
                      <div className="fw-semibold">{project.name}</div>
                      <div className="small text-secondary text-truncate" style={{ maxWidth: 260 }}>{project.description || 'No description'}</div>
                    </td>
                    <td>
                      {project.manager
                        ? <div>{project.manager.full_name}<br /><span className={`badge ${roleTint(project.manager.role)}`}>{String(project.manager.role || '').replace(/_/g, ' ')}</span></div>
                        : <span className="text-secondary">Not assigned</span>}
                    </td>
                    <td>
                      {team.length
                        ? <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 250 }}>
                            {team.map((member) => (
                              <span key={member.id} className={`badge ${roleTint(member.role)}`} title={`${member.full_name} — ${member.email}`}>
                                {member.full_name} · {String(member.role || '').replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        : <span className="text-secondary">No team yet</span>}
                    </td>
                    <td><span className={`badge ${project.priority === 'URGENT' || project.priority === 'HIGH' ? 'text-bg-danger' : project.priority === 'LOW' ? 'text-bg-light border' : 'text-bg-secondary'}`}>{project.priority || 'MEDIUM'}</span></td>
                    <td>{formatDate(project.due_date)}</td>
                    <td><span className={`badge ${project.status === 'ACTIVE' ? 'text-bg-success' : project.status === 'COMPLETED' ? 'text-bg-primary' : 'text-bg-secondary'}`}>{String(project.status || 'ACTIVE').replace('_', ' ')}</span></td>
                    <td className="text-nowrap">
                      <div className="d-flex gap-2 justify-content-end">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(project)} title="Assign delivery lead and team roles"><i className="bi bi-people me-1" />Assign</button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(project)} title="Delete project" aria-label={`Delete ${project.name}`}><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visible.length && (
                <tr><td colSpan="7" className="text-center text-secondary p-4">No projects match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal d-block" role="dialog" aria-modal="true" aria-label={editing ? 'Edit project roles' : 'New project'} style={{ background: '#0007', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={submit}>
              <div className="modal-header">
                <h2 className="h5 modal-title">{editing ? 'Assign project roles' : 'New project'}</h2>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)} aria-label="Close" />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger" role="alert">{error}</div>}

                <div className="mb-3">
                  <label className="form-label" htmlFor="projectName">Project name *</label>
                  <input id="projectName" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="projectDescription">Description</label>
                  <textarea id="projectDescription" className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="projectRepo">Repository URL *</label>
                  <input id="projectRepo" className="form-control" placeholder="https://github.com/organisation/repository" value={form.github_repo_url} onChange={(e) => setForm({ ...form, github_repo_url: e.target.value })} required />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-4">
                    <label className="form-label" htmlFor="projectPriority">Priority</label>
                    <select id="projectPriority" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label" htmlFor="projectDue">Due date</label>
                    <input id="projectDue" type="date" className="form-control" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label" htmlFor="projectStatus">Status</label>
                    <select id="projectStatus" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {STATUSES.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="projectLead">Delivery lead</label>
                  <select id="projectLead" className="form-select" value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
                    <option value="">No lead yet</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>{person.full_name} — {String(person.role || '').replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="border rounded p-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold small">Team members &amp; roles ({form.assigned_user_ids.length} selected)</span>
                    <input className="form-control form-control-sm" style={{ maxWidth: 220 }} aria-label="Search people" placeholder="Search name, email or role" value={peopleSearch} onChange={(e) => setPeopleSearch(e.target.value)} />
                  </div>
                  <div className="list-group" style={{ maxHeight: 240, overflowY: 'auto' }}>
                    {filteredPeople.map((person) => (
                      <label key={person.id} className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-2">
                        <input
                          className="form-check-input me-1"
                          type="checkbox"
                          checked={form.assigned_user_ids.includes(person.id)}
                          onChange={() => toggleMember(person.id)}
                        />
                        <span className="flex-grow-1">{person.full_name}<span className="small text-secondary ms-2">{person.email}</span></span>
                        <span className={`badge ${roleTint(person.role)}`}>{String(person.role || '').replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                    {!filteredPeople.length && <div className="text-secondary small p-2">No people match this search.</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Save roles' : 'Create project')}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
