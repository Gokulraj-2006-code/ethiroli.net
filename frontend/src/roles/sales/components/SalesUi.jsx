import React from 'react';
import { labelize, statusClass } from '../utils/salesFormat.js';

export function StatusBadge({ status, children }) {
  const text = children ?? labelize(status);
  if (!text || text === '—') return <span className="text-muted">—</span>;
  return <span className={`sales-badge ${statusClass(status)}`}>{text}</span>;
}

export function EmptyState({ icon = 'bi-inbox', title, message }) {
  return (
    <div className="sales-empty">
      <i className={`bi ${icon}`} aria-hidden="true"></i>
      <h6 className="mb-1">{title}</h6>
      {message && <p className="mb-0">{message}</p>}
    </div>
  );
}

/** Inline server-validation message (kept next to the field that caused it). */
export function FieldError({ message }) {
  if (!message) return null;
  return <div className="invalid-feedback d-block">{message}</div>;
}

/** Bootstrap-styled modal shell used by the Sales create/convert/expense flows. */
export function SalesModal({ title, subtitle, onClose, children, size = '' }) {
  return (
    <div className="modal show d-block sales-modal" tabIndex="-1" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`}>
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-0">{title}</h5>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormAlert({ error }) {
  if (!error) return null;
  return (
    <div className="alert alert-danger py-2 small" role="alert">
      <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
      {error}
    </div>
  );
}

export function SuccessAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="alert alert-success py-2 small d-flex align-items-center justify-content-between" role="status">
      <span><i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>{message}</span>
      {onDismiss && <button type="button" className="btn-close btn-close-sm" onClick={onDismiss} aria-label="Dismiss"></button>}
    </div>
  );
}
