import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useHrData - Unified data hook for HR portal
 * Ensures proper data flow: API → State → UI with consistent patterns
 * 
 * ALL HR pages should import and use this hook for:
 * - Consistent loading/error/empty states
 * - Standardized CRUD flow
 * - Proper data shape across the application
 * - Guard against infinite re-fetching loops from inline function arguments
 */

export const useHrData = (
  fetchFn,
  fetchArgs,
  createFn,
  updateFn,
  deleteFn,
  getSummaryFn
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [summary, setSummary] = useState(null);

  // Store function references in refs to prevent infinite re-render cycles
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const createFnRef = useRef(createFn);
  createFnRef.current = createFn;

  const updateFnRef = useRef(updateFn);
  updateFnRef.current = updateFn;

  const deleteFnRef = useRef(deleteFn);
  deleteFnRef.current = deleteFn;

  const getSummaryFnRef = useRef(getSummaryFn);
  getSummaryFnRef.current = getSummaryFn;

  const fetchArgsRef = useRef(fetchArgs);
  fetchArgsRef.current = fetchArgs;

  const fetchArgsKey = typeof fetchArgs === 'object' ? JSON.stringify(fetchArgs) : String(fetchArgs || '');
  
  const fetchData = useCallback(async (args = fetchArgsRef.current) => {
    const fn = fetchFnRef.current;
    if (!fn || typeof fn !== 'function') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fn(args);
      const payload = result?.data?.data ?? result?.data ?? result;
      // Result can be an array or an object (like dashboard metrics)
      if (Array.isArray(payload)) {
        setData(payload);
      } else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.data)) {
          setData(payload.data);
        } else if (Array.isArray(payload.list)) {
          setData(payload.list);
        } else {
          setData(payload);
        }
      } else {
        setData([]);
      }

      if (getSummaryFnRef.current && typeof getSummaryFnRef.current === 'function') {
        try {
          const sum = await getSummaryFnRef.current();
          setSummary(sum?.data?.data ?? sum?.data ?? sum);
        } catch (summaryError) {
          setError(summaryError.message || 'Failed to load summary');
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(fetchArgsRef.current);
  }, [fetchArgsKey, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const handleCreate = useCallback(async (formData) => {
    const fn = createFnRef.current;
    if (!fn) {
      setError('Create operation not configured');
      return;
    }
    setSubmitting(true);
    try {
      await fn(formData);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Create failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchData]);

  const handleUpdate = useCallback(async (id, formData) => {
    const fn = updateFnRef.current;
    if (!fn) {
      setError('Update operation not configured');
      return;
    }
    setSubmitting(true);
    try {
      await fn(id, formData);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Update failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchData]);

  const handleDelete = useCallback(async (id) => {
    const fn = deleteFnRef.current;
    if (!fn) {
      setError('Delete operation not configured');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setSubmitting(true);
    try {
      await fn(id);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Delete failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchData]);

  const handleToggleStatus = useCallback(async (id) => {
    const fn = updateFnRef.current;
    if (!fn) {
      setError('Toggle not configured');
      return;
    }
    const currentItem = Array.isArray(data) ? data.find((d) => d.id === id) : null;
    const newStatus = currentItem?.is_active === false ? true : false;
    setSubmitting(true);
    try {
      await fn(id, { is_active: newStatus });
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Toggle failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [data, fetchData]);

  const loadSummary = useCallback(async () => {
    const fn = getSummaryFnRef.current;
    if (fn && typeof fn === 'function') {
      setLoading(true);
      try {
        const result = await fn();
        setSummary(result);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return {
    data,
    loading,
    error,
    submitting,
    setSubmitting,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter,
    summary,
    fetchData,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
    loadSummary,
  };
};

export default useHrData;
