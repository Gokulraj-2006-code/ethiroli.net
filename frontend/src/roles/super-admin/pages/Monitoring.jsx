import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../services/api/axiosInstance.js';
import PanelMonitoring from '../../../common/components/PanelMonitoring/PanelMonitoring.jsx';
import { listErrorLogs } from '../../../services/api/monitoringApi.js';

export default function Monitoring() {
  const [logs, setLogs] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, telemetryRes] = await Promise.all([
        listErrorLogs().catch(() => ({ data: [] })),
        axiosInstance.get('/v1/system/cluster/telemetry').catch(() => ({ data: { data: null } }))
      ]);
      setLogs(logsData?.data || logsData || []);
      setTelemetry(telemetryRes.data?.data || null);
    } catch (err) {
      console.error('Failed to load monitoring data', err);
      setError('Failed to load monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !telemetry && logs.length === 0) {
    return (
      <div className="container-fluid p-3 text-center text-muted py-5">
        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        Loading host telemetry and logs...
      </div>
    );
  }

  const stats = {
    total: logs.length,
    unresolved: logs.filter(l => !l.resolved && !l.isResolved).length,
    critical: logs.filter(l => l.level === 'critical' || l.severity === 'critical').length,
  };

  return (
    <div className="container-fluid p-3 bg-light min-vh-100">
      <PanelMonitoring />

      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-cpu text-primary" aria-hidden="true"></i>
            Cluster Telemetry & Host Monitoring
          </h2>
          <p className="text-secondary small mb-0">
            Real-time Node.js multi-worker distribution, database connection pooling metrics, and zero-downtime cluster reload.
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {/* Cluster & DB Pool Telemetry Section */}
      {telemetry && (
        <div className="row g-3 mb-2">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4">
              <span className="text-secondary small fw-semibold text-uppercase">Cluster Worker PID</span>
              <div className="d-flex align-items-baseline gap-2 my-1">
                <h3 className="fw-bold text-primary mb-0">{telemetry.currentWorker?.pid}</h3>
                <span className="badge bg-primary bg-opacity-10 text-primary">Worker #{telemetry.currentWorker?.workerId}</span>
              </div>
              <small className="text-muted">Master PID: {telemetry.masterPid} • Up {telemetry.currentWorker?.uptimeSeconds}s</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4">
              <span className="text-secondary small fw-semibold text-uppercase">Worker Heap / RSS</span>
              <h3 className="fw-bold text-success my-1">{telemetry.currentWorker?.memory?.rssMb} MB</h3>
              <small className="text-muted">Heap Used: {telemetry.currentWorker?.memory?.heapUsedMb} MB / {telemetry.currentWorker?.memory?.heapTotalMb} MB</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4">
              <span className="text-secondary small fw-semibold text-uppercase">Database Pool Connections</span>
              <div className="d-flex align-items-baseline gap-2 my-1">
                <h3 className="fw-bold text-info mb-0">{telemetry.database?.pool?.active ?? 1} / {telemetry.database?.configuredLimit ?? 15}</h3>
                <span className={`badge ${telemetry.database?.connected ? 'bg-success' : 'bg-danger'}`}>
                  {telemetry.database?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <small className="text-muted">Latency: {telemetry.database?.latencyMs}ms • Queue: {telemetry.database?.pool?.queued ?? 0}</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-dark border-4">
              <span className="text-secondary small fw-semibold text-uppercase">Host Physical Hardware</span>
              <h3 className="fw-bold text-dark my-1">{telemetry.system?.cpuCores} Cores</h3>
              <small className="text-muted">Free RAM: {telemetry.system?.freeMemoryMb} MB / {telemetry.system?.totalMemoryMb} MB</small>
            </div>
          </div>
        </div>
      )}

      {/* Error Log Stat Cards */}
      <div className="row g-3 mb-2">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="text-secondary small fw-semibold text-uppercase">Total Errors</div>
            <div className="fs-3 fw-bold my-1">{stats.total}</div>
            <div className="text-muted small">Recorded system logs</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-warning border-4">
            <div className="text-secondary small fw-semibold text-uppercase">Unresolved Incidents</div>
            <div className="fs-3 fw-bold text-warning my-1">{stats.unresolved}</div>
            <div className="text-muted small">Requiring review</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-danger border-4">
            <div className="text-secondary small fw-semibold text-uppercase">Critical Severity</div>
            <div className="fs-3 fw-bold text-danger my-1">{stats.critical}</div>
            <div className="text-muted small">Immediate mitigation</div>
          </div>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
        <h5 className="fw-bold mb-3">Recorded Host Error Incidents</h5>
        <div className="table-responsive">
          {logs.length === 0 ? (
            <div className="text-center py-4 text-muted">No unresolved error logs found. Cluster operating at peak health.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Incident ID</th>
                  <th>Message</th>
                  <th>Severity</th>
                  <th>Service / Route</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><code className="text-muted">{log.id.slice(0, 8)}...</code></td>
                    <td><span className="fw-semibold text-dark">{log.message || log.errorMessage || '-'}</span></td>
                    <td>
                      <span className={`badge ${log.level === 'critical' ? 'bg-danger' : log.level === 'warning' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {log.level || 'info'}
                      </span>
                    </td>
                    <td><code>{log.service || log.source || '-'}</code></td>
                    <td className="small text-muted">{new Date(log.createdAt || log.created_at || Date.now()).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
