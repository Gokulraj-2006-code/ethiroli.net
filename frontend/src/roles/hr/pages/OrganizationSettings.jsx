import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (response) => response?.data?.data ?? response?.data;

export default function OrganizationSettings() {
  const [data, setData] = useState({ branches: [], departments: [], subRoles: [], managers: [] });
  const [selectedManager, setSelectedManager] = useState('');
  const [scopes, setScopes] = useState([]);
  const [newScope, setNewScope] = useState({ branch_id: '', department_id: '' });
  const [newSubRole, setNewSubRole] = useState({ department_id: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(unwrap(await axiosInstance.get('/v1/org/structure'))); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load organizational structure.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const loadScopes = async (managerId) => {
    if (!managerId) { setScopes([]); return; }
    try { setScopes(unwrap(await axiosInstance.get(`/v1/org/manager-scopes/${encodeURIComponent(managerId)}`)) || []); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load manager scopes.'); }
  };
  const selectManager = (managerId) => { setSelectedManager(managerId); loadScopes(managerId); };

  const addScope = () => {
    if (!newScope.branch_id) return setError('Choose a branch before adding a manager scope.');
    const scope = { branch_id: newScope.branch_id, department_id: newScope.department_id || null };
    const key = (item) => `${item.branch_id}:${item.department_id ?? '*'}`;
    setScopes((current) => current.some((item) => key(item) === key(scope)) ? current : [...current, scope]);
    setNewScope({ branch_id: '', department_id: '' }); setError('');
  };

  const saveScopes = async () => {
    if (!selectedManager) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await axiosInstance.put(`/v1/org/manager-scopes/${encodeURIComponent(selectedManager)}`, { scopes: scopes.map(({ branch_id, department_id }) => ({ branch_id, department_id })) });
      setNotice(`${unwrap(response)?.scopeCount ?? scopes.length} manager scope(s) saved.`);
      await loadScopes(selectedManager);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save manager scopes.'); }
    finally { setSaving(false); }
  };

  const submitSubRole = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await axiosInstance.post('/v1/org/sub-roles', newSubRole);
      setNotice('Sub-role added.'); setNewSubRole({ department_id: '', name: '' }); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to add the sub-role.'); }
    finally { setSaving(false); }
  };

  const toggleSubRole = async (role) => {
    setError(''); setNotice('');
    try { await axiosInstance.patch(`/v1/org/sub-roles/${encodeURIComponent(role.id)}`, { is_active: false }); setNotice('Sub-role deactivated. Existing personnel assignments remain in history.'); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update this sub-role.'); }
  };

  return <AdminPage title="Organization structure" subtitle="Manage the four divisions, configurable sub-roles, and explicit manager scopes" loading={loading} error={error} onRetry={load}>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <div className="row g-4">
      <div className="col-12 col-xl-5"><section className="card shadow-sm h-100"><div className="card-header bg-white"><h2 className="h6 mb-0">Add a sub-role</h2></div><div className="card-body">
        <form className="d-grid gap-3" onSubmit={submitSubRole}>
          <label className="form-label mb-0">Division<select className="form-select mt-1" required value={newSubRole.department_id} onChange={(e) => setNewSubRole({ ...newSubRole, department_id: e.target.value })}><option value="">Select division</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
          <label className="form-label mb-0">Sub-role name<input className="form-control mt-1" required maxLength={150} value={newSubRole.name} onChange={(e) => setNewSubRole({ ...newSubRole, name: e.target.value })} /></label>
          <button className="btn btn-primary" disabled={saving}>Add sub-role</button>
        </form>
        <h3 className="h6 mt-4">Current sub-roles</h3>{data.subRoles.map((role) => <div className="d-flex align-items-center justify-content-between border-bottom py-2" key={role.id}><span>{role.department_name} · {role.name}</span><button className="btn btn-sm btn-outline-secondary" onClick={() => toggleSubRole(role)}>Deactivate</button></div>)}
      </div></section></div>

      <div className="col-12 col-xl-7"><section className="card shadow-sm"><div className="card-header bg-white"><h2 className="h6 mb-0">Manager scopes</h2></div><div className="card-body">
        <label className="form-label">Manager<select className="form-select" value={selectedManager} onChange={(e) => selectManager(e.target.value)}><option value="">Choose a manager</option>{data.managers.map((manager) => <option value={manager.id} key={manager.id}>{manager.full_name}</option>)}</select></label>
        {!selectedManager ? <p className="text-secondary mb-0">Choose a manager to assign branch and division access. Managers without scopes cannot view or assign team work.</p> : <>
          <div className="row g-2 align-items-end mt-2">
            <label className="col-md-5 form-label">Branch<select className="form-select" value={newScope.branch_id} onChange={(e) => setNewScope({ ...newScope, branch_id: e.target.value })}><option value="">Choose branch</option>{data.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>
            <label className="col-md-5 form-label">Division<select className="form-select" value={newScope.department_id} onChange={(e) => setNewScope({ ...newScope, department_id: e.target.value })}><option value="">All divisions at branch</option>{data.departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select></label>
            <div className="col-md-2"><button type="button" className="btn btn-outline-primary w-100" onClick={addScope}>Add</button></div>
          </div>
          <div className="mt-3">{scopes.map((scope) => <div className="d-flex justify-content-between border-bottom py-2" key={`${scope.branch_id}:${scope.department_id ?? '*'}`}><span>{scope.branch_name || data.branches.find((b) => b.id === scope.branch_id)?.name} · {scope.department_name || data.departments.find((d) => Number(d.id) === Number(scope.department_id))?.name || 'All divisions'}</span><button className="btn btn-sm btn-link text-danger" onClick={() => setScopes((current) => current.filter((item) => !(item.branch_id === scope.branch_id && item.department_id === scope.department_id)))}>Remove</button></div>)}{!scopes.length && <p className="text-secondary">No assigned scopes. This manager currently has no team access.</p>}</div>
          <button className="btn btn-primary mt-3" disabled={saving} onClick={saveScopes}>{saving ? 'Saving…' : 'Save manager scopes'}</button>
        </>}
      </div></section></div>
    </div>
  </AdminPage>;
}
