import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import salesPortalApi, { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState, FieldError, FormAlert, SalesModal, StatusBadge, SuccessAlert } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatMoney, labelize } from '../utils/salesFormat.js';

const today = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const emptyOrderForm = () => ({
  client_id: '',
  client_name: '',
  title: '',
  description: '',
  order_value: '',
  order_date: today(),
  expected_delivery_date: '',
  notes: '',
  items: [{ description: '', quantity: '1', unit_price: '' }],
});

const emptyConvertForm = () => ({
  estimated_cost: '',
  manager_id: '',
  project_name: '',
  description: '',
  priority: 'MEDIUM',
  category: '',
  start_date: '',
  expected_end_date: '',
});

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState('');
  const [detail, setDetail] = useState(null);
  const [mode, setMode] = useState(null); // create | edit | view | convert
  const [selected, setSelected] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderForm());
  const [editForm, setEditForm] = useState({});
  const [convertForm, setConvertForm] = useState(emptyConvertForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', search: '' });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
      const rows = await salesPortalApi.listClientOrders(params);
      setOrders(asArray(rows));
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [clientRows, managerRows, budgetRow] = await Promise.all([
          salesPortalApi.listClients(),
          salesPortalApi.listOrderManagers(),
          salesPortalApi.getSalesBudget(),
        ]);
        if (!cancelled) {
          setClients(asArray(clientRows));
          setManagers(asArray(managerRows));
          setBudget(budgetRow || null);
        }
      } catch {
        // Orders still work without the pickers; server validation remains authoritative.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const closeModal = () => {
    setMode(null);
    setSelected(null);
    setDetail(null);
    setFormError(null);
    setFieldErrors({});
  };

  const openCreate = () => {
    setFormError(null);
    setFieldErrors({});
    setOrderForm(emptyOrderForm());
    setMode('create');
  };

  const openEdit = (order) => {
    setFormError(null);
    setFieldErrors({});
    setSelected(order);
    setEditForm({
      title: order.title || '',
      description: order.description || '',
      status: order.status || 'DRAFT',
      order_value: order.order_value ?? '',
      order_date: String(order.order_date || '').slice(0, 10),
      expected_delivery_date: String(order.expected_delivery_date || '').slice(0, 10),
      notes: order.notes || '',
    });
    setMode('edit');
  };

  const openView = async (order) => {
    setFormError(null);
    setSelected(order);
    setDetail(null);
    setMode('view');
    try {
      const result = await salesPortalApi.getClientOrder(order.id);
      setDetail(result || null);
    } catch (err) {
      setFormError(salesErrorMessage(err));
    }
  };

  const openConvert = (order) => {
    setFormError(null);
    setFieldErrors({});
    setSelected(order);
    setConvertForm({
      ...emptyConvertForm(),
      project_name: order.title || '',
      description: order.description || '',
      expected_end_date: String(order.expected_delivery_date || '').slice(0, 10),
    });
    setMode('convert');
  };

  const updateItem = (index, key, value) => {
    setOrderForm((form) => ({
      ...form,
      items: form.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const items = orderForm.items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        }));
      const payload = {
        title: orderForm.title.trim(),
        description: orderForm.description.trim() || undefined,
        order_date: orderForm.order_date || undefined,
        expected_delivery_date: orderForm.expected_delivery_date || undefined,
        notes: orderForm.notes.trim() || undefined,
        currency: orderForm.currency || undefined,
        items,
      };
      if (orderForm.client_id) payload.client_id = orderForm.client_id;
      else payload.client_name = orderForm.client_name.trim();
      if (!items.length) payload.order_value = Number(orderForm.order_value);

      const result = await salesPortalApi.createClientOrder(payload);
      setSuccess(`Client order ${result?.order_number || ''} created.`.trim());
      closeModal();
      await loadOrders();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await salesPortalApi.updateClientOrder(selected.id, {
        ...editForm,
        order_value: Number(editForm.order_value),
      });
      setSuccess('Client order updated.');
      closeModal();
      await loadOrders();
    } catch (err) {
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitConvert = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = {
        estimated_cost: Number(convertForm.estimated_cost),
        manager_id: convertForm.manager_id,
        project_name: convertForm.project_name.trim() || undefined,
        description: convertForm.description.trim() || undefined,
        priority: convertForm.priority,
        category: convertForm.category.trim() || undefined,
        start_date: convertForm.start_date || undefined,
        expected_end_date: convertForm.expected_end_date || undefined,
      };
      const result = await salesPortalApi.convertClientOrder(selected.id, payload);
      setSuccess(`Converted to project ${result?.project_code || ''} — assign the manager from the conversion dialog only.`.trim());
      closeModal();
      await loadOrders();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeOrder = async (order) => {
    if (!window.confirm(`Delete draft order ${order.order_number}? This cannot be undone.`)) return;
    setBusy(true);
    setFormError(null);
    try {
      await salesPortalApi.deleteClientOrder(order.id);
      setSuccess('Draft client order deleted.');
      await loadOrders();
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const isDraft = (order) => String(order.status).toUpperCase() === 'DRAFT';
  const convertible = (order) => !['CONVERTED', 'CANCELLED'].includes(String(order?.status || '').toUpperCase());
  const orderCurrency = (order) => order?.currency || budget?.currency;

  return (
    <AdminPage
      title="Client Orders"
      subtitle="Capture client orders, manage their lifecycle and convert approved orders into company projects."
      loading={loading}
      error={error}
      onRetry={loadOrders}
      actions={<button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>New order</button>}
    >
      <SuccessAlert message={success} onDismiss={() => setSuccess('')} />

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <form
            className="sales-filter-bar"
            onSubmit={(event) => { event.preventDefault(); setAppliedFilters({ ...filters }); }}
          >
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="order-status-filter">Status</label>
              <select id="order-status-filter" className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All statuses</option>
                {['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'CONVERTED', 'CANCELLED'].map((status) => (
                  <option key={status} value={status}>{labelize(status)}</option>
                ))}
              </select>
            </div>
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="order-search-filter">Search</label>
              <input id="order-search-filter" className="form-control form-control-sm" placeholder="Title, order number or client" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-sm btn-outline-primary">Apply</button>
            <button type="button" className="btn btn-sm btn-link" onClick={() => { setFilters({ status: '', search: '' }); setAppliedFilters({ status: '', search: '' }); }}>Clear</button>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          {orders.length === 0 ? (
            <EmptyState icon="bi-clipboard2" title="No client orders" message="Create an order to start the sales-to-project workflow." />
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Order</th><th>Client</th><th>Value</th><th>Status</th><th>Order date</th><th>Expected delivery</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="fw-semibold">{order.title}</div>
                      <small className="text-muted">{order.order_number}</small>
                    </td>
                    <td>{order.client_name || '—'}</td>
                    <td>{formatMoney(order.order_value, orderCurrency(order))}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{formatDate(order.expected_delivery_date)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => openView(order)} title="View order">View</button>
                        {!convertible(order) ? (
                          order.converted_project_id && <Link className="btn btn-outline-primary" to={`/app/sales/projects/${order.converted_project_id}`}>Project</Link>
                        ) : (
                          <>
                            <button className="btn btn-outline-primary" onClick={() => openEdit(order)}>Edit</button>
                            <button className="btn btn-success" onClick={() => openConvert(order)}>Convert</button>
                            {isDraft(order) && <button className="btn btn-outline-danger" onClick={() => removeOrder(order)} disabled={busy}>Delete</button>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {mode === 'create' && (
        <SalesModal title="New client order" subtitle="Items are optional; enter an order value if no items are added." onClose={closeModal} size="modal-lg">
          <form onSubmit={submitCreate}>
            <div className="modal-body">
              <FormAlert error={formError} />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="order-client">Client <span className="text-danger">*</span></label>
                  <select
                    id="order-client"
                    className="form-select"
                    value={orderForm.client_id || '__manual__'}
                    onChange={(e) => setOrderForm({ ...orderForm, client_id: e.target.value === '__manual__' ? '' : e.target.value, client_name: '' })}
                  >
                    <option value="__manual__">Enter a client name</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.company_name || client.name || client.email || 'Unnamed client'}</option>
                    ))}
                  </select>
                  {!orderForm.client_id && (
                    <>
                      <input className="form-control mt-2" placeholder="Client name" value={orderForm.client_name} onChange={(e) => setOrderForm({ ...orderForm, client_name: e.target.value })} required />
                      <FieldError message={fieldErrors.client_name} />
                    </>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="order-title">Order title <span className="text-danger">*</span></label>
                  <input id="order-title" className="form-control" value={orderForm.title} onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })} required />
                  <FieldError message={fieldErrors.title} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="order-description">Description</label>
                  <textarea id="order-description" className="form-control" rows="2" value={orderForm.description} onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="order-date">Order date</label>
                  <input id="order-date" type="date" className="form-control" value={orderForm.order_date} onChange={(e) => setOrderForm({ ...orderForm, order_date: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="order-delivery">Expected delivery</label>
                  <input id="order-delivery" type="date" className="form-control" value={orderForm.expected_delivery_date} onChange={(e) => setOrderForm({ ...orderForm, expected_delivery_date: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="order-value">Order value (no items)</label>
                  <input id="order-value" type="number" min="0" step="0.01" className="form-control" value={orderForm.order_value} onChange={(e) => setOrderForm({ ...orderForm, order_value: e.target.value })} />
                  <FieldError message={fieldErrors.order_value} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="sales-section-title mb-0">Order items</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setOrderForm({ ...orderForm, items: [...orderForm.items, { description: '', quantity: '1', unit_price: '' }] })}>
                      <i className="bi bi-plus me-1"></i>Add item
                    </button>
                  </div>
                  {orderForm.items.map((item, index) => (
                    <div className="sales-line-item mb-2" key={index}>
                      <div className="row g-2 align-items-end">
                        <div className="col-md-5">
                          <label className="form-label small">Description</label>
                          <input className="form-control form-control-sm" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small">Quantity</label>
                          <input type="number" min="0.01" step="0.01" className="form-control form-control-sm" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small">Unit price</label>
                          <input type="number" min="0" step="0.01" className="form-control form-control-sm" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} />
                        </div>
                        <div className="col-md-2">
                          <button type="button" className="btn btn-sm btn-outline-danger w-100" disabled={orderForm.items.length === 1} onClick={() => setOrderForm({ ...orderForm, items: orderForm.items.filter((_, i) => i !== index) })}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <FieldError message={fieldErrors.items} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="order-notes">Notes</label>
                  <textarea id="order-notes" className="form-control" rows="2" value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Create order'}</button>
            </div>
          </form>
        </SalesModal>
      )}

      {mode === 'edit' && (
        <SalesModal title={`Edit ${selected?.order_number || 'order'}`} onClose={closeModal}>
          <form onSubmit={submitEdit}>
            <div className="modal-body">
              <FormAlert error={formError} />
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-title">Title</label>
                <input id="edit-title" className="form-control" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-description">Description</label>
                <textarea id="edit-description" className="form-control" rows="2" value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-status">Status</label>
                  <select id="edit-status" className="form-select" value={editForm.status || 'DRAFT'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    {['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'CANCELLED'].map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-value">Order value</label>
                  <input id="edit-value" type="number" min="0" step="0.01" className="form-control" value={editForm.order_value ?? ''} onChange={(e) => setEditForm({ ...editForm, order_value: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-date">Order date</label>
                  <input id="edit-date" type="date" className="form-control" value={editForm.order_date || ''} onChange={(e) => setEditForm({ ...editForm, order_date: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-delivery">Expected delivery</label>
                  <input id="edit-delivery" type="date" className="form-control" value={editForm.expected_delivery_date || ''} onChange={(e) => setEditForm({ ...editForm, expected_delivery_date: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </SalesModal>
      )}

      {mode === 'view' && (
        <SalesModal title={selected?.order_number || 'Client order'} onClose={closeModal} size="modal-lg">
          <div className="modal-body">
            <FormAlert error={formError} />
            {!detail ? (
              <p className="text-muted mb-0">Loading order details…</p>
            ) : (
              <>
                <div className="sales-fact-grid mb-3">
                  <div><span className="sales-fact-label">Title</span><span className="sales-fact-value">{detail.title}</span></div>
                  <div><span className="sales-fact-label">Client</span><span className="sales-fact-value">{detail.client_name || '—'}</span></div>
                  <div><span className="sales-fact-label">Status</span><span className="sales-fact-value"><StatusBadge status={detail.status} /></span></div>
                  <div><span className="sales-fact-label">Order value</span><span className="sales-fact-value">{formatMoney(detail.order_value, detail.currency)}</span></div>
                  <div><span className="sales-fact-label">Order date</span><span className="sales-fact-value">{formatDate(detail.order_date)}</span></div>
                  <div><span className="sales-fact-label">Expected delivery</span><span className="sales-fact-value">{formatDate(detail.expected_delivery_date)}</span></div>
                </div>
                {detail.description && <p className="small">{detail.description}</p>}
                <h6 className="sales-section-title mt-3">Items</h6>
                {asArray(detail.items).length === 0 ? (
                  <EmptyState icon="bi-list" title="No items" message="This order was created with an order value only." />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light"><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead>
                      <tbody>
                        {asArray(detail.items).map((item) => (
                          <tr key={item.id}>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{formatMoney(item.unit_price, detail.currency)}</td>
                            <td>{formatMoney(item.total_price, detail.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Close</button></div>
        </SalesModal>
      )}

      {mode === 'convert' && (
        <SalesModal
          title={`Convert ${selected?.order_number || 'order'} to a project`}
          subtitle="This is the only place where a project manager is assigned."
          onClose={closeModal}
          size="modal-lg"
        >
          <form onSubmit={submitConvert}>
            <div className="modal-body">
              <FormAlert error={formError} />
              {budget?.configured && (
                <div className="alert alert-info py-2 small">
                  Available Sales allocation: <strong>{formatMoney(budget.available, budget.currency)}</strong>
                </div>
              )}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-manager">Project manager <span className="text-danger">*</span></label>
                  <select id="convert-manager" className="form-select" value={convertForm.manager_id} onChange={(e) => setConvertForm({ ...convertForm, manager_id: e.target.value })} required>
                    <option value="">Select a manager</option>
                    {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.full_name} ({manager.email})</option>)}
                  </select>
                  <FieldError message={fieldErrors.manager_id} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-cost">Estimated cost <span className="text-danger">*</span></label>
                  <input id="convert-cost" type="number" min="0.01" step="0.01" className="form-control" value={convertForm.estimated_cost} onChange={(e) => setConvertForm({ ...convertForm, estimated_cost: e.target.value })} required />
                  <FieldError message={fieldErrors.estimated_cost} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-name">Project name</label>
                  <input id="convert-name" className="form-control" value={convertForm.project_name} onChange={(e) => setConvertForm({ ...convertForm, project_name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-priority">Priority</label>
                  <select id="convert-priority" className="form-select" value={convertForm.priority} onChange={(e) => setConvertForm({ ...convertForm, priority: e.target.value })}>
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => <option key={priority} value={priority}>{labelize(priority)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-category">Category</label>
                  <input id="convert-category" className="form-control" value={convertForm.category} onChange={(e) => setConvertForm({ ...convertForm, category: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-start">Start date</label>
                  <input id="convert-start" type="date" className="form-control" value={convertForm.start_date} onChange={(e) => setConvertForm({ ...convertForm, start_date: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="convert-end">Expected end date</label>
                  <input id="convert-end" type="date" className="form-control" value={convertForm.expected_end_date} onChange={(e) => setConvertForm({ ...convertForm, expected_end_date: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="convert-description">Description</label>
                  <textarea id="convert-description" className="form-control" rows="2" value={convertForm.description} onChange={(e) => setConvertForm({ ...convertForm, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={busy}>{busy ? 'Converting…' : 'Convert to project'}</button>
            </div>
          </form>
        </SalesModal>
      )}
    </AdminPage>
  );
}
